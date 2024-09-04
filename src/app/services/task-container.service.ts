import { Injectable } from '@angular/core';
import { Observable, of, Subject } from "rxjs";
import { ApiService } from "./api.service";
import { TasksService } from './tasks.service';
import { ProblemsService } from './problems.service';
import { QuestionsService } from './questions.service';
import { TaskContainer } from "../models/interfaces/task-container";
import { TaskContainerType } from "../models/interfaces/types";
import { Epic } from "../models/epic";
import { TaskC } from "../models/task-class";
import { Story } from "../models/story";
import { Problem } from "../models/problem";
import { Question } from "../models/question";
import { EpicsService } from "./epics.service";
import { StoriesService } from "./stories.service";

@Injectable({
  providedIn: 'root'
})
export class TaskContainerService {

  refreshSubtasks$ = new Subject<TaskContainer>();

  constructor(
    private apiService: ApiService,
    private tasksService: TasksService,
    private problemsService: ProblemsService,
    private questionsService: QuestionsService,
    private readonly epicsService: EpicsService,
    private readonly storiesService: StoriesService,
  ) { }

  getParentsPath(taskContainer: TaskContainer): Observable<string[]> {
    return this.apiService._getParentsPath(taskContainer);
  }

  getTaskContainer(type: TaskContainerType, id: number): Observable<TaskContainer | null> {
    switch(type) {
      case 'task':
        return this.tasksService.getTask(id);
      case 'problem':
        return this.problemsService.getProblem(id);
      case 'question':
        return this.questionsService.getQuestion(id);
      default:
        return of(null);
    }
  }

  addTaskToContainerByShortDescription(containerDescription: string) {
    const matches = containerDescription.match(/^(.+)-(\d+)/)
    if (matches) {
      const type: TaskContainerType = matches[1].toLowerCase() as TaskContainerType;
      const id = +matches[2];
      switch (type) {
        case "epic":
          this.epicsService.getEpic(id).subscribe((epic: Epic) => {
            this.tasksService.openAddTaskDialogToContainer(epic).subscribe();
          });
          break;
        case "story":
          this.storiesService.getStory(id).subscribe((story: Story) => {
            this.tasksService.openAddTaskDialogToContainer(story).subscribe();
          });
          break;
        case "problem":
          this.problemsService.getProblem(id).subscribe((problem: Problem) => {
            this.tasksService.openAddTaskDialogToContainer(problem).subscribe();
          });
          break;
        case "question":
          this.questionsService.getQuestion(id).subscribe((question: Question) => {
            this.tasksService.openAddTaskDialogToContainer(question).subscribe();
          });
          break;
        case "task":
          this.tasksService.getTask(id).subscribe((task: TaskC) => {
            this.tasksService.openAddTaskDialogToContainer(task).subscribe();
          });
          break;
      }
    }
  }
}
