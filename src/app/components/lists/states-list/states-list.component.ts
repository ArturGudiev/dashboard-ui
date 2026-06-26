import { SelectionModel } from '@angular/cdk/collections';
import { type AfterViewInit, ChangeDetectionStrategy, Component, effect, inject, input, output, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { StatesService } from '../../../services/task-container-services/states.service';
import { type ModelsContainerDescription, type ModelsStateFull } from '../../../types/generated';
import { FulfilledStatusIconComponent } from '../../shared/fulfilled-status-icon/fulfilled-status-icon.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-states-list',
  templateUrl: './states-list.component.html',
  imports: [
    MatTableModule,
    MatCheckboxModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
    FulfilledStatusIconComponent,
  ],
  standalone: true,
  styleUrls: ['./states-list.component.sass'],
})
export class StatesListComponent implements AfterViewInit {
  states = input.required<ModelsStateFull[]>();
  showAddButton = input(true);
  showTitle = input(true);
  title = input('States');
  parent = input<ModelsContainerDescription | null>(null);
  updateList = output<void>();

  private readonly router = inject(Router);
  private readonly statesService = inject(StatesService);

  readonly selection = new SelectionModel<ModelsStateFull>(true, []);
  readonly displayedColumns: string[] = ['select', 'description', 'isFulfilled'];
  readonly dataSource = new MatTableDataSource<ModelsStateFull>([]);

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor() {
    effect(() => {
      this.dataSource.data = this.states();
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  onStateClick(state: ModelsStateFull): void {
    this.router.navigate(['state', state.id]);
  }

  addState(): void {
    this.statesService.openAddStateDialog(this.parent() ?? undefined).subscribe(() => {
      this.updateList.emit();
    });
  }
}
