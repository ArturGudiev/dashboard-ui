import {
  ChangeDetectionStrategy,
  Component,
  effect,
  ElementRef,
  input,
  OnDestroy,
  viewChild,
} from '@angular/core';
import MindElixir, { SIDE, type MindElixirInstance, type NodeObj } from 'mind-elixir';
import { type MmNode } from '../../../shared/libs/mm-parser.lib';

function toMindElixirNode(node: MmNode): NodeObj {
  return {
    id: node.id,
    topic: node.text,
    expanded: !node.folded,
    hyperLink: node.link,
    note: node.note,
    children: node.children.length
      ? node.children.map((child) => toMindElixirNode(child))
      : undefined,
  };
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-mind-map-graph',
  standalone: true,
  templateUrl: './mind-map-graph.component.html',
  styleUrls: ['./mind-map-graph.component.sass'],
})
export class MindMapGraphComponent implements OnDestroy {
  readonly root = input.required<MmNode>();
  private readonly host = viewChild.required<ElementRef<HTMLDivElement>>('mapHost');

  private instance: MindElixirInstance | null = null;

  constructor() {
    effect(() => {
      const root = this.root();
      const el = this.host().nativeElement;
      this.destroyMap();
      this.initMap(el, root);
    });
  }

  ngOnDestroy(): void {
    this.destroyMap();
  }

  private initMap(el: HTMLElement, root: MmNode): void {
    el.innerHTML = '';
    const mind = new MindElixir({
      el,
      direction: SIDE,
      editable: false,
      contextMenu: false,
      toolBar: true,
      keypress: false,
      allowUndo: false,
      overflowHidden: false,
    });

    mind.init({
      nodeData: toMindElixirNode(root),
      direction: SIDE,
    });
    mind.disableEdit();
    requestAnimationFrame(() => {
      try {
        mind.toCenter();
        mind.scaleFit();
      } catch {
        // ignore
      }
    });
    this.instance = mind;
  }

  private destroyMap(): void {
    if (this.instance) {
      try {
        this.instance.destroy();
      } catch {
        // ignore
      }
      this.instance = null;
    }
  }
}
