import {Component, OnInit, EventEmitter, Output, HostListener} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Router} from '@angular/router';
import {NewTaskDialogComponent} from "../../modules/tasks/new-task-dialog/new-task-dialog.component";
import {NavToTaskDialogComponent} from "../../modules/dialogs/nav-to-task-dialog/nav-to-task-dialog.component";
import {Subscription} from "rxjs";
import {DashboardService, DashboardStateInterface} from "../../services/dashboard.service";

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.sass']
})
export class ToolbarComponent implements OnInit {

  @Output() toggleSidenav = new EventEmitter<void>();
  // @Output() toggleTheme = new EventEmitter<void>();
  // @Output() toggleDir = new EventEmitter<void>();
  dashboardSubscription: Subscription;
  doneTasks: number;

  constructor(private dialog: MatDialog,
              private _snackBar: MatSnackBar,
              private dashboardService: DashboardService,
              private router: Router) { }

  ngOnInit(): void {
    this.dashboardService.getDataStateChange().subscribe((state: DashboardStateInterface) => {
      this.doneTasks = state.doneTasks;
    });
  }

  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    console.log('CCC', event, event.key);

    if (event.key === '_') {
      this.onNavToTaskClick();
    }

    // if (event.key === 'u' && this.parentsPath.length > 1) {
    //   console.log('AAAA', this.parentsPath.slice(-2));
    //   // this.onParentClick(this.parentsPath.slice(-2)[0]); // todo refactor
    // }
    //
    // if (event.keyCode === KEY_CODE.LEFT_ARROW) {
    //   this.decrement();
    // }
  }


  onNavToTaskClick(): void {
    const dialogRef = this.dialog.open(NavToTaskDialogComponent,
      {
        height: '300px',
        width: '300px',
      });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.router.navigate(['task', result.taskId]);
      }
    });
  }
}
