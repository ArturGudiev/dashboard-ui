import { Injectable } from '@angular/core';
import {ApiService} from "./api.service";
import {Observable} from "rxjs";
import {AliasesRecord} from "../models/alias-record";

@Injectable({
  providedIn: 'root'
})
export class AliasesService {

  constructor(private apiService: ApiService) { }


  getAliasRecord(alias: string): Observable<AliasesRecord> {
    return this.apiService._getAlias(alias);
  }
}
