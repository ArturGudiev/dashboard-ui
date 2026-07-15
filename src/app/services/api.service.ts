import { inject, Injectable } from '@angular/core';
import { type TaskC } from '../models/task-class';
import { HttpClient, HttpParams } from '@angular/common/http';
import { forkJoin, type Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Direction } from '../models/direction';
import { Epic } from "../models/epic";
import { Story } from "../models/story";
import { Problem } from "../models/problem";
import { Question } from "../models/question";
import { Knowledge } from "../models/knowledge";
import { RecordItem } from "../models/record-item";
import { Action } from '../models/classes/action';
import { type TaskContainer } from "../models/interfaces/task-container";
import { type TreeNode } from "../components/containers/tree/my-tree.component";
import { type IArrayParams } from "../models/interfaces/array-params";
import { AppConfigService } from './app-config.service';
import {
  type EntDirection,
  type EntDirectionSubmission,
  type EntLogMessage,
  type EntLongTask,
  type EntLongTaskSubmission,
  type EntRepetitiveTaskExecution,
  type HandlersAddDirectionSubmissionRequest,
  type HandlersAddLongTaskProgressRequest,
  type HandlersAddLongTaskSubmissionRequest,
  type HandlersNewDirectionRequest,
  type HandlersPatchDirectionByIdRequest,
  type HandlersNewLongTaskRequest,
  type HandlersAnswerQuestionRequest,
  type HandlersIdsRequest,
  type HandlersNewLogMessageRequest,
  type HandlersNewProblemRequest,
  type HandlersNewQuestionRequest,
  type HandlersNewRepetitiveTaskRequest,
  type HandlersNewTaskRequest,
  type HandlersPaginatedResponseEntLogMessage,
  type HandlersSolveProblemRequest,
  type EntTask,
  type HandlersTaskResponse,
  type ModelsAliasModel,
  type ModelsDirectionFull,
  type ModelsDirectionStatsEntry,
  type ModelsNewStoryRequest,
  type ModelsProblemFull,
  type ModelsQuestionFull,
  type ModelsRepetitiveTaskResponse,
  type ModelsStateFull,
  type ModelsStateRequirementCheckShort,
  type ModelsStateRequirementFull,
  type ModelsStateRequirementShort,
  type ModelsStateShort,
  type ModelsNewStateRequest,
  type EntStateRequirementCheck,
  type ModelsStoryFull,
  type ModelsTaskFull,
  type EntLongTaskProgress,
  type ModelsLongTaskFull,
  ModelsLongTaskProgressSubmission,
} from "../types/generated";
import { toModelsLongTaskFull } from '../shared/libs/long-task.lib';
import {
  type EmptyJsonResponse,
  taskFromEnt,
  taskFromFinishResponse,
  taskFromFull,
  toUpdateTaskBody,
} from '../shared/libs/task-api.lib';
import { type TaskContainerType } from "../models/interfaces/types";
import {
  toEpicPartial,
  toProblemPartial,
  toQuestionPartial,
  toStoryPartial,
} from '../shared/libs/container-update.lib';
import { type CreateHierarchicalTasksRequest } from './task-container-services/tasks.service';

/** GET /done-tasks — Go `handlers.DoneTasksResponse`. */
export interface DoneTasksCountResponse {
  doneTasks: number;
}

export type NameValueEntityPayload = {
  name: string;
  value: string;
  tags: string[];
  extension: string;
};

interface NewRecordRequest {
  message: string;
  tags?: string[];
}

interface RecordItemDto {
  _id: number;
  message: string;
  date: string;
  tags: string[];
}

export interface IArrayResponse<T> {
  arrInfo: {
    length: number
  },
  items: T[]
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  get baseUrl(): string {
    return this.appConfig.baseUrl;
  }

  private http = inject(HttpClient);
  private appConfig = inject(AppConfigService);

  /** GET /task/:id — handler returns `models.TaskFull`. */
  _getTask(id: number): Observable<TaskC> {
    return this.http
      .get<ModelsTaskFull>(`${this.baseUrl}/task/${id}`)
      .pipe(map(taskFromFull));
  }

  _getParentsPath(obj: TaskContainer): Observable<string[]> {
    const body = { type: obj.type, id: obj.id };
    return this.http.post<string[]>(`${this.baseUrl}/parents-path`, body).pipe(map(arr => arr.reverse()));
  }

