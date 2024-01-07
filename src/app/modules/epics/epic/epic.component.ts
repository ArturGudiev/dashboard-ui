import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDialog } from "@angular/material/dialog";
import { Title } from "@angular/platform-browser";
import { ActivatedRoute, Router } from "@angular/router";
import { Subscription } from "rxjs";
import { Epic } from "../../../models/epic";
import { CommandsService } from "../../../services/commands.service";
import { EpicsService } from "../../../services/epics.service";
import { TasksService } from "../../../services/tasks.service";
import { getUrlByDescription } from "../../../shared/libs/dashboard.lib";

@Component({
  selector: 'app-epic',
  templateUrl: './epic.component.html',
  styleUrls: ['./epic.component.sass']
})
export class EpicComponent implements OnInit, OnDestroy {
  epic: Epic;
  parentsPath: string[];
  routeSubscription: Subscription;
  isLoading = true;
  id: number;
  constructor(private route: ActivatedRoute,
              private epicsService: EpicsService,
              private tasksService: TasksService,
              private router: Router,
              private commandsService: CommandsService,
              private titleService: Title,
              public dialog: MatDialog,
  ) {
  }

  ngOnInit(): void {
    this.routeSubscription = this.route.params.subscribe(params => {
      this.id = params['id'];
      this.refreshEpic();
    });
  }

  refreshEpic() {
    this.isLoading = true;
    this.epicsService.getEpic(this.id).subscribe((epic: Epic) => {
      this.epic = epic;
      this.titleService.setTitle(this.epic.getFullDescription());
      if (this.epic !== null) {
        this.tasksService.getParentsPath(this.epic).subscribe((res: string[]) => {
          this.parentsPath = res;
        });
      }
      this.isLoading = false;
    });
  }

  ngOnDestroy(): void {
    this.routeSubscription.unsubscribe();
  }


  onGoToNearestParent() {
    if (this.parentsPath && this.parentsPath.length <= 1) {
      return;
    }
    this.goToParentHandler(this.parentsPath.slice(-2, -1)[0]);
  }

  goToParentHandler(description: string) {
    const urls = getUrlByDescription(description);
    if (urls) {
      this.router.navigate(urls).then();
    }
  }

}
