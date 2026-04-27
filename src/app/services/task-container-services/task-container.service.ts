import { Injectable } from '@angular/core';
import { Observable, of, Subject } from "rxjs";
import { TasksService } from './tasks.service';
import { ProblemsService } from './problems.service';
import { QuestionsService } from './questions.service';
import { EpicsService } from "./epics.service";
import { StoriesService } from "./stories.service";
import { TaskContainer } from "../../models/interfaces/task-container";
import { ApiService } from "../api.service";
import { TaskContainerType } from "../../models/interfaces/types";
import { Epic } from "../../models/epic";
import { Story } from "../../models/story";
import { Problem } from "../../models/problem";
import { Question } from "../../models/question";
import { TaskC } from "../../models/task-class";
import { NEW_QUESTION_DIALOG_OPTIONS } from "../../shared/constants";
import { switchMap } from "rxjs/operators";
import { MatDialog } from "@angular/material/dialog";
import { LogsService } from "../logs.service";
import { EntLogMessage } from "../../types/generated";
import {
  AddLogDialogComponent,
  AddLogDialogResult
} from "../../components/dialogs/add-log-dialog/add-log-dialog.component";
import { LogsDialogComponent } from "../../components/dialogs/logs-dialog/logs-dialog.component";

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
    private logsService: LogsService,
    private readonly epicsService: EpicsService,
    private readonly storiesService: StoriesService,
    private dialog: MatDialog,
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

  openAddLogDialog(taskContainer: TaskContainer): Observable<EntLogMessage> {
    const dialogRef = this.dialog.open(AddLogDialogComponent,
      {data: {title: 'LOG 111', inputWidth: '40rem'},
        ...NEW_QUESTION_DIALOG_OPTIONS
      });
    return dialogRef.afterClosed()
      .pipe(
        // filter((description: string) => !!description),
        switchMap((obj: AddLogDialogResult) => {
          console.log(obj, 'After closed subscription');
          return this.logsService.addLogMessage(
            obj.logMessage,
            obj.isContainerLog ? taskContainer : undefined,
            obj.logType
          );
        })
      )
  }

  openLogsDialog(taskContainer: TaskContainer) {
    const dialogRef = this.dialog.open(LogsDialogComponent,
      {data: { taskContainer },
         height: '1000px', width: '800px',
      });
    return;
  }



  /**
   *
   * @param task
   */
  getReport(container: TaskContainer): Observable<any> {
    return this.apiService.getReport(container)
  }
}