  _getLongTaskParentsPath(id: number): Observable<string[]> {
    const body = { type: 'long-task', id };
    return this.http.post<string[]>(`${this.baseUrl}/parents-path`, body).pipe(map(arr => arr.reverse()));
  }

  _getTasks(ids: number[]): Observable<TaskC[]> {
    const body: HandlersIdsRequest = { ids };
    return this.http
      .post<ModelsTaskFull[]>(`${this.baseUrl}/get-tasks`, body)
      .pipe(map((tasks) => tasks.map(taskFromFull)));
  }

  /** GET /tasks/by-due-date?date=YYYY-MM-DD */
  _getOpenTasksByDueDate(date: string): Observable<TaskC[]> {
    const params = new HttpParams({ fromObject: { date } });
    return this.http
      .get<ModelsTaskFull[]>(`${this.baseUrl}/tasks/by-due-date`, { params })
      .pipe(map((tasks) => tasks.map(taskFromFull)));
  }

  /** POST /new-task — handler returns `models.TaskFull` (via GetTaskFull after create). */
  _createNewTask(request: HandlersNewTaskRequest): Observable<TaskC> {
    return this.http
      .post<ModelsTaskFull>(`${this.baseUrl}/new-task`, request)
      .pipe(map(taskFromFull));
  }

  /** POST /new-hierarchical-tasks — returns created root `models.TaskFull[]`. */
  _createHierarchicalTasks(request: CreateHierarchicalTasksRequest): Observable<TaskC[]> {
    return this.http
      .post<ModelsTaskFull[]>(`${this.baseUrl}/new-hierarchical-tasks`, request)
      .pipe(map((tasks) => tasks.map(taskFromFull)));
  }

  /** PUT /finish-task/:id — handler returns `handlers.TaskResponse`. */
  _finishTask(task: TaskC): Observable<TaskC> {
    return this.http
      .put<HandlersTaskResponse>(`${this.baseUrl}/finish-task/${task.id}`, {})
      .pipe(map(taskFromFinishResponse));
  }

  _finishTaskById(id: number): Observable<TaskC> {
    return this.http
      .put<HandlersTaskResponse>(`${this.baseUrl}/finish-task/${id}`, {})
      .pipe(map(taskFromFinishResponse));
  }

  /** PUT /finish-tasks-by-ids — handler returns `{}`. */
  _finishTasks(tasks: TaskC[]): Observable<EmptyJsonResponse> {
    return this.http.put<EmptyJsonResponse>(
      `${this.baseUrl}/finish-tasks-by-ids/`,
      tasks.map((el) => el.id),
    );
  }

  _finishTasksByIds(ids: number[]): Observable<EmptyJsonResponse> {
    return this.http.put<EmptyJsonResponse>(`${this.baseUrl}/finish-tasks-by-ids/`, ids);
  }

  /** PUT /add-anonymous-task — handler returns `ent.Task`. */
  _addAnonymousTask(): Observable<TaskC> {
    return this.http
      .put<EntTask>(`${this.baseUrl}/add-anonymous-task`, {})
      .pipe(map(taskFromEnt));
  }

  /** PUT /update-task — handler returns `models.TaskFull`. */
  _updateTask(task: TaskC): Observable<TaskC> {
    return this.http
      .put<ModelsTaskFull>(`${this.baseUrl}/update-task`, toUpdateTaskBody(task))
      .pipe(map(taskFromFull));
  }

  _patchTask(id: number, newTaskName: string): Observable<TaskC> {
    return this.http
      .patch<ModelsTaskFull>(`${this.baseUrl}/task/${id}`, { description: newTaskName })
      .pipe(map(taskFromFull));
  }

  _getDoneTasksNumber(from: string | null): Observable<DoneTasksCountResponse> {
    let params = new HttpParams();
    if (from) {
      params = params.set('from', String(from));
    }
    return this.http.get<DoneTasksCountResponse>(`${this.baseUrl}/done-tasks`, { params });
  }

  //-----------------------------------------epics--------------------------------------------
  _getEpic(id: number) {
    return this.http.get<Epic>(`${this.baseUrl}/epic/${id}`)
      .pipe(
        map((obj) => Epic.createFromObj(obj))
      );
  }

  _getAllEpics(): Observable<Epic[]> {
    return this.http.get<Epic[]>(`${this.baseUrl}/epics`)
      .pipe(
        map((arr) => arr.map(obj => Epic.createFromObj(obj)))
        );
  }

