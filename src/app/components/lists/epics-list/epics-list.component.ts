import { SelectionModel } from '@angular/cdk/collections';
import { AfterViewInit, Component, effect, inject, input, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { Epic } from "../../../models/epic";
import { MatPaginator } from "@angular/material/paginator";
import { MatTableDataSource } from "@angular/material/table";

import { MaterialModule } from "../../../modules/material/material.module";

@Component({
  selector: 'app-epics-list',
  templateUrl: './epics-list.component.html',
  imports: [
    MaterialModule
  ],
  standalone: true,
  styleUrls: ['./epics-list.component.sass']
})
export class EpicsListComponent implements AfterViewInit {

  epics = input.required<Epic[]>();
  selection = new SelectionModel<Epic>(true, []);
  displayedColumns: string[] = ['select', 'description'];

  private router = inject(Router);

  dataSource = new MatTableDataSource<Epic>([]);
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor() {
    effect(() => {
      this.dataSource.data = this.epics();
    });
  }

  ngAfterViewInit() { 
    this.dataSource.paginator = this.paginator;
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
