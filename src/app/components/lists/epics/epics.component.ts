import { Component, OnInit } from '@angular/core';
import { EpicsService } from "../../../services/epics.service";
import { Epic } from "../../../models/epic";
import { AsyncPipe, NgIf } from "@angular/common";
import { SharedModule } from "../../../shared/shared.module";
import { Observable } from "rxjs";
import { EpicsListComponent } from "../epics-list/epics-list.component";

@Component({
  selector: 'app-epics',
  standalone: true,
  imports: [
    NgIf,
    SharedModule,
    AsyncPipe,
    EpicsListComponent
  ],
  templateUrl: './epics.component.html',
  styleUrl: './epics.component.sass'
})
export class EpicsComponent {
  epics$ = this.epicsService.getAllEpics();

  constructor(private epicsService: EpicsService) {}

}
