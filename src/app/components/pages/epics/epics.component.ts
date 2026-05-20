import { Component, inject , ChangeDetectionStrategy} from '@angular/core';
import { AsyncPipe } from "@angular/common";
import { EpicsListComponent } from "../../lists/epics-list/epics-list.component";
import { EpicsService } from "../../../services/task-container-services/epics.service";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-epics',
    standalone: true,
    imports: [
      AsyncPipe,
      EpicsListComponent
    ],
    templateUrl: './epics.component.html',
})
export class EpicsComponent {
  private epicsService = inject(EpicsService);
  
  epics$ = this.epicsService.getAllEpics();
  
}
