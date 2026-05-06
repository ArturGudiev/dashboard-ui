import {
  ChangeDetectorRef,
  Component,
  input,
  OnChanges,
  output,
  OnInit,
  SimpleChanges,
  inject
} from '@angular/core';
import { TaskC } from "../../../models/task-class";
import { SelectionModel } from "@angular/cdk/collections";
import * as _ from "lodash";
import { every, isNaN } from "lodash";
import { CommandsService, CommandsStateInterface } from "../../../services/commands.service";
import { MatDialog } from "@angular/material/dialog";
import { GetValueDialogComponent } from "../../dialogs/get-value/get-value-dialog.component";
import { Store } from "@ngxs/store";
import { SetFocusedTaskForSubtasks } from "../../../state/app.actions";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { AppState } from "../../../state/app.state";
import { distinctUntilChanged, map, withLatestFrom } from "rxjs/operators";
import { taskContainerDescriptionsAreEqual } from "../../../shared/libs/utils.lib";
import { NavigationService } from "../../../services/navigation.service";
import { isTask } from "../../../shared/constants";
import { MaterialModule } from "../../../modules/material/material.module";
import { NgClass } from "@angular/common";
import { TaskContainer } from "../../../models/interfaces/task-container";
import { TasksService } from "../../../services/task-container-services/tasks.service";
import { TaskContainerService } from "../../../services/task-container-services/task-container.service";

@UntilDestroy()
@Component({
  selector: 'app-tasks-list',
  templateUrl: './tasks-list.component.html',
  imports: [
    MaterialModule,
    NgClass
  ],
  standalone: true,
  styleUrls: ['./tasks-list.component.sass']
})
export class TasksListComponent implements OnInit, OnChanges {
  
  container = input.required<TaskContainer>();
  showTitle = input(false);
  tasks = input.required<TaskC[]>();
  level = input(0);
  refreshTasks = output<void>();
  resolveParent = output<void>();
  
  selection = new SelectionModel<number>(true, []);
  readonly displayedColumns: string[] = ['select', 'position', 'description', 'actions', 'showSubtasks'];
  readonly tasksByIdMap: { [key: number]: { tasks: TaskC[], container: TaskContainer }; } = {};
  isContainerFocused: boolean = false;
  
  get tasksByIdMapKeys(): number[] {
    return Object.keys(this.tasksByIdMap).map(e => Number(e));
  }

  get showFinishAllTasksIcon(): boolean {
    return !this.selection.hasValue() || this.selection.selected.length === this.tasks().length;
  }

  get showFinishSelectedTasksIcon(): boolean {
    return this.selection.hasValue() && this.selection.selected.length < this.tasks().length;
  }

  private tasksService = inject(TasksService);
  private taskContainerService = inject(TaskContainerService);
  private commandsService = inject(CommandsService);
  private navigationService = inject(NavigationService);
  private dialog = inject(MatDialog);
  private cdr = inject(ChangeDetectorRef);
  private store = inject(Store);

