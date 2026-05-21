import { Component, DestroyRef, effect, inject, input, linkedSignal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { Problem } from '../../../models/problem';
import { ProblemsService } from '../../../services/task-container-services/problems.service';
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

  readonly problemForView = linkedSignal(() => this.problem());

  private problemsService = inject(ProblemsService);
  private titleService = inject(Title);
  private destroyRef = inject(DestroyRef);

  constructor() {
    effect(() => {
      this.titleService.setTitle(this.problemForView().getFullDescription());
    });
  }

  reloadProblem(): void {
    this.problemsService
      .getProblem(Number(this.id()))
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((p) => this.problemForView.set(p));
  }

  updateProblem(): void {
    this.problemsService
      .updateProblem(this.problemForView())
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((updated) => this.problemForView.set(updated));
  }
}
