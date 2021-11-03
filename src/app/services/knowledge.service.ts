import { Injectable } from '@angular/core';
import {Observable} from "rxjs";
import {ApiService} from "./api.service";
import {Definition} from "../models/definition";

@Injectable({
  providedIn: 'root'
})
export class KnowledgeService {

  constructor(private apiService: ApiService) { }

  getDefinitions(tag: string): Observable<Definition[]> {
    return this.apiService._getDefinitions(tag);
  }

}
