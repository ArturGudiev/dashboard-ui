import { SelectionModel } from '@angular/cdk/collections';
import { AfterViewInit, Component, EventEmitter, Input, OnInit, Output, ViewChild } from '@angular/core';
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
    styleUrls: ['./epics-list.component.sass']
})
export class EpicsListComponent implements OnInit, AfterViewInit {

  @Input({transform: (value: Epic[] | null): Epic[] => value ?? []}) epics: Epic[] = [];
  @Output() addSubepic = new EventEmitter<Epic>();
  selection = new SelectionModel<Epic>(true, []);
  displayedColumns: string[] = ['select', 'description'];

  constructor(private router: Router) {
  }

  dataSource = new MatTableDataSource<Epic>([]);
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
  }

  ngOnInit(): void {
    this.dataSource = new MatTableDataSource<Epic>(this.epics);
  }

  epicsSelectAllToggle() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }
    this.selection.select(...this.epics);
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.epics.length;
    return numSelected === numRows;
  }

  onSubepicClick(epic: Epic) {
    this.router.navigate(['epic', epic.id]);
  }
}
