import { Component, DestroyRef, effect, inject, input } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { type Problem } from '../../../models/problem';
import { ProblemsService } from '../../../services/task-container-services/problems.service';
import { linkedContainerForView } from '../../../shared/libs/container-view.lib';
import { TaskContainerSignalComponent } from '../task-container-signal/task-container-signal.component';

@Component({
  selector: 'app-problem',
  templateUrl: './problem.component.html',
  imports: [TaskContainerSignalComponent],
  styleUrls: ['./problem.component.sass'],
})
export class ProblemComponent {
  /** From route param `id` (withComponentInputBinding). */
  id = input.required<number>();

  /** From route resolve `problem` — refreshed when `id` changes (`runGuardsAndResolvers: 'paramsChange'`). */
  problem = input.required<Problem>();

  readonly problemForView = linkedContainerForView(() => this.id(), () => this.problem());

  private problemsService = inject(ProblemsService);
  private titleService = inject(Title);
  private destroyRef = inject(DestroyRef);

  constructor() {
    effect(() => {
      const problem = this.problemForView();
      if (problem) {
        this.titleService.setTitle(problem.getFullDescription());
      }
    });
  }

  reloadProblem(): void {
    this.problemsService
      .getProblem(Number(this.id()))
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((p) => this.problemForView.set(p));
  }

  updateProblem(): void {
    const problem = this.problemForView();
    if (!problem) {
      return;
    }
    this.problemsService
      .updateProblem(problem)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((updated) => this.problemForView.set(updated));
  }
}
