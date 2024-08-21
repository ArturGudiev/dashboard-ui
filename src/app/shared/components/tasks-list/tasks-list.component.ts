import {
  ChangeDetectorRef,
  Component,
  EventEmitter, HostListener,
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
import { NavigationService } from "../../../services/navigation.service";

@UntilDestroy()
@Component({
  selector: 'app-tasks-list',
  templateUrl: './tasks-list.component.html',
  styleUrls: ['./tasks-list.component.sass']
})
export class TasksListComponent implements OnInit, OnChanges {
  @Input({required: true}) container!: TaskContainer;
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
    private navigationService: NavigationService,
    public dialog: MatDialog,
    public cdr: ChangeDetectorRef,
    private router: Router,
    private store: Store,
  ) {
  }

  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    if (event.key === '1') {
      console.log('1');
    }
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
        this.isContainerFocused = !!el;
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
  addTask(makeSelected = false) {
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
            .subscribe((newTask: TaskC) => {
              if (makeSelected) {
                this.tasksByIdMap[newTask._id] = {container: newTask, tasks: []};
                this.store.dispatch(new SetFocusedTaskForSubtasks(newTask));
              }
              this.refreshTasks.emit();
            })
        }
      })
  }

  /**
   * При изменении задач tasks, вызываются изменения зависимых объектов (вылеоение,  idsMap)
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['tasks']) {
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
        this.removeTasksByIdMapKey(idFromMap)
      }
    })

  }

  /**
   * При изменении this.tasks изменяется выделение
   * @private
   */
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
        if (element) {
          newSelectedItems.push(element._id);
        }
      }
    });
    this.selection.clear();
    this.selection = new SelectionModel<number>(true, newSelectedItems);
    this.cdr.detectChanges();

  }

  /**
   * Обработка горячих клавиш
   * @param command
   * @private
   */
  private handleTaskCommand(command: string) {
    const arr = command.split(' ');
    if (['select-subtask'].includes(arr[0])) {
      if (this.level === 0) {
        this.handleSelectSubtaskAction()
      }
    }

    if (arr.length === 1 && Number.isInteger(+arr[0]) && +arr[0] >= 1 && +arr[0] <= this.tasks.length) {
      const index = +arr[0] - 1;
      const task = this.tasks[index];

      // this.router.navigate(['task', this.tasks[+arr[0] - 1]._id]).then();
      this.navigationService.navigateToTask(this.tasks[+arr[0] - 1]._id);
    }

    if (arr[0].startsWith('select-task')) {
      console.log('select-task', arr[0]);
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
    if (['new-task-go'].includes(arr[0]) && this.level === 0) {
      this.addTaskAndGoToIt();
    }
    if (['new-task-for-focused-task-and-go'].includes(arr[0]) && this.isContainerFocused) {
      this.addTaskAndGoToIt();
    }
    if (['selected-task'].includes(arr[0]) && this.level === 0) {
      this.addTask(true);
    }
    if (['subtask'].includes(arr[0]) && this.isContainerFocused) {
      this.addTask();
    }
  }

  /**
   * Очистить выделение
   */
  private clearSelection() {
    this.selection.clear();
  }

  /**
   * Проверка, выделены ли все элементы в таблице (на этой странице)
   */
  areAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.tasks.length;
    return numSelected === numRows;
  }

  /**
   * Обработчик клика на главный чекбокс
   */
  onMainCheckboxClick() {
    if (this.areAllSelected()) {
      this.clearSelection();
      return;
    }
    this.selection.select(...this.tasks.map(e => e._id));
  }

  /**
   * Обработчик клика на завершение задачи
   */
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

  /**
   * Обработчик щакрытия всех задач
   */
  onFinishAllTasksClick() {
    this.clearSelection();
    const subtasks = this.tasks;
    this.tasksService.finishTasks(subtasks).pipe(untilDestroyed(this)).subscribe(
      () => this.refreshTasks.emit());
  }

  /**
   * обработчик клика на подзадачу
   */
  onSubtaskClick(task: TaskC) {
    this.clearSelection();
    // this.router.navigate(['task', task._id]).then();
    this.navigationService.navigateToTask(task._id);
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

  /**
   * Обработчик команды select-subtask
   * @private
   */
  private handleSelectSubtaskAction() {
    const dialogRef = this.dialog.open(GetValueDialogComponent, {data: {title: 'Select subtask'}});
    dialogRef.afterClosed().pipe(untilDestroyed(this)).subscribe((value: string) => {
      if (value && !isNaN(+value)) {
        const index = +value;
        if (index > 0 && index <= this.tasks.length) {
          const task = this.tasks[index - 1];
          if ( this.tasksByIdMap[task._id] !== undefined ) {
            this.removeTasksByIdMapKey(task._id);
            return;
          }
          this.tasksService.getTasks(task.tasks).subscribe(tasks => {
            this.tasksByIdMap[task._id] = {tasks, container: task};
            this.store.dispatch(new SetFocusedTaskForSubtasks(task));
          });
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
      this.removeTasksByIdMapKey(subtask._id)
    }
  }

  private removeTasksByIdMapKey(key: number) {
    delete this.tasksByIdMap[key];
    this.checkIfTaskForSubtasksIsLast();
  }

  /**
   * Фокусирование задачи
   */
  focusSubtask() {
    this.store.dispatch(new SetFocusedTaskForSubtasks(this.container));
  }

  /**
   * Выделен ли элемент для отображение подзадач
   * @param subtask
   */
  checkedElement(subtask: TaskC): boolean {
    return Object.keys(this.tasksByIdMap).includes(String(subtask._id));
  }

  /**
   * Завершить подзадачу
   * @param subtask
   */
  finishSubtask(subtask: TaskC) {
    this.tasksService.finishTask(subtask).pipe(untilDestroyed(this)).subscribe(() => this.refreshTasks.emit())
  }

  private checkIfTaskForSubtasksIsLast() {
    if ( Object.keys(this.tasksByIdMap).length === 1) {
      const id = +Object.keys(this.tasksByIdMap)[0];
      this.store.dispatch(new SetFocusedTaskForSubtasks(this.tasksByIdMap[id].container));
    }
  }

  private addTaskAndGoToIt() {
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
              .subscribe((newTask: TaskC) => {
                this.navigationService.navigateToTask(newTask._id); // TODO send task so it wont upload it
              })
          }
        })
  }
}
