import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges
} from '@angular/core';
import { TaskC } from "../../../models/task-class";
import { SelectionModel } from "@angular/cdk/collections";
import { TasksService } from "../../../services/tasks.service";
import { Router } from "@angular/router";
import { Observable, Subscription } from "rxjs";
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
import { replaceInArrayIfFind } from "../../libs/utils.lib";

@UntilDestroy()
@Component({
  selector: 'app-tasks-list',
  templateUrl: './tasks-list.component.html',
  styleUrls: ['./tasks-list.component.sass']
})
export class TasksListComponent implements OnInit, OnChanges, OnDestroy {

  private _tasksIds: number[] = [];
  tasks: TaskC[] = [];

  @Input()
  tasksIds: number[];



  @Input() taskContainer: TaskContainer;
  @Input() showTitle = false;
  @Input() level = 0;
  @Output() refreshTasks = new EventEmitter();
  @Output() addSubtask = new EventEmitter();
  @Output() onTaskDoneClick = new EventEmitter();

  selection = new SelectionModel<TaskC>(true, []); // TODO make a separate table component
  displayedColumns: string[] = ['select', 'position', 'description', 'actions', 'showSubtasks'];
  showSelectedSubtask = false;
  tasksWithSubtasksToShow: TaskC[] = [];

  tasksOfSelectedSubtask: TaskC[] = [];
  commandsSubscription: Subscription;

  isContainerFocused$: Observable<boolean> = this.store.select(AppState.getFocusedTaskForSubtasks).pipe(
    map((el: TaskContainer | null) => this.showTitle && el && this.taskContainer.getFullDescription() === el.getFullDescription() )
  )

  constructor(
    private tasksService: TasksService,
    private commandsService: CommandsService,
    public dialog: MatDialog,
    public cdr: ChangeDetectorRef,
    private router: Router,
    private store: Store,
  ) { }

  ngOnInit(): void {
    this.commandsSubscription = this.commandsService.getDataStateChange().subscribe(state => {
      this.handleTaskCommand(state.command);
    })

    this.isContainerFocused$.pipe(
      untilDestroyed(this),
      distinctUntilChanged()
    ).subscribe(() => this.cdr.detectChanges());

  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.tasksIds) {
      console.log(changes.tasksIds);
      this.tasksService.getTasks(this.tasksIds).subscribe(res => {
        this.tasks = res;
        this.makeChangesAfterTasksChanged();
      })
    }
    if (changes.taskContainer) {
      this.showSelectedSubtask = false;
    }
  }

  private makeChangesAfterTasksChanged() {
    if (every(this.selection.selected.map(task => task._id), x => !this.tasks.map(t => t._id).includes(x))) {
      this.clearSelection();
    } else {
      let newSelectedItems: TaskC[] = [];
      this.selection.selected.forEach(selectedTask => {
        this.tasks.map(t => t._id)
        if (this.tasks.some(subtask => subtask._id === selectedTask._id)) {
          const element = this.tasks.find(subtask => subtask._id === selectedTask._id);
          newSelectedItems.push(element);
        }
      });
      this.selection.clear();
      this.selection = new SelectionModel<TaskC>(true, newSelectedItems);
      this.cdr.detectChanges();
    }

    this.tasks.forEach(taskFromTasks => {
      const index = this.tasksWithSubtasksToShow.findIndex(taskWithSubtasksToShow => taskWithSubtasksToShow._id === taskFromTasks._id);
      if (index !== undefined && index >= 0) {
        this.tasksWithSubtasksToShow[index] = taskFromTasks;
      }
    })
  }

  private handleTaskCommand(command: string) {
    const arr = command.split(' ');
    if (['subtask'].includes(arr[0])) {
    }
    if (['subsubtask'].includes(arr[0])) {
    }
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
    if (['deselect-subsubtask'].includes(arr[0])) {
      if (this.level === 1) {
        // if (this.selectedSubtask) {
        //   this.unselectSelectedSubtask();
        // }
      }
    }

  }

  private clearSelection() {
    this.selection.clear();
    this.showSelectedSubtask = false;
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
    this.selection.select(...this.tasks);
  }

  onFinishTasksClick() {
    this.tasksService.finishTasks(this.selection.selected).subscribe(
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
    this.tasks = [];
    this.tasksService.finishTasks(subtasks).subscribe(
      () => this.refreshTasks.emit());
  }

  onSubtaskClick(task: TaskC) {
    this.clearSelection();
    this.router.navigate(['task', task._id]).then();
  }

  refreshTasksOfSelectedSubtask(item: TaskC) {
    this.tasksService.getTask(item._id).subscribe(updatedTask => {
      this.refreshUpdatedTaskInAllRelatedArrays(updatedTask);
    })
  }

  private refreshUpdatedTaskInAllRelatedArrays(updatedTask: TaskC) {
    replaceInArrayIfFind(this.tasks, e => e._id === updatedTask._id, updatedTask)
    replaceInArrayIfFind(this.tasksWithSubtasksToShow, e => e._id === updatedTask._id, updatedTask)

    const selected = [...this.selection.selected];
    replaceInArrayIfFind(selected, e => e._id === updatedTask._id, updatedTask)
    this.selection.clear();
    this.selection = new SelectionModel<TaskC>(true, selected);
  }

  onTaskOfSelectedSubtaskDoneClick(task: TaskC, parentTask: TaskC){
    this.tasksService.finishTask(task).subscribe(() => {
      this.updateAndRefreshTaskInAllRelatedArrays(parentTask);
    })
  }

  private updateAndRefreshTaskInAllRelatedArrays(parentTask: TaskC) {
    this.tasksService.getTask(parentTask._id).subscribe(res => {
      this.refreshUpdatedTaskInAllRelatedArrays(res);
    })
  }

  ngOnDestroy(): void {
    this.tasksOfSelectedSubtask = [];
  }

  addTaskOfSelectedSubtask(parentTask: TaskC) {
    this.tasksService.openAddTaskDialog2(parentTask).subscribe(() => {
      this.updateAndRefreshTaskInAllRelatedArrays(parentTask);
    });
  }

  private handleSelectSubtaskAction() {
    const dialogRef = this.dialog.open(GetValueDialogComponent, {data: {title: 'Solution'}});
    dialogRef.afterClosed().subscribe((value: string) => {
      if (value && !isNaN(+value)) {
        const index = +value;
        if (index > 0 && index <= this.tasks.length) {
          this.selection = new SelectionModel<TaskC>(true, [this.tasks[index - 1]]);
          this.showSelectedSubtask = true;
        }
      }
    });
  }

  setShowSubtasksField($event: MatCheckboxChange, subtask: TaskC, i: number) {
    if ($event.checked) {

      this.tasksWithSubtasksToShow.push(subtask);
      if ( this.level === 0 && this.tasksWithSubtasksToShow.length === 1 ) {
        this.store.dispatch(new SetFocusedTaskForSubtasks(subtask));
      }
    } else {
      this.tasksWithSubtasksToShow = this.tasksWithSubtasksToShow
        .filter(el => el._id !== subtask._id);
    }
  }

  focusSubtask($event: MouseEvent) {
    this.store.dispatch(new SetFocusedTaskForSubtasks(this.taskContainer));
  }

  checkedElement(subtask: TaskC) {
    return !!this.tasksWithSubtasksToShow.find(el => el._id === subtask._id);
  }
}
