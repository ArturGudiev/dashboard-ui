import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Definition} from "../../../models/definition";
import {SelectionModel} from "@angular/cdk/collections";
import {Router} from "@angular/router";

@Component({
  selector: 'app-subdefinitions',
  templateUrl: './subdefinitions.component.html',
  styleUrls: ['./subdefinitions.component.sass']
})
export class SubdefinitionsComponent implements OnInit {
  @Input() definitions: Definition[] = [];
  @Output() addDefinition = new EventEmitter();
  @Output() refreshDefinitions = new EventEmitter();
  displayedColumns: string[] = ['select', 'position', 'name', 'value'];

  selection = new SelectionModel<Definition>(true, []);

  constructor(private router: Router) { }

  ngOnInit(): void {
  }


  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.definitions.length;
    return numSelected === numRows;
  }


  masterToggle() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }
    this.selection.select(...this.definitions);
  }

  onDefinitionClick(definition: Definition) {
    this.router.navigate(['definition', definition._id]).then();
  }

}
