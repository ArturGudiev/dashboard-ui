import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { type EditableTaskNode } from '../../../services/task-container-services/tasks.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-hierarchical-task-node',
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    HierarchicalTaskNodeComponent,
  ],
  template: `
    <div class="node-row" [style.margin-left.rem]="depth() * 1.5">
      <mat-form-field class="description-field">
        <mat-label>Description</mat-label>
        <input
          matInput
          [value]="node().description"
          (input)="onDescriptionInput($event)"
        >
      </mat-form-field>

      <button
        mat-icon-button
        type="button"
        (click)="addChild()"
        aria-label="Add child task"
      >
        <mat-icon>subdirectory_arrow_right</mat-icon>
      </button>

      @if (canRemove()) {
        <button
          mat-icon-button
          type="button"
          color="warn"
          (click)="remove.emit()"
          aria-label="Remove task"
        >
          <mat-icon>delete</mat-icon>
        </button>
      }
    </div>

    @for (child of node().children; track $index) {
      <app-hierarchical-task-node
        [node]="child"
        [depth]="depth() + 1"
        [canRemove]="true"
        (remove)="removeChild($index)"
        (treeChange)="treeChange.emit()"
      ></app-hierarchical-task-node>
    }
  `,
  styles: [`
    .node-row
      display: flex
      align-items: center
      gap: 0.25rem
      margin-bottom: 0.25rem

    .description-field
      flex: 1
      min-width: 16rem
  `],
})
export class HierarchicalTaskNodeComponent {
  node = input.required<EditableTaskNode>();
  depth = input(0);
  canRemove = input(true);

  remove = output<void>();
  treeChange = output<void>();

  addChild(): void {
    this.node().children.push({ description: '', children: [] });
    this.treeChange.emit();
  }

  removeChild(index: number): void {
    this.node().children.splice(index, 1);
    this.treeChange.emit();
  }

  onDescriptionInput(event: Event): void {
    this.node().description = (event.target as HTMLInputElement).value;
    this.treeChange.emit();
  }
}
