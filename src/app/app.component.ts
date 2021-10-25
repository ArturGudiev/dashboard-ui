import {Component, OnInit} from '@angular/core';
import {DashboardService} from "./services/dashboard.service";
import {MatSnackBar} from "@angular/material/snack-bar";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.sass']
})
export class AppComponent implements OnInit{
  title = 'dashboard-ui';

  constructor(private dashboardService: DashboardService,
              private _snackBar: MatSnackBar) {
  }

  ngOnInit(): void {
    this.dashboardService.updateDoneTasksNumber();
    // this._snackBar.open('Welcome', 'close', {
    //   duration: 3000
    // });
  }
}
