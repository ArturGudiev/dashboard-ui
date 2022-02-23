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
import {TaskC} from "../../../models/task-class";
import {SelectionModel} from "@angular/cdk/collections";
import {TasksService} from "../../../services/tasks.service";
import {Router} from "@angular/router";
import {AlertService} from "../../../services/alert.service";
import {Subscription} from "rxjs";
import {every} from "lodash";
import {TaskContainer} from "../../../interfaces/task-container";
import {CommandsService} from "../../../services/commands.service";
import {MatDialog} from "@angular/material/dialog";
import {GetValueDialogComponent} from "../../../modules/dialogs/get-value/get-value-dialog.component";

@Component({
  selector: 'app-subtasks',
  templateUrl: './subtasks.component.html',
  styleUrls: ['./subtasks.component.sass']
})
export class SubtasksComponent implements OnInit, OnChanges, OnDestroy {
  @Input() taskContainer: TaskContainer;
  @Input() subtasks: TaskC[];
  @Input() showTitle = false;
  @Input() level = 0;
  @Output() refreshSubtasks = new EventEmitter();
  @Output() addSubtask = new EventEmitter();
  @Output() onSubtaskDoneClick = new EventEmitter();
  selection = new SelectionModel<TaskC>(true, []);
  displayedColumns: string[] = ['select', 'position', 'description', 'actions'];
  displayedColumns2: string[] = ['description', 'actions'];
  showSelectedSubtask = false;
  selectedSubtask: TaskC = null;
  tasksOfSelectedSubtask: TaskC[] = [];
  refreshTasksSubscription: Subscription;
  commandsSubscription: Subscription;
  constructor(private tasksService: TasksService,
              private alertService: AlertService,
              private commandsService: CommandsService,
              public dialog: MatDialog,
              public cdr: ChangeDetectorRef,
              private router: Router) { }

  ngOnInit(): void {
    this.refreshTasksSubscription = this.tasksService.getRefreshTasksDataStateChange().subscribe(state => {
      if (this.selectedSubtask === state.taskContainer) { this.refreshTasksOfSelectedSubtask(); }
    });
    this.commandsSubscription = this.commandsService.getDataStateChange().subscribe(state => {
      this.handleTaskCommand(state.command);
    })
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
      }
    }
    if (changes.taskContainer) {
      this.showSelectedSubtask = false;
    }
  }

  private handleTaskCommand(command: string) {
    const arr = command.split(' ');
    if (['subtask'].includes(arr[0])) {
      if (this.selectedSubtask && this.level === 0) {
        this.addTaskOfSelectedSubtask();
      }
    }
    if (['subsubtask'].includes(arr[0])) {
      if (this.selectedSubtask && this.level === 1) {
        this.addTaskOfSelectedSubtask();
      }
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
        if (this.selectedSubtask) {
          this.unselectSelectedSubtask();
        }
      }
    }
    if (['deselect-subsubtask'].includes(arr[0])) {
      if (this.level === 1) {
        if (this.selectedSubtask) {
          this.unselectSelectedSubtask();
        }
      }
    }

  }

  private clearSelection() {
    this.selection.clear();
    this.selectedSubtask = null;
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
  onSubtaskListClick() {
    this.selectedSubtask = this.selection.selected[0];
    this.toggleShowTasksOfSelectedSubtask();
  }

  toggleShowTasksOfSelectedSubtask() {
    this.showSelectedSubtask = !this.showSelectedSubtask;
    if (this.showSelectedSubtask) {
      this.refreshTasksOfSelectedSubtask();
    }
  }

  refreshTasksOfSelectedSubtask() {
    if (!this.selectedSubtask) {
      return;
    }
    this.tasksService.getTasks(this.selectedSubtask.getFullDescription()).subscribe(
      tasks => this.tasksOfSelectedSubtask = tasks
    );
  }

  onTaskOfSelectedSubtaskDoneClick(task: TaskC){
    this.tasksService.finishTask(task).subscribe(() => this.refreshTasksOfSelectedSubtask())
  }

  ngOnDestroy(): void {
    this.selectedSubtask = null;
    this.tasksOfSelectedSubtask = [];
    this.refreshTasksSubscription.unsubscribe();

  }

  addTaskOfSelectedSubtask() {
    this.tasksService.openAddTaskDialog(this.selectedSubtask);
  }

  unselectSelectedSubtask() {
    this.selectedSubtask = null;
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
          this.selectedSubtask = this.selection.selected[0];
          this.showSelectedSubtask = true;
          this.refreshTasksOfSelectedSubtask();
        }
      }
    });
  }
}
