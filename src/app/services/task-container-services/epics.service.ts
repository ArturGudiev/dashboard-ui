import { inject, Injectable } from '@angular/core';
import { type Observable } from "rxjs";
import { map } from "rxjs/operators";
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
    return this.apiService._getEpics(ids).pipe(
      map((epics) => epics.filter((epic) => !epic.closed)),
    );
  }

  getAllEpics(): Observable<Epic[]> {
    return this.apiService._getAllEpics().pipe(
      map((epics) => epics.filter((epic) => !epic.closed)),
    );
  }

  updateEpic(epic: Epic): Observable<Epic> {
    return this.apiService._updateEpic(epic)
  }

  closeEpic(id: number): Observable<Epic> {
    return this.apiService._patchEpic(id, { closed: true });
  }
}
