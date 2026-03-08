import { Component, OnInit } from '@angular/core';
import { MultitaskingComponent } from "../../multitasking/multitasking.component";
import { EpicsService } from "../../../services/task-container-services/epics.service";

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
  standalone: true,
  imports: [
    MultitaskingComponent
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
