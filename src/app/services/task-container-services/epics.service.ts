import { inject, Injectable } from '@angular/core';
import { type Observable } from "rxjs";
import { ApiService } from "../api.service";
import { type Epic } from "../../models/epic";

@Injectable({
  providedIn: 'root'
})
export class EpicsService {

  private apiService = inject(ApiService);

  getEpic(id: number): Observable<Epic> {
    return this.apiService._getEpic(id);
  }

  getEpics(ids: number[]): Observable<Epic[]> {
    return this.apiService._getEpics(ids);
  }

  getAllEpics(): Observable<Epic[]> {
    return this.apiService._getAllEpics();
  }

  updateEpic(epic: Epic): Observable<Epic> {
    return this.apiService._updateEpic(epic)
  }
}
