import { inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { filter, switchMap } from 'rxjs/operators';
import { NewTaskDialogComponent } from '../../components/dialogs/new-task-dialog/new-task-dialog.component';
import { Story } from '../../models/story';
import { TaskContainer } from '../../models/interfaces/task-container';
import { NEW_STORY_DIALOG_OPTIONS } from '../../shared/constants';
import { ApiService } from '../api.service';

@Injectable({
  providedIn: 'root',
})
export class StoriesService {
  private apiService = inject(ApiService);
  private dialog = inject(MatDialog);

  getStory(id: number): Observable<Story> {
    return this.apiService._getStory(id);
  }

  getStories(ids: number[]): Observable<Story[]> {
    return this.apiService._getStories(ids);
  }

  updateStory(story: Story): Observable<Story> {
    return this.apiService._updateStory(story);
  }

  createNewStory(obj: {
    story: { description: string; tags: string[]; notes: string };
    parent: { id: number; type: string };
  }): Observable<Story> {
    return this.apiService._createNewStory(obj);
  }

  createStoryFromDialog(taskContainer: TaskContainer): Observable<Story> {
    const dialogRef = this.dialog.open(NewTaskDialogComponent, {
      data: {
        title: 'New story for ' + taskContainer.getFullDescription(),
        inputWidth: '40rem',
      },
      ...NEW_STORY_DIALOG_OPTIONS,
    });
    return dialogRef.afterClosed().pipe(
      filter((responseObj: { description?: string; notes?: string } | null) => !!responseObj?.description),
      switchMap((responseObj) => {
        const story = {
          description: responseObj!.description!,
          tags: [] as string[],
          notes: responseObj!.notes ?? '',
        };
        const parent = { id: taskContainer.id, type: taskContainer.type };
        return this.createNewStory({ story, parent });
      }),
    );
  }
}
