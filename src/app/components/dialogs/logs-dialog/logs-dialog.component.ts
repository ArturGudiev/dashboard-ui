import { Component, computed, effect, Inject, signal } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { TaskContainer } from "../../../models/interfaces/task-container";
import { LogsService } from "../../../services/logs.service";
import { EntLogMessage } from "../../../types/generated";
import { MatSlideToggle } from "@angular/material/slide-toggle";
import { Subscription } from "rxjs";
import { MatButton } from "@angular/material/button";
import { MatPaginator, PageEvent } from "@angular/material/paginator";

@Component({
    selector: 'app-logs-dialog',
    imports: [MatSlideToggle, MatButton, MatPaginator],
    template: `
    <mat-slide-toggle
      [checked]="showAllMessages()"
      (change)="showAllMessages.set($event.checked)"
    >All log messages</mat-slide-toggle>
    @for (content of logMessages(); track content.id; let idx = $index) {
      <div style="border: 1px solid red">
        {{ perPage() * (page() - 1) + idx + 1 }}
        {{ content.description }}
      </div>
    }
    <div>Per page: {{ perPage() }}</div>
    <div>Page: {{ page() }}</div>
    <div>{{ perPage() * (page() - 1) + 1 }} --- {{ Math.min(perPage() * page(), total()) }} from {{ total() }}</div>
    <mat-paginator
      [pageIndex]="page()"
      (change)="onPaginatorChange($event)"
      [length]="total()"
      [pageSize]="perPage()"
      (page)="handlePageEvent($event)"
      aria-label="Select page">
    </mat-paginator>
  `,
    styleUrl: './logs-dialog.component.sass'
})
export class LogsDialogComponent {
  perPage = signal(20);
  page = signal(0);
  total = signal(0);
  hasNextPage = computed(() => this.perPage() * this.page() < this.total());


  showAllMessages = signal(false);

  /** Loaded asynchronously; `computed` cannot return Promises. */
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
          ...(!this.showAllMessages() && { taskContainer: this.data.taskContainer }),
          perPage: this.perPage(),
          page: this.page(),
        };
        sub = this.logsService.getLogMessages(params).subscribe({
          next: (messagesResponse) => {
            this.logMessages.set(messagesResponse.items);
            this.page.set(messagesResponse.page);
            this.total.set(messagesResponse.total);
          },
          error: (err) => console.error('err === ', err)
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
