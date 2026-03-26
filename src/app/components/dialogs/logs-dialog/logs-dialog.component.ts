import { Component, effect, Inject, model, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { TaskContainer } from "../../../models/interfaces/task-container";
import { LogsService } from "../../../services/logs.service";
import { EntLogMessage } from "../../../types/generated";
import { Subscription } from "rxjs";
import { MatPaginator, PageEvent } from "@angular/material/paginator";
import { MatFormField, MatOption, MatSelect } from "@angular/material/select";
import { MatFormFieldModule } from "@angular/material/form-field";

@Component({
  selector: 'app-logs-dialog',
  imports: [MatPaginator, MatSelect, MatOption, MatFormField, MatFormFieldModule],
  template: `

    <mat-form-field style="width: 10rem">
      <mat-label>Logs group type</mat-label>
      <mat-select [(value)]="groupType">
        <mat-option [value]="'container'">Container</mat-option>
        <mat-option [value]="'global'">Global</mat-option>
        <mat-option [value]="'all'">All</mat-option>
      </mat-select>
    </mat-form-field>

    @for (content of logMessages(); track content.id; let idx = $index) {
      <div style="border: 1px solid red">
        {{ perPage() * page() + idx + 1 }}
        {{ content.description }}
      </div>
    }
    <mat-paginator
      [pageIndex]="page()"
      (change)="onPaginatorChange($event)"
      [length]="total()"
      [pageSize]="perPage()"
      (page)="handlePageEvent($event)"
      aria-label="Select page">
    </mat-paginator>
  `,
  standalone: true,
  styleUrl: './logs-dialog.component.scss'
})
export class LogsDialogComponent {
  perPage = signal(20);
  page = signal(0);
  total = signal(0);
  groupType = model<'container' | 'global' | 'all'>('container')

  logMessages = signal<EntLogMessage[]>([]);

  constructor(
    public dialogRef: MatDialogRef<LogsDialogComponent>,
    private logsService: LogsService,
    @Inject(MAT_DIALOG_DATA) public data: { taskContainer: TaskContainer }
  ) {
    effect(
      (onCleanup) => {
        let sub: Subscription | null = null;
        const params = {
          ...(this.groupType() === 'container'  && { taskContainer: this.data.taskContainer }),
          ...(this.groupType() === 'global'  && { global: true }),
          perPage: this.perPage(),
          page: this.page(),
        };
        sub = this.logsService.getLogMessages(params).subscribe({
          next: (messagesResponse) => {
            this.logMessages.set(messagesResponse.items);
            this.page.set(messagesResponse.page);
            this.total.set(messagesResponse.total);
          },
          error: (err) => {
            this.logMessages.set([]);
            this.page.set(1);
            this.total.set(0);
          }
        });
        onCleanup(() => {
          sub?.unsubscribe();
        });
      },
      { allowSignalWrites: true }
    );
  }

  ngOnInit(): void {
    console.log('ngOnInit === ', this.data);
    console.log(this.data.taskContainer);
  }

  protected readonly Math = Math;

  onPaginatorChange($event: Event) {
    console.log('onPaginatorChange', $event);
  }

  handlePageEvent(val: PageEvent): void {
    this.page.set(val.pageIndex);
  }
}
