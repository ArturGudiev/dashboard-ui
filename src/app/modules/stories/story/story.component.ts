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
import {GetValueDialogComponent} from "../../dialogs/get-value/get-value-dialog.component";
import {ProblemsService} from "../../../services/problems.service";
import {Problem} from "../../../models/problem";

@Component({
  selector: 'app-story',
  templateUrl: './story.component.html',
  styleUrls: ['./story.component.sass']
})
export class StoryComponent implements OnInit {
  story: Story;
  subtasks: TaskC[];
  problems: Problem[];
  parentsPath: string[];
  substories: Story[];

  constructor(
    private route: ActivatedRoute,
    private storiesService: StoriesService,
    private tasksService: TasksService,
    private router: Router,
    private titleService: Title,
    public dialog: MatDialog,
    public problemsService: ProblemsService
  ) { }

  ngOnInit(): void {
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
          this.refreshProblems();
          this.refreshSubstories();
        }
      })
    })
  }

  private refreshSubstories() {
    this.storiesService.getStories(this.story.getFullDescription()).subscribe(stories => {
      this.substories = stories;
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

  refreshProblems(): void {
    this.problemsService.getProblems(this.story.getFullDescription())
      .subscribe(problems => this.problems = problems.filter((p: Problem) => !p.solution));
  }

  addProblem() {
    const dialogRef = this.dialog.open(GetValueDialogComponent, {data: { title: 'Description' }});
    dialogRef.afterClosed().subscribe((description: string) => {
      if (description) {
        const obj = {description: description, tags: [this.story.getFullDescription()]}
        this.problemsService.createNewProblem(obj).subscribe(() => this.refreshProblems());
      }
    });
  }

  onProblemSolvedClick(problem: Problem) {
    const dialogRef = this.dialog.open(GetValueDialogComponent, {data: { title: 'Solution' }});
    dialogRef.afterClosed().subscribe((solution: string) => {
      if (solution) {
        this.problemsService.solveTheProblem(problem, solution).subscribe(() => this.refreshProblems());
      }
    });
  }
}
