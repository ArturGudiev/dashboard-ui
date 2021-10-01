import {Component, OnInit, EventEmitter, Output, HostListener} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Router} from '@angular/router';
import {NewTaskDialogComponent} from "../../modules/tasks/new-task-dialog/new-task-dialog.component";
import {NavToDialogComponent} from "../../modules/dialogs/nav-to-task-dialog/nav-to-dialog.component";
import {Subscription} from "rxjs";
import {DashboardService, DashboardStateInterface} from "../../services/dashboard.service";
import {predefinedRoutes} from "../../shared/constants/predefined-routes";
import {getPredefinedRouteValue, isPredefinedRoute} from "../../shared/libs/dashboard.lib";
import {Hotkeys} from "../../classes/hotkeys";

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
              private hotkeys: Hotkeys,
              private router: Router) { }

  ngOnInit(): void {
    this.dashboardService.getDataStateChange().subscribe((state: DashboardStateInterface) => {
      this.doneTasks = state.doneTasks;
    });

    this.hotkeys.addShortcut({ keys: 'shift.z' }).subscribe(() => console.log('SSS'));
    this.hotkeys.addShortcut({ keys: 'meta.g' }).subscribe(() =>
      this.onNavToClick()
    );

    // Unsubscribe if you need to
    this.hotkeys.addShortcut({ keys: 'meta.j' }).subscribe();
  }

  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    console.log('CCC', event, event.key);


    if (event.key === '_') {
      this.onNavToClick();
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

  @HostListener('keydown.shift', ['$event'])
  onKeyDown(e: KeyboardEvent) {
    // optionally use preventDefault() if your combination
    // triggers other events (moving focus in case of Shift+Tab)
    // e.preventDefault();
    console.log('shift and tab');
  }


  onNavToClick(): void {
    const dialogRef = this.dialog.open(NavToDialogComponent,
      {
        height: '300px',
        width: '300px',
      });

    dialogRef.afterClosed().subscribe(result => {
      const navItem = result.navItem;

      if (navItem) {
        if (isPredefinedRoute(navItem)) {
          this.router.navigate(getPredefinedRouteValue(navItem)).then();
        }
        if (Number.isInteger(+navItem)) {
          this.router.navigate(['task', navItem.taskId]);
        }
        const arr = navItem.split(' ');
        console.log('HERE2', arr[0], arr[1], ['e', 'epic'].includes(arr[0]), ['e', 'epic'].includes(arr[0]) && Number.isInteger(arr[1]))
        if (['e', 'epic'].includes(arr[0]) && Number.isInteger(+arr[1])) {
          console.log('HERE3');
          this.router.navigate(['epic', arr[1]]).then();
        }
        if (['t', 'task'].includes(arr[0]) && Number.isInteger(+arr[1])) {
          this.router.navigate(['epic', arr[1]]).then();
        }
      }
    });
  }
}
