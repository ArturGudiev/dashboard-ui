import { Component, inject, OnInit, signal } from '@angular/core';
import { Title } from "@angular/platform-browser";
import { ActivatedRoute } from "@angular/router";
import { Epic } from "../../../models/epic";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { MatProgressSpinner } from "@angular/material/progress-spinner";

import { map } from "rxjs/operators";
import { TaskContainerComponent } from "../task-container/task-container.component";
import { EpicsService } from "../../../services/task-container-services/epics.service";
import { TaskContainerService } from "../../../services/task-container-services/task-container.service";

@UntilDestroy()
@Component({
    selector: 'app-epic',
    templateUrl: './epic.component.html',
    imports: [
      MatProgressSpinner,
      TaskContainerComponent
    ],
    styleUrls: ['./epic.component.sass']
})
export class EpicComponent implements OnInit {
  id!: number;
  epic!: Epic; 
  parentsPath = signal<string[]>([]);
  isLoading = signal<boolean>(true);

  refreshSubtasks$ = () => this.epicsService.getEpic(this.id).pipe(map(e => e.tasks));
  refreshProblemsList$ = () => this.epicsService.getEpic(this.id).pipe(map(e => e.problems));
  refreshQuestionsList$ = () => this.epicsService.getEpic(this.id).pipe(map(e => e.questions));

  private route = inject(ActivatedRoute);
  private epicsService = inject(EpicsService);
  private titleService = inject(Title);
  private taskContainerService = inject(TaskContainerService);
  
  ngOnInit(): void {
    this.route.params.pipe(untilDestroyed(this))
      .subscribe(params => {
        this.id = params['id'];
        this.refreshEpic();
      });
  }

  refreshEpic() {
    this.isLoading.set(true);
    this.epicsService.getEpic(this.id).pipe(untilDestroyed(this)).subscribe((epic: Epic) => {
      this.epic = epic;
      this.titleService.setTitle(epic.getFullDescription());
      if (epic) {
        this.taskContainerService.getParentsPath(epic)
          .pipe(untilDestroyed(this))
          .subscribe((res: string[]) => {
            this.parentsPath.set(res);
          });
      }
      this.isLoading.set(false);
    });
  }

  /**
   * Сохранение эпика (например, для обновления в базе заметок)
   */
  updateEpic() {
    if (!this.epic) {
      return;
    }
    const epicVal = this.epic;
    if (epicVal) {
      this.epicsService.updateEpic(epicVal).subscribe((epic: Epic) => this.epic = epic);
    }
  }
}
