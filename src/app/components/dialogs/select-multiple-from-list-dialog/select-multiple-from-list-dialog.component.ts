import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogRef } from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';

export interface SelectMultipleFromListDialogData<T = string> {
  title: string;
  values: T[];
  mapFunction?: (item: T) => string;
  /** Pre-select all items when the dialog opens. */
  selectAllByDefault?: boolean;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-select-multiple-from-list-dialog',
  standalone: true,
  templateUrl: './select-multiple-from-list-dialog.component.html',
  styleUrls: ['./select-multiple-from-list-dialog.component.sass'],
  imports: [
    MatButton,
    MatCheckboxModule,
    MatDialogActions,
  ],
})
export class SelectMultipleFromListDialogComponent<T> {
  private readonly dialogRef = inject(MatDialogRef<SelectMultipleFromListDialogComponent<T>, T[] | null>);
  readonly data = inject<SelectMultipleFromListDialogData<T>>(MAT_DIALOG_DATA);

  readonly selectedIndexes = signal<ReadonlySet<number>>(
    this.data.selectAllByDefault
      ? new Set(this.data.values.map((_, index) => index))
      : new Set(),
  );

  readonly allSelected = computed(() =>
    this.data.values.length > 0 && this.selectedIndexes().size === this.data.values.length,
  );

  readonly someSelected = computed(() => {
    const size = this.selectedIndexes().size;
    return size > 0 && size < this.data.values.length;
  });

  readonly selectedCount = computed(() => this.selectedIndexes().size);

  labelFor(item: T): string {
    return this.data.mapFunction ? this.data.mapFunction(item) : String(item);
  }

  isSelected(index: number): boolean {
    return this.selectedIndexes().has(index);
  }

  toggleIndex(index: number): void {
    this.selectedIndexes.update((indexes) => {
      const next = new Set(indexes);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }

  toggleAll(): void {
    if (this.allSelected()) {
      this.selectedIndexes.set(new Set());
      return;
    }
    this.selectedIndexes.set(new Set(this.data.values.map((_, index) => index)));
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }

  onOk(): void {
    const selected = this.data.values.filter((_, index) => this.selectedIndexes().has(index));
    this.dialogRef.close(selected);
  }
}
