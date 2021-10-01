import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {TasksService} from "../../../services/tasks.service";
import {TaskC} from "../../../models/taskClass";
import {Epic} from "../../../models/epic";
import {EpicsService} from "../../../services/epics.service";
import {NewTaskDialogComponent} from "../../tasks/new-task-dialog/new-task-dialog.component";
import {MatDialog} from "@angular/material/dialog";
import {getUrlByDescription} from "../../../shared/libs/dashboard.lib";

@Component({
  selector: 'app-epic',
  templateUrl: './epic.component.html',
  styleUrls: ['./epic.component.sass']
})
export class EpicComponent implements OnInit {
  epic: Epic;

  subtasks: TaskC[];
  parentsPath: string[];

  constructor(private route: ActivatedRoute,
              private epicsService: EpicsService,
              private tasksService: TasksService,
              private router: Router,
              public dialog: MatDialog
  ) {
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      let id = params['id'];
      this.epicsService.getEpic(id).subscribe((epic: Epic) => {
        this.epic = epic;
        if (this.epic !== null) {
          this.tasksService.getParentsPath(this.epic).subscribe((res: string[]) => {
            this.parentsPath = res;
          });
          this.tasksService.getTasks(this.epic.getFullDescription()).subscribe(res => {
            this.subtasks = res;
          });
        }
      })
    });
  }

  refreshSubtasks() {
    this.tasksService.getTasks(this.epic.getFullDescription()).subscribe(newSubtasks => {
      this.subtasks = newSubtasks;
    });
  }

  addSubtask() {
    this.openAddTaskDialog();
  }

  openAddTaskDialog() {
    const dialogRef = this.dialog.open(NewTaskDialogComponent,
      {
        data: {parentTask: this.epic},
        height: '300px',
        width: '300px',
      });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const description = result.description;
        const obj = {description: description, tags: [this.epic.getFullDescription()]}
        console.log(obj);
        this.tasksService.createNewTask(obj).subscribe(() => {
          this.tasksService.getTasks(this.epic.getFullDescription()).subscribe(res => {
            this.subtasks = res;
          });
        });
      }
    });
  }

  onParentClick(description: string) {
    const urls = getUrlByDescription(description);
    if (urls) {
      this.router.navigate(urls);
    }
  }

  onSubtaskDoneClick(subtask: TaskC) {
    this.tasksService.finishTask(subtask).subscribe(() => this.refreshSubtasks());
  }


}
