import {Component, EventEmitter, HostListener, OnDestroy, OnInit, Output} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Router} from '@angular/router';
import {NavToDialogComponent} from "../../modules/dialogs/nav-task-dialog/nav-to-dialog.component";
import {DashboardService, DashboardStateInterface} from "../../services/dashboard.service";
import {getPredefinedRouteValue, isPredefinedRoute} from "../../shared/libs/dashboard.lib";
import {Hotkeys} from "../../classes/hotkeys";
import {CommandDialogComponent} from "../../modules/dialogs/command-dialog/command-dialog.component";
import {CommandsService} from "../../services/commands.service";
import {AlertService} from "../../services/alert.service";
import {GetValueDialogComponent} from "../../modules/dialogs/get-value/get-value-dialog.component";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.sass']
})
export class ToolbarComponent implements OnInit, OnDestroy {

  @Output() toggleSidenav = new EventEmitter<void>();
  doneTasks: number;
  private commandSubscription: Subscription;
  constructor(private dialog: MatDialog,
              private _snackBar: MatSnackBar,
              private dashboardService: DashboardService,
              private hotkeys: Hotkeys,
              private commandService: CommandsService,
              private alertService: AlertService,
              private router: Router) { }

  ngOnInit(): void {
    this.commandSubscription = this.dashboardService.getDataStateChange().subscribe((state: DashboardStateInterface) => {
      this.doneTasks = state.doneTasks;
    });

    this.hotkeys.addShortcut({ keys: 'meta.g' }).subscribe(() => this.onNavToClick());
    this.hotkeys.addShortcut({keys: 'Control.r'}).subscribe(() => this.commandService.setCommand('resolve'));
    this.hotkeys.addShortcut({keys: 'Control.p'}).subscribe(() => this.commandService.setCommand('problem'));
    this.hotkeys.addShortcut({keys: 'Control.a'}).subscribe(() => this.commandService.setCommand('fta'));

    this.hotkeys.addShortcut({ keys: 'Control.f' }).subscribe(() => {
        const dialogRef = this.dialog.open(GetValueDialogComponent, {data: { title: 'Finish' }});
        dialogRef.afterClosed().subscribe((finishCommand: string) => {
          if (finishCommand.startsWith('p')) {
            const newCommand = finishCommand.slice(1).trim();
            this.commandService.setCommand(`fp ${newCommand}`);
            return;
          }
          if (finishCommand) {
            this.commandService.setCommand(`f ${finishCommand}`);
            return;
          }
        });
      }
    );

    this.hotkeys.addShortcut({keys: 'meta.b'}).subscribe(() => this.commandService.setCommand('back'));
    this.hotkeys.addShortcut({keys: 'alt.b'}).subscribe(() => this.commandService.setCommand('back'));

    this.hotkeys.addShortcut({keys: '§'}).subscribe(() => this.commandService.setCommand('command'));
    this.hotkeys.addShortcut({keys: '`'}).subscribe(() => this.commandService.setCommand('command'));
    this.hotkeys.addShortcut({keys: 'meta.c'}).subscribe(() => this.openCommandDialog());
    this.hotkeys.addShortcut({keys: 'alt.c'}).subscribe(() => this.openCommandDialog());

    // Unsubscribe if you need to
    this.hotkeys.addShortcut({ keys: 'meta.j' }).subscribe();
  }

  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    console.log('CCC', event, event.key);
    // this.alertService.showAlert(`'CCC', ${event.key}`);
    // if (event.key === '_') {
    //   this.onNavToClick();
    // }
    if (event.key === '\\') {
      this.commandService.setCommand('anonymous');
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
  onKeyDown() {
    // optionally use preventDefault() if your combination
    // triggers other events (moving focus in case of Shift+Tab)
    // e.preventDefault();
    console.log('shift and tab');
  }


  onNavToClick(): void {
    const dialogRef = this.dialog.open(NavToDialogComponent,
      {
        height: '300px',
        width: '500px',
      });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) {
        return;
      }
      const navItem = result.navItem;

      if (navItem) {
        if (isPredefinedRoute(navItem)) {
          this.router.navigate(getPredefinedRouteValue(navItem)).then();
        }
        if (Number.isInteger(+navItem)) {
          this.router.navigate(['task', navItem]).then();
        }
        const arr = navItem.split(' ');
        if (['e', 'epic'].includes(arr[0]) && Number.isInteger(+arr[1])) {
          this.router.navigate(['epic', arr[1]]).then();
        }
        if (['t', 'task'].includes(arr[0]) && Number.isInteger(+arr[1])) {
          this.router.navigate(['epic', arr[1]]).then();
        }
        if (['s', 'story'].includes(arr[0]) && Number.isInteger(+arr[1])) {
          this.router.navigate(['story', arr[1]]).then();
        }

      }
    });
  }

  private openCommandDialog() {
    const dialogRef = this.dialog.open(CommandDialogComponent,
      {
        height: '300px',
        width: '500px',
      });

    dialogRef.afterClosed().subscribe(result => {
      if (!result) {
        return;
      }
      this.commandService.setCommand(result.command);
    });

    }

  openSnackBar(message = 'Cannonball!!') {
    this._snackBar.open(message, 'Splash', {
      horizontalPosition: 'center', //start, end, left, right
      verticalPosition: 'bottom',  // top, bottom
    });
  }

  ngOnDestroy(): void {
    this.commandSubscription.unsubscribe();
  }
}
