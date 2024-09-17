import { Component, Input, OnInit } from '@angular/core';
import { TaskContainer } from "../../../models/interfaces/task-container";
import { MyTreeComponent, TreeNode } from "../tree/my-tree.component";
import { TaskContainerService } from "../../../services/task-container-services/task-container.service";
import { MatProgressSpinner } from "@angular/material/progress-spinner";

@Component({
  selector: 'app-report',
  standalone: true,
  imports: [
    MyTreeComponent,
    MatProgressSpinner
  ],
  templateUrl: './container-report.component.html',
  styleUrl: './container-report.component.scss'
})
export class ContainerReportComponent implements OnInit {
  @Input({required: true}) container!: TaskContainer;
  treeData: TreeNode[] | null = null;
  loading = true;
  constructor(private readonly taskContainerService: TaskContainerService) { }

  ngOnInit(): void {
    this.taskContainerService.getReport(this.container).subscribe(res => {
      this.loading = false;1
      this.treeData = [res];
    });
  }


}
