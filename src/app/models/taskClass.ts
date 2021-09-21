import {TaskContainer} from '../interfaces/task-container';

export class TaskC implements TaskContainer {
  static readonly PREFIX = 'Task-';
  static readonly DESCRIPTION_REGEX = new RegExp('^' + TaskC.PREFIX + '(\\d+)\\s');


  _id: number;
  description: string;
  tags: string[];
  done = false;

  constructor(_id: number,
              description: string,
              done: boolean,
              tags: string[] = []
  ) {
    this.description = description;
    this.done = done;
    this.tags = tags;
    this._id = _id;
  }

  // static createSimpleTask(originalTag: string): Task {
  //   const description = 'Simple task';
  //   const tags = [originalTag];
  //   return new Task(this.getNextTaskId(), description, true, tags);
  // }

  // static createSimpleTasks(originalTag: string, num = 1): Task[] {
  //   const arr: Task[] = [];
  //   _.times(num, () => {
  //     arr.push(this.createSimpleTask(originalTag));
  //   });
  //   return arr;
  // }

  // static async createTaskInteractively(originalTags: string, askForTags = true): Promise<any> {
  //   try {
  //     let description = await getUserInput('Enter description');
  //     if (description === '') {
  //       return null;
  //     }
  //     if (description.slice(-1) === '@' || description.slice(-1) === '$') {
  //       askForTags = false;
  //       if (description.slice(-1) === '@') {
  //         description = description.slice(0, -1);
  //       }
  //     }
  //     const tagsString = !askForTags || State.skipTags ? '' : await getUserInput('Enter tags( = separated without space)');
  //     let tags = tagsString ? tagsString.split('=') : [];
  //
  //     if (originalTags) {
  //       tags = [...tags, ...(originalTags ? originalTags.split('=') : [])];
  //     }
  //     return new Task(this.getNextTaskId(), description, false, tags);
  //   } catch (e) {
  //     console.log("Can't create a task", e);
  //     await waitForUserInput();
  //   }
  // }

  // static createNewSubtask(description: string, taskContainer: TaskContainer): Task {
  //   return new Task(Task.getNextTaskId(), description, false, [taskContainer.getFullDescription()]);
  // }

  // static createNewSubtasks(descriptions: string[], taskContainer: TaskContainer): Task[] {
  //   return descriptions.map(
  //     (description: string) =>
  //       new Task(Task.getNextTaskId(), description, false, [taskContainer.getFullDescription()])
  //   )
  // }

  // static getNextTaskId(): number {
  //   const meta = getJSONFileContent(metaFile);
  //   const id = ++meta.taskId;
  //   writeFileContent(metaFile, meta);
  //   return id;
  // }

  getFullDescription(): string {
    return `${(TaskC.PREFIX)}${this._id} ${this.description}`
  }

  // async interactive(): Promise<void> {
  //   await taskInteractive(this);
  // }

  // getTasks(): Task[] {
  //   return getTasksByTag(this.getFullDescription());
  // }

  // getProblems() {
  //   const tag = this.getFullDescription();
  //   return State.showSolvedProblems ? getAllProblems(tag) : getOpenProblems(tag);
  // }
  //
  // getQuestions() {
  //   const tag = this.getFullDescription();
  //   return State.showAnsweredQuestions ? getAllQuestions(tag) : getOpenQuestions(tag);
  // }
  //
  // getAllTasks(): Task[] {
  //   return getAllTasks(this.getFullDescription());
  // }
  //
  // getAllProblems() {
  //   return getAllProblems(this.getFullDescription());
  // }
  //
  // getAllQuestions() {
  //   return getAllQuestions(this.getFullDescription());
  // }

  // getLogs(): LogMessage[] {
  //   const taskLogs = getLogsByTag(this.getFullDescription());
  //   const tasks = this.getAllTasks();
  //   const innerTasksLogs = tasks.map(task => task.getLogs()).reduce(
  //     (a, b) => _.union(a, b), []
  //   );
  //   const problems = this.getAllProblems();
  //   const problemLogs = problems.map(problem => problem.getLogs()).reduce(
  //     (a, b) => _.union(a, b), []
  //   );
  //   const questions = this.getAllQuestions();
  //   const questionsLogs = questions.map(question => question.getLogs()).reduce(
  //     (a, b) => _.union(a, b), []
  //   );
  //   const res = _.union(taskLogs, innerTasksLogs, problemLogs, questionsLogs);
  //   res.sort(sortLogMessagesFunction);
  //   return res;
  // }
  //
  // getActions(): Action[] {
  //   return getActions(this.getFullDescription());
  // }
  //
  // getDefinitions(): Definition[] {
  //   return getDefinitions(this.getFullDescription());
  // }
  //
  // getKnowledgeBits(): Knowledge[] {
  //   return getKnowledgeBits(this.getFullDescription());
  // }
  //
  // getHistoryRecord(): HistoryRecord {
  //   return new HistoryRecord(this.getFullDescription());
  // }
  //
  // getStatTree(): any {
  //   return {};
  // }
  //
  // getNotesFile() {
  //   return `${TASK_NOTES_DIR}${this._id}.txt`;
  // }
  //
  // getNotes(): string {
  //   const filepath = this.getNotesFile();
  //   if (fs.existsSync(filepath)) {
  //     return readFileSync(filepath).toString();
  //   }
  //   return '';
  // }
}
