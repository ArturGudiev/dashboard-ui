import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Story } from "../../../models/story";
import { SelectionModel } from "@angular/cdk/collections";
import { Router } from "@angular/router";
import { MaterialModule } from "../../../modules/material/material.module";


@Component({
  selector: 'app-substories',
  imports: [
    MaterialModule
  ],
  templateUrl: './sub-stories.component.html',
  standalone: true,
  styleUrls: ['./sub-stories.component.sass']
})
export class SubStoriesComponent implements OnInit {

  @Input() stories: Story[] = [];
  @Output() onStoryClick = new EventEmitter<Story>();
  @Output() addSubstory = new EventEmitter<Story>();
  selection = new SelectionModel<Story>(true, []);
  displayedColumns: string[] = ['select', 'position', 'description'];
  constructor(private router: Router) { }

  ngOnInit(): void {
  }

  onFinishStoriesClick() {

  }

  storiesSelectAllToggle() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }
    this.selection.select(...this.stories);
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.stories.length;
    return numSelected === numRows;
  }

  onSubstoryClick(story: Story) {
    this.router.navigate(['story', story.id]);
  }
}
