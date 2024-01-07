import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {Story} from "../../../models/story";
import {SelectionModel} from "@angular/cdk/collections";
import {TaskC} from "../../../models/task-class";
import {Router} from "@angular/router";

@Component({
  selector: 'app-substories',
  templateUrl: './sub-stories.component.html',
  styleUrls: ['./sub-stories.component.sass']
})
export class SubStoriesComponent implements OnInit {

  @Input() stories: Story[];
  @Output() onStoryClick = new EventEmitter<Story>();
  @Output() addSubstory = new EventEmitter<Story>();
  selection = new SelectionModel<Story>(true, []);
  displayedColumns: string[] = ['select', 'position', 'description', 'actions'];
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
    this.router.navigate(['story', story._id]);
  }
}
