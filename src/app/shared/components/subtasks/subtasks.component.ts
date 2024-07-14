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
import { AlertService } from "../../../services/alert.service";
import { Observable, Subscription } from "rxjs";
import { every, isNaN, some } from "lodash";
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
import { state } from "@angular/animations";

@UntilDestroy()
@Component({
  selector: 'app-subtasks',
  templateUrl: './subtasks.component.html',
  styleUrls: ['./subtasks.component.sass']
})
export class SubtasksComponent implements OnInit, OnChanges, OnDestroy {
  get subtasks(): TaskC[] {
    return this._subtasks;
  }

  @Input()
  set subtasks(value: TaskC[]) {
    this._subtasks = value;
    this.tasksWithSubtasksToShow = this.tasksWithSubtasksToShow
      .filter(el => this.subtasks.some(e => e._id === el.instance._id));
  }

  private _subtasks: TaskC[] = [];
  @Input() taskContainer: TaskContainer;
  @Input() showTitle = false;
  @Input() level = 0;
  @Output() refreshSubtasks = new EventEmitter();
  @Output() addSubtask = new EventEmitter();
  @Output() onSubtaskDoneClick = new EventEmitter();

  selection = new SelectionModel<TaskC>(true, []);
  displayedColumns: string[] = ['select', 'position', 'description', 'actions', 'showSubtasks'];
  showSelectedSubtask = false;
  tasksWithSubtasksToShow: {instance: TaskC, subtasks$: Observable<TaskC[]>}[] = [];


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
    if (changes.subtasks) {
      if (every(this.selection.selected.map(task => task._id), x => !this.subtasks.map(t => t._id).includes(x))) {
        this.clearSelection();
      } else {
        let newSelectedItems: TaskC[] = [];
        this.selection.selected.forEach(selectedTask => {
          this.subtasks.map(t => t._id)
          if (this.subtasks.some(subtask => subtask._id === selectedTask._id)) {
            const element = this.subtasks.find(subtask => subtask._id === selectedTask._id);
            newSelectedItems.push(element);
          }
        });
        this.selection.clear();
        this.selection = new SelectionModel<TaskC>(true, newSelectedItems);
        this.cdr.detectChanges();
      }
      this.tasksWithSubtasksToShow.forEach(el => {
        const index = this.subtasks?.findIndex(e => e._id === el.instance._id);
        if (index !== undefined && index >= 0) {
          el.instance = this.subtasks[index];
          el.subtasks$ = this.tasksService.getTasks(this.subtasks[index].tasks);
        }
      })
    }
    if (changes.taskContainer) {
      this.showSelectedSubtask = false;
    }
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
    const numRows = this.subtasks.length;
    return numSelected === numRows;
  }

  onMainCheckboxClick() {
    if (this.isAllSelected()) {
      this.clearSelection();
      return;
    }
    this.selection.select(...this.subtasks);
  }

  onFinishTasksClick() {
    this.tasksService.finishTasks(this.selection.selected).subscribe(
      {
        next: () => {
          this.clearSelection();
          this.refreshSubtasks.emit();
        }
      }
    );
  }

  onFinishAllTasksClick() {
    this.clearSelection();
    const subtasks = this.subtasks;
    this.subtasks = [];
    this.tasksService.finishTasks(subtasks).subscribe(
      () => this.refreshSubtasks.emit());
  }

  onSubtaskClick(task: TaskC) {
    this.clearSelection();
    this.router.navigate(['task', task._id]).then();
  }

  /**
   * prerequisite --- only 1 is selected
   */
  onShowSubtasksList() {
    // this.selectedSubtask = this.selection.selected[0];
    this.toggleShowTasksOfSelectedSubtask();
  }

  toggleShowTasksOfSelectedSubtask() {
    this.showSelectedSubtask = !this.showSelectedSubtask;
    if (this.showSelectedSubtask) {
      this.refreshTasksOfSelectedSubtask();
    }
  }

  refreshTasksOfSelectedSubtask() {
  }

  onTaskOfSelectedSubtaskDoneClick(task: TaskC){
    this.tasksService.finishTask(task).subscribe(() => this.refreshTasksOfSelectedSubtask())
  }

  ngOnDestroy(): void {
    this.tasksOfSelectedSubtask = [];
  }

  addTaskOfSelectedSubtask(taskWithSubtasksToShow: TaskC) {
    // this.tasksService.getTask(taskWithSubtasksToShowId).subscribe(
    //   t => this.tasksService.openAddTaskDialog2(t).subscribe(() => this.refreshTasksOfSelectedSubtask())
    // )
    // ;
    this.tasksService.openAddTaskDialog2(taskWithSubtasksToShow).subscribe(() => this.refreshTasksOfSelectedSubtask());
  }

  getTask(id: number): Observable<TaskC> {
    return this.tasksService.getTask(id);
  }

  unselectSelectedSubtask() {
    // this.selectedSubtask = null;
    this.showSelectedSubtask = false;
    this.clearSelection();
  }

  private handleSelectSubtaskAction() {
    const dialogRef = this.dialog.open(GetValueDialogComponent, {data: {title: 'Solution'}});
    dialogRef.afterClosed().subscribe((value: string) => {
      if (value && !isNaN(+value)) {
        const index = +value;
        if (index > 0 && index <= this.subtasks.length) {
          this.selection = new SelectionModel<TaskC>(true, [this.subtasks[index - 1]]);
          // this.selectedSubtask = this.selection.selected[0];
          this.showSelectedSubtask = true;
          this.refreshTasksOfSelectedSubtask();
        }
      }
    });
  }

  onSubtaskViewListClick(subtask: TaskC) {
    this.selection = new SelectionModel<TaskC>(true, [subtask]);
    // this.selectedSubtask = subtask;
    this.showSelectedSubtask = true;
    this.refreshTasksOfSelectedSubtask();
  }

  setShowSubtasksField($event: MatCheckboxChange, subtask: TaskC, i: number) {
    if ($event.checked) {

      this.tasksWithSubtasksToShow.push({
        instance: subtask,
        subtasks$: this.tasksService.getTasks(subtask.tasks)
      });
      if ( this.level === 0 && this.tasksWithSubtasksToShow.length === 1 ) {
        this.store.dispatch(new SetFocusedTaskForSubtasks(subtask));
      }
    } else {
      this.tasksWithSubtasksToShow = this.tasksWithSubtasksToShow
        .filter(el => el.instance._id !== subtask._id);
    }
  }

  focusSubtask($event: MouseEvent) {
    this.store.dispatch(new SetFocusedTaskForSubtasks(this.taskContainer));
  }

  checkedElement(subtask: TaskC) {
    return !!this.tasksWithSubtasksToShow.find(el => el.instance._id === subtask._id);
  }
}