  _getEpics(ids: number[]): Observable<Epic[]> {
    return this.http.post<Epic[]>(`${this.baseUrl}/get-epics`, {ids})
      .pipe(
        map((epicsObjArr: Epic[]) => epicsObjArr.map(epicObj => Epic.createFromObj(epicObj)))
      );
  }

  _updateEpic(epic: Epic): Observable<Epic> {
    return this.http.put<Epic>(`${this.baseUrl}/update-epic`, toEpicPartial(epic))
      .pipe(
        map((obj) => Epic.createFromObj(obj))
      );
  }

  _patchEpic(id: number, newName: string): Observable<Epic> {
    return this.http
      .patch<Epic>(`${this.baseUrl}/epic/${id}`, { description: newName })
      .pipe(map((obj) => Epic.createFromObj(obj)));
  }

//------------------------------------stories-------------------------------------------------
  _getStory(id: number) {
    return this.http.get<Story>(`${this.baseUrl}/story/${id}`)
      .pipe(
        map((obj) => Story.createFromObj(obj))
      );
  }

  _getStories(ids: number[]): Observable<Story[]> {
    const body: HandlersIdsRequest = { ids };
    return this.http.post<ModelsStoryFull[]>(`${this.baseUrl}/get-stories`, body).pipe(
      map((stories) => stories.map((s) => Story.createFromObj(s))),
    );
  }

  _updateStory(story: Story): Observable<Story> {
    return this.http.put<Story>(`${this.baseUrl}/update-story`, toStoryPartial(story))
      .pipe(
        map((obj) => Story.createFromObj(obj))
      );
  }

  _createNewStory(obj: ModelsNewStoryRequest): Observable<Story> {
    return this.http.post<Story>(`${this.baseUrl}/new-story`, obj).pipe(
      map((story) => Story.createFromObj(story)),
    );
  }

  _patchStory(id: number, newName: string): Observable<Story> {
    return this.http
      .patch<Story>(`${this.baseUrl}/story/${id}`, { description: newName })
      .pipe(map((obj) => Story.createFromObj(obj)));
  }
  //------------------------------------stories-------------------------------------------------
  //------------------------------------problems-------------------------------------------------

  _getProblems(ids: number[]): Observable<Problem[]> {
    const body: HandlersIdsRequest = { ids };
    return this.http.post<ModelsProblemFull[]>(`${this.baseUrl}/get-problems`, body).pipe(
      map((problems) => problems.map((p) => Problem.createFromObj(p))),
    );
  }

  _getProblem(id: number): Observable<Problem> {
    return this.http.get<Problem>(`${this.baseUrl}/problem/${id}`)
      .pipe(
        map((obj) => Problem.createFromObj(obj))
      );
  }

  _solveTheProblem(_id: number, solution: string): Observable<ModelsProblemFull> {
    const body: HandlersSolveProblemRequest = { solution };
    return this.http.post<ModelsProblemFull>(`${this.baseUrl}/solve-problem/${_id}`, body);
  }

  updateProblem(problem: Problem): Observable<Problem> {
    return this.http.put<Problem>(`${this.baseUrl}/update-problem`, toProblemPartial(problem))
      .pipe(
        map((obj) => Problem.createFromObj(obj))
      );
  }

  _createNewProblem(obj: HandlersNewProblemRequest): Observable<Problem> {
    return this.http.post<Problem>(`${this.baseUrl}/new-problem`, obj);
  }

  _patchProblem(id: number, newName: string): Observable<Problem> {
    return this.http
      .patch<Problem>(`${this.baseUrl}/problem/${id}`, { description: newName })
      .pipe(map((obj) => Problem.createFromObj(obj)));
  }

  //----------------------------------------problems-----------------------------------------
  //----------------------------------------aliases----------------------------------------
  _getAlias(alias: string): Observable<ModelsAliasModel> {
    return this.http.get<ModelsAliasModel>(`${this.baseUrl}/aliases/${alias}`);
  }

  //----------------------------------------aliases----------------------------------------
  //----------------------------------------questions----------------------------------------
  _getQuestions(ids: number[]): Observable<Question[]> {
    const body: HandlersIdsRequest = { ids };
    return this.http.post<ModelsQuestionFull[]>(`${this.baseUrl}/get-questions`, body).pipe(
      map((questions) => questions.map((p) => Question.createFromObj(p))),
    );
  }

  updateQuestion(question: Question): Observable<Question> {
    return this.http.put<Question>(`${this.baseUrl}/update-question`, toQuestionPartial(question))
      .pipe(
        map((obj) => Question.createFromObj(obj))
      );
  }

