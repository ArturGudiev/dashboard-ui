import { Component, DestroyRef, inject, type OnInit , ChangeDetectionStrategy} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatSnackBar } from "@angular/material/snack-bar";
import { DashboardService } from "./services/dashboard.service";
import { AlertService, type IAlertsDataState } from "./services/alert.service";
import { SidenavComponent } from "./components/pages/sidenav/sidenav.component";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-root',
    imports: [SidenavComponent],
  templateUrl: './app.component.html',
  standalone: true,
  styleUrl: './app.component.sass'
})
export class AppComponent implements OnInit {
  title = 'dashboard-ui';
  alertState: IAlertsDataState | null = null;

  private dashboardService = inject(DashboardService);
  private alertService = inject(AlertService);
  private _snackBar = inject(MatSnackBar);
  private destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.dashboardService.updateDoneTasksNumber();
    setInterval(() => this.dashboardService.updateDoneTasksNumber(), 30000);

    this.alertService.data$
      .pipe(takeUntilDestroyed(this.destroyRef))
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
