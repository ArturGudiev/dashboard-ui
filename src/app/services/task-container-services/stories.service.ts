import { inject, Injectable } from '@angular/core';
import { Observable } from "rxjs";
import { ApiService } from "../api.service";
import { Story } from "../../models/story";

@Injectable({
  providedIn: 'root'
})
export class StoriesService {

  private apiService = inject(ApiService);

  getStory(id: number): Observable<Story> {
    return this.apiService._getStory(id);
  }

  getStories(ids: number[]): Observable<Story[]> {
    return this.apiService._getStories(ids);
  }

  updateStory(story: Story): Observable<Story> {
    return this.apiService._updateStory(story);
  }

}
