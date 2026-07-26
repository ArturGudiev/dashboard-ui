import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogRef } from '@angular/material/dialog';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatInput } from '@angular/material/input';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { type ScriptFull, type ScriptParam, type ScriptParamType, type ScriptShort } from '../../../models/script';
import { ScriptsApiService } from '../../../services/scripts-api.service';
import { AppStore } from '../../../state/app.store';

export type ScriptEditDialogData = {
  script?: ScriptFull | null;
};

export type ScriptEditDialogResult = ScriptShort;

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-script-edit-dialog',
  standalone: true,
  templateUrl: './script-edit-dialog.component.html',
  styleUrls: ['./script-edit-dialog.component.sass'],
  imports: [
    ReactiveFormsModule,
    MatFormField,
    MatLabel,
    MatInput,
    MatDialogActions,
    MatButton,
    MatIconButton,
    MatSelectModule,
    MatIconModule,
    CdkTextareaAutosize,
  ],
})
export class ScriptEditDialogComponent {
  dialogRef = inject(MatDialogRef<ScriptEditDialogComponent, ScriptEditDialogResult | null>);
  data = inject<ScriptEditDialogData>(MAT_DIALOG_DATA, { optional: true });
  private scriptsApi = inject(ScriptsApiService);
  private destroyRef = inject(DestroyRef);
  private appStore = inject(AppStore);

  readonly syntaxError = signal('');
  readonly paramTypes: ScriptParamType[] = ['string', 'boolean', 'number'];

  form = new FormGroup({
    name: new FormControl(this.data?.script?.name ?? '', { nonNullable: true, validators: [Validators.required] }),
    description: new FormControl(this.data?.script?.description ?? '', { nonNullable: true }),
    code: new FormControl(this.data?.script?.code ?? '', { nonNullable: true, validators: [Validators.required] }),
    params: new FormArray(
      (this.data?.script?.params ?? []).map((p) => this.createParamGroup(p)),
    ),
  });

  constructor() {
    this.appStore.setDisabledHotkeys(true);
    this.destroyRef.onDestroy(() => this.appStore.setDisabledHotkeys(false));
  }

  get params(): FormArray {
    return this.form.controls.params;
  }

  addParam(): void {
    this.params.push(this.createParamGroup({ name: '', type: 'string' }));
  }

  removeParam(index: number): void {
    this.params.removeAt(index);
  }

  onCodeKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Tab') {
      return;
    }
    event.preventDefault();

    const textarea = event.target as HTMLTextAreaElement;
    const value = textarea.value;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const indent = '  ';

    if (event.shiftKey) {
      this.unindentSelection(textarea, value, start, end, indent);
      return;
    }

    if (start !== end && value.slice(start, end).includes('\n')) {
      this.indentSelection(textarea, value, start, end, indent);
      return;
    }

    const next = value.slice(0, start) + indent + value.slice(end);
    this.form.controls.code.setValue(next);
    queueMicrotask(() => {
      textarea.selectionStart = textarea.selectionEnd = start + indent.length;
    });
  }

  validateCode(): void {
    const code = this.form.controls.code.value;
    this.scriptsApi.validate(code).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res) => this.syntaxError.set(res.ok ? '' : (res.error ?? 'Invalid syntax')),
      error: (err) => this.syntaxError.set(err?.error?.error ?? 'Validation failed'),
    });
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    const params: ScriptParam[] = value.params
      .filter((p) => p.name.trim())
      .map((p) => ({
        name: p.name.trim(),
        type: p.type,
        ...(p.defaultValue !== '' ? { default: this.coerceDefault(p.type, p.defaultValue) } : {}),
      }));

    this.scriptsApi.validate(value.code).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (res) => {
        if (!res.ok) {
          this.syntaxError.set(res.error ?? 'Invalid syntax');
          return;
        }
        this.syntaxError.set('');
        this.dialogRef.close({
          name: value.name.trim(),
          description: value.description.trim(),
          code: value.code,
          params,
        });
      },
      error: (err) => this.syntaxError.set(err?.error?.error ?? 'Validation failed'),
    });
  }

  private createParamGroup(param: ScriptParam): FormGroup<{
    name: FormControl<string>;
    type: FormControl<ScriptParamType>;
    defaultValue: FormControl<string>;
  }> {
    return new FormGroup({
      name: new FormControl(param.name, { nonNullable: true }),
      type: new FormControl(param.type, { nonNullable: true }),
      defaultValue: new FormControl(
        param.default === undefined || param.default === null ? '' : String(param.default),
        { nonNullable: true },
      ),
    });
  }

  private coerceDefault(type: ScriptParamType, raw: string): unknown {
    switch (type) {
      case 'boolean':
        return raw === 'true';
      case 'number':
        return Number(raw);
      default:
        return raw;
    }
  }

  private indentSelection(
    textarea: HTMLTextAreaElement,
    value: string,
    start: number,
    end: number,
    indent: string,
  ): void {
    const lineStart = value.lastIndexOf('\n', start - 1) + 1;
    const selected = value.slice(lineStart, end);
    const indented = selected.replace(/^/gm, indent);
    const next = value.slice(0, lineStart) + indented + value.slice(end);
    this.form.controls.code.setValue(next);
    queueMicrotask(() => {
      textarea.selectionStart = lineStart;
      textarea.selectionEnd = lineStart + indented.length;
    });
  }

  private unindentSelection(
    textarea: HTMLTextAreaElement,
    value: string,
    start: number,
    end: number,
    indent: string,
  ): void {
    const lineStart = value.lastIndexOf('\n', start - 1) + 1;
    const lineEnd = end === start
      ? (value.indexOf('\n', end) === -1 ? value.length : value.indexOf('\n', end))
      : end;
    const blockEnd = Math.max(lineEnd, end);
    const selected = value.slice(lineStart, blockEnd);
    const unindented = selected.replace(new RegExp(`^(?:${indent}|\\t)`, 'gm'), '');
    const next = value.slice(0, lineStart) + unindented + value.slice(blockEnd);
    const removed = selected.length - unindented.length;
    this.form.controls.code.setValue(next);
    queueMicrotask(() => {
      textarea.selectionStart = Math.max(lineStart, start - Math.min(removed, indent.length));
      textarea.selectionEnd = Math.max(textarea.selectionStart, end - removed);
    });
  }
}
