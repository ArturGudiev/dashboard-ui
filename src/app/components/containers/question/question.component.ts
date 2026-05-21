import { Component, DestroyRef, effect, inject, input, linkedSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { Question } from '../../../models/question';
import { QuestionsService } from '../../../services/task-container-services/questions.service';
import { TaskContainerSignalComponent } from '../task-container-signal/task-container-signal.component';

@Component({
  selector: 'app-question',
  templateUrl: './question.component.html',
  imports: [TaskContainerSignalComponent],
  styleUrls: ['./question.component.sass'],
})
export class QuestionComponent {
  /** From route param `id` (withComponentInputBinding). */
  id = input.required<number>();

  /** From route resolve `question` — refreshed when `id` changes (`runGuardsAndResolvers: 'paramsChange'`). */
  question = input.required<Question>();

  readonly questionForView = linkedSignal(() => this.question());

  private questionsService = inject(QuestionsService);
  private titleService = inject(Title);
  private destroyRef = inject(DestroyRef);

  constructor() {
    effect(() => {
      this.titleService.setTitle(this.questionForView().getFullDescription());
    });
  }

  reloadQuestion(): void {
    this.questionsService
      .getQuestion(Number(this.id()))
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((q) => this.questionForView.set(q));
  }

  updateQuestion(): void {
    this.questionsService
      .updateQuestion(this.questionForView())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((updated) => this.questionForView.set(updated));
  }
}
