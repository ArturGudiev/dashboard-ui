import { ChangeDetectionStrategy, Component, DestroyRef, effect, inject, input } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { type KnowledgeNode } from '../../../models/knowledge-node';
import { KnowledgeNodesService } from '../../../services/task-container-services/knowledge-nodes.service';
import { linkedContainerForView } from '../../../shared/libs/container-view.lib';
import { TaskContainerSignalComponent } from '../task-container-signal/task-container-signal.component';

@Component({
  selector: 'app-knowledge-node',
  templateUrl: './knowledge-node.component.html',
  imports: [TaskContainerSignalComponent],
  styleUrls: ['./knowledge-node.component.sass'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KnowledgeNodeComponent {
  /** From route param `id` (withComponentInputBinding). */
  id = input.required<number>();

  /** From route resolve `knowledgeNode`. */
  knowledgeNode = input.required<KnowledgeNode>();

  readonly knowledgeNodeForView = linkedContainerForView(() => this.id(), () => this.knowledgeNode());

  private knowledgeNodesService = inject(KnowledgeNodesService);
  private titleService = inject(Title);
  private destroyRef = inject(DestroyRef);

  constructor() {
    effect(() => {
      const node = this.knowledgeNodeForView();
      if (node) {
        this.titleService.setTitle(node.getFullDescription());
      }
    });
  }

  reloadKnowledgeNode(): void {
    this.knowledgeNodesService
      .getKnowledgeNode(Number(this.id()))
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((n) => this.knowledgeNodeForView.set(n));
  }

  updateKnowledgeNode(): void {
    const node = this.knowledgeNodeForView();
    if (!node) {
      return;
    }
    this.knowledgeNodesService
      .updateKnowledgeNode(node)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((updated) => this.knowledgeNodeForView.set(updated));
  }
}
