import { SelectionModel } from '@angular/cdk/collections';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { Epic } from "../../../models/epic";

@Component({
  selector: 'app-epics-list',
  templateUrl: './epics-list.component.html',
  styleUrls: ['./epics-list.component.sass']
})
export class EpicsListComponent implements OnInit {


  @Input() epics: Epic[] = [];
  @Output() addSubepic = new EventEmitter<Epic>();
  selection = new SelectionModel<Epic>(true, []);
  displayedColumns: string[] = ['select', 'position', 'description', 'actions'];
  constructor(private router: Router) { }

  ngOnInit(): void {
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
    this.router.navigate(['epic', epic._id]);
  }
}
