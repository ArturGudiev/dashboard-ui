import { ChangeDetectionStrategy, Component, DestroyRef, EventEmitter, inject, type OnInit, Output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { MatToolbar } from "@angular/material/toolbar";
import { MatIcon } from "@angular/material/icon";
import { MatButton } from "@angular/material/button";
import { DashboardService } from "../../../services/dashboard.service";
import type { DashboardStateInterface } from "../../../services/dashboard.service";
import { Hotkeys } from "../../../classes/hotkeys";
import { CommandsService } from "../../../services/commands.service";
import { NavigationService } from "../../../services/navigation.service";
import { GetValueDialogComponent } from "../../dialogs/get-value/get-value-dialog.component";
import { NavToDialogComponent } from "../../dialogs/nav-task-dialog/nav-to-dialog.component";
import { CommandDialogComponent } from "../../dialogs/command-dialog/command-dialog.component";
import { MessageService } from "../../../services/message.service";
import { NgxMatTimepickerModule } from "ngx-mat-timepicker";
import { FormsModule } from "@angular/forms";
import { OverlayModule } from "@angular/cdk/overlay";
import { GetDatetimeDialogComponent } from "../../dialogs/get-datetime-dialog/get-datetime-dialog.component";
import { AppStore } from "../../../state/app.store";

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  imports: [
    MatToolbar,
    MatIcon,
    MatButton,
    NgxMatTimepickerModule,
    FormsModule,
    OverlayModule,

  ],
  standalone: true,
  styleUrls: ['./toolbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToolbarComponent implements OnInit {

  @Output() toggleSidenav = new EventEmitter<void>();
  readonly doneTasks = signal(0);
  readonly doneTasksUntilValue = signal(0);
  readonly showUntilValue = signal(false);
  value: string = '';

  private appStore = inject(AppStore);
  private destroyRef = inject(DestroyRef);
  private dialog = inject(MatDialog);
  private _snackBar = inject(MatSnackBar);
  private dashboardService = inject(DashboardService);
  private hotkeys = inject(Hotkeys);
  private commandService = inject(CommandsService);
  private navigateService = inject(NavigationService);
  private messageService = inject(MessageService);
  private router = inject(Router);

  ngOnInit(): void {
    this.dashboardService.getDataStateChange()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((state: DashboardStateInterface) => {
      this.doneTasks.set(state.doneTasks);
      this.doneTasksUntilValue.set(state.doneTasksUntilValue);
      this.showUntilValue.set(state.showUntilValue);
    });

    this.commandService.getDataStateChange()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(state => {
      this.handleCommand(state.command);
    });

    this.addHotkeys();
  }

  openGetDatetimeDialog() {
    const dialogRef = this.dialog.open(GetDatetimeDialogComponent, {
      width: '500px',
      height: '700px',
      enterAnimationDuration: '0ms',
      exitAnimationDuration: '0ms',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.appStore.setDoneTaskFromDate(result.dateTimeValue);
        this.dashboardService.updateDoneTasksNumber();
        return;
      }
    });
  }

  /**
   * Добавления сочетания клавиш
   * @private
   */
  private addHotkeys() {
    for (let i = 1; i <= 9; i++) {
      // this.hotkeys.addShortcut({keys: `Alt.${i}`}).subscribe(() => this.console.log(`Alts + ${i}`));
      this.hotkeys.addShortcut({keys: `Alt.${i}`}).subscribe(() => this.messageService.showMessage(`Alt + ${i}`));
      this.hotkeys.addShortcut({keys: `Meta.${i}`}).subscribe(() => this.messageService.showMessage(`Meta + ${i}`));
      this.hotkeys.addShortcut({keys: `Option.${i}`}).subscribe(() => this.messageService.showMessage(`Option + ${i}`));
      this.hotkeys.addShortcut({keys: `Control.${i}`}).subscribe(() => this.commandService.setCommand(i.toString()));
      this.hotkeys.addShortcut({keys: `Control.Alt.${i}`}).subscribe(() =>
        this.commandService.setCommand('select-specific-task', { index: i - 1 }),
      );
      this.hotkeys.addShortcut({keys: `Control.Shift.${i}`}).subscribe(() =>
        this.commandService.setCommand('select-specific-task', { index: i - 1 }),
      );
    }
    this.hotkeys.addShortcut({keys: 'Control.u'}).subscribe(() => this.commandService.setCommand('parent'));
    this.hotkeys.addShortcut({keys: 'Control.g'}).subscribe(() => this.onNavToClick());
    this.hotkeys.addShortcut({keys: 'Control.r'}).subscribe(() => this.commandService.setCommand('resolve'));
    this.hotkeys.addShortcut({keys: 'Control.p'}).subscribe(() => this.commandService.setCommand('problem'));
    this.hotkeys.addShortcut({keys: 'Control.h'}).subscribe(() => this.commandService.setCommand('help'));

    this.hotkeys.addShortcut({keys: 'Control.o'}).subscribe(() => this.commandService.setCommand('subtask'));
    this.hotkeys.addShortcut({keys: 'Control.y'}).subscribe(() => this.commandService.setCommand('new-task-go'));
    this.hotkeys.addShortcut({keys: 'Control.Alt.y'}).subscribe(() => this.commandService.setCommand('new-task-for-focused-task-and-go'));
    this.hotkeys.addShortcut({keys: 'Control.Meta.y'}).subscribe(() => this.commandService.setCommand('new-task-for-focused-task-and-go'));
    this.hotkeys.addShortcut({keys: '='}).subscribe(() => this.commandService.setCommand('task'));
    this.hotkeys.addShortcut({keys: '+'}).subscribe(() => this.commandService.setCommand('task'));
    this.hotkeys.addShortcut({keys: 'Meta.o'}).subscribe(() => this.commandService.setCommand('selected-task'));
    this.hotkeys.addShortcut({keys: 'Alt.o'}).subscribe(() => this.commandService.setCommand('selected-task'));

    this.hotkeys.addShortcut({keys: '®'}).subscribe(() => this.commandService.setCommand('records'));
    this.hotkeys.addShortcut({keys: 'option.r'}).subscribe(() => this.commandService.setCommand('records'));
    this.hotkeys.addShortcut({keys: 'Â'}).subscribe(() => this.commandService.setCommand('new-record'));
    this.hotkeys.addShortcut({keys: 'Control.q'}).subscribe(() => this.commandService.setCommand('question'));
    this.hotkeys.addShortcut({keys: 'Control.t'}).subscribe(() => this.commandService.setCommand('fta'));
    this.hotkeys.addShortcut({keys: 'Control.Shift.r'}).subscribe(() => this.commandService.setCommand('fresolve'));
    this.hotkeys.addShortcut({keys: 'Control.Shift.t'}).subscribe(() =>
      this.commandService.setCommand('focus-fta'),
    );
    this.hotkeys.addShortcut({keys: 'Control.Alt.t'}).subscribe(() =>
      this.commandService.setCommand('focus-fta'),
    );
    this.hotkeys.addShortcut({keys: 'Control.m'}).subscribe(() => this.commandService.setCommand('notes'));
    this.hotkeys.addShortcut({keys: '\\'}).subscribe(() => this.commandService.setCommand('anonymous'));

    this.hotkeys.addShortcut({keys: 'Control.s'}).subscribe(() => this.commandService.setCommand('select-subtask'));
    this.hotkeys.addShortcut({keys: 'Control.Shift.s'}).subscribe(() => this.commandService.setCommand('select-subsubtask'));
    this.hotkeys.addShortcut({keys: 'Control.f'}).subscribe(() => {
        const dialogRef = this.dialog.open(GetValueDialogComponent, {data: {title: 'Finish'}});
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

    this.hotkeys.addShortcut({keys: 'Control.Shift.f'}).subscribe(() => {
        const dialogRef = this.dialog.open(GetValueDialogComponent, {data: {title: 'Finish'}});
        dialogRef.afterClosed().subscribe((finishCommand: string) => {
          if (finishCommand) {
            this.commandService.setCommand(`ff ${finishCommand}`);
            return;
          }
        });
      }
    );

    this.hotkeys.addShortcut({keys: '§'}).subscribe(() => this.commandService.setCommand('command'));
    this.hotkeys.addShortcut({keys: '`'}).subscribe(() => this.commandService.setCommand('command'));
    this.hotkeys.addShortcut({keys: 'meta.c'}).subscribe(() => this.openCommandDialog());
    this.hotkeys.addShortcut({keys: 'alt.c'}).subscribe(() => this.openCommandDialog());
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

  onLogsClick() {
    this.commandService.setCommand('logs');
  }

  onLongTasksClick() {
    this.router.navigate(['long-tasks']);
  }

  onEpicsClick() {
    this.router.navigate(['epics']);
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

  onKnowledgeClick() {
    const dialogRef = this.dialog.open(GetValueDialogComponent, {data: {title: 'Knowledge query'}});
    dialogRef.afterClosed().subscribe((knowledgeQuery: string) => {
      if (knowledgeQuery) {
        this.router.navigate(['knowledge-tree', 'node', knowledgeQuery]).then();
      }
    });
  }

  private handleCommand(command: string) {
    if (command === '+5') {
      this.dashboardService.setDoneTasksUntilValue(this.doneTasks() + 5);
    }
  }

  onUntilValueClick() {
    this.dashboardService.disableShowUntilValue();
  }

}
