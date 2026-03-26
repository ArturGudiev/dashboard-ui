import { Component } from '@angular/core';
import { MatSnackBar } from "@angular/material/snack-bar";
import { DashboardService } from "./services/dashboard.service";
import { AlertService, IAlertsDataState } from "./services/alert.service";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { MaterialModule } from './modules/material/material.module';
import { SidenavComponent } from "./components/pages/sidenav/sidenav.component";

@UntilDestroy()
@Component({
  selector: 'app-root',
  imports: [MaterialModule, SidenavComponent],
  templateUrl: './app.component.html',
  standalone: true,
  styleUrl: './app.component.sass'
})
export class AppComponent {
  title = 'dashboard-ui';
  alertState: IAlertsDataState | null = null;

  constructor(
    private dashboardService: DashboardService,
    private alertService: AlertService,
    private _snackBar: MatSnackBar
  ) {
  }

  ngOnInit(): void {
    console.log('app.component.ts -- ngOnInit');
    this.dashboardService.updateDoneTasksNumber();
    setInterval(() => this.dashboardService.updateDoneTasksNumber(), 30000);

    this.alertService.data$
      .pipe(untilDestroyed(this))
      .subscribe((alertState: IAlertsDataState) => {
        this.alertState = alertState;
        if (!alertState.closed) {
          this._snackBar.open(alertState.message, 'close', {
            duration: alertState.duration,
          });
          this.alertService.setAlertClosed();
        }
      });
  }

}