  /**
   * Инициализация компонента. Подписка на
   * 1) команды (горячие клавиши)
   * 2) isContainerFocused
   * 3) подписка на subject refresh subtasks
   */
  ngOnInit(): void {
    this.commandsService.getDataStateChange()
      .pipe(
        withLatestFrom(this.store.select(AppState.getDisabledHotkeys)),
        untilDestroyed(this))
      .subscribe(([state, hotkeysDisabled]: [CommandsStateInterface, boolean]) => {
        if (hotkeysDisabled) {
          return;
        }
        this.handleTaskCommand(state.command, state.args);
      })

    this.store.select(AppState.getFocusedTaskForSubtasks).pipe(
      untilDestroyed(this),
      map((el: TaskContainer | null) => this.showTitle() && el && this.container().getFullDescription() === el.getFullDescription(),
        distinctUntilChanged()
      )).subscribe((el) => {
      this.isContainerFocused = !!el;
      this.cdr.detectChanges();
    });

    this.taskContainerService.refreshSubtasks$.pipe(untilDestroyed(this)).subscribe(v => {
      if (taskContainerDescriptionsAreEqual(v.getTaskContainerDescription(), this.container().getTaskContainerDescription())) {
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
          const task: any = {
            description: description,
            tags: [],
            done: false,
            notes: responseObj.notes,
          }
          const parent = { id: this.container().id, type: this.container().type };
          this.tasksService.createNewTask({ task, parent })
            .pipe(untilDestroyed(this))
            .subscribe((newTask: TaskC) => {
              if (makeSelected) {
                this.tasksByIdMap[newTask.id] = {container: newTask, tasks: []};
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
    const newTasksIds = this.tasks().map(e => e.id);
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
    if (every(this.selection.selected, x => !this.tasks().map(t => t.id).includes(x))) {
      this.clearSelection();
      return;
    }

    let newSelectedItems: number[] = [];
    this.selection.selected.forEach(id => {
      if (this.tasks().some(subtask => subtask.id === id)) {
        const element = this.tasks().find(subtask => subtask.id === id);
        if (element) {
          newSelectedItems.push(element.id);
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
  private handleTaskCommand(command: string, commandArgs: object) {
    const arr = command.split(' ');
    const args = arr.slice(1);
    if (['select-subtask'].includes(arr[0])) {
      if (this.level() === 0) {
        this.handleSelectSubtaskAction()
      }
    }

    if (arr.length === 1 && Number.isInteger(+arr[0]) && +arr[0] >= 1 && +arr[0] <= this.tasks.length) {
      const index = +arr[0] - 1;
      const task = this.tasks()[index];

      // this.router.navigate(['task', this.tasks[+arr[0] - 1]._id]).then();
      this.navigationService.navigateToTask(this.tasks()[+arr[0] - 1].id);
    }

    if (['select-subsubtask'].includes(arr[0])) {
      if (this.level() === 1) {
        this.handleSelectSubtaskAction()
      }
    }

    if (['ff'].includes(arr[0]) && this.isContainerFocused) {
      this.finishTaskHandler(args);
    }

    if (['focus-fta'].includes(arr[0]) && this.isContainerFocused) {
      this.onFinishAllTasksHandler();
    }
    if (['fresolve'].includes(arr[0]) && this.isContainerFocused) {
      this.resolveParent.emit();
    }

    if (['task'].includes(arr[0]) && this.level() === 0) {
      this.addTask();
    }
    if (['new-task-go'].includes(arr[0]) && this.level() === 0) {
      this.addTaskAndGoToIt();
    }
    if (['new-task-for-focused-task-and-go'].includes(arr[0]) && this.isContainerFocused) {
      this.addTaskAndGoToIt();
    }
    if (['selected-task'].includes(arr[0]) && this.level() === 0) {
      this.addTask(true);
    }
    if (['subtask'].includes(arr[0]) && this.isContainerFocused) {
      this.addTask();
    }
  }

  private finishTaskHandler(args: string[]) {
    if (!args || args.length === 0) {
      return;
    }
    if (args.length > 0 && args[0] && /^\d+-\d+$/.test(args[0])) {
      const numbers = args[0].split('-');
      const num1 = +numbers[0] - 1;
      const num2 = +numbers[1] - 1;
      const rangeNumbers = _.range(num1, num2 + 1);
      const tasksToFinish = rangeNumbers.map((index: number) => this.tasks()[index]);
      this.tasksService.finishTasks(tasksToFinish).subscribe(() => this.refreshTasks.emit());
    } else if (args.length > 0 && args[0] && args[0].includes(',')) {
      const numbers = args[0].split(',').map(str => +str);
      const tasksToFinish = numbers.map((number: number) => this.tasks()[number - 1]);
      this.tasksService.finishTasks(tasksToFinish).subscribe(() => this.refreshTasks.emit());
    } else {
      const index = +args[0];
      if (Number.isInteger(index) && index >= 1 && index <= this.tasks.length) {
        this.tasksService.finishTask(this.tasks()[index - 1]).subscribe(() => this.refreshTasks.emit());
      }
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
    this.selection.select(...this.tasks().map(e => e.id));
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
  onFinishAllTasksHandler() {
    this.clearSelection();
    const subtasks = this.tasks();
    this.tasksService.finishTasks(subtasks).pipe(untilDestroyed(this)).subscribe(
      () => this.refreshTasks.emit());
  }

  /**
   * обработчик клика на подзадачу
   */
  onSubtaskClick(task: TaskC) {
    this.clearSelection();
    // this.router.navigate(['task', task._id]).then();
    this.navigationService.navigateToTask(task.id);
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
          const task = this.tasks()[index - 1];
          if (this.tasksByIdMap[task.id] !== undefined) {
            this.removeTasksByIdMapKey(task.id);
            return;
          }
          this.tasksService.getTasks(task.tasks).subscribe(tasks => {
            this.tasksByIdMap[task.id] = {tasks, container: task};
            this.store.dispatch(new SetFocusedTaskForSubtasks(task));
          });
        }
      }
    });
  }

  /**
   * Когда кликает пользователь на чекбокс, то задача фокусируется для подзадач. Но только если клик был совершен
   * без зажатия Alt
   */
  setShowSubtasksFieldClickHandler($event: MouseEvent, subtask: TaskC) {
    if (this.checkedElement(subtask)) {
      this.removeTasksByIdMapKey(subtask.id);
    } else {
      this.tasksService.getTasks(subtask.tasks).pipe(untilDestroyed(this)).subscribe(res => {
        this.tasksByIdMap[subtask.id] = {container: subtask, tasks: res};
        if (!$event.altKey) {
          this.store.dispatch(new SetFocusedTaskForSubtasks(subtask));
        }
      })
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
    this.store.dispatch(new SetFocusedTaskForSubtasks(this.container()));
  }

  /**
   * Выделен ли элемент для отображение подзадач
   * @param subtask
   */
  checkedElement(subtask: TaskC): boolean {
    return Object.keys(this.tasksByIdMap).includes(String(subtask.id));
  }

  /**
   * Завершить подзадачу
   * @param subtask
   */
  finishSubtask(subtask: TaskC) {
    this.tasksService.finishTask(subtask).pipe(untilDestroyed(this)).subscribe(() => this.refreshTasks.emit())
  }

  private checkIfTaskForSubtasksIsLast() {
    if (Object.keys(this.tasksByIdMap).length === 1) {
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
          const task: any = {
            description: description,
            tags: [],
            done: false,
            notes: responseObj.notes,
          }
          const parent = { id: this.container().id, type: this.container().type };
          this.tasksService.createNewTask({ task, parent })
            .pipe(untilDestroyed(this))
            .subscribe((newTask: TaskC) => {
              this.navigationService.navigateToTask(newTask.id); // TODO send task so it wont upload it
            })
        }
      })
  }

  resolveContainer(container: TaskContainer) {
    if (isTask(container)) {
      this.tasksService.finishTask(container).pipe(untilDestroyed(this)).subscribe(() => this.refreshTasks.emit())
    }
  }
}
