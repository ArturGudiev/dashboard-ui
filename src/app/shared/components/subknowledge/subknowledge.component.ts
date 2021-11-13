import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Knowledge} from "../../../models/knowledge";
import {SelectionModel} from "@angular/cdk/collections";
import {Router} from "@angular/router";

@Component({
  selector: 'app-subknowledge',
  templateUrl: './subknowledge.component.html',
  styleUrls: ['./subknowledge.component.sass']
})
export class SubknowledgeComponent implements OnInit {
  @Input() knowledgeBits: Knowledge[] = [];
  @Output() addKnowledge = new EventEmitter();
  @Output() refreshKnowledge = new EventEmitter();
  displayedColumns: string[] = ['select', 'position', 'name', 'value'];

  selection = new SelectionModel<Knowledge>(true, []);

  constructor(private router: Router) { }

  ngOnInit(): void { }


  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.knowledgeBits.length;
    return numSelected === numRows;
  }


  masterToggle() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }
    this.selection.select(...this.knowledgeBits);
  }

  onKnowledgeClick(knowledge: Knowledge) {
    this.router.navigate(['knowledge', knowledge._id]).then();
  }

}
