import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {SelectionModel} from "@angular/cdk/collections";
import {Router} from "@angular/router";
import {Action} from "../../../models/action";

@Component({
  selector: 'app-subactions',
  templateUrl: './subactions.component.html',
  styleUrls: ['./subactions.component.sass']
})
export class SubactionsComponent implements OnInit {
  @Input() actions: Action[] = [];
  @Output() addAction = new EventEmitter();
  @Output() refreshActions = new EventEmitter();
  displayedColumns: string[] = ['select', 'position', 'name', 'value'];

  selection = new SelectionModel<Action>(true, []);

  constructor(private router: Router) { }

  ngOnInit(): void { }


  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.actions.length;
    return numSelected === numRows;
  }


  masterToggle() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }
    this.selection.select(...this.actions);
  }

  onActionClick(action: Action) {
    this.router.navigate(['action', action._id]).then();
  }
}
