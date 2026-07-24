import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { type KnowledgeNode } from '../../../models/knowledge-node';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-knowledge-nodes-list',
  imports: [MatTableModule, MatButtonModule, MatIconModule],
  templateUrl: './knowledge-nodes-list.component.html',
  standalone: true,
  styleUrls: ['./knowledge-nodes-list.component.sass'],
})
export class KnowledgeNodesListComponent {
  knowledgeNodes = input.required<KnowledgeNode[]>();
  knowledgeNodeClick = output<KnowledgeNode>();

  readonly displayedColumns: string[] = ['position', 'description'];

  onKnowledgeNodeClick(node: KnowledgeNode): void {
    this.knowledgeNodeClick.emit(node);
  }
}
