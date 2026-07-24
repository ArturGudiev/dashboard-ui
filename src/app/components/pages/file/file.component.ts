import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toObservable, toSignal } from '@angular/core/rxjs-interop';
import { DomSanitizer, type SafeResourceUrl, Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { from, of } from 'rxjs';
import { catchError, filter, map, switchMap, tap } from 'rxjs/operators';
import { type MmNode, parseMindMapXml } from '../../../shared/libs/mm-parser.lib';
import { FilesService } from '../../../services/files.service';
import { MindMapViewerComponent } from './mind-map-viewer.component';
import { MindMapGraphComponent } from './mind-map-graph.component';

type PreviewKind = 'text' | 'image' | 'pdf' | 'mindmap' | 'binary';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-file',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatProgressSpinner,
    MatSlideToggleModule,
    MindMapViewerComponent,
    MindMapGraphComponent,
  ],
  templateUrl: './file.component.html',
  styleUrls: ['./file.component.sass'],
})
export class FileComponent {
  private route = inject(ActivatedRoute);
  private filesService = inject(FilesService);
  private sanitizer = inject(DomSanitizer);
  private titleService = inject(Title);
  private destroyRef = inject(DestroyRef);

  readonly filesPath = toSignal(
    this.route.url.pipe(map((segments) => segments.map((s) => s.path).join('/'))),
    { initialValue: '' },
  );

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly encrypted = signal(false);
  readonly previewKind = signal<PreviewKind>('binary');
  readonly textContent = signal<string | null>(null);
  readonly mindMapRoot = signal<MmNode | null>(null);
  /** Outline (default) vs mind-elixir graph with nodes/edges. */
  readonly showMindMapVisually = signal(false);
  readonly objectUrl = signal<SafeResourceUrl | null>(null);
  readonly downloadHref = signal<string | null>(null);
  readonly fileName = signal('');
  readonly mimeType = signal('');
  readonly sizeBytes = signal(0);

  private rawObjectUrl: string | null = null;

  constructor() {
    toObservable(this.filesPath)
      .pipe(
        tap((path) => {
          this.revokeObjectUrl();
          this.textContent.set(null);
          this.mindMapRoot.set(null);
          this.showMindMapVisually.set(false);
          this.objectUrl.set(null);
          this.error.set(null);
          this.encrypted.set(false);
          this.mimeType.set('');
          this.sizeBytes.set(0);

          if (!path) {
            this.loading.set(false);
            this.error.set('No file path provided');
            this.fileName.set('');
            return;
          }

          this.loading.set(true);
          this.fileName.set(path.split('/').pop() ?? path);
          this.titleService.setTitle(path);
        }),
        filter((path): path is string => !!path),
        switchMap((path) =>
          from(this.filesService.loadFileForDisplay(path)).pipe(
            catchError((err: unknown) => {
              void this.setErrorFromHttp(err);
              this.loading.set(false);
              return of(null);
            }),
          ),
        ),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((loaded) => {
        if (!loaded) {
          return;
        }
        void this.applyBlob(loaded.blob, loaded.encrypted);
      });

    this.destroyRef.onDestroy(() => this.revokeObjectUrl());
  }

  download(): void {
    const url = this.downloadHref();
    if (!url) {
      return;
    }
    const a = document.createElement('a');
    a.href = url;
    a.download = this.fileName() || 'download';
    a.click();
  }

  onShowVisuallyChange(checked: boolean): void {
    this.showMindMapVisually.set(checked);
  }

  private async applyBlob(blob: Blob, encrypted: boolean): Promise<void> {
    this.encrypted.set(encrypted);
    this.sizeBytes.set(blob.size);

    const path = this.filesPath();
    const mime = blob.type || this.guessMime(path);
    this.mimeType.set(mime);

    this.rawObjectUrl = URL.createObjectURL(blob);
    this.downloadHref.set(this.rawObjectUrl);

    const kind = this.resolvePreviewKind(mime, path);
    this.previewKind.set(kind);

    try {
      if (kind === 'text') {
        this.textContent.set(await blob.text());
      } else if (kind === 'mindmap') {
        const xml = await blob.text();
        this.textContent.set(xml);
        this.mindMapRoot.set(parseMindMapXml(xml));
      } else if (kind === 'image' || kind === 'pdf') {
        this.objectUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(this.rawObjectUrl));
      }
    } catch (e) {
      this.error.set(e instanceof Error ? e.message : 'Failed to render file');
      this.previewKind.set('binary');
    }

    this.loading.set(false);
  }

  private async setErrorFromHttp(err: unknown): Promise<void> {
    if (err instanceof Error && err.message) {
      this.error.set(err.message);
      return;
    }
    const httpErr = err as { status?: number; error?: Blob | { error?: string }; message?: string };
    if (httpErr?.error instanceof Blob) {
      try {
        const text = await httpErr.error.text();
        const parsed = JSON.parse(text) as { error?: string };
        this.error.set(parsed.error ?? `Failed to load file (${httpErr.status ?? '?'})`);
        return;
      } catch {
        this.error.set(`Failed to load file (${httpErr.status ?? '?'})`);
        return;
      }
    }
    const message =
      (typeof httpErr?.error === 'object' && httpErr.error && 'error' in httpErr.error
        ? httpErr.error.error
        : undefined) ?? httpErr?.message ?? 'Failed to load file';
    this.error.set(message);
  }

  private resolvePreviewKind(mime: string, path: string): PreviewKind {
    if (/\.mm$/i.test(path) || mime === 'application/x-freemind') {
      return 'mindmap';
    }
    if (mime.startsWith('image/')) {
      return 'image';
    }
    if (mime === 'application/pdf' || path.toLowerCase().endsWith('.pdf')) {
      return 'pdf';
    }
    if (
      mime.startsWith('text/') ||
      mime === 'application/json' ||
      mime === 'application/xml' ||
      mime === 'application/javascript' ||
      /\.(txt|md|json|ya?ml|xml|csv|log|ts|js|go|html|css|sass|scss|env|sh|py|rs)$/i.test(path)
    ) {
      return 'text';
    }
    if (mime === 'application/octet-stream' && /\.(txt|md|json|log|csv)$/i.test(path)) {
      return 'text';
    }
    return 'binary';
  }

  private guessMime(path: string): string {
    const lower = path.toLowerCase();
    if (/\.mm$/.test(lower)) return 'application/x-freemind';
    if (/\.(png)$/.test(lower)) return 'image/png';
    if (/\.(jpe?g)$/.test(lower)) return 'image/jpeg';
    if (/\.(gif)$/.test(lower)) return 'image/gif';
    if (/\.(webp)$/.test(lower)) return 'image/webp';
    if (/\.(svg)$/.test(lower)) return 'image/svg+xml';
    if (/\.(pdf)$/.test(lower)) return 'application/pdf';
    if (/\.(txt|md|log|csv|env)$/.test(lower)) return 'text/plain';
    if (/\.(json)$/.test(lower)) return 'application/json';
    if (/\.(html?)$/.test(lower)) return 'text/html';
    return 'application/octet-stream';
  }

  private revokeObjectUrl(): void {
    if (this.rawObjectUrl) {
      URL.revokeObjectURL(this.rawObjectUrl);
      this.rawObjectUrl = null;
    }
    this.downloadHref.set(null);
  }
}
