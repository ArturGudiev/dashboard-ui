import {Component, HostListener, OnInit} from '@angular/core';
import {TaskC} from "../../../models/task-class";
import {Story} from "../../../models/story";
import {ActivatedRoute, Router} from "@angular/router";
import {TasksService} from "../../../services/tasks.service";
import {MatDialog} from "@angular/material/dialog";
import {StoriesService} from "../../../services/stories.service";
import {NewTaskDialogComponent} from "../../tasks/new-task-dialog/new-task-dialog.component";
import {getUrlByDescription} from "../../../shared/libs/dashboard.lib";
import {Title} from "@angular/platform-browser";

@Component({
  selector: 'app-story',
  templateUrl: './story.component.html',
  styleUrls: ['./story.component.sass']
})
export class StoryComponent implements OnInit {
  story: Story;
  subtasks: TaskC[];
  parentsPath: string[];
  stories: Story[];

  constructor(
    private route: ActivatedRoute,
    private storiesService: StoriesService,
    private tasksService: TasksService,
    private router: Router,
    private titleService: Title,
    public dialog: MatDialog

  ) { }

  ngOnInit(): void {
    console.log('StoryComponent.ngOnInit');

    this.route.params.subscribe(params => {
      let id = params['id'];
      this.storiesService.getStory(id).subscribe((story: Story) => {
        this.story = story;
        this.titleService.setTitle(this.story.getFullDescription());
        if (this.story !== null) {
          this.tasksService.getParentsPath(this.story).subscribe((res: string[]) => {
            this.parentsPath = res;
          });
          this.refreshSubtasks();
          this.refreshSubstories();
        }
      })
    })
  }

  private refreshSubstories() {
    this.storiesService.getStories(this.story.getFullDescription()).subscribe(stories => {
      this.stories = stories;
    });
  }

  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {

    if (event.key === 'Insert' || event.key === '+' || event.key === '=') {
      this.openAddTaskDialog();
    }

  }

  navigateToStory(story: Story) {
    this.router.navigate(['story', story._id]).then();
  }

  refreshSubtasks() {
    this.tasksService.getTasks(this.story.getFullDescription()).subscribe(newSubtasks => {
      this.subtasks = newSubtasks;
    });
  }

  addSubtask() {
    this.openAddTaskDialog();
  }

  openAddTaskDialog() {
    const dialogRef = this.dialog.open(NewTaskDialogComponent,
      {
        data: {parentTask: this.story},
        height: '300px',
        width: '300px',
      });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const description = result.description;
        const obj = {description: description, tags: [this.story.getFullDescription()]}
        this.tasksService.createNewTask(obj).subscribe(() => {
          this.refreshSubtasks();
        });
      }
    });
  }

  onDownClick() {
    // this.scrollToBottom();
    document.getElementById(`row-${this.subtasks.length - 1}`).scrollIntoView({ behavior: 'smooth', block: 'center' });
    // window.scrollTo(0,document.body.scrollHeight);
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

  addSubstory() {

  }
}
