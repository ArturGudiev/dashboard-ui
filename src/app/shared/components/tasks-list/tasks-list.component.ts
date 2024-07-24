import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges
} from '@angular/core';
import { TaskC } from "../../../models/task-class";
import { SelectionModel } from "@angular/cdk/collections";
import { TasksService } from "../../../services/tasks.service";
import { Router } from "@angular/router";
import { every, isNaN } from "lodash";
import { TaskContainer } from "../../../interfaces/task-container";
import { CommandsService } from "../../../services/commands.service";
import { MatDialog } from "@angular/material/dialog";
import { GetValueDialogComponent } from "../../../modules/dialogs/get-value/get-value-dialog.component";
import { MatCheckboxChange } from "@angular/material/checkbox";
import { Store } from "@ngxs/store";
import { SetFocusedTaskForSubtasks } from "../../../state/app.actions";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { AppState } from "../../../state/app.state";
import { distinctUntilChanged, map } from "rxjs/operators";
import { taskContainerDescriptionsAreEqual } from "../../libs/utils.lib";
import { TaskContainerService } from "../../../services/task-container.service";

@UntilDestroy()
@Component({
  selector: 'app-tasks-list',
  templateUrl: './tasks-list.component.html',
  styleUrls: ['./tasks-list.component.sass']
})
export class TasksListComponent implements OnInit, OnChanges {
  @Input() container: TaskContainer;
  @Input() showTitle = false;
  @Input() tasks: TaskC[] = [];
  @Input() level = 0;

  @Output() refreshTasks = new EventEmitter();

  selection = new SelectionModel<number>(true, []);
  displayedColumns: string[] = ['select', 'position', 'description', 'actions', 'showSubtasks'];

  isContainerFocused: boolean = false;
  tasksByIdMap: { [key: number]: { tasks: TaskC[], container: TaskContainer }; } = {};

  get tasksByIdMapKeys(): number[] {
    return Object.keys(this.tasksByIdMap).map(e => Number(e));
  }

  get showFinishAllTasksIcon(): boolean {
    return !this.selection.hasValue() || this.selection.selected.length === this.tasks.length
  }

  get showFinishSelectedTasksIcon(): boolean {
    return this.selection.hasValue() && this.selection.selected.length < this.tasks.length
  }

  constructor(
    public tasksService: TasksService,
    private taskContainerService: TaskContainerService,
    private commandsService: CommandsService,
    public dialog: MatDialog,
    public cdr: ChangeDetectorRef,
    private router: Router,
    private store: Store,
  ) {
  }

  /**
   * Инициализация компонента. Подписка на
   * 1) команды (горячие клавиши)
   * 2) isContainerFocused
   * 3) подписка на subject refresh subtasks
   */
  ngOnInit(): void {
    this.commandsService.getDataStateChange()
      .pipe(untilDestroyed(this))
      .subscribe(state => {
        this.handleTaskCommand(state.command);
      })

    this.store.select(AppState.getFocusedTaskForSubtasks).pipe(
      untilDestroyed(this),
      map((el: TaskContainer | null) => this.showTitle && el && this.container.getFullDescription() === el.getFullDescription(),
      distinctUntilChanged()
      )).subscribe((el) => {
        this.isContainerFocused = el;
        this.cdr.detectChanges();
      });

    this.taskContainerService.refreshSubtasks$.pipe(untilDestroyed(this)).subscribe(v => {
      if (taskContainerDescriptionsAreEqual(v.getTaskContainerDescription(), this.container.getTaskContainerDescription())) {
        this.refreshTasks.emit();
      }
    })

  }

  /**
   * Добавление новой задачи для данного контейнера
   */
  addTask() {
    this.tasksService.openAddTaskDialog()
      .subscribe((responseObj: any) => {
        this.tasksService.addTaskDialogOpened = false;
        if (!responseObj) {
          return;
        }
        const description = responseObj.description;
        if (description) {
          const obj: any = {
            description: description,
            tags: [],
            done: false,
            notes: responseObj.notes,
            parents: [this.container.getTaskContainerDescription()]
          }
          this.tasksService.createNewTask(obj)
            .pipe(untilDestroyed(this))
            .subscribe(() => this.refreshTasks.emit())
        }
      })
  }

