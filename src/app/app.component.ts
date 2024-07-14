import {Component, OnDestroy, OnInit} from '@angular/core';
import {DashboardService} from "./services/dashboard.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {AlertService, IAlertsDataState} from "./services/alert.service";
import {Subscription} from "rxjs";
import {ApiService} from "./services/api.service";
import { Store } from '@ngxs/store';
import { AppState } from "./state/app.state";
import { MyAction } from "./state/app.actions";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'dashboard-ui';
  alertState: IAlertsDataState;
  alertSubscription: Subscription;

  constructor(private dashboardService: DashboardService,
              private alertService: AlertService,
              private apiService: ApiService,
              private store: Store,
              private _snackBar: MatSnackBar) {
  }

  ngOnInit(): void {
    this.dashboardService.updateDoneTasksNumber();
    setInterval(() => this.dashboardService.updateDoneTasksNumber(), 30000);
    this.alertSubscription = this.alertService.getDataStateChange()
      .subscribe((alertState: IAlertsDataState) => {
        this.alertState = alertState;
        if (!alertState.closed) {
          this._snackBar.open(alertState.message, 'close', {
            duration: alertState.duration,
          });
          this.alertService.setAlertClosed();
        }
      });

    this.apiService._getAlias('amdocse').subscribe( val => console.log(val))
  }

  ngOnDestroy(): void {
    this.alertSubscription.unsubscribe();
  }
}
