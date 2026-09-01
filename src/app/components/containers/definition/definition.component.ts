import { ChangeDetectionStrategy, Component, DestroyRef, effect, inject, input } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { type Definition } from '../../../models/definition';
import { DefinitionsService } from '../../../services/task-container-services/definitions.service';
import { linkedContainerForView } from '../../../shared/libs/container-view.lib';
import { TaskContainerSignalComponent } from '../task-container-signal/task-container-signal.component';

@Component({
  selector: 'app-definition',
  templateUrl: './definition.component.html',
  imports: [TaskContainerSignalComponent],
  styleUrls: ['./definition.component.sass'],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DefinitionComponent {
  id = input.required<number>();
  definition = input.required<Definition>();

  readonly definitionForView = linkedContainerForView(() => this.id(), () => this.definition());

  private definitionsService = inject(DefinitionsService);
  private titleService = inject(Title);
  private destroyRef = inject(DestroyRef);

  constructor() {
    effect(() => {
      const def = this.definitionForView();
      if (def) {
        this.titleService.setTitle(def.getFullDescription());
      }
    });
  }

  reloadDefinition(): void {
    this.definitionsService
      .getDefinition(Number(this.id()))
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((def) => this.definitionForView.set(def));
  }

  updateDefinition(): void {
    const def = this.definitionForView();
    if (!def) {
      return;
    }
    this.definitionsService
      .updateDefinition(def)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((updated) => this.definitionForView.set(updated));
  }
}
