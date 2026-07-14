import {
  CdkDragDrop,
  DragDropModule,
  moveItemInArray,
} from '@angular/cdk/drag-drop';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  input,
  output,
  type OnInit,
  inject,
  signal,
  untracked,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { type ContainerVariable, type TaskC } from "../../../models/task-class";
import * as _ from "lodash";
import { every, isNaN } from "lodash";
import { CommandsService, type CommandsStateInterface } from "../../../services/commands.service";
import { MatDialog } from "@angular/material/dialog";
import { GetValueDialogComponent } from "../../dialogs/get-value/get-value-dialog.component";
import { AppStore } from "../../../state/app.store";
import { taskContainerDescriptionsAreEqual } from "../../../shared/libs/utils.lib";
import { NavigationService } from "../../../services/navigation.service";
import { isTask } from "../../../shared/constants";
import { MatTableModule } from "@angular/material/table";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { NgClass } from "@angular/common";
import { type TaskContainer } from "../../../models/interfaces/task-container";
import {
  type CreateNewTaskRequest,
  type CreateHierarchicalTasksRequest,
  type HierarchicalTaskDialogResult,
  type NewTaskDialogResult,
  type TaskNode,
  TasksService,
} from "../../../services/task-container-services/tasks.service";
import { TaskContainerService } from "../../../services/task-container-services/task-container.service";
import { VariablesService } from "../../../services/variables.service";
import { tasksListRefreshAnimation } from './tasks-list.animations';

type ExpandedSubtasks = Record<number, { tasks: TaskC[]; container: TaskContainer }>;

