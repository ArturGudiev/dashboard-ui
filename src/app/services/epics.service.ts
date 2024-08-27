import { Injectable } from '@angular/core';
import {Observable} from "rxjs";
import {ApiService} from "./api.service";
import {Epic} from "../models/epic";

@Injectable({
  providedIn: 'root'
})
export class EpicsService {

  constructor(private apiService: ApiService) { }

  getEpic(id: number): Observable<Epic> {
    return this.apiService._getEpic(id);
  }

  getEpics(ids: number[]): Observable<Epic[]> {
    return this.apiService._getEpics(ids);
  }

  getParentsPath(problem: any): Observable<string[]> { // TODO simplify
    return this.apiService._getEpicParentsPath(problem);
  }

  getAllEpics(): Observable<Epic[]> {
    return this.apiService._getAllEpics();
  }
}