  _createNewQuestion(obj: HandlersNewQuestionRequest): Observable<Question> {
    return this.http.post<Question>(`${this.baseUrl}/new-question`, obj);
  }

  _answerTheQuestion(_id: number, answer: string): Observable<ModelsQuestionFull> {
    const body: HandlersAnswerQuestionRequest = { answer };
    return this.http.post<ModelsQuestionFull>(`${this.baseUrl}/answer-question/${_id}`, body);
  }

  _getQuestion(id: number): Observable<Question> {
    return this.http.get<Question>(`${this.baseUrl}/question/${id}`)
      .pipe(
        map((obj) => Question.createFromObj(obj))
      );
  }

  _patchQuestion(id: number, newName: string): Observable<Question> {
    return this.http
      .patch<Question>(`${this.baseUrl}/question/${id}`, { description: newName })
      .pipe(map((obj) => Question.createFromObj(obj)));
  }

  //----------------------------------------questions------------------------------------------

  //------------------------------------actions----------------------------------------
  _getActions(ids: number[]): Observable<Action[]> {
    const body: HandlersIdsRequest = { ids };
    return this.http.post<Action[]>(`${this.baseUrl}/get-actions/`, body).pipe(
      map((actions) => actions.map((a) => Action.createFromObj(a))),
    );
  }

  _createNewAction(actionObject: NameValueEntityPayload): Observable<Action> {
    return this.http.post<Action>(`${this.baseUrl}/new-action/`, actionObject);
  }

  _getAction(id: number) {
    return this.http.get<Action>(`${this.baseUrl}/action/${id}`)
      .pipe(
        map((obj: Action) => Action.createFromObj(obj))
      );
  }

  _updateAction(action: Action): Observable<Action> {
    return this.http.post<Action>(`${this.baseUrl}/update-action/`, action)
      .pipe(
        map((obj: Action) => Action.createFromObj(obj))
      );
  }

  //------------------------------------actions----------------------------------------
  //------------------------------------logs----------------------------------------
  getLogs(containerType?: TaskContainerType, containerId?: number): Observable<EntLogMessage> {
    const url = containerType && containerId
      ? `${this.baseUrl}/log-messages/${containerType}/${containerId}`
      : `${this.baseUrl}/log-messages`;
    return this.http.get<EntLogMessage>(url);
  }

  addLogMessage(body: HandlersNewLogMessageRequest) {
    return this.http.post<EntLogMessage>(`${this.baseUrl}/log-messages`, body);
  }

  getLogMessages({ taskContainer, perPage, page, global }: { taskContainer?: TaskContainer, perPage?: number, page?: number, global?: boolean }) {
    let myParams = new HttpParams();
    if (taskContainer) {
      myParams = myParams.set('containerType', taskContainer.type).set('containerID', taskContainer.id);
    }
    if (perPage) {
      myParams = myParams.set('perPage', perPage);
    }
    if (page) {
      myParams = myParams.set('page', page);
    }
    if (global) {
      myParams = myParams.set('global', true);
    }
    return this.http.get<HandlersPaginatedResponseEntLogMessage>(`${this.baseUrl}/log-messages`, { params: myParams });
  }

  //------------------------------------logs----------------------------------------
  //------------------------------------knowledge bits start----------------------------------------
  _getKnowledgeBits(ids: number[]): Observable<Knowledge[]> {
    const body: HandlersIdsRequest = { ids };
    return this.http.post<Knowledge[]>(`${this.baseUrl}/get-knowledge-bits/`, body).pipe(
      map((knowledgeBits) => knowledgeBits.map((a) => Knowledge.createFromObj(a))),
    );
  }

  _createNewKnowledge(knowledgeObject: NameValueEntityPayload): Observable<Knowledge> {
    return this.http.post<Knowledge>(`${this.baseUrl}/new-knowledge/`, knowledgeObject);
  }

  _getKnowledge(id: number) {
    return this.http.get<Knowledge>(`${this.baseUrl}/knowledge/${id}`)
      .pipe(
        map((obj: Knowledge) => Knowledge.createFromObj(obj))
      );
  }

  _updateKnowledge(knowledge: Knowledge): Observable<Knowledge> {
    return this.http.post<Knowledge>(`${this.baseUrl}/update-knowledge/`, knowledge)
      .pipe(
        map((obj: Knowledge) => Knowledge.createFromObj(obj))
      );
  }