  /**
   * При изменении задач tasks, вызываются изменения зависимых объектов (вылеоение,  idsMap)
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes.tasks) {
      this.makeChangesAfterTasksChanged();
    }
  }

  private makeChangesAfterTasksChanged() {
    // выделение
    this.makeSelectionChangesAfterTasksChanged();

    // обновление элементов idsFromMap при изменении задач
    if (this.tasks === undefined) {
      return;
    }
    const newTasksIds = this.tasks.map(e => e._id);
    const idsFromMap = Object.keys(this.tasksByIdMap);
    idsFromMap.map(e => Number(e)).forEach(idFromMap => {
      if (!newTasksIds.includes(idFromMap)) {
        delete this.tasksByIdMap[idFromMap];
      }
    })

  }

  private makeSelectionChangesAfterTasksChanged() {
    if (this.tasks === undefined) {
      return;
    }
    if (every(this.selection.selected, x => !this.tasks.map(t => t._id).includes(x))) {
      this.clearSelection();
      return;
    }

    let newSelectedItems: number[] = [];
    this.selection.selected.forEach(id => {
      this.tasks.map(t => t._id)
      if (this.tasks.some(subtask => subtask._id === id)) {
        const element = this.tasks.find(subtask => subtask._id === id);
        newSelectedItems.push(element._id);
      }
    });
    this.selection.clear();
    this.selection = new SelectionModel<number>(true, newSelectedItems);
    this.cdr.detectChanges();

  }

  private handleTaskCommand(command: string) {
    const arr = command.split(' ');
    if (['select-subtask'].includes(arr[0])) {
      if (this.level === 0) {
        this.handleSelectSubtaskAction()
      }
    }
    if (['select-subsubtask'].includes(arr[0])) {
      if (this.level === 1) {
        this.handleSelectSubtaskAction()
      }
    }
    if (['deselect-subtask'].includes(arr[0])) {
      if (this.level === 0) {
      }
    }
    if (['task'].includes(arr[0]) && this.level === 0) {
      this.addTask();
    }
    if (['new-task'].includes(arr[0]) && this.isContainerFocused) {
      this.addTask();
    }
  }

  private clearSelection() {
    this.selection.clear();
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.tasks.length;
    return numSelected === numRows;
  }

  onMainCheckboxClick() {
    if (this.isAllSelected()) {
      this.clearSelection();
      return;
    }
    this.selection.select(...this.tasks.map(e => e._id));
  }

  onFinishTasksClick() {
    this.tasksService.finishTasksByIds(this.selection.selected).pipe(untilDestroyed(this)).subscribe(
      {
        next: () => {
          this.clearSelection();
          this.refreshTasks.emit();
        }
      }
    );
  }

  onFinishAllTasksClick() {
    this.clearSelection();
    const subtasks = this.tasks;
    this.tasksService.finishTasks(subtasks).pipe(untilDestroyed(this)).subscribe(
      () => this.refreshTasks.emit());
  }

  onSubtaskClick(task: TaskC) {
    this.clearSelection();
    this.router.navigate(['task', task._id]).then();
  }

  /**
   * Метод по заданному id
   *  1) подгружает задачу с бэкенда
   *  2) по списку id задачи подгружает список подзадач
   *  3) в tasksByIdMap добавляет запись {container: uploadedTask, tasks}
   * @param id
   */
  refreshTasksOfSelectedSubtask(id: number) {
    this.tasksService.getTask(id).pipe(untilDestroyed(this)).subscribe(task => {
      this.tasksService.getTasks(task.tasks).pipe(untilDestroyed(this)).subscribe(tasks => {
        this.tasksByIdMap[id] = {tasks, container: task};
      })
    })
  }

  private handleSelectSubtaskAction() {
    const dialogRef = this.dialog.open(GetValueDialogComponent, {data: {title: 'Solution'}});
    dialogRef.afterClosed().pipe(untilDestroyed(this)).subscribe((value: string) => {
      if (value && !isNaN(+value)) {
        const index = +value;
        if (index > 0 && index <= this.tasks.length) {
          this.selection = new SelectionModel<number>(true, [this.tasks[index - 1]._id]);
        }
      }
    });
  }

  /**
   * Обработка события нажатия на show subtasks checkbox. Если события добавляет галочку, то
   * берутся подзадачи выбранной задачи, добавляются запись по id {container, tasks} в tasksByIdMap.
   * Если мы сейчас находимся на нулевом уровне, и это первая выделеннвя подзадача, то она сразу фокусируется.
   *
   * Если же событие снимает галку, то запись соответствующая удаляется из tasksByIdMap.
   */
  setShowSubtasksField($event: MatCheckboxChange, subtask: TaskC) {
    if ($event.checked) {
      this.tasksService.getTasks(subtask.tasks).pipe(untilDestroyed(this)).subscribe(res => {
        this.tasksByIdMap[subtask._id] = {container: subtask, tasks: res};
        if (this.level === 0 && Object.keys(this.tasksByIdMap).length === 1) {
          this.store.dispatch(new SetFocusedTaskForSubtasks(subtask));
        }
      })
      ;
    } else {
      delete this.tasksByIdMap[subtask._id];
    }
  }

  focusSubtask() {
    this.store.dispatch(new SetFocusedTaskForSubtasks(this.container));
  }

  checkedElement(subtask: TaskC): boolean {
    return Object.keys(this.tasksByIdMap).includes(String(subtask._id));
  }

  finishSubtask(subtask: TaskC) {
    this.tasksService.finishTask(subtask).pipe(untilDestroyed(this)).subscribe(() => this.refreshTasks.emit())
  }
}
