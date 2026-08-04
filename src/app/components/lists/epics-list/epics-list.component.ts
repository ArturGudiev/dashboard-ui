import { SelectionModel } from '@angular/cdk/collections';
import { type AfterViewInit, Component, effect, inject, input, output, ViewChild , ChangeDetectionStrategy} from '@angular/core';
import { Router } from '@angular/router';
import { type Epic } from "../../../models/epic";
import { MatPaginator } from "@angular/material/paginator";
import { MatTableDataSource } from "@angular/material/table";

import { MatTableModule } from "@angular/material/table";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatPaginatorModule } from "@angular/material/paginator";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-epics-list',
  templateUrl: './epics-list.component.html',
  imports: [
    MatTableModule,
    MatCheckboxModule,
    MatPaginatorModule,
    MatButtonModule,
    MatIconModule,
  ],
  standalone: true,
  styleUrls: ['./epics-list.component.sass']
})
export class EpicsListComponent implements AfterViewInit {

  epics = input.required<Epic[]>();
  showAddButton = input(false);
  addSubepic = output<void>();
  selection = new SelectionModel<Epic>(true, []);
  readonly displayedColumns: string[] = ['select', 'description'];
  
  dataSource = new MatTableDataSource<Epic>([]);
  private _paginator?: MatPaginator;

  @ViewChild(MatPaginator) set paginator(paginator: MatPaginator | undefined) {
    this._paginator = paginator;
    if (paginator) {
      this.dataSource.paginator = paginator;
    }
  }

  get paginator(): MatPaginator | undefined {
    return this._paginator;
  }

  private router = inject(Router);

  constructor() {
    effect(() => {
      this.dataSource.data = this.epics();
    });
  }

  ngAfterViewInit() { 
    if (this._paginator) {
      this.dataSource.paginator = this._paginator;
    }
  }

  epicsSelectAllToggle() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }
    this.selection.select(...this.epics());
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.epics().length;
    return numSelected === numRows;
  }

  onSubepicClick(epic: Epic) {
    this.router.navigate(['epic', epic.id]);
  }
}
