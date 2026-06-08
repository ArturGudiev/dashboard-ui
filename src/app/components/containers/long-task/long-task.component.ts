import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, effect, inject, input, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTableModule } from '@angular/material/table';
import { LongTasksService } from '../../../services/task-container-services/long-tasks.service';
import { getUrlByDescription } from '../../../shared/libs/dashboard.lib';
import { formatLongTaskProgress } from '../../../shared/libs/long-task.lib';
import { type EntLongTask, type EntLongTaskSubmission } from '../../../types/generated';

@Component({
  selector: 'app-long-task',
  templateUrl: './long-task.component.html',
  styleUrls: ['./long-task.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatTableModule,
  ],
})
export class LongTaskComponent {
  id = input.required<number>();
  longTask = input.required<EntLongTask>();

  readonly longTaskForView = signal<EntLongTask | null>(null);
  readonly submissions = signal<EntLongTaskSubmission[]>([]);

  readonly submissionColumns = ['execution_date', 'progress', 'comments'];

  private longTasksService = inject(LongTasksService);
  private titleService = inject(Title);
  private router = inject(Router);
  private destroyRef = inject(DestroyRef);

  constructor() {
    effect(() => {
      const task = this.longTask();
      this.longTaskForView.set(task);
      if (task) {
        this.titleService.setTitle(this.getFullDescription(task));
      }
      this.loadSubmissions();
    });
  }

  reloadLongTask(): void {
    this.longTasksService
      .getLongTask(Number(this.id()))
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((task) => this.longTaskForView.set(task));
  }

  loadSubmissions(): void {
    this.longTasksService
      .getSubmissions(Number(this.id()))
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((items) => this.submissions.set(items));
  }

  addSubmission(): void {
    this.longTasksService
      .openAddSubmissionDialog(Number(this.id()))
      .subscribe(() => {
        this.reloadLongTask();
        this.loadSubmissions();
      });
  }

  getFullDescription(task: EntLongTask): string {
    return `LongTask-${task.id} ${task.description ?? ''}`;
  }

  goToNearestParent(): void {
    this.longTasksService
      .getParentsPath(Number(this.id()))
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((parentsPath) => {
        if (parentsPath.length > 1) {
          const parentDescription = parentsPath[parentsPath.length - 2];
          const urls = getUrlByDescription(parentDescription);
          if (urls.length > 0) {
            this.router.navigate(urls).then();
            return;
          }
        }
        this.router.navigate(['long-tasks']).then();
      });
  }

  formatProgress(task: EntLongTask): string {
    return formatLongTaskProgress(task);
  }

  formatSubmissionProgress(submission: EntLongTaskSubmission): string {
    if (submission.progress_to_set != null) {
      return `set to ${submission.progress_to_set}`;
    }
    if (submission.progress_to_add != null) {
      return `+${submission.progress_to_add}`;
    }
    return '—';
  }
}
