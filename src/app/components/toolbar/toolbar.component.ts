import {Component, EventEmitter, HostListener, OnDestroy, OnInit, Output} from '@angular/core';
import {MatDialog} from '@angular/material/dialog';
import {MatSnackBar} from '@angular/material/snack-bar';
import {Router} from '@angular/router';
import {NavToDialogComponent} from "../../modules/dialogs/nav-task-dialog/nav-to-dialog.component";
import {DashboardService, DashboardStateInterface} from "../../services/dashboard.service";
import {Hotkeys} from "../../classes/hotkeys";
import {CommandDialogComponent} from "../../modules/dialogs/command-dialog/command-dialog.component";
import {CommandsService} from "../../services/commands.service";
import {AlertService} from "../../services/alert.service";
import {GetValueDialogComponent} from "../../modules/dialogs/get-value/get-value-dialog.component";
import {Subscription} from "rxjs";
import {NavigationService} from "../../services/navigation.service";

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
              private navigateService: NavigationService,
              private router: Router) { }

  ngOnInit(): void {
    this.commandSubscription = this.dashboardService.getDataStateChange().subscribe((state: DashboardStateInterface) => {
      this.doneTasks = state.doneTasks;
    });

    const symbols = {
      meta: '&#8984;', // ⌘
      shift: '&#8679;', // ⇧
      left: '&#8592;', // ←
      right: '&#8594;', // →
      up: '&#8593;', // ↑
      down: '&#8595;' // ↓
    };

    for (let i = 1; i <= 9; i++) {
      this.hotkeys.addShortcut({keys: `Control.${i}`}).subscribe(() => this.commandService.setCommand(i.toString()));
    }
    this.hotkeys.addShortcut({ keys: 'Control.g' }).subscribe(() => this.onNavToClick());
    this.hotkeys.addShortcut({keys: 'Control.Shift.r'}).subscribe(() => this.commandService.setCommand('resolve'));
    this.hotkeys.addShortcut({keys: 'Control.p'}).subscribe(() => this.commandService.setCommand('problem'));

    this.hotkeys.addShortcut({keys: 'Control.o'}).subscribe(() => this.commandService.setCommand('new-task'));
    this.hotkeys.addShortcut({keys: 'Meta.o'}).subscribe(() => this.commandService.setCommand('new-task'));
    this.hotkeys.addShortcut({keys: 'Alt.o'}).subscribe(() => this.commandService.setCommand('new-task'));
    this.hotkeys.addShortcut({keys: '='}).subscribe(() => this.commandService.setCommand('task'));

    this.hotkeys.addShortcut({keys: '®'}).subscribe(() => this.commandService.setCommand('records'));
    this.hotkeys.addShortcut({keys: 'option.r'}).subscribe(() => this.commandService.setCommand('records'));
    this.hotkeys.addShortcut({keys: 'Â'}).subscribe(() => this.commandService.setCommand('new-record'));
    this.hotkeys.addShortcut({keys: 'Control.q'}).subscribe(() => this.commandService.setCommand('question'));
    this.hotkeys.addShortcut({keys: 'Control.t'}).subscribe(() => this.commandService.setCommand('fta'));
    this.hotkeys.addShortcut({keys: 'Control.d'}).subscribe(() => this.commandService.setCommand('definition'));
    this.hotkeys.addShortcut({keys: 'Control.k'}).subscribe(() => this.commandService.setCommand('knowledge'));
    this.hotkeys.addShortcut({keys: 'Control.m'}).subscribe(() => this.commandService.setCommand('notes'));
    this.hotkeys.addShortcut({keys: 'Control.='}).subscribe(() => this.commandService.setCommand('task'));
    this.hotkeys.addShortcut({keys: '\\'}).subscribe(() => this.commandService.setCommand('anonymous'));
    this.hotkeys.addShortcut({keys: 'Control.o'}).subscribe(() => this.commandService.setCommand('subtask'));
    this.hotkeys.addShortcut({keys: 'Control.Shift.o'}).subscribe(() => this.commandService.setCommand('subsubtask'));
    this.hotkeys.addShortcut({keys: 'Control.s'}).subscribe(() => this.commandService.setCommand('select-subtask'));
    this.hotkeys.addShortcut({keys: 'Control.Shift.s'}).subscribe(() => this.commandService.setCommand('select-subsubtask'));
    this.hotkeys.addShortcut({keys: 'Control.y'}).subscribe(() => this.commandService.setCommand('deselect-subtask'));
    this.hotkeys.addShortcut({keys: 'Control.Shift.y'}).subscribe(() => this.commandService.setCommand('deselect-subsubtask'));
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
  }

  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    // console.log('CCC', event, event.key);
    // this.alertService.showAlert(event.key);
    // this.alertService.showAlert(`'CCC', ${event}, ${event.key}`)
    // if (event.key === '\\') {
    //   this.commandService.setCommand('anonymous');
    // }
  }

  @HostListener('keydown.shift', ['$event'])
  onKeyDown() {
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
      this.navigateService.navigateByInput(navItem);
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

  onKnowledgeClick() {
    const dialogRef = this.dialog.open(GetValueDialogComponent, {data: {title: 'Knowledge query'}});
    dialogRef.afterClosed().subscribe((knowledgeQuery: string) => {
      if (knowledgeQuery) {
        this.router.navigate(['knowledge-tree', 'node', knowledgeQuery]).then();
      }
    });
  }
}
