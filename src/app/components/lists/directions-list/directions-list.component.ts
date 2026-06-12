import { SelectionModel } from '@angular/cdk/collections';
import { type AfterViewInit, ChangeDetectionStrategy, Component, effect, inject, input, output, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { DirectionsService } from '../../../services/task-container-services/directions.service';
import { type EntDirection } from '../../../types/generated';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-directions-list',
  templateUrl: './directions-list.component.html',
  imports: [
    MatTableModule,
    MatCheckboxModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
  ],
  standalone: true,
  styleUrls: ['./directions-list.component.sass'],
})
export class DirectionsListComponent implements AfterViewInit {
  directions = input.required<EntDirection[]>();
  updateList = output<void>();

  private readonly router = inject(Router);
  private readonly directionsService = inject(DirectionsService);

  readonly selection = new SelectionModel<EntDirection>(true, []);
  readonly displayedColumns: string[] = ['select', 'description', 'closed'];
  readonly dataSource = new MatTableDataSource<EntDirection>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor() {
    effect(() => {
      this.dataSource.data = this.directions();
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  onDirectionClick(direction: EntDirection): void {
    this.router.navigate(['direction', direction.id]);
  }

  addDirection(): void {
    this.directionsService.openAddDirectionDialog().subscribe(() => {
      this.updateList.emit();
    });
  }
}