  _getRecordItems(arrayParams: IArrayParams, tag?: string): Observable<IArrayResponse<RecordItem>> {
    const url = tag ? `${this.baseUrl}/records/${tag}` : `${this.baseUrl}/records`;
    return this.http.post<IArrayResponse<RecordItemDto>>(url, {}, {
      params: {
        offset: arrayParams.offset,
        count: arrayParams.pageSize
      }
    }).pipe(
      map((obj) => ({
        ...obj,
        items: obj.items.map((el) => RecordItem.createRecordsItemFromObj(el)),
      })),
    );
  }

  _addRecord(message: string, tag?: string): Observable<RecordItem> {
    const bodyObj: NewRecordRequest = { message };
    if (tag) {
      bodyObj.tags = [tag];
    }
    return this.http.post<RecordItem>(`${this.baseUrl}/new-record/`, bodyObj);
  }
  //------------------------------------knowledge bits end----------------------------------------

  //------------------------------------ reports ----------------------------------------
  getReport(obj: TaskContainer): Observable<TreeNode | null> {
    return this.http.post<TreeNode | null>(`${this.baseUrl}/report/`, obj);
  }

  getTaskReport(id: number): Observable<TreeNode | null> {
    return this.http.get<TreeNode | null>(`${this.baseUrl}/task-report/${id}`);
  }
  //------------------------------------ reports ----------------------------------------

  //------------------------------------ directions  ----------------------------------------
  _getAllDirections(open?: boolean): Observable<EntDirection[]> {
    const params = open === undefined ? undefined : new HttpParams({ fromObject: { open } });
    return this.http.get<EntDirection[]>(`${this.baseUrl}/directions`, { params });
  }

  _getDirection(id: number): Observable<Direction> {
    return this.http.get<ModelsDirectionFull>(`${this.baseUrl}/directions/${id}`)
      .pipe(map((obj) => Direction.createFromObj(obj)));
  }

  _createDirection(obj: HandlersNewDirectionRequest): Observable<Direction> {
    return this.http.post<ModelsDirectionFull>(`${this.baseUrl}/directions`, obj)
      .pipe(map((direction) => Direction.createFromObj(direction)));
  }

  _patchDirection(id: number, body: HandlersPatchDirectionByIdRequest): Observable<Direction> {
    return this.http.patch<ModelsDirectionFull>(`${this.baseUrl}/directions/${id}`, body)
      .pipe(map((direction) => Direction.createFromObj(direction)));
  }

  _getDirectionStats(id: number): Observable<ModelsDirectionStatsEntry[]> {
    return this.http.get<ModelsDirectionStatsEntry[]>(`${this.baseUrl}/directions/${id}/stats`);
  }

  _addDirectionSubmission(id: number, body: HandlersAddDirectionSubmissionRequest): Observable<EntDirectionSubmission> {
    return this.http.post<EntDirectionSubmission>(`${this.baseUrl}/directions/${id}/submissions`, body);
  }
  //------------------------------------ directions  ----------------------------------------

  //------------------------------------ long tasks  ----------------------------------------
  _getAllLongTasks(open?: boolean): Observable<ModelsLongTaskFull[]> {
    const params = open === undefined ? undefined : new HttpParams({ fromObject: { open } });
    return this.http.get<ModelsLongTaskFull[]>(`${this.baseUrl}/long-tasks`, { params });
  }

  _getLongTaskProgresses(id: number): Observable<EntLongTaskProgress[]> {
    return this.http.get<EntLongTaskProgress[]>(`${this.baseUrl}/long-tasks/${id}/progresses`);
  }

  _addLongTaskProgress(id: number, body: HandlersAddLongTaskProgressRequest): Observable<EntLongTaskProgress> {
    return this.http.post<EntLongTaskProgress>(`${this.baseUrl}/long-tasks/${id}/progresses`, body);
  }

  _getLongTask(id: number): Observable<ModelsLongTaskFull> {
    return forkJoin({
      task: this.http.get<EntLongTask>(`${this.baseUrl}/long-tasks/${id}`),
      progresses: this._getLongTaskProgresses(id),
    }).pipe(
      map(({ task, progresses }) => toModelsLongTaskFull(task, progresses)),
    );
  }

  _createLongTask(obj: HandlersNewLongTaskRequest): Observable<EntLongTask> {
    return this.http.post<EntLongTask>(`${this.baseUrl}/long-tasks`, { ...obj });
  }

