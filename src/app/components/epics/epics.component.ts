import { Component, OnInit } from '@angular/core';
import { EpicsService } from "../../services/epics.service";
import { Epic } from "../../models/epic";
import { NgIf } from "@angular/common";
import { SharedModule } from "../../shared/shared.module";

@Component({
  selector: 'app-epics',
  standalone: true,
  imports: [
    NgIf,
    SharedModule
  ],
  templateUrl: './epics.component.html',
  styleUrl: './epics.component.sass'
})
export class EpicsComponent implements OnInit {
  epics: Epic[] = [];


  constructor(
    private epicsService: EpicsService
  ) {
  }

  ngOnInit() {
    this.epicsService.getAllEpics().subscribe(epics => {
      console.log('epics.component.ts -- ', epics);
      this.epics = epics;
    });
  }

}
