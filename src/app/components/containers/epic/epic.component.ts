import { Component, OnInit } from '@angular/core';
import { MatDialog } from "@angular/material/dialog";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute } from "@angular/router";
import { Epic } from "../../../models/epic";
import { EpicsService } from "../../../services/epics.service";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { NgIf } from "@angular/common";
import { map } from "rxjs/operators";
import { TaskContainerComponent } from "../task-container/task-container.component";
import { TaskContainerService } from "../../../services/task-container.service";

@UntilDestroy()
@Component({
  selector: 'app-epic',
  templateUrl: './epic.component.html',
  standalone: true,
  imports: [
    MatProgressSpinner,
    NgIf,
    TaskContainerComponent
  ],
  styleUrls: ['./epic.component.sass']
})
export class EpicComponent implements OnInit {
  id!: number;
  epic!: Epic; // resolve
  parentsPath: string[] = [];
  isLoading = true;

  refreshSubtasks$ = () => this.epicsService.getEpic(this.id).pipe(map(e => e.tasks));
  refreshProblemsList$ = () => this.epicsService.getEpic(this.id).pipe(map(e => e.problems));
  refreshQuestionsList$ = () => this.epicsService.getEpic(this.id).pipe(map(e => e.questions));

  constructor(
    public dialog: MatDialog,
    private route: ActivatedRoute,
    private epicsService: EpicsService,
    private titleService: Title,
    private taskContainerService: TaskContainerService,
  ) {
  }

  ngOnInit(): void {
    this.route.params.pipe(untilDestroyed(this))
      .subscribe(params => {
        this.id = params['id'];
        this.refreshEpic();
      });
  }

  refreshEpic() {
    this.isLoading = true;
    this.epicsService.getEpic(this.id).pipe(untilDestroyed(this)).subscribe((epic: Epic) => {
      this.epic = epic;
      this.titleService.setTitle(this.epic.getFullDescription());
      if (this.epic !== null) {
        this.taskContainerService.getParentsPath(this.epic)
          .pipe(untilDestroyed(this))
          .subscribe((res: string[]) => {
            this.parentsPath = res;
          });
      }
      this.isLoading = false;
    });
  }

  /**
   * Сохранение эпика (например, для обновления в базе заметок)
   */
  updateEpic() {
    if (!this.epic) {
      return;
    }
    this.epicsService.updateEpic(this.epic).subscribe((epic: Epic) => this.epic = epic);
  }
}
