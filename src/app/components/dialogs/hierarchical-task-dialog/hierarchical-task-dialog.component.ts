import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogActions, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import {
  createEmptyEditableTaskNode,
  type EditableTaskNode,
  type HierarchicalTaskDialogResult,
  toTaskNodes,
} from '../../../services/task-container-services/tasks.service';
import { HierarchicalTaskNodeComponent } from './hierarchical-task-node.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-hierarchical-task-dialog',
  imports: [
    MatButtonModule,
    MatDialogActions,
    MatIconModule,
    HierarchicalTaskNodeComponent,
  ],
  templateUrl: './hierarchical-task-dialog.component.html',
  styleUrls: ['./hierarchical-task-dialog.component.sass'],
})
export class HierarchicalTaskDialogComponent {
  private dialogRef = inject(MatDialogRef<HierarchicalTaskDialogComponent>);

  readonly roots = signal<EditableTaskNode[]>([createEmptyEditableTaskNode()]);

  onCancel(): void {
    this.dialogRef.close(undefined);
  }

  addRoot(): void {
    this.roots.update((roots) => [...roots, createEmptyEditableTaskNode()]);
  }

  removeRoot(index: number): void {
    this.roots.update((roots) => roots.filter((_, i) => i !== index));
  }

  refreshTree(): void {
    this.roots.update((roots) => [...roots]);
  }

  onSubmit(): void {
    const nodes = toTaskNodes(this.roots());
    if (!nodes.length) {
      return;
    }

    const result: HierarchicalTaskDialogResult = { nodes };
    this.dialogRef.close(result);
  }

  canSubmit(): boolean {
    return toTaskNodes(this.roots()).length > 0;
  }
}
