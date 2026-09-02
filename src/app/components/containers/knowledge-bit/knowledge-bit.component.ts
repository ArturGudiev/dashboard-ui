import { ChangeDetectionStrategy, Component, DestroyRef, effect, inject, input } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { type Knowledge } from '../../../models/knowledge';
import { KnowledgeService } from '../../../services/task-container-services/knowledge.service';
import { linkedContainerForView } from '../../../shared/libs/container-view.lib';
import { TaskContainerSignalComponent } from '../task-container-signal/task-container-signal.component';

@Component({
  selector: 'app-knowledge-bit',
  templateUrl: './knowledge-bit.component.html',
  imports: [TaskContainerSignalComponent],
  styleUrls: ['./knowledge-bit.component.sass'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KnowledgeBitComponent {
  id = input.required<number>();
  knowledgeBit = input.required<Knowledge>();

  readonly knowledgeBitForView = linkedContainerForView(() => this.id(), () => this.knowledgeBit());

  private knowledgeService = inject(KnowledgeService);
  private titleService = inject(Title);
  private destroyRef = inject(DestroyRef);

  constructor() {
    effect(() => {
      const kb = this.knowledgeBitForView();
      if (kb) {
        this.titleService.setTitle(kb.getFullDescription());
      }
    });
  }

  reloadKnowledgeBit(): void {
    this.knowledgeService
      .getKnowledge(Number(this.id()))
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((kb) => this.knowledgeBitForView.set(kb));
  }

  updateKnowledgeBit(): void {
    const kb = this.knowledgeBitForView();
    if (!kb) {
      return;
    }
    this.knowledgeService
      .updateKnowledge(kb)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((updated) => this.knowledgeBitForView.set(updated));
  }
}
