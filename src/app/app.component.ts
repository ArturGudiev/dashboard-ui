import { Component, DestroyRef, effect, inject, untracked, ChangeDetectionStrategy} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatSnackBar } from "@angular/material/snack-bar";
import { RouterOutlet } from '@angular/router';
import { DashboardService } from "./services/dashboard.service";
import { AlertService, type IAlertsDataState } from "./services/alert.service";
import { WebsocketService } from "./services/websocket.service";
import { AuthStore } from "./state/auth.store";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-root',
    imports: [RouterOutlet],
  templateUrl: './app.component.html',
  standalone: true,
  styleUrl: './app.component.sass'
})
export class AppComponent {
  title = 'dashboard-ui';
  alertState: IAlertsDataState | null = null;

  private dashboardService = inject(DashboardService);
  private alertService = inject(AlertService);
  private websocketService = inject(WebsocketService);
  private authStore = inject(AuthStore);
  private _snackBar = inject(MatSnackBar);
  private destroyRef = inject(DestroyRef);

  constructor() {
    effect(() => {
      const isAuthenticated = this.authStore.isAuthenticated();
      untracked(() => {
        if (isAuthenticated) {
          void this.dashboardService.updateDoneTasksNumber();
          this.websocketService.connect();
        } else {
          this.websocketService.close();
        }
      });
    });

    this.websocketService.connected$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.dashboardService.updateDoneTasksNumber());
    this.websocketService
      .onEvent('doneTasksChanged')
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.dashboardService.updateDoneTasksNumber());

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
