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


}
