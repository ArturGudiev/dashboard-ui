import { AsyncPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogRef } from '@angular/material/dialog';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatButton } from '@angular/material/button';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { combineLatest, debounceTime, distinctUntilChanged, map, of, startWith, switchMap } from 'rxjs';
import { type ScriptFull, type ScriptListItem, type ScriptParam, type ScriptScope } from '../../../models/script';
import { type TaskContainer } from '../../../models/interfaces/task-container';
import { ScriptsApiService } from '../../../services/scripts-api.service';
import { AppStore } from '../../../state/app.store';

export type RunScriptDialogData = {
  container: TaskContainer;
  scriptId?: number;
  scope?: ScriptScope;
};

export type RunScriptDialogResult = {
  scriptId: number;
  params: Record<string, unknown>;
};

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-run-script-dialog',
  standalone: true,
  templateUrl: './run-script-dialog.component.html',
  styleUrls: ['./run-script-dialog.component.sass'],
  imports: [
    AsyncPipe,
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatInput,
    MatDialogActions,
    MatButton,
    MatAutocompleteModule,
    MatCheckboxModule,
    MatButtonToggleModule,
    CdkTextareaAutosize,
  ],
})
export class RunScriptDialogComponent {
  dialogRef = inject(MatDialogRef<RunScriptDialogComponent, RunScriptDialogResult | null>);
  data = inject<RunScriptDialogData>(MAT_DIALOG_DATA);
  private scriptsApi = inject(ScriptsApiService);
  private destroyRef = inject(DestroyRef);
  private appStore = inject(AppStore);

  readonly selectedScript = signal<ScriptFull | null>(null);
  readonly launchError = signal('');
  readonly paramControls = signal<FormGroup>(new FormGroup({}));
  readonly hidePicker = signal(!!this.data.scriptId);

  searchControl = new FormControl('', { nonNullable: true });
  scopeControl = new FormControl<ScriptScope>(this.data.scope ?? 'all', { nonNullable: true });

  filteredScripts$ = combineLatest([
    this.searchControl.valueChanges.pipe(startWith(''), debounceTime(200), distinctUntilChanged()),
    this.scopeControl.valueChanges.pipe(startWith(this.scopeControl.value)),
  ]).pipe(
    switchMap(([value, scope]) => {
      if (typeof value !== 'string') {
        return of([] as ScriptListItem[]);
      }
      return this.scriptsApi.listForContainer(this.data.container, scope, value).pipe(
        map((items) => items ?? []),
      );
    }),
  );

  constructor() {
    this.appStore.setDisabledHotkeys(true);
    this.destroyRef.onDestroy(() => this.appStore.setDisabledHotkeys(false));
    if (this.data.scriptId) {
      this.loadScript(this.data.scriptId);
    }
  }

  displayScriptName(script: ScriptListItem | string | null): string {
    if (!script) {
      return '';
    }
    return typeof script === 'string' ? script : script.name;
  }

  onScriptSelected(script: ScriptListItem): void {
    this.loadScript(script.id);
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }

  onLaunch(): void {
    const script = this.selectedScript();
    if (!script) {
      this.launchError.set('Select a script first');
      return;
    }
    const params = this.collectParams(script.params ?? []);
    this.dialogRef.close({ scriptId: script.id, params });
  }

  private loadScript(id: number): void {
    this.launchError.set('');
    this.scriptsApi.get(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (full) => {
        this.selectedScript.set(full);
        this.buildParamControls(full.params ?? []);
        if (!this.searchControl.value) {
          this.searchControl.setValue(full.name, { emitEvent: false });
        }
      },
      error: (err) => this.launchError.set(err?.error?.error ?? 'Failed to load script'),
    });
  }

  private buildParamControls(params: ScriptParam[]): void {
    const group: Record<string, FormControl> = {};
    for (const p of params) {
      if (p.type === 'boolean') {
        group[p.name] = new FormControl(p.default === true || p.default === 'true', { nonNullable: true });
      } else {
        group[p.name] = new FormControl(
          p.default === undefined || p.default === null ? '' : String(p.default),
          { nonNullable: true },
        );
      }
    }
    this.paramControls.set(new FormGroup(group));
  }

  private collectParams(params: ScriptParam[]): Record<string, unknown> {
    const form = this.paramControls();
    const out: Record<string, unknown> = {};
    for (const p of params) {
      const raw = form.get(p.name)?.value;
      switch (p.type) {
        case 'boolean':
          out[p.name] = !!raw;
          break;
        case 'number':
          out[p.name] = raw === '' || raw === null || raw === undefined ? undefined : Number(raw);
          break;
        default:
          out[p.name] = raw ?? '';
      }
    }
    return out;
  }
}
