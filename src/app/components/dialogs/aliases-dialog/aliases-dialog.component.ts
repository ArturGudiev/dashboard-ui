import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogRef } from '@angular/material/dialog';
import { MatButton } from '@angular/material/button';
import { MatChip, MatChipRemove, MatChipSet } from '@angular/material/chips';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInput } from '@angular/material/input';

export interface AliasesDialogData {
  aliases: string[];
  containerDescription?: string;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-aliases-dialog',
  templateUrl: './aliases-dialog.component.html',
  styleUrls: ['./aliases-dialog.component.sass'],
  standalone: true,
  imports: [
    FormsModule,
    MatButton,
    MatChip,
    MatChipRemove,
    MatChipSet,
    MatDialogActions,
    MatFormField,
    MatIcon,
    MatInput,
    MatLabel,
  ],
})
export class AliasesDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<AliasesDialogComponent, string[] | null>);
  readonly data = inject<AliasesDialogData>(MAT_DIALOG_DATA);

  readonly aliases = signal<string[]>([...(this.data.aliases ?? [])]);
  readonly newAlias = signal('');

  addAlias(): void {
    const value = this.newAlias().trim();
    if (!value) {
      return;
    }

    const exists = this.aliases().some(
      (alias) => alias.toLowerCase() === value.toLowerCase(),
    );
    if (exists) {
      this.newAlias.set('');
      return;
    }

    this.aliases.update((list) => [...list, value]);
    this.newAlias.set('');
  }

  removeAlias(aliasToRemove: string): void {
    this.aliases.update((list) => list.filter((alias) => alias !== aliasToRemove));
  }

  onAliasInputKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.addAlias();
    }
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }

  onOk(): void {
    this.dialogRef.close(this.aliases());
  }
}