  _patchLongTask(id: number, body: { description?: string; notes?: string }): Observable<EntLongTask> {
    return this.http.patch<EntLongTask>(`${this.baseUrl}/long-tasks/${id}`, body);
  }

  _getLongTaskSubmissions(id: number): Observable<ModelsLongTaskProgressSubmission[]> {
    return this.http.get<ModelsLongTaskProgressSubmission[]>(`${this.baseUrl}/long-tasks/${id}/submissions`);
  }

  _addLongTaskSubmission(id: number, body: HandlersAddLongTaskSubmissionRequest): Observable<EntLongTaskSubmission> {
    return this.http.post<EntLongTaskSubmission>(`${this.baseUrl}/long-tasks/${id}/submissions`, body);
  }
  //------------------------------------ long tasks  ----------------------------------------

  //------------------------------------ repetitive tasks  ----------------------------------------
  _getAllRepetitiveTasks(actual = true): Observable<ModelsRepetitiveTaskResponse[]> {
    return this.http.get<ModelsRepetitiveTaskResponse[]>(`${this.baseUrl}/repetitive-tasks`, {
      params: new HttpParams({ fromObject: { actual }} )
    });
  }

  _markRepetitiveTaskAsDone(id: number): Observable<EntRepetitiveTaskExecution> {
    return this.http.post<EntRepetitiveTaskExecution>(
      `${this.baseUrl}/repetitive-tasks/${id}/executions`,
      { }
    );
  }

  _createRepetitiveTask(obj: HandlersNewRepetitiveTaskRequest): Observable<ModelsRepetitiveTaskResponse> {
    return this.http.post<ModelsRepetitiveTaskResponse>(
      `${this.baseUrl}/new-repetitive-task`,
      { ...obj }
    );
  }

  _patchRepetitiveTask(id: number, newName: string): Observable<ModelsRepetitiveTaskResponse> {
    return this.http.patch<ModelsRepetitiveTaskResponse>(
      `${this.baseUrl}/repetitive-tasks/${id}`,
      { description: newName },
    );
  }
  //------------------------------------ repetitive tasks  ----------------------------------------

  //------------------------------------ states  ----------------------------------------
  _getAllStates(): Observable<ModelsStateFull[]> {
    return this.http.get<ModelsStateFull[]>(`${this.baseUrl}/states`);
  }

  _getState(id: number): Observable<ModelsStateFull> {
    return this.http.get<ModelsStateFull>(`${this.baseUrl}/states/${id}`);
  }

  _getStateRequirements(stateId: number): Observable<ModelsStateRequirementFull[]> {
    return this.http.get<ModelsStateRequirementFull[]>(`${this.baseUrl}/states/${stateId}/requirements`);
  }

  _createState(body: ModelsNewStateRequest): Observable<ModelsStateFull> {
    return this.http.post<ModelsStateFull>(`${this.baseUrl}/states`, body);
  }

  _addStateRequirement(stateId: number, body: ModelsStateRequirementShort): Observable<ModelsStateRequirementFull> {
    return this.http.post<ModelsStateRequirementFull>(`${this.baseUrl}/states/${stateId}/requirements`, body);
  }

  _addStateRequirementCheck(
    requirementId: number,
    body: ModelsStateRequirementCheckShort,
  ): Observable<EntStateRequirementCheck> {
    return this.http.post<EntStateRequirementCheck>(
      `${this.baseUrl}/state-requirements/${requirementId}/checks`,
      body,
    );
  }

  _getStateRequirementsByIds(ids: number[]): Observable<ModelsStateRequirementFull[]> {
    if (!ids.length) {
      return of([]);
    }
    const params = new HttpParams({ fromObject: { ids: ids.join(',') } });
    return this.http.get<ModelsStateRequirementFull[]>(`${this.baseUrl}/state-requirements`, { params });
  }

  _getStateRequirementChecks(requirementId: number): Observable<EntStateRequirementCheck[]> {
    return this.http.get<EntStateRequirementCheck[]>(
      `${this.baseUrl}/state-requirements/${requirementId}/checks`,
    );
  }
  //------------------------------------ states  ----------------------------------------

  //------------------------------------ container ----------------------------------------
  changeOrderOfTasks(containerType: TaskContainerType, containerId: number, tasksInNewOrder: number[]): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/change-tasks-order`, { containerType, containerId, tasksInNewOrder });
  }
  //------------------------------------ contianer ----------------------------------------

}
