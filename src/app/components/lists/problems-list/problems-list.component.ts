import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, input, type OnInit, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { type Problem } from "../../../models/problem";
import { SelectionModel } from "@angular/cdk/collections";
import { Router } from "@angular/router";
import { type TaskC } from "../../../models/task-class";
import { type MatCheckboxChange } from "@angular/material/checkbox";
import { AppStore } from "../../../state/app.store";
import { GetValueDialogComponent } from "../../dialogs/get-value/get-value-dialog.component";
import { MatDialog } from "@angular/material/dialog";
import { GET_VALUE_DIALOG_OPTIONS } from "../../../shared/constants";
import { CommandsService } from "../../../services/commands.service";
import { MatTableModule } from "@angular/material/table";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { NgClass } from "@angular/common";
import { TasksListComponent } from "../tasks-list/tasks-list.component";
import { type TaskContainer } from "../../../models/interfaces/task-container";
import { ProblemsService } from "../../../services/task-container-services/problems.service";
import { TasksService } from "../../../services/task-container-services/tasks.service";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-problems-list',
  templateUrl: './problems-list.component.html',
  imports: [
    MatTableModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    NgClass,
    TasksListComponent
  ],
  standalone: true,
  styleUrls: ['./problems-list.component.sass']
})
export class ProblemsListComponent implements OnInit {
  container = input.required<TaskContainer>();
  problems = input.required<Problem[]>();
  refreshProblems = output<void>();
  
  readonly displayedColumns: string[] = ['select', 'position', 'description', 'actions', 'showSubtasks'];
  readonly expandedSubtasks = signal<Record<number, { tasks: TaskC[]; container: TaskContainer }>>({});
  readonly tasksByIdMapKeys = computed(() => Object.keys(this.expandedSubtasks()).map(Number));
  readonly selection = new SelectionModel<Problem>(true, []);

  private problemsService = inject(ProblemsService);
  private commandsService = inject(CommandsService);
  private tasksService = inject(TasksService);
  private appStore = inject(AppStore);
  private dialog = inject(MatDialog);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.commandsService.getDataStateChange()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(state => {
        this.handleTaskCommand(state.command);
      })
  }

  /**
   * Обработка горячих клавиш
   * @param command
   * @private
   */
  private handleTaskCommand(command: string) {
    const arr = command.split(' ');
    if (['problem'].includes(arr[0])) {
      this.addProblem();
    }
  }

  /**
   * Метод создаёт новую проблему
   */
  addProblem(): void {
    this.problemsService.createProblemFromDialog(
      this.container()
    ).subscribe(() => this.refreshProblems.emit());
  }


  onFinishProblemClick() {
    this.problemsService.finishProblem(this.selection.selected[0]).subscribe(
      {
        next: () => {
          this.selection.clear();
          this.refreshProblems.emit();
        }
      }
    );
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.problems().length;
    return numSelected === numRows;
  }

  /**
   * Метод по заданному id
   *  1) подгружает задачу с бэкенда
   *  2) по списку id задачи подгружает список подзадач
   *  3) в tasksByIdMap добавляет запись {container: uploadedTask, tasks}
   * @param id
   */
  refreshTasksOfSelectedSubtask(id: number) {
    this.problemsService.getProblem(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(problem => {
      this.tasksService.getTasks(problem.tasks).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(tasks => {
        this.expandedSubtasks.update(map => ({
          ...map,
          [id]: { tasks, container: problem },
        }));
      })
    })
  }


  onMainCheckboxClick() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }
    this.selection.select(...this.problems());
  }

  onProblemClick(problem: Problem) {
    this.router.navigate(['problem', problem.id]).then();
  }

  /**
   * Выделен ли элемент для отображение подзадач
   * @param subtask
   */
  checkedElement(subproblem: Problem): boolean {
    return Object.hasOwn(this.expandedSubtasks(), subproblem.id);
  }

  /**
   * Обработка события нажатия на show subtasks checkbox. Если события добавляет галочку, то
   * берутся подзадачи выбранной задачи, добавляются запись по id {container, tasks} в tasksByIdMap.
   * Если мы сейчас находимся на нулевом уровне, и это первая выделеннвя подзадача, то она сразу фокусируется.
   *
   * Если же событие снимает галку, то запись соответствующая удаляется из tasksByIdMap.
   */
  setShowSubtasksField($event: MatCheckboxChange, problem: Problem) {
    if ($event.checked) {
      this.tasksService.getTasks(problem.tasks).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(res => {
        this.expandedSubtasks.update(map => ({
          ...map,
          [problem.id]: { container: problem, tasks: res },
        }));
        if (Object.keys(this.expandedSubtasks()).length === 1) {
          this.appStore.setFocusedTaskForSubtasks(problem);
        }
      });
    } else {
      this.expandedSubtasks.update(map => {
        const { [problem.id]: _removed, ...rest } = map;
        return rest;
      });
    }
  }

  onProblemSolvedClick(problem: Problem) {
    const dialogRef = this.dialog.open(GetValueDialogComponent,
      {data: {title: 'Solution', inputWidth: '40rem'},
        ...GET_VALUE_DIALOG_OPTIONS});
    dialogRef.afterClosed().subscribe((solution: string) => {
      if (solution) {
        this.problemsService.solveTheProblem(problem, solution)
          .subscribe(() => this.refreshProblems.emit());
      }
    });
  }
}
