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
import { Observable, of, Subscription } from "rxjs";
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
import { replaceInArrayIfFind, taskContainerDescriptionsAreEqual } from "../../libs/utils.lib";
import { TaskContainerService } from "../../../services/task-container.service";

@UntilDestroy()
@Component({
  selector: 'app-tasks-list',
  templateUrl: './tasks-list.component.html',
  styleUrls: ['./tasks-list.component.sass']
})
export class TasksListComponent implements OnInit, OnChanges, OnDestroy {


  @Input() container: TaskContainer;
  @Input() showTitle = false;
  @Input() tasks: TaskC[] = [];
  @Input() level = 0;

  @Output() refreshTasks = new EventEmitter();

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
            .subscribe(() => this.refreshTasks.emit())
        }
      })
  }

  selection = new SelectionModel<number>(true, []); // TODO make a separate table component
  displayedColumns: string[] = ['select', 'position', 'description', 'actions', 'showSubtasks'];
  showSelectedSubtask = false;

  tasksOfSelectedSubtask: TaskC[] = [];
  commandsSubscription: Subscription;

  isContainerFocused$: Observable<boolean> = this.store.select(AppState.getFocusedTaskForSubtasks).pipe(
    map((el: TaskContainer | null) => this.showTitle && el && this.container.getFullDescription() === el.getFullDescription() )
  )

  tasksByIdMap: { [key: number]: {tasks: TaskC[], container: TaskContainer}; } = {};


  constructor(
    public tasksService: TasksService,
    private taskContainerService: TaskContainerService,
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

    this.taskContainerService.refreshSubtasks$.subscribe(v => {
      if (taskContainerDescriptionsAreEqual(v.getTaskContainerDescription(), this.container.getTaskContainerDescription())) {
        this.refreshTasks.emit();
      }
    })

  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.tasks) {
      this.makeChangesAfterTasksChanged();
    }
    if (changes.taskContainer) {
      this.showSelectedSubtask = false;
    }
  }




  private makeChangesAfterTasksChanged() {
    if (every(this.selection.selected, x => !this.tasks.map(t => t._id).includes(x))) {
      this.clearSelection();
    } else {
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
    this.selection.select(...this.tasks.map(e => e._id));
  }

  onFinishTasksClick() {
    this.tasksService.finishTasksByIds(this.selection.selected).subscribe(
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
    this.tasksService.finishTasks(subtasks).subscribe(
      () => this.refreshTasks.emit());
  }

  onSubtaskClick(task: TaskC) {
    this.clearSelection();
    this.router.navigate(['task', task._id]).then();
  }

  refreshTasksOfSelectedSubtask(id: string) {
    console.log('tasks-list.component.ts -- refreshTasksOfSelectedSubtask');
    this.tasksService.getTask(+id).subscribe(task => {
      console.log('tasks-list.component.ts -- ', task);
      this.tasksService.getTasks(task.tasks).subscribe(tasks => {
        console.log('tasks-list.component.ts -- ', tasks);
        this.tasksByIdMap[+id] = {tasks, container: task};
      })
    })
  }

  onTaskOfSelectedSubtaskDoneClick(task: TaskC, parentTaskId: string){
    this.tasksService.finishTask(task).subscribe(() => {
      this.tasksService.getTask(+parentTaskId).subscribe(res => {
        this.tasksService.getTasks(res.tasks).subscribe(tasks => {
          this.tasksByIdMap[+parentTaskId] = {container: res, tasks};
        })
      })
    })
  }

  ngOnDestroy(): void {
    this.tasksOfSelectedSubtask = [];
  }

  private handleSelectSubtaskAction() {
    const dialogRef = this.dialog.open(GetValueDialogComponent, {data: {title: 'Solution'}});
    dialogRef.afterClosed().subscribe((value: string) => {
      if (value && !isNaN(+value)) {
        const index = +value;
        if (index > 0 && index <= this.tasks.length) {
          this.selection = new SelectionModel<number>(true, [this.tasks[index - 1]._id]);
          this.showSelectedSubtask = true;
        }
      }
    });
  }

  setShowSubtasksField($event: MatCheckboxChange, subtask: TaskC, i: number) {
    if ($event.checked) {
      this.tasksService.getTasks(subtask.tasks).subscribe(res => {
        this.tasksByIdMap[subtask._id] = {container: subtask, tasks: res};
        if (this.level === 0 && Object.keys(this.tasksByIdMap).length === 1) {
          this.store.dispatch(new SetFocusedTaskForSubtasks(subtask));
        }
      })
      ;
      // if ( this.level === 0 && Object.keys(this.tasksWithSubtasksToShow.length === 1 ) {
    } else {
      delete this.tasksByIdMap[subtask._id];
    }
  }

  focusSubtask($event: MouseEvent) {
    this.store.dispatch(new SetFocusedTaskForSubtasks(this.container));
  }

  checkedElement(subtask: TaskC): boolean {
    // return !!this.tasksWithSubtasksToShow.find(el => el === subtask._id);
    return Object.keys(this.tasksByIdMap).includes(String(subtask._id));
  }

  finishSubtask(subtask: TaskC) {
    this.tasksService.finishTask(subtask).subscribe(() => this.refreshTasks.emit())
    // this.onTaskDoneClick.emit(subtask)
  }

  getTasksObs(id: number): Observable<TaskC[]> {
    const item =  this.tasks.find(e => e._id === id);
    if (item) {
      return this.tasksService.getTasks(item.tasks);
    }
    return of([]);
  }

  Object = Object;
}
