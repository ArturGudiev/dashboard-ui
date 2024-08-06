import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MatSnackBar } from "@angular/material/snack-bar";
import { DashboardService } from "./services/dashboard.service";
import { AlertService, IAlertsDataState } from "./services/alert.service";
import { ApiService } from "./services/api.service";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { Store } from "@ngxs/store";
import { MaterialModule } from './modules/material/material.module';
import { SidenavComponent } from "./components/sidenav/sidenav.component";

@UntilDestroy()
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, MaterialModule, SidenavComponent],
  templateUrl: './app.component.html',
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
