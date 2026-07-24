import { inject, Injectable } from '@angular/core';
import { type Observable, of, Subject } from "rxjs";
import { KnowledgeNodesService } from './knowledge-nodes.service';
import { TasksService } from './tasks.service';
import { ProblemsService } from './problems.service';
import { QuestionsService } from './questions.service';
import { EpicsService } from "./epics.service";
import { StoriesService } from "./stories.service";
import { type TaskContainer } from "../../models/interfaces/task-container";
import { ApiService } from "../api.service";
import { type TaskContainerType } from "../../models/interfaces/types";
import { type Epic } from "../../models/epic";
import { type Story } from "../../models/story";
import { type Problem } from "../../models/problem";
import { type Question } from "../../models/question";
import { type TaskC } from "../../models/task-class";
import { NEW_QUESTION_DIALOG_OPTIONS } from "../../shared/constants";
import { switchMap } from "rxjs/operators";
import { MatDialog } from "@angular/material/dialog";
import { LogsService } from "../logs.service";
import { type EntLogMessage } from "../../types/generated";
import {
  AddLogDialogComponent,
  type AddLogDialogResult
} from "../../components/dialogs/add-log-dialog/add-log-dialog.component";
import { LogsDialogComponent } from "../../components/dialogs/logs-dialog/logs-dialog.component";
import { type TreeNode } from "../../components/containers/tree/my-tree.component";
import { type ModelsRepetitiveTaskResponse } from '../../types/generated';

@Injectable({
  providedIn: 'root'
})
export class TaskContainerService {

  refreshSubtasks$ = new Subject<TaskContainer>();

  private apiService = inject(ApiService);
  private tasksService = inject(TasksService);
  private problemsService = inject(ProblemsService);
  private questionsService = inject(QuestionsService);
  private logsService = inject(LogsService);
  private epicsService = inject(EpicsService);
  private storiesService = inject(StoriesService);
  private knowledgeNodesService = inject(KnowledgeNodesService);
  private dialog = inject(MatDialog);

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
      case 'knowledge-node':
        return this.knowledgeNodesService.getKnowledgeNode(id);
      default:
        return of(null);
    }
  }
  
  renameTaskContainer(
    taskContainer: TaskContainer,
    newTaskName: string,
  ): Observable<TaskContainer | ModelsRepetitiveTaskResponse> {
    const { id, type } = taskContainer;
    switch (type) {
      case 'task':
        return this.apiService._patchTask(id, newTaskName);
      case 'epic':
        return this.apiService._patchEpic(id, newTaskName);
      case 'story':
        return this.apiService._patchStory(id, newTaskName);
      case 'problem':
        return this.apiService._patchProblem(id, newTaskName);
      case 'question':
        return this.apiService._patchQuestion(id, newTaskName);
      case 'knowledge-node':
        return this.apiService._patchKnowledgeNode(id, newTaskName);
      case 'repetitive-task':
        return this.apiService._patchRepetitiveTask(id, newTaskName);
      case 'direction':
        return this.apiService._patchDirection(id, { description: newTaskName });
      default:
        throw new Error(`Cannot rename container of type "${type}"`);
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
        switchMap((obj: AddLogDialogResult) => {
          return this.logsService.addLogMessage(
            obj.logMessage,
            obj.isContainerLog ? taskContainer : undefined,
            obj.logType
          );
        })
      )
  }

  openLogsDialog(taskContainer: TaskContainer) {
    this.dialog.open(LogsDialogComponent,
      {data: { taskContainer },
         height: '1000px', width: '800px',
      });
    return;
  }



  /**
   *
   * @param task
   */
  getReport(container: TaskContainer): Observable<TreeNode | null> {
    return this.apiService.getTaskReport(container.id);
  }

  changeOrderOfTasks(container: TaskContainer, newOrder: number[]): Observable<void> {
    return this.apiService.changeOrderOfTasks(container.type, container.id, newOrder);
  }
}
