import {Component, OnInit} from '@angular/core';
import {DashboardService} from "./services/dashboard.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {AlertService, IAlertsDataState} from "./services/alert.service";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent implements OnInit {
  title = 'dashboard-ui';
  alertState: IAlertsDataState;

  constructor(private dashboardService: DashboardService,
              private alertService: AlertService,
              private _snackBar: MatSnackBar) {
  }

  ngOnInit(): void {
    this.dashboardService.updateDoneTasksNumber();
    this.alertService.getDataStateChange()
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
