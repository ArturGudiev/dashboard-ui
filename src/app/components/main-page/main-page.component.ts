import {Component, OnInit} from '@angular/core';
import { EpicsService } from "../../services/epics.service";
import { SharedModule } from "../../shared/shared.module";

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  standalone: true,
  imports: [
    SharedModule
  ],
  styleUrls: ['./main-page.component.sass']
})
export class MainPageComponent implements OnInit {
  constructor(
    private epicsService: EpicsService
  ) {
  }

  ngOnInit():    void {
  }

}