@Component({
  selector: 'app-tasks-list',
  templateUrl: './tasks-list.component.html',
  imports: [
    DragDropModule,
    MatTableModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    NgClass
  ],
  standalone: true,
  styleUrls: ['./tasks-list.component.sass'],
  animations: [tasksListRefreshAnimation],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TasksListComponent implements OnInit {

  container = input.required<TaskContainer>();
  showTitle = input(false);
  tasks = input.required<TaskC[]>();
  variables = input<ContainerVariable[]>([]);
  level = input(0);

  /** Changes when tasks are reloaded — drives fade animation. */
  readonly tasksTrackKey = computed(() => this.tasks().map((t) => t.id).join(','));
  refreshTasks = output<void>();
  resolveParent = output<void>();
  reorderDone = output<number[]>();

  readonly displayedColumns: string[] = ['select', 'position', 'description', 'actions', 'showSubtasks'];
  readonly selectedIds = signal<readonly number[]>([]);
  readonly expandedSubtasks = signal<ExpandedSubtasks>({});
  readonly isContainerFocused = computed(() => {
    const focused = this.appStore.focusedTaskForSubtasks();
    return !!(this.showTitle() && focused && this.container().getFullDescription() === focused.getFullDescription());
  });
  readonly tasksByIdMapKeys = computed(() => Object.keys(this.expandedSubtasks()).map(Number));
  readonly showFinishAllTasksIcon = computed(() => {
    const selectedCount = this.selectedIds().length;
    return selectedCount === 0 || selectedCount === this.tasks().length;
  });
  readonly showFinishSelectedTasksIcon = computed(() => {
    const selectedCount = this.selectedIds().length;
    return selectedCount > 0 && selectedCount < this.tasks().length;
  });
  readonly reorderMode = signal(false);
  readonly reorderedTasks = signal<TaskC[]>([]);

  private tasksService = inject(TasksService);
  private taskContainerService = inject(TaskContainerService);
  private commandsService = inject(CommandsService);
  private navigationService = inject(NavigationService);
  private dialog = inject(MatDialog);
  private appStore = inject(AppStore);
  private variablesService = inject(VariablesService);
  private destroyRef = inject(DestroyRef);

  constructor() {
    effect(() => {
      this.tasks();
      untracked(() => this.makeChangesAfterTasksChanged());
    });
  }

  ngOnInit(): void {
    this.commandsService.getDataStateChange()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((state: CommandsStateInterface) => {
        if (this.appStore.disabledHotkeys()) {
          return;
        }
        this.handleTaskCommand(state.command, state.args);
      });

    this.taskContainerService.refreshSubtasks$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(v => {
      if (taskContainerDescriptionsAreEqual(v.getTaskContainerDescription(), this.container().getTaskContainerDescription())) {
        this.refreshTasks.emit();
      }
    });
  }

  addTask(makeSelected = false) {
    this.tasksService.openAddTaskDialog({ markSelectedByDefault: makeSelected })
      .subscribe((responseObj: NewTaskDialogResult | undefined) => {
        this.tasksService.addTaskDialogOpened = false;
        if (!responseObj) {
          return;
        }
        const description = responseObj.description;
        if (description) {
          const request: CreateNewTaskRequest = {
            task: {
              description: this.interpolateTaskText(description),
              tags: [],
              notes: this.interpolateTaskText(responseObj.notes ?? ''),
            },
            parent: { id: this.container().id, type: this.container().type },
          };
          this.tasksService.createNewTask(request)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((newTask: TaskC) => {
              if (makeSelected || responseObj.markSelected) {
                this.expandedSubtasks.update(map => ({
                  ...map,
                  [newTask.id]: { container: newTask, tasks: [] },
                }));
                this.appStore.setFocusedTaskForSubtasks(newTask);
              }
              this.refreshTasks.emit();
            })
        }
      })
  }

  addHierarchicalTask(): void {
    this.tasksService.openHierarchicalTaskDialog()
      .subscribe((responseObj: HierarchicalTaskDialogResult | undefined) => {
        this.tasksService.hierarchicalTaskDialogOpened = false;
        if (!responseObj?.nodes.length) {
          return;
        }

        const request: CreateHierarchicalTasksRequest = {
          parent: { id: this.container().id, type: this.container().type },
          nodes: this.interpolateTaskNodes(responseObj.nodes),
        };

        this.tasksService.createHierarchicalTasks(request)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(() => this.refreshTasks.emit());
      });
  }

  private interpolateTaskNodes(nodes: TaskNode[]): TaskNode[] {
    return nodes.map((node) => ({
      description: this.interpolateTaskText(node.description),
      children: this.interpolateTaskNodes(node.children),
    }));
  }

  private makeChangesAfterTasksChanged() {
    this.makeSelectionChangesAfterTasksChanged();

    const newTasksIds = this.tasks().map(e => e.id);
    const expandedSubtasks = this.expandedSubtasks();
    const nextExpandedSubtasks = Object.fromEntries(
      Object.entries(expandedSubtasks).filter(([id]) => newTasksIds.includes(Number(id)))
    ) as ExpandedSubtasks;

    if (Object.keys(nextExpandedSubtasks).length !== Object.keys(expandedSubtasks).length) {
      this.expandedSubtasks.set(nextExpandedSubtasks);
    }
  }

  private makeSelectionChangesAfterTasksChanged() {
    if (every(this.selectedIds(), id => !this.tasks().some(task => task.id === id))) {
      this.clearSelection();
      return;
    }

    const newSelectedItems = this.selectedIds().filter(id => this.tasks().some(task => task.id === id));
    if (newSelectedItems.length !== this.selectedIds().length) {
      this.selectedIds.set(newSelectedItems);
    }
  }

  private handleTaskCommand(command: string, _commandArgs: object) {
    const arr = command.split(' ');
    const args = arr.slice(1);
    if (['select-subtask'].includes(arr[0])) {
      if (this.level() === 0) {
        this.handleSelectSubtaskAction()
      }
    }

    if (arr.length === 1 && Number.isInteger(+arr[0]) && +arr[0] >= 1 && +arr[0] <= this.tasks().length) {
      this.navigationService.navigateToTask(this.tasks()[+arr[0] - 1].id);
    }

    if (['select-subsubtask'].includes(arr[0])) {
      if (this.level() === 1) {
        this.handleSelectSubtaskAction()
      }
    }

    if (['ff'].includes(arr[0]) && this.isContainerFocused()) {
      this.finishTaskHandler(args);
    }

    if (['focus-fta'].includes(arr[0]) && this.isContainerFocused()) {
      this.onFinishAllTasksHandler();
    }
    if (['fresolve'].includes(arr[0]) && this.isContainerFocused()) {
      this.resolveParent.emit();
    }

    if (['task'].includes(arr[0]) && this.level() === 0) {
      this.addTask();
    }
    if (['htask'].includes(arr[0]) && this.level() === 0) {
      this.addHierarchicalTask();
    }
    if (['new-task-go'].includes(arr[0]) && this.level() === 0) {
      this.addTaskAndGoToIt();
    }
    if (['new-task-for-focused-task-and-go'].includes(arr[0]) && this.isContainerFocused()) {
      this.addTaskAndGoToIt();
    }
    if (['selected-task'].includes(arr[0]) && this.level() === 0) {
      this.addTask(true);
    }
    if (['subtask'].includes(arr[0]) && this.isContainerFocused()) {
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
      if (Number.isInteger(index) && index >= 1 && index <= this.tasks().length) {
        this.tasksService.finishTask(this.tasks()[index - 1]).subscribe(() => this.refreshTasks.emit());
      }
    }
  }

  private clearSelection() {
    this.selectedIds.set([]);
  }

  hasSelection(): boolean {
    return this.selectedIds().length > 0;
  }

  areAllSelected() {
    const numSelected = this.selectedIds().length;
    const numRows = this.tasks().length;
    return numSelected === numRows;
  }

  onMainCheckboxClick() {
    if (this.areAllSelected()) {
      this.clearSelection();
      return;
    }
    this.selectedIds.set(this.tasks().map(e => e.id));
  }

  toggleSelection(id: number) {
    this.selectedIds.update(ids => (
      ids.includes(id) ? ids.filter(selectedId => selectedId !== id) : [...ids, id]
    ));
  }

  isSelected(id: number): boolean {
    return this.selectedIds().includes(id);
  }

  onFinishTasksClick() {
    this.tasksService.finishTasksByIds([...this.selectedIds()]).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
      {
        next: () => {
          this.clearSelection();
          this.refreshTasks.emit();
        }
      }
    );
  }

  onFinishAllTasksHandler() {
    this.clearSelection();
    const subtasks = this.tasks();
    this.tasksService.finishTasks(subtasks).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
      () => this.refreshTasks.emit());
  }

  startReorderMode(): void {
    this.reorderedTasks.set([...this.tasks()]);
    this.reorderMode.set(true);
  }

  dropReorderedTask(event: CdkDragDrop<TaskC[]>): void {
    this.reorderedTasks.update((tasks) => {
      const updated = [...tasks];
      moveItemInArray(updated, event.previousIndex, event.currentIndex);
      return updated;
    });
  }

  finishReorderMode(): void {
    this.reorderMode.set(false);
    this.reorderDone.emit(this.reorderedTasks().map((task) => task.id));
  }

  onSubtaskClick(task: TaskC) {
    this.clearSelection();
    this.navigationService.navigateToTask(task.id);
  }

  refreshTasksOfSelectedSubtask(id: number) {
    this.tasksService.getTask(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(task => {
      this.tasksService.getTasks(task.tasks).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(tasks => {
        this.expandedSubtasks.update(map => ({
          ...map,
          [id]: { tasks, container: task },
        }));
      })
    })
  }

  private handleSelectSubtaskAction() {
    const dialogRef = this.dialog.open(GetValueDialogComponent, {data: {title: 'Select subtask'}});
    dialogRef.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((value: string) => {
      if (value && !isNaN(+value)) {
        const index = +value;
        if (index > 0 && index <= this.tasks().length) {
          const task = this.tasks()[index - 1];
          if (this.expandedSubtasks()[task.id] !== undefined) {
            this.removeTasksByIdMapKey(task.id);
            return;
          }
          this.tasksService.getTasks(task.tasks).subscribe(tasks => {
            this.expandedSubtasks.update(map => ({
              ...map,
              [task.id]: { tasks, container: task },
            }));
            this.appStore.setFocusedTaskForSubtasks(task);
          });
        }
      }
    });
  }

  setShowSubtasksFieldClickHandler($event: MouseEvent, subtask: TaskC) {
    if (this.checkedElement(subtask)) {
      this.removeTasksByIdMapKey(subtask.id);
    } else {
      this.tasksService.getTasks(subtask.tasks).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(res => {
        this.expandedSubtasks.update(map => ({
          ...map,
          [subtask.id]: { container: subtask, tasks: res },
        }));
        if (!$event.altKey) {
          this.appStore.setFocusedTaskForSubtasks(subtask);
        }
      })
    }
  }

  private removeTasksByIdMapKey(key: number) {
    this.expandedSubtasks.update(map => {
      const { [key]: _removed, ...rest } = map;
      return rest;
    });
    this.checkIfTaskForSubtasksIsLast();
  }

  focusSubtask() {
    this.appStore.setFocusedTaskForSubtasks(this.container());
  }

  checkedElement(subtask: TaskC): boolean {
    return Object.hasOwn(this.expandedSubtasks(), subtask.id);
  }

  finishSubtask(subtask: TaskC) {
    this.tasksService.finishTask(subtask).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.refreshTasks.emit())
  }

  private checkIfTaskForSubtasksIsLast() {
    const expandedSubtasks = this.expandedSubtasks();
    const expandedIds = Object.keys(expandedSubtasks);
    if (expandedIds.length === 1) {
      const id = +expandedIds[0];
      this.appStore.setFocusedTaskForSubtasks(expandedSubtasks[id].container);
    }
  }

  private addTaskAndGoToIt() {
    this.tasksService.openAddTaskDialog()
      .subscribe((responseObj: NewTaskDialogResult | undefined) => {
        this.tasksService.addTaskDialogOpened = false;
        if (!responseObj) {
          return;
        }
        const description = responseObj.description;
        if (description) {
          const request: CreateNewTaskRequest = {
            task: {
              description: this.interpolateTaskText(description),
              tags: [],
              notes: this.interpolateTaskText(responseObj.notes ?? ''),
            },
            parent: { id: this.container().id, type: this.container().type },
          };
          this.tasksService.createNewTask(request)
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe((newTask: TaskC) => {
              this.navigationService.navigateToTask(newTask.id);
            })
        }
      })
  }

  private interpolateTaskText(text: string): string {
    return this.variablesService.interpolateString(text, this.variables());
  }

  resolveContainer(container: TaskContainer) {
    if (isTask(container)) {
      this.tasksService.finishTask(container).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.refreshTasks.emit())
    }
  }
}
