import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {SelectionModel} from "@angular/cdk/collections";
import {Router} from "@angular/router";
import {KnowledgeNode} from "../../../models/knowledge-node";

@Component({
  selector: 'app-knowledge-subnodes',
  templateUrl: './knowledge-subnodes.component.html',
  styleUrls: ['./knowledge-subnodes.component.sass']
})
export class KnowledgeSubnodesComponent implements OnInit {
  @Input() knowledgeNodes: KnowledgeNode[] = [];
  @Output() addKnowledgeNode = new EventEmitter();
  @Output() refreshKnowledgeNodes = new EventEmitter();
  @Output() deleteKnowledgeNode = new EventEmitter();
  displayedColumns: string[] = ['select', 'position', 'name'];

  selection = new SelectionModel<KnowledgeNode>(true, []);

  constructor(private router: Router) { }

  ngOnInit(): void { }


  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.knowledgeNodes.length;
    return numSelected === numRows;
  }


  masterToggle() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }
    this.selection.select(...this.knowledgeNodes);
  }

  onKnowledgeNodeClick(knowledgeNode: KnowledgeNode) {
    this.router.navigate(['knowledge-tree', 'node', knowledgeNode._id]).then();
  }
}
