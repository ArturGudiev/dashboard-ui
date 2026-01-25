import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Problem } from "../../../models/problem";
import { SelectionModel } from "@angular/cdk/collections";
import { Router } from "@angular/router";
import { TaskC } from "../../../models/task-class";
import { MatCheckboxChange } from "@angular/material/checkbox";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { SetFocusedTaskForSubtasks } from "../../../state/app.actions";
import { Store } from "@ngxs/store";
import { GetValueDialogComponent } from "../../dialogs/get-value/get-value-dialog.component";
import { MatDialog } from "@angular/material/dialog";
import { GET_VALUE_DIALOG_OPTIONS } from "../../../shared/constants";
import { CommandsService } from "../../../services/commands.service";
import { MaterialModule } from "../../../modules/material/material.module";
import { NgClass, NgForOf, NgIf } from "@angular/common";
import { TasksListComponent } from "../tasks-list/tasks-list.component";
import { TaskContainer } from "../../../models/interfaces/task-container";
import { ProblemsService } from "../../../services/task-container-services/problems.service";
import { TasksService } from "../../../services/task-container-services/tasks.service";

@UntilDestroy()
@Component({
  selector: 'app-problems-list',
  templateUrl: './problems-list.component.html',
  standalone: true,
  imports: [
    MaterialModule,
    NgClass,
    NgForOf,
    NgIf,
    TasksListComponent
  ],
  styleUrls: ['./problems-list.component.sass']
})
export class ProblemsListComponent implements OnInit {
  @Input({required: true}) container!: TaskContainer;
  @Input() problems: Problem[] = [];
  @Output() refreshProblems = new EventEmitter();
  displayedColumns: string[] = ['select', 'position', 'description', 'actions', 'showSubtasks'];

  tasksByIdMap: { [key: number]: { tasks: TaskC[], container: TaskContainer }; } = {};

  selection = new SelectionModel<Problem>(true, []);

  get tasksByIdMapKeys(): number[] {
    return Object.keys(this.tasksByIdMap).map(e => Number(e));
  }

  constructor(
    private problemsService: ProblemsService,
    private commandsService: CommandsService,
    private tasksService: TasksService,
    private store: Store,
    private router: Router,
    private dialog: MatDialog,
  ) {
  }

  ngOnInit(): void {
    this.commandsService.getDataStateChange()
      .pipe(untilDestroyed(this))
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
    this.problemsService.createProblemFromDialog(this.container).subscribe(() => this.refreshProblems.emit());
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
    const numRows = this.problems.length;
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
    this.problemsService.getProblem(id).pipe(untilDestroyed(this)).subscribe(problem => {
      this.tasksService.getTasks(problem.tasks).pipe(untilDestroyed(this)).subscribe(tasks => {
        this.tasksByIdMap[id] = {tasks, container: problem};
      })
    })
  }


  onMainCheckboxClick() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }
    this.selection.select(...this.problems);
  }

  onProblemClick(problem: Problem) {
    this.router.navigate(['problem', problem.id]).then();
  }

  /**
   * Выделен ли элемент для отображение подзадач
   * @param subtask
   */
  checkedElement(subproblem: Problem): boolean {
    return Object.keys(this.tasksByIdMap).includes(String(subproblem.id));
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
      this.tasksService.getTasks(problem.tasks).pipe(untilDestroyed(this)).subscribe(res => {
        this.tasksByIdMap[problem.id] = {container: problem, tasks: res};
        if (Object.keys(this.tasksByIdMap).length === 1) {
          this.store.dispatch(new SetFocusedTaskForSubtasks(problem));
        }
      })
      ;
    } else {
      delete this.tasksByIdMap[problem.id];
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
