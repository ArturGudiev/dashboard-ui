import {Component, HostListener, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from "@angular/router";
import {TasksService} from "../../../services/tasks.service";
import {TaskC} from "../../../models/task-class";
import {Epic} from "../../../models/epic";
import {EpicsService} from "../../../services/epics.service";
import {NewTaskDialogComponent} from "../../tasks/new-task-dialog/new-task-dialog.component";
import {MatDialog} from "@angular/material/dialog";
import {getUrlByDescription} from "../../../shared/libs/dashboard.lib";
import {Story} from "../../../models/story";
import {StoriesService} from "../../../services/stories.service";
import {Title} from "@angular/platform-browser";

@Component({
  selector: 'app-epic',
  templateUrl: './epic.component.html',
  styleUrls: ['./epic.component.sass']
})
export class EpicComponent implements OnInit {
  epic: Epic;
  subtasks: TaskC[];
  stories: Story[];
  parentsPath: string[];

  constructor(private route: ActivatedRoute,
              private epicsService: EpicsService,
              private tasksService: TasksService,
              private router: Router,
              private storiesService: StoriesService,
              private titleService: Title,
  public dialog: MatDialog
  ) {
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      let id = params['id'];
      this.epicsService.getEpic(id).subscribe((epic: Epic) => {
        this.epic = epic;
        this.titleService.setTitle(this.epic.getFullDescription());
        if (this.epic !== null) {
          this.tasksService.getParentsPath(this.epic).subscribe((res: string[]) => {
            this.parentsPath = res;
          });
          this.refreshSubtasks();
          this.refreshSubstories();
        }
      })
    });
  }

  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {

    if (event.key === 'Insert' || event.key === '+' || event.key === '=') {
      this.openAddTaskDialog();
    }

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


  onSubtaskDoneClick(subtask: TaskC) {
    this.tasksService.finishTask(subtask).subscribe(() => this.refreshSubtasks());
  }


  onGoToNearseParent() {
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

  navigateToStory(story: Story) {
    this.router.navigate(['story', story._id]).then();
  }

  addSubstory() {

  }

  private refreshSubstories() {
    this.storiesService.getStories(this.epic.getFullDescription()).subscribe(stories => {
      this.stories = stories;
    });
  }
}
