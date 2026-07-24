import { HttpClient, HttpResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom, type Observable, of, tap } from 'rxjs';
import { AppConfigService } from './app-config.service';
import { FilesCryptoService } from './files-crypto.service';

export interface FilesConfig {
  encrypted: boolean;
  baseDir: string;
}

export interface FileListItem {
  path: string;
  size: number;
  isDir: boolean;
}

export interface LoadedFile {
  blob: Blob;
  encrypted: boolean;
  relativePath: string;
}

@Injectable({
  providedIn: 'root',
})
export class FilesService {
  private http = inject(HttpClient);
  private appConfig = inject(AppConfigService);
  private filesCrypto = inject(FilesCryptoService);

  private cachedConfig: FilesConfig | null = null;

  private get baseUrl(): string {
    return this.appConfig.baseUrl;
  }

  getConfig(force = false): Observable<FilesConfig> {
    if (!force && this.cachedConfig) {
      return of(this.cachedConfig);
    }
    return this.http.get<FilesConfig>(`${this.baseUrl}/files/config`).pipe(
      tap((config) => {
        this.cachedConfig = config;
      }),
    );
  }

  async loadConfig(force = false): Promise<FilesConfig> {
    return firstValueFrom(this.getConfig(force));
  }

  listFiles(): Observable<FileListItem[]> {
    return this.http.get<FileListItem[]>(`${this.baseUrl}/files`);
  }

  /** GET /files/content/{relativePath} — raw file bytes (ciphertext when encrypted). */
  getFile(relativePath: string): Observable<HttpResponse<Blob>> {
    const encoded = relativePath
      .split('/')
      .map((segment) => encodeURIComponent(segment))
      .join('/');
    return this.http.get(`${this.baseUrl}/files/content/${encoded}`, {
      responseType: 'blob',
      observe: 'response',
    });
  }

  /**
   * Loads a file for display/download.
   * When the server reports encrypted storage, prompts for a session key (once)
   * and decrypts in the browser. The key is never sent to the API.
   */
  async loadFileForDisplay(relativePath: string): Promise<LoadedFile> {
    const config = await this.loadConfig();
    if (config.encrypted) {
      const unlocked = await this.filesCrypto.ensureUnlocked(true);
      if (!unlocked) {
        throw new Error('Files key required to open encrypted files');
      }
    }

    const response = await firstValueFrom(this.getFile(relativePath));
    const body = response.body;
    if (!body) {
      throw new Error('Empty file response');
    }

    const headerEncrypted = response.headers.get('X-Files-Encrypted') === 'true';
    const encrypted = config.encrypted || headerEncrypted;

    if (!encrypted) {
      return { blob: body, encrypted: false, relativePath };
    }

    try {
      const plain = await this.filesCrypto.decryptBlob(body);
      return { blob: plain, encrypted: true, relativePath };
    } catch (firstErr) {
      // Wrong key: clear, ask once more, retry decrypt without re-fetching ciphertext.
      const retried = await this.filesCrypto.promptForKey();
      if (!retried) {
        throw firstErr instanceof Error ? firstErr : new Error('Decryption failed');
      }
      const plain = await this.filesCrypto.decryptBlob(body);
      return { blob: plain, encrypted: true, relativePath };
    }
  }
}
