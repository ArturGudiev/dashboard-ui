import {Component, OnInit} from '@angular/core';
import { EpicsService } from "../../services/epics.service";
import { MultitaskingComponent } from "../multitasking/multitasking.component";

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
