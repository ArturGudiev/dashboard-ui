import { AsyncPipe } from "@angular/common";
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RepetitiveTasksService } from "../../../services/task-container-services/repetitive-tasks.service";
import type { ModelsRepetitiveTaskResponse } from "../../../types/generated";
import { RepetitiveTasksListComponent } from "../../lists/repetitive-tasks-list/repetitive-tasks-list.component";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'dash-repetitive-tasks',
  standalone: true,
  imports: [
    AsyncPipe,
    RepetitiveTasksListComponent,
  ],
  templateUrl: './repetitive-tasks.component.html'
})
export class RepetitiveTasksComponent {
  private repetitiveTasksService = inject(RepetitiveTasksService);
  data$ = this.repetitiveTasksService.getAllRepetitiveTasks();


  onItemExecutedMark($event: ModelsRepetitiveTaskResponse) {
    this.repetitiveTasksService.markTaskAsDone($event.id).subscribe(() => {
      this.data$ = this.repetitiveTasksService.getAllRepetitiveTasks();
    });
  }

  updateList() {
    this.data$ = this.repetitiveTasksService.getAllRepetitiveTasks();
  }
}
