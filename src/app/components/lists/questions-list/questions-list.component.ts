import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Question } from "../../../models/question";
import { SelectionModel } from "@angular/cdk/collections";
import { Router } from "@angular/router";
import { Problem } from "../../../models/problem";
import { TaskC } from "../../../models/task-class";
import { MatCheckboxChange } from "@angular/material/checkbox";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { SetFocusedTaskForSubtasks } from "../../../state/app.actions";
import { Store } from "@ngxs/store";
import { GetValueDialogComponent } from "../../dialogs/get-value/get-value-dialog.component";
import { GET_VALUE_DIALOG_OPTIONS } from "../../../shared/constants";
import { MatDialog } from "@angular/material/dialog";
import { CommandsService } from "../../../services/commands.service";
import { MaterialModule } from "../../../modules/material/material.module";
import { NgClass } from "@angular/common";
import { TasksListComponent } from "../tasks-list/tasks-list.component";
import { TaskContainer } from "../../../models/interfaces/task-container";
import { QuestionsService } from "../../../services/task-container-services/questions.service";
import { TasksService } from "../../../services/task-container-services/tasks.service";

@UntilDestroy()
@Component({
  selector: 'app-questions-list',
  imports: [
    MaterialModule,
    NgClass,
    TasksListComponent
  ],
  templateUrl: './questions-list.component.html',
  standalone: true,
  styleUrls: ['./questions-list.component.sass']
})
export class QuestionsListComponent implements OnInit {
  @Input({required: true}) container!: TaskContainer;
  @Input() questions: Question[] = [];
  @Output() refreshQuestions = new EventEmitter();
  @Output() answerTheQuestion = new EventEmitter();
  displayedColumns: string[] = ['select', 'position', 'description', 'actions', 'showSubtasks'];
  selection = new SelectionModel<Question>(true, []);

  tasksByIdMap: { [key: number]: { tasks: TaskC[], container: TaskContainer }; } = {};

  get tasksByIdMapKeys(): number[] {
    return Object.keys(this.tasksByIdMap).map(e => Number(e));
  }


  constructor(
    private questionsService: QuestionsService,
    private tasksService: TasksService,
    private router: Router,
    private dialog: MatDialog,
    private store: Store,
    private commandsService: CommandsService,
  ) {
  }

  ngOnInit(): void {
    this.commandsService.getDataStateChange().pipe(untilDestroyed(this)).subscribe(state => {
      this.handleTaskCommand(state.command);
    })
  }

  private handleTaskCommand(command: string): void {
    const arr = command.split(' ');
    const args = arr.slice(1);
    if (['question'].includes(arr[0])) {
      this.addQuestion();
    }
  }

  addQuestion(): void {
    this.questionsService.createQuestionFromDialog(this.container)
      .subscribe(() => this.refreshQuestions.emit());

  }

  onAnswerSelectedQuestionClick() {
    this.questionsService.finishQuestion(this.selection.selected[0]).subscribe(
      {
        next: () => {
          this.selection.clear();
          this.refreshQuestions.emit();
        }
      }
    );
  }

  onAnswerQuestionClick(question: Question) {
    const dialogRef = this.dialog.open(GetValueDialogComponent,
      {
        data: {title: 'Solution', inputWidth: '40rem'},
        ...GET_VALUE_DIALOG_OPTIONS
      });
    dialogRef.afterClosed().subscribe((solution: string) => {
      if (solution) {
        this.questionsService.answerTheQuestion(question, solution)
          .subscribe(() => this.refreshQuestions.emit());
      }
    });
  }


  /**
   * Метод по заданному id
   *  1) подгружает задачу с бэкенда
   *  2) по списку id задачи подгружает список подзадач
   *  3) в tasksByIdMap добавляет запись {container: uploadedTask, tasks}
   * @param id
   */
  refreshTasksOfSelectedQuestion(id: number) {
    this.questionsService.getQuestion(id).pipe(untilDestroyed(this)).subscribe(problem => {
      this.tasksService.getTasks(problem.tasks).pipe(untilDestroyed(this)).subscribe(tasks => {
        this.tasksByIdMap[id] = {tasks, container: problem};
      })
    })
  }


  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.questions.length;
    return numSelected === numRows;
  }


  onMainCheckboxClick() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }
    this.selection.select(...this.questions);
  }

  onQuestionClick(question: Question) {
    this.router.navigate(['question', question.id]).then();
  }

  /**
   * Выделен ли элемент для отображение подзадач
   * @param subtask
   */
  checkedElement(question: Question): boolean {
    return Object.keys(this.tasksByIdMap).includes(String(question.id));
  }

  /**
   * Обработка события нажатия на show subtasks checkbox. Если события добавляет галочку, то
   * берутся подзадачи выбранной задачи, добавляются запись по id {container, tasks} в tasksByIdMap.
   * Если мы сейчас находимся на нулевом уровне, и это первая выделеннвя подзадача, то она сразу фокусируется.
   *
   * Если же событие снимает галку, то запись соответствующая удаляется из tasksByIdMap.
   */
  setShowSubtasksField($event: MatCheckboxChange, problem: Problem) {
    if ($event.checked) {
      this.tasksService.getTasks(problem.tasks).pipe(untilDestroyed(this)).subscribe(res => {
        this.tasksByIdMap[problem.id] = {container: problem, tasks: res};
        if (Object.keys(this.tasksByIdMap).length === 1) {
          this.store.dispatch(new SetFocusedTaskForSubtasks(problem));
        }
      })
      ;
    } else {
      delete this.tasksByIdMap[problem.id];
    }
  }


}
