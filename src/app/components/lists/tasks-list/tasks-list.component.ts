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
import { isAfterTask, isTask } from "../../../shared/constants";
import { MatTableModule } from "@angular/material/table";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { NgClass } from "@angular/common";
import { type TaskContainer } from "../../../models/interfaces/task-container";
import {
  type CreateNewTaskRequest,
  type CreateHierarchicalTasksRequest,
  dueDateInputToIso,
  type HierarchicalTaskDialogResult,
  type NewTaskDialogResult,
  tagsFromNewTaskDialog,
  type TaskNode,
  TasksService,
} from "../../../services/task-container-services/tasks.service";
import { TaskContainerService } from "../../../services/task-container-services/task-container.service";
import { VariablesService } from "../../../services/variables.service";
import { tasksListRefreshAnimation } from './tasks-list.animations';

type ExpandedSubtasks = Record<number, { tasks: TaskC[]; container: TaskContainer }>;

type TasksSection = {
  key: 'regular' | 'after';
  title: string;
  tasks: TaskC[];
  afterTaskDefault: boolean;
  showReorder: boolean;
  showFinishSelected: boolean;
  positionOffset: number;
};

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
  readonly regularTasks = computed(() => this.tasks().filter((task) => !isAfterTask(task)));
  readonly afterTasks = computed(() => this.tasks().filter((task) => isAfterTask(task)));
  readonly hasAfterTasks = computed(() => this.afterTasks().length > 0);
  /** Tasks in display order: regular first, then after-tasks. */
  readonly orderedTasks = computed(() =>
    this.hasAfterTasks() ? [...this.regularTasks(), ...this.afterTasks()] : this.tasks(),
  );
  readonly taskSections = computed((): TasksSection[] => {
    const regular = this.regularTasks();
    const after = this.afterTasks();
    if (after.length === 0) {
      return [{
        key: 'regular',
        title: 'Tasks',
        tasks: this.tasks(),
        afterTaskDefault: false,
        showReorder: true,
        showFinishSelected: true,
        positionOffset: 0,
      }];
    }
    return [
      {
        key: 'regular',
        title: 'Tasks',
        tasks: regular,
        afterTaskDefault: false,
        showReorder: true,
        showFinishSelected: true,
        positionOffset: 0,
      },
      {
        key: 'after',
        title: 'After tasks',
        tasks: after,
        afterTaskDefault: true,
        showReorder: false,
        showFinishSelected: false,
        positionOffset: regular.length,
      },
    ];
  });
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

  addTask(makeSelected = false, afterTaskByDefault = false) {
    this.tasksService.openAddTaskDialog({
      markSelectedByDefault: makeSelected,
      afterTaskByDefault,
    })
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
              tags: tagsFromNewTaskDialog(responseObj),
              notes: this.interpolateTaskText(responseObj.notes ?? ''),
              ...(responseObj.dueDate
                ? { dueDateTime: dueDateInputToIso(responseObj.dueDate) }
                : {}),
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

    if (arr.length === 1 && Number.isInteger(+arr[0]) && +arr[0] >= 1 && +arr[0] <= this.orderedTasks().length) {
      this.navigationService.navigateToTask(this.orderedTasks()[+arr[0] - 1].id);
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
    const ordered = this.orderedTasks();
    if (args.length > 0 && args[0] && /^\d+-\d+$/.test(args[0])) {
      const numbers = args[0].split('-');
      const num1 = +numbers[0] - 1;
      const num2 = +numbers[1] - 1;
      const rangeNumbers = _.range(num1, num2 + 1);
      const tasksToFinish = rangeNumbers.map((index: number) => ordered[index]);
      this.tasksService.finishTasks(tasksToFinish).subscribe(() => this.refreshTasks.emit());
    } else if (args.length > 0 && args[0] && args[0].includes(',')) {
      const numbers = args[0].split(',').map(str => +str);
      const tasksToFinish = numbers.map((number: number) => ordered[number - 1]);
      this.tasksService.finishTasks(tasksToFinish).subscribe(() => this.refreshTasks.emit());
    } else {
      const index = +args[0];
      if (Number.isInteger(index) && index >= 1 && index <= ordered.length) {
        this.tasksService.finishTask(ordered[index - 1]).subscribe(() => this.refreshTasks.emit());
      }
    }
  }

  private clearSelection() {
    this.selectedIds.set([]);
  }

  hasSelection(): boolean {
    return this.selectedIds().length > 0;
  }

  areAllSelected(sectionTasks: TaskC[] = this.tasks()) {
    return sectionTasks.length > 0 && sectionTasks.every((task) => this.selectedIds().includes(task.id));
  }

  hasSelectionIn(sectionTasks: TaskC[]): boolean {
    return sectionTasks.some((task) => this.selectedIds().includes(task.id));
  }

  onMainCheckboxClick(sectionTasks: TaskC[] = this.tasks()) {
    if (this.areAllSelected(sectionTasks)) {
      const sectionIds = new Set(sectionTasks.map((task) => task.id));
      this.selectedIds.update((ids) => ids.filter((id) => !sectionIds.has(id)));
      return;
    }
    this.selectedIds.update((ids) => [...new Set([...ids, ...sectionTasks.map((task) => task.id)])]);
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
    const selectedCount = this.selectedIds().length;
    if (selectedCount === 0) {
      return;
    }
    if (selectedCount > 15) {
      const confirmed = confirm(`Are you sure you want to close all ${selectedCount} tasks?`);
      if (!confirmed) {
        return;
      }
    }
    this.tasksService.finishTasksByIds([...this.selectedIds()]).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
      {
        next: () => {
          this.clearSelection();
          this.refreshTasks.emit();
        }
      }
    );
  }

  onFinishAllTasksHandler(sectionTasks: TaskC[] = this.tasks()) {
    if (sectionTasks.length === 0) {
      return;
    }
    if (sectionTasks.length > 15) {
      const confirmed = confirm(`Are you sure you want to close all ${sectionTasks.length} tasks?`);
      if (!confirmed) {
        return;
      }
    }
    const finishedIds = new Set(sectionTasks.map((task) => task.id));
    this.selectedIds.update((ids) => ids.filter((id) => !finishedIds.has(id)));
    this.tasksService.finishTasks(sectionTasks).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(
      () => this.refreshTasks.emit());
  }

  startReorderMode(): void {
    this.reorderedTasks.set([...this.regularTasks()]);
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
    const reorderedIds = this.reorderedTasks().map((task) => task.id);
    const afterIds = this.afterTasks().map((task) => task.id);
    this.reorderDone.emit(afterIds.length > 0 ? [...reorderedIds, ...afterIds] : reorderedIds);
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
        const ordered = this.orderedTasks();
        if (index > 0 && index <= ordered.length) {
          const task = ordered[index - 1];
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
              tags: tagsFromNewTaskDialog(responseObj),
              notes: this.interpolateTaskText(responseObj.notes ?? ''),
              ...(responseObj.dueDate
                ? { dueDateTime: dueDateInputToIso(responseObj.dueDate) }
                : {}),
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
