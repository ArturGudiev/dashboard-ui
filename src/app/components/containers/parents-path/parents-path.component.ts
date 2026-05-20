import { Component, inject, input, output , ChangeDetectionStrategy} from '@angular/core';
import { NgStyle } from "@angular/common";
import { LongClickDirectiveDirective } from "../../../directives/long-click-directive.directive";
import { TaskContainerService } from "../../../services/task-container-services/task-container.service";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-parents-path',
  imports: [
    NgStyle,
    LongClickDirectiveDirective
  ],
  templateUrl: './parents-path.component.html',
  standalone: true,
  styleUrls: ['./parents-path.component.sass']
})
export class ParentsPathComponent {

  parentsPath = input.required<string[]>();
  onParentClick = output<string>();

  private taskContainerService = inject(TaskContainerService);

  longClick(node: string) {
    this.taskContainerService.addTaskToContainerByShortDescription(node);
  }
}
