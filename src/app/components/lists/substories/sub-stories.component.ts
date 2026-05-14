import { Component, input, output } from '@angular/core';
import { Story } from "../../../models/story";
import { SelectionModel } from "@angular/cdk/collections";
import { MatTableModule } from "@angular/material/table";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatButtonModule } from "@angular/material/button";
import { MatIconModule } from "@angular/material/icon";


@Component({
  selector: 'app-substories',
  imports: [MatTableModule, MatCheckboxModule, MatButtonModule, MatIconModule],
  templateUrl: './sub-stories.component.html',
  standalone: true,
  styleUrls: ['./sub-stories.component.sass']
})
export class SubStoriesComponent {

  stories = input.required<Story[]>();
  onStoryClick = output<Story>();
  addSubstory = output<void>();
  readonly selection = new SelectionModel<Story>(true, []);
  readonly displayedColumns: string[] = ['select', 'position', 'description'];

  storiesSelectAllToggle() {
    if (this.isAllSelected()) {
      this.selection.clear();
      return;
    }
    this.selection.select(...this.stories());
  }

  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.stories().length;
    return numSelected === numRows;
  }

  onSubstoryClick(story: Story) {
    this.onStoryClick.emit(story);
  }
}
