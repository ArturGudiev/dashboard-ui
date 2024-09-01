import { Injectable } from '@angular/core';
import { Observable } from "rxjs";
import { ApiService } from "./api.service";
import { Story } from "../models/story";
import { TaskContainer } from "../models/interfaces/task-container";

@Injectable({
  providedIn: 'root'
})
export class StoriesService {

  constructor(private apiService: ApiService) { }

  getStory(id: number): Observable<Story> {
    return this.apiService._getStory(id);
  }

  getStories(ids: number[]): Observable<Story[]> {
    return this.apiService._getStories(ids);
  }

  updateStory(story: Story): Observable<Story> {
    return this.apiService._updateStory(story);
  }

  getParentsPath(taskContainer: TaskContainer): Observable<string[]> {
    return this.apiService._getParentsPath(taskContainer);
  }

}
