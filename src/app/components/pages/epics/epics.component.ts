import { Component } from '@angular/core';
import { AsyncPipe, NgIf } from "@angular/common";
import { EpicsListComponent } from "../../lists/epics-list/epics-list.component";
import { EpicsService } from "../../../services/task-container-services/epics.service";

@Component({
    selector: 'app-epics',
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
