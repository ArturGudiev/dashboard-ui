import { Component, input, OnInit, signal } from '@angular/core';
import { TaskContainer } from "../../../models/interfaces/task-container";
import { MyTreeComponent, TreeNode } from "../tree/my-tree.component";
import { TaskContainerService } from "../../../services/task-container-services/task-container.service";
import { MatProgressSpinner } from "@angular/material/progress-spinner";

@Component({
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
  treeData = signal<TreeNode[] | null>(null);
  loading = signal<boolean>(true);
  constructor(private readonly taskContainerService: TaskContainerService) { }

  ngOnInit(): void {
    this.taskContainerService.getReport(this.container()).subscribe(res => {
      this.loading.set(false);
      this.treeData.set([res]);
    });
  }


}
