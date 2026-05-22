import { Component, DestroyRef, effect, inject, input } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { type Question } from '../../../models/question';
import { QuestionsService } from '../../../services/task-container-services/questions.service';
import { linkedContainerForView } from '../../../shared/libs/container-view.lib';
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

  readonly questionForView = linkedContainerForView(() => this.id(), () => this.question());

  private questionsService = inject(QuestionsService);
  private titleService = inject(Title);
  private destroyRef = inject(DestroyRef);

  constructor() {
    effect(() => {
      const question = this.questionForView();
      if (question) {
        this.titleService.setTitle(question.getFullDescription());
      }
    });
  }

  reloadQuestion(): void {
    this.questionsService
      .getQuestion(Number(this.id()))
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((q) => this.questionForView.set(q));
  }

  updateQuestion(): void {
    const question = this.questionForView();
    if (!question) {
      return;
    }
    this.questionsService
      .updateQuestion(question)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((updated) => this.questionForView.set(updated));
  }
}
