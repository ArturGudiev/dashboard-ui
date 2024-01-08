import {Component, OnInit} from '@angular/core';
import { EpicsService } from 'src/app/services/epics.service';

@Component({
  selector: 'app-main-page',
  templateUrl: './main-page.component.html',
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
