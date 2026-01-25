import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgForOf, NgStyle } from "@angular/common";
import { MaterialModule } from "../../../modules/material/material.module";
import { LongClickDirectiveDirective } from "../../../directives/long-click-directive.directive";
import { TasksService } from "../../../services/task-container-services/tasks.service";
import { EpicsService } from "../../../services/task-container-services/epics.service";
import { StoriesService } from "../../../services/task-container-services/stories.service";
import { ProblemsService } from "../../../services/task-container-services/problems.service";
import { QuestionsService } from "../../../services/task-container-services/questions.service";
import { TaskContainerService } from "../../../services/task-container-services/task-container.service";

@Component({
  selector: 'app-parents-path',
  standalone: true,
  imports: [
    MaterialModule,
    NgStyle,
    NgForOf,
    LongClickDirectiveDirective
  ],
  templateUrl: './parents-path.component.html',
  styleUrls: ['./parents-path.component.sass']
})
export class ParentsPathComponent implements OnInit {

  @Input() parentsPath: string[] = [];
  @Output() onParentClick = new EventEmitter<string>();

  constructor(
    private tasksService: TasksService,
    private readonly epicsService: EpicsService,
    private readonly storiesService: StoriesService,
    private readonly problemsService: ProblemsService,
    private readonly questionsService: QuestionsService,
    private readonly taskContainerService: TaskContainerService
  ) {
  }

  ngOnInit(): void {
    console.log('AAAAAAAAA', this.parentsPath);
  }

  /**
   *
   * @param parent
   */
  longClick(parent: string) {
    this.taskContainerService.addTaskToContainerByShortDescription(parent);
  }
}
