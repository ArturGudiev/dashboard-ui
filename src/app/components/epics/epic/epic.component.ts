import { Component, OnInit } from '@angular/core';
import { MatDialog } from "@angular/material/dialog";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import { Epic } from "../../../models/epic";
import { CommandsService } from "../../../services/commands.service";
import { EpicsService } from "../../../services/epics.service";
import { TasksService } from "../../../services/tasks.service";
import { getUrlByDescription } from "../../../shared/libs/dashboard.lib";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { SharedModule } from "../../../shared/shared.module";
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { NgIf } from "@angular/common";
import { map } from "rxjs/operators";
import { Observable, of } from "rxjs";

@UntilDestroy()
@Component({
  selector: 'app-epic',
  templateUrl: './epic.component.html',
  standalone: true,
  imports: [
    SharedModule,
    MatProgressSpinner,
    NgIf
  ],
  styleUrls: ['./epic.component.sass']
})
export class EpicComponent implements OnInit {
  id!: number;
  epic!: Epic; // resolve
  parentsPath: string[] = [];
  isLoading = true;

  parentsPath$: Observable<string[]> = of([]);


  refreshSubtasks$ = () => this.epicsService.getEpic(this.id).pipe(map(e => e.tasks));
  refreshProblemsList$ = () => this.epicsService.getEpic(this.id).pipe(map(e => e.problems));
  refreshQuestionsList$ = () => this.epicsService.getEpic(this.id).pipe(map(e => e.questions));

  constructor(private route: ActivatedRoute,
              private epicsService: EpicsService,
              private tasksService: TasksService,
              private router: Router,
              private titleService: Title,
              public dialog: MatDialog,
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
      this.parentsPath$ = this.epicsService.getParentsPath(this.epic);
      this.titleService.setTitle(this.epic.getFullDescription());
      if (this.epic !== null) {
        this.tasksService.getParentsPath(this.epic)
          .pipe(untilDestroyed(this))
          .subscribe((res: string[]) => {
            this.parentsPath = res;
          });
      }
      this.isLoading = false;
    });
  }



}
