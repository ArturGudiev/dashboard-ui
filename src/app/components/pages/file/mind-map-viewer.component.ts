import { ChangeDetectionStrategy, Component, input, linkedSignal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import {
  type MmNode,
  setAllFolded,
  toggleFoldedAt,
} from '../../../shared/libs/mm-parser.lib';
import { MmNodeComponent } from './mm-node.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-mind-map-viewer',
  standalone: true,
  imports: [MatButtonModule, MmNodeComponent],
  templateUrl: './mind-map-viewer.component.html',
  styleUrls: ['./mind-map-viewer.component.sass'],
})
export class MindMapViewerComponent {
  /** Parsed root node from the `.mm` file. */
  readonly root = input.required<MmNode>();

  /** Local fold state so expand/collapse does not mutate the input. */
  readonly tree = linkedSignal(() => this.root());

  expandAll(): void {
    this.tree.set(setAllFolded(this.tree(), false));
  }

  collapseAll(): void {
    this.tree.set(setAllFolded(this.tree(), true));
  }

  onToggle(id: string): void {
    this.tree.set(toggleFoldedAt(this.tree(), id));
  }
}
