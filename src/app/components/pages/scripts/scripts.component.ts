import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIconButton, MatMiniFabButton } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { MatTableModule } from '@angular/material/table';
import { type ScriptFull, type ScriptListItem } from '../../../models/script';
import { ScriptsApiService } from '../../../services/scripts-api.service';
import {
  ScriptEditDialogComponent,
  type ScriptEditDialogResult,
} from '../../dialogs/script-edit-dialog/script-edit-dialog.component';
import { AlertService } from '../../../services/alert.service';
import { SCRIPT_EDIT_DIALOG_OPTIONS } from '../../../shared/constants';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-scripts',
  standalone: true,
  templateUrl: './scripts.component.html',
  styleUrls: ['./scripts.component.sass'],
  imports: [
    MatIconButton,
    MatMiniFabButton,
    MatIconModule,
    MatTableModule,
  ],
})
export class ScriptsComponent {
  private scriptsApi = inject(ScriptsApiService);
  private dialog = inject(MatDialog);
  private alertService = inject(AlertService);
  private destroyRef = inject(DestroyRef);

  readonly scripts = signal<ScriptListItem[]>([]);
  readonly displayedColumns = ['name', 'description', 'actions'];

  constructor() {
    this.reload();
  }

  reload(): void {
    this.scriptsApi.list({ scope: 'global' }).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (items) => this.scripts.set(items ?? []),
      error: (err) => this.alertService.showAlert(err?.error?.error ?? 'Failed to load scripts', 4000, 'error'),
    });
  }

  createScript(): void {
    const ref = this.dialog.open(ScriptEditDialogComponent, {
      data: { script: null },
      ...SCRIPT_EDIT_DIALOG_OPTIONS,
    });
    ref.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((result: ScriptEditDialogResult | null) => {
      if (!result) {
        return;
      }
      this.scriptsApi.create(result).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: () => this.reload(),
        error: (err) => this.alertService.showAlert(err?.error?.error ?? 'Failed to create script', 4000, 'error'),
      });
    });
  }

  editScript(item: ScriptListItem): void {
    this.scriptsApi.get(item.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (script: ScriptFull) => {
        const ref = this.dialog.open(ScriptEditDialogComponent, {
          data: { script },
          ...SCRIPT_EDIT_DIALOG_OPTIONS,
        });
        ref.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((result: ScriptEditDialogResult | null) => {
          if (!result) {
            return;
          }
          this.scriptsApi.update(item.id, result).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
            next: () => this.reload(),
            error: (err) => this.alertService.showAlert(err?.error?.error ?? 'Failed to update script', 4000, 'error'),
          });
        });
      },
      error: (err) => this.alertService.showAlert(err?.error?.error ?? 'Failed to load script', 4000, 'error'),
    });
  }

  deleteScript(item: ScriptListItem): void {
    if (!confirm(`Delete script "${item.name}"?`)) {
      return;
    }
    this.scriptsApi.delete(item.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => this.reload(),
      error: (err) => this.alertService.showAlert(err?.error?.error ?? 'Failed to delete script', 4000, 'error'),
    });
  }
}
