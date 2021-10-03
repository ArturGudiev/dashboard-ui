import {Injectable} from '@angular/core';
import {Observable} from "rxjs";
import {ApiService} from "./api.service";
import {Story} from "../models/story";

@Injectable({
  providedIn: 'root'
})
export class StoriesService {

  constructor(private apiService: ApiService) { }

  getStory(id: number): Observable<Story> {
    return this.apiService._getStory(id);
  }
}
