import { ChangeDetectionStrategy, Component, DestroyRef, inject, input, output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTableModule } from '@angular/material/table';
import { type TaskContainer } from '../../../models/interfaces/task-container';
import { type ContainerCheck } from '../../../models/task-class';
import { AlertService } from '../../../services/alert.service';
import { ContainerChecksApiService } from '../../../services/container-checks-api.service';
import {
  type CreateHierarchicalTasksRequest,
  TasksService,
} from '../../../services/task-container-services/tasks.service';
import { TaskContainerService } from '../../../services/task-container-services/task-container.service';
import { GET_VALUE_DIALOG_OPTIONS, SELECT_MULTIPLE_DIALOG_OPTIONS } from '../../../shared/constants';
import { AppStore } from '../../../state/app.store';
import { GetValueDialogComponent } from '../../dialogs/get-value/get-value-dialog.component';
import {
  SelectMultipleFromListDialogComponent,
} from '../../dialogs/select-multiple-from-list-dialog/select-multiple-from-list-dialog.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-container-checks-list',
  templateUrl: './container-checks-list.component.html',
  imports: [
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
  ],
  standalone: true,
  styleUrls: ['./container-checks-list.component.sass'],
})
export class ContainerChecksListComponent {
  container = input.required<TaskContainer>();
  checks = input.required<ContainerCheck[]>();

  addCheckClick = output<void>();
  refreshContainer = output<void>();

  readonly displayedColumns: string[] = ['description', 'delete'];

  private containerChecksApiService = inject(ContainerChecksApiService);
  private tasksService = inject(TasksService);
  private taskContainerService = inject(TaskContainerService);
  private appStore = inject(AppStore);
  private alertService = inject(AlertService);
  private dialog = inject(MatDialog);
  private destroyRef = inject(DestroyRef);

  onAddCheckClick(): void {
    this.addCheckClick.emit();
  }

  onDeleteCheck(check: ContainerCheck, event: MouseEvent): void {
    event.stopPropagation();
    this.containerChecksApiService.deleteCheck(check.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.refreshContainer.emit());
  }

  onEditCheck(check: ContainerCheck): void {
    const dialogRef = this.dialog.open(GetValueDialogComponent, {
      data: {
        title: 'Edit check',
        initialValue: check.description,
        selectInitialValue: true,
      },
      ...GET_VALUE_DIALOG_OPTIONS,
    });

    dialogRef.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((description: string | null) => {
      if (!description?.trim()) {
        return;
      }

      this.containerChecksApiService.patchCheck(check.id, description.trim())
        .subscribe(() => this.refreshContainer.emit());
    });
  }

  addAllChecksAsTasks(): void {
    this.addChecksAsTasks(this.checks(), this.container());
  }

  addSelectedChecksAsTasks(): void {
    this.openSelectChecksDialog((selected) => {
      this.addChecksAsTasks(selected, this.container());
    });
  }

  addAllChecksToFocusedTask(): void {
    const focused = this.getFocusedTask();
    if (!focused) {
      return;
    }
    this.addChecksAsTasks(this.checks(), focused);
  }

  addSelectedChecksToFocusedTask(): void {
    const focused = this.getFocusedTask();
    if (!focused) {
      return;
    }
    this.openSelectChecksDialog((selected) => {
      this.addChecksAsTasks(selected, focused);
    });
  }

  private getFocusedTask(): TaskContainer | null {
    const focused = this.appStore.focusedTaskForSubtasks();
    if (!focused) {
      this.alertService.showAlert('No focused task selected', 3000, 'error');
      return null;
    }
    return focused;
  }

  private openSelectChecksDialog(onSelected: (checks: ContainerCheck[]) => void): void {
    const checks = this.checks();
    if (checks.length === 0) {
      this.alertService.showAlert('No checks to select', 3000, 'error');
      return;
    }

    const dialogRef = this.dialog.open<
      SelectMultipleFromListDialogComponent<ContainerCheck>,
      { title: string; values: ContainerCheck[]; mapFunction: (check: ContainerCheck) => string; selectAllByDefault: boolean },
      ContainerCheck[] | null
    >(SelectMultipleFromListDialogComponent, {
      data: {
        title: 'Select checks',
        values: checks,
        mapFunction: (check) => check.description,
        selectAllByDefault: true,
      },
      ...SELECT_MULTIPLE_DIALOG_OPTIONS,
    });

    dialogRef.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((selected) => {
      if (!selected?.length) {
        return;
      }
      onSelected(selected);
    });
  }

  private addChecksAsTasks(checks: ContainerCheck[], parent: TaskContainer): void {
    if (checks.length === 0) {
      this.alertService.showAlert('No checks to add', 3000, 'error');
      return;
    }

    const request: CreateHierarchicalTasksRequest = {
      parent: { id: parent.id, type: parent.type },
      nodes: checks.map((check) => ({
        description: this.checkToTaskDescription(check),
        children: [],
      })),
    };

    this.tasksService.createHierarchicalTasks(request)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.refreshContainer.emit();
        this.taskContainerService.refreshSubtasks$.next(parent);
      });
  }

  private checkToTaskDescription(check: ContainerCheck): string {
    return `Check "${check.description}"`;
  }
}
