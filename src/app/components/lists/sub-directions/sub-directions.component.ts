import { SelectionModel } from '@angular/cdk/collections';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { type Direction } from '../../../models/direction';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-sub-directions',
  imports: [MatTableModule, MatCheckboxModule, MatButtonModule, MatIconModule],
  templateUrl: './sub-directions.component.html',
  standalone: true,
  styleUrls: ['./sub-directions.component.sass'],
})
export class SubDirectionsComponent {
  directions = input.required<Direction[]>();
  showAddButton = input(true);

  directionClick = output<Direction>();
  addSubDirection = output<void>();

  readonly selection = new SelectionModel<Direction>(true, []);
  readonly displayedColumns: string[] = ['select', 'position', 'description', 'status'];

  directionsSelectAllToggle(): void {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }
    this.selection.select(...this.directions());
  }

  isAllSelected(): boolean {
    const numSelected = this.selection.selected.length;
    const numRows = this.directions().length;
    return numSelected === numRows;
  }

  onDirectionClick(direction: Direction): void {
    this.directionClick.emit(direction);
  }
}
