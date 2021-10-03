import { TaskContainer } from "../interfaces/task-container";

export class Story implements TaskContainer{
  static readonly PREFIX = 'STORY-';
  static readonly DESCRIPTION_REGEX = new RegExp('^' + Story.PREFIX + '(\\d+)\\s');

  _id: number;
  description: string;
  active: boolean;
  closed = false;
  deferred = false;
  tags: string[];


  constructor(id: number, description: string, tags: string[], active: boolean, closed = false, deferred = false) {
    this._id = id;
    this.description = description;
    this.tags = tags;
    this.active = active;
    this.closed = closed;
    this.deferred = deferred;
  }

  // static async createStoryInteractively(originalTags: string): Promise<Story | null> {
  //     let description = await getUserInput('Enter story description');
  //     let askForTags = true;
  //     if ( description === '' ) {
  //         return null;
  //     }
  //     if (description.slice(-1) === '@' ) {
  //         askForTags = false;
  //         description = description.slice(0, -1);
  //     }
  //     const tagsString = !askForTags ? '' : await getUserInput('Enter tags( = separated without space)');
  //     let tags = tagsString ? tagsString.split('=') : [];

  //     if (originalTags) {
  //         tags = [...tags, ...(originalTags ? originalTags.split('='): [])];
  //     }
  //     return new Story(this.getNextStoryId(), description, tags, false);
  // }

  // static getNextStoryId(): number {
  //     const meta = getJSONFileContent(metaFile);
  //     const id = ++meta.storyId;
  //     writeFileContent(metaFile, meta);
  //     return id;
  // }

  // toString(): string {
  //     const res = this.description;
  //     return res;
  // }

  getFullDescription(): string {
    return `${Story.PREFIX}${this._id} ${this.description}`
  }

  // async interactive(): Promise<void> {
  //     await storyInteractive(this);
  // }

  // getOpenTasks(): Task[] {
  //     return getTasksByTag(this.getFullDescription());
  // }

  // getProblems() {
  //     const tag = this.getFullDescription();
  //     return State.showSolvedProblems ? getAllProblems(tag) : getOpenProblems(tag);
  // }

  // getQuestions() {
  //     const tag = this.getFullDescription();
  //     return State.showAnsweredQuestions ? getAllQuestions(tag) : getOpenQuestions(tag);
  // }

  // getAllTasks(): Task[] {
  //     return getAllTasks(this.getFullDescription());
  // }

  // getAllProblems() {
  //     return getAllProblems(this.getFullDescription());
  // }

  // getAllQuestions() {
  //     return getAllQuestions(this.getFullDescription());
  // }

  // getLogs() {
  //     const storyLogs = getLogsByTag(this.getFullDescription());
  //     const tasks = this.getAllTasks();
  //     const innerTasksLogs = tasks.map(task => task.getLogs()).reduce(
  //         (a, b,i) => _.union(a, b), []
  //     );
  //     const problems = this.getAllProblems();
  //     const problemLogs = problems.map(problem => problem.getLogs()).reduce(
  //         (a, b,i) => _.union(a, b), []
  //     );
  //     const questions = this.getAllQuestions();
  //     const questionsLogs = questions.map(question => question.getLogs()).reduce(
  //         (a, b,i) => _.union(a, b), []
  //     );
  //     const res = _.union(storyLogs, innerTasksLogs, problemLogs, questionsLogs);
  //     res.sort(sortLogMessagesFunction);
  //     return res;
  // }

  // getActions(): Action[] {
  //     return getActions(this.getFullDescription());
  // }

  // getDefinitions(): Definition[] {
  //     return getDefinitions(this.getFullDescription());
  // }

  // getKnowledgeBits(): Knowledge[] {
  //     return getKnowledgeBits(this.getFullDescription());
  // }

  // getTasks(): Task[] {
  //     return getTasksByTag(this.getFullDescription());
  // }

  // getHistoryRecord(): HistoryRecord {
  //     return new HistoryRecord(this.getFullDescription());
  // }
}
