import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Title } from "@angular/platform-browser";
import { ActivatedRoute } from "@angular/router";
import { Epic } from "../../../models/epic";
import { MatProgressSpinner } from "@angular/material/progress-spinner";

import { map } from "rxjs/operators";
import { TaskContainerComponent } from "../task-container/task-container.component";
import { EpicsService } from "../../../services/task-container-services/epics.service";
import { TaskContainerService } from "../../../services/task-container-services/task-container.service";

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
  private destroyRef = inject(DestroyRef);
  
  ngOnInit(): void {
    this.route.params.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(params => {
        this.id = params['id'];
        this.refreshEpic();
      });
  }

  refreshEpic() {
    this.isLoading.set(true);
    this.epicsService.getEpic(this.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((epic: Epic) => {
      this.epic = epic;
      this.titleService.setTitle(epic.getFullDescription());
      if (epic) {
        this.taskContainerService.getParentsPath(epic)
          .pipe(takeUntilDestroyed(this.destroyRef))
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
