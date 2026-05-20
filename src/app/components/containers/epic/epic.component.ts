import { Component, inject, input, signal } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Title } from "@angular/platform-browser";
import { Epic } from "../../../models/epic";
import { MatProgressSpinner } from "@angular/material/progress-spinner";

import { of } from "rxjs";
import { EpicsService } from "../../../services/task-container-services/epics.service";
import { TaskContainerService } from "../../../services/task-container-services/task-container.service";
import { TaskContainerSignalComponent } from "../task-container-signal/task-container-signal.component";

@Component({
  selector: 'app-epic',
  templateUrl: './epic.component.html',
  imports: [
    MatProgressSpinner,
    TaskContainerSignalComponent
  ],
  styleUrls: ['./epic.component.sass']
})
export class EpicComponent {
  
  epicId = input.required<number>();
  parentsPath = signal<string[]>([]);
  
  epicResource = rxResource<Epic, { id: number }>({
    params: () => ({ id: this.epicId() ?? 0 }),
    stream: ({ params }) => this.epicsService.getEpic(params.id),
  });

  parentsPathResource = rxResource<string[], { epic: Epic | null }>({
    params: () => ({ epic: this.epicResource.value() ?? null }),
    stream: ({ params }) => {
      if (!params.epic) {
        return of([]);
      }
      return this.taskContainerService.getParentsPath(params.epic);
    },
  });


  private epicsService = inject(EpicsService);
  private titleService = inject(Title);
  private taskContainerService = inject(TaskContainerService);

  

  updateEpic() { // TODO 
  //   if (!this.epic) {
  //     return;
  //   }
  //   this.epicsService.updateEpic(this.epic)
  //     .pipe(takeUntilDestroyed(this.destroyRef))
  //     .subscribe((updatedEpic: Epic) => this.epic = updatedEpic);
  }
}
