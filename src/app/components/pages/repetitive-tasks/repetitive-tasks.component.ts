import { Component, inject , ChangeDetectionStrategy} from '@angular/core';
import { AsyncPipe } from "@angular/common";
import { RepetitiveTasksService } from "../../../services/task-container-services/repetitive-tasks.service";
import { RepetitiveTasksListComponent } from "../../lists/repetitive-tasks-list/repetitive-tasks-list.component";
import { ModelsRepetitiveTaskResponse } from "../../../types/generated";

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
