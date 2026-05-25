import { ChangeDetectionStrategy, Component, inject, input, type OnInit, signal } from '@angular/core';
import { type TaskContainer } from "../../../models/interfaces/task-container";
import { MyTreeComponent, type TreeNode } from "../tree/my-tree.component";
import { TaskContainerService } from "../../../services/task-container-services/task-container.service";
import { MatProgressSpinner } from "@angular/material/progress-spinner";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-report',
  imports: [
    MyTreeComponent,
    MatProgressSpinner
  ],
  templateUrl: './container-report.component.html',
  standalone: true,
  styleUrls: ['./container-report.component.scss']
})
export class ContainerReportComponent implements OnInit {
  container = input.required<TaskContainer>();
  treeData = signal<TreeNode[]>([]);
  loading = signal<boolean>(true);

  private readonly taskContainerService = inject(TaskContainerService);

  ngOnInit(): void {
    this.taskContainerService.getReport(this.container()).subscribe(res => {
      this.loading.set(false);
      this.treeData.set(res ? [res] : []);
    });
  }

}
