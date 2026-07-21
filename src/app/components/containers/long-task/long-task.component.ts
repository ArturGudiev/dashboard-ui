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
import { formatLongTaskProgress, getLongTaskProgressName } from '../../../shared/libs/long-task.lib';
import { ModelsLongTaskFull, ModelsLongTaskProgress, ModelsLongTaskProgressSubmission } from '../../../types/generated';
import { LongTaskProgressesListComponent } from '../../lists/long-task-progresses-list/long-task-progresses-list.component';

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
    LongTaskProgressesListComponent,
  ],
})
export class LongTaskComponent {
  id = input.required<number>();
  longTask = input.required<ModelsLongTaskFull>();

  readonly longTaskForView = signal<ModelsLongTaskFull | null>(null);
  readonly submissions = signal<ModelsLongTaskProgressSubmission[]>([]);

  readonly submissionColumns = [
    'execution_date',
    'progress_name',
    'progress_to_add',
    'progress_to_set',
    'progress_raw',
    'comments',
  ];

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

  closeTask(): void {
    this.longTasksService
      .closeLongTask(Number(this.id()))
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.router.navigate(['long-tasks']).then();
      });
  }

  loadSubmissions(): void {
    this.longTasksService
      .getSubmissions(Number(this.id()))
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((items) => this.submissions.set(items));
  }

  addProgress(): void {
    this.longTasksService
      .openAddProgressDialog(Number(this.id()))
      .subscribe(() => this.reloadLongTask());
  }

  addProgressSubmission(progress: ModelsLongTaskProgress): void {
    this.longTasksService
      .openAddProgressSubmissionDialog(progress)
      .subscribe(() => {
        this.reloadLongTask();
        this.loadSubmissions();
      });
  }

  // addSubmission(): void {
  //   const task = this.longTaskForView();
  //   if (!task) {
  //     return;
  //   }
  //   this.longTasksService
  //     .openAddSubmissionDialog(task)
  //     .subscribe(() => {
  //       this.reloadLongTask();
  //       this.loadSubmissions();
  //     });
  // }

  getFullDescription(task: ModelsLongTaskFull): string {
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

  formatProgress(task: ModelsLongTaskFull): string {
    return formatLongTaskProgress(task);
  }

  getSubmissionProgressName(submission: ModelsLongTaskProgressSubmission): string {
    return getLongTaskProgressName(
      this.longTaskForView()?.progresses,
      submission.longTaskProgressID,
    );
  }
}
