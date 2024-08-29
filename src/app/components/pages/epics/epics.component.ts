import { Component } from '@angular/core';
import { EpicsService } from "../../../services/epics.service";
import { AsyncPipe, NgIf } from "@angular/common";
import { EpicsListComponent } from "../../lists/epics-list/epics-list.component";

@Component({
  selector: 'app-epics',
  standalone: true,
  imports: [
    NgIf,
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
