import { ChangeDetectionStrategy, Component, DestroyRef, inject, input, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { type ContainerVariable } from '../../../models/task-class';
import { ContainerVariablesApiService } from '../../../services/container-variables-api.service';
import {
  VariableDialogComponent,
  type VariableDialogResult,
} from '../../dialogs/variable-dialog/variable-dialog.component';
import { VARIABLE_DIALOG_OPTIONS } from '../../../shared/constants';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-variables-table',
  templateUrl: './variables-table.component.html',
  imports: [
    MatTableModule,
    MatButtonModule,
    MatIconModule,
  ],
  standalone: true,
  styleUrls: ['./variables-table.component.sass'],
  host: {
    '[class.expanded]': 'tableVisible()',
  },
})
export class VariablesTableComponent {
  variables = input.required<ContainerVariable[]>();

  addVariableClick = output<void>();
  refreshContainer = output<void>();

  readonly tableVisible = signal(false);
  readonly displayedColumns: string[] = ['name', 'value', 'delete'];
  readonly toggleTableTitle = signal('Show variables table');

  private containerVariablesApiService = inject(ContainerVariablesApiService);
  private dialog = inject(MatDialog);
  private destroyRef = inject(DestroyRef);

  onAddVariableClick(): void {
    this.addVariableClick.emit();
  }

  toggleTable(): void {
    this.tableVisible.update(value => !value);
    this.toggleTableTitle.set(this.tableVisible() ? 'Hide variables table' : 'Show variables table');
  }

  onDeleteVariable(variable: ContainerVariable, event: MouseEvent): void {
    event.stopPropagation();
    this.containerVariablesApiService.deleteVariable(variable.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.refreshContainer.emit());
  }

  onEditVariable(variable: ContainerVariable): void {
    const dialogRef = this.dialog.open(VariableDialogComponent, {
      data: {
        variableName: variable.variableName,
        variableValue: variable.variableValue,
      },
      ...VARIABLE_DIALOG_OPTIONS,
    });

    dialogRef.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((result: VariableDialogResult | null) => {
      if (!result) {
        return;
      }

      this.containerVariablesApiService.patchVariable(
        variable.id,
        result.variableName,
        result.variableValue,
      ).subscribe(() => this.refreshContainer.emit());
    });
  }
}
