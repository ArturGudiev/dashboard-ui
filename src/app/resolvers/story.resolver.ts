import { inject } from '@angular/core';
import { type ResolveFn } from '@angular/router';
import { type Story } from '../models/story';
import { StoriesService } from '../services/task-container-services/stories.service';

export const storyResolver: ResolveFn<Story> = (route) => {
  const id = Number(route.paramMap.get('id'));
  return inject(StoriesService).getStory(id);
};
