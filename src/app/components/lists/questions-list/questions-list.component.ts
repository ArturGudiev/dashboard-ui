import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, input, type OnInit, output, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { type Question } from "../../../models/question";
import { SelectionModel } from "@angular/cdk/collections";
import { Router } from "@angular/router";
import { type TaskC } from "../../../models/task-class";
import { type MatCheckboxChange } from "@angular/material/checkbox";
import { AppStore } from "../../../state/app.store";
import { GetValueDialogComponent } from "../../dialogs/get-value/get-value-dialog.component";
import { GET_VALUE_DIALOG_OPTIONS } from "../../../shared/constants";
import { MatDialog } from "@angular/material/dialog";
import { CommandsService } from "../../../services/commands.service";
import { MatTableModule } from "@angular/material/table";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";
import { NgClass } from "@angular/common";
import { TasksListComponent } from "../tasks-list/tasks-list.component";
import { type TaskContainer } from "../../../models/interfaces/task-container";
import { QuestionsService } from "../../../services/task-container-services/questions.service";
import { TasksService } from "../../../services/task-container-services/tasks.service";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-questions-list',
  imports: [
    MatTableModule,
    MatCheckboxModule,
    MatButtonModule,
    MatIconModule,
    NgClass,
    TasksListComponent
  ],
  templateUrl: './questions-list.component.html',
  standalone: true,
  styleUrls: ['./questions-list.component.sass']
})
export class QuestionsListComponent implements OnInit {
  container = input.required<TaskContainer>();
  questions = input.required<Question[]>();
  refreshQuestions = output<void>();
  readonly displayedColumns: string[] = ['select', 'position', 'description', 'actions', 'showSubtasks'];
  readonly expandedSubtasks = signal<Record<number, { tasks: TaskC[]; container: TaskContainer }>>({});
  readonly tasksByIdMapKeys = computed(() => Object.keys(this.expandedSubtasks()).map(Number));
  readonly selection = new SelectionModel<Question>(true, []);
  private questionsService = inject(QuestionsService);
  private tasksService = inject(TasksService);
  private router = inject(Router);
  private dialog = inject(MatDialog);
  private appStore = inject(AppStore);
  private commandsService = inject(CommandsService);
  private destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.commandsService.getDataStateChange().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(state => {
      this.handleTaskCommand(state.command);
    })
  }

  private handleTaskCommand(command: string): void {
    const arr = command.split(' ');
    if (['question'].includes(arr[0])) {
      this.addQuestion();
    }
  }

  addQuestion(): void {
    this.questionsService.createQuestionFromDialog(this.container())
      .subscribe(() => this.refreshQuestions.emit());

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
    this.questionsService.getQuestion(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(problem => {
      this.tasksService.getTasks(problem.tasks).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(tasks => {
        this.expandedSubtasks.update(map => ({
          ...map,
          [id]: { tasks, container: problem },
        }));
      })
    })
  }


  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.questions().length;
    return numSelected === numRows;
  }


  onMainCheckboxClick() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }
    this.selection.select(...this.questions());
  }

  onQuestionClick(question: Question) {
    this.router.navigate(['question', question.id]).then();
  }

  /**
   * Выделен ли элемент для отображение подзадач
   * @param subtask
   */
  checkedElement(question: Question): boolean {
    return Object.hasOwn(this.expandedSubtasks(), question.id);
  }

  /**
   * Обработка события нажатия на show subtasks checkbox. Если события добавляет галочку, то
   * берутся подзадачи выбранной задачи, добавляются запись по id {container, tasks} в tasksByIdMap.
   * Если мы сейчас находимся на нулевом уровне, и это первая выделеннвя подзадача, то она сразу фокусируется.
   *
   * Если же событие снимает галку, то запись соответствующая удаляется из tasksByIdMap.
   */
  setShowSubtasksField($event: MatCheckboxChange, question: Question) {
    if ($event.checked) {
      this.tasksService.getTasks(question.tasks).pipe(takeUntilDestroyed(this.destroyRef)).subscribe(res => {
        this.expandedSubtasks.update(map => ({
          ...map,
          [question.id]: { container: question, tasks: res },
        }));
        if (Object.keys(this.expandedSubtasks()).length === 1) {
          this.appStore.setFocusedTaskForSubtasks(question);
        }
      });
    } else {
      this.expandedSubtasks.update(map => {
        const { [question.id]: _removed, ...rest } = map;
        return rest;
      });
    }
  }


}
