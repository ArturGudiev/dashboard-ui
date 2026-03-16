import { Injectable } from '@angular/core';
import { ApiService } from "./api.service";
import { Observable } from "rxjs";
import { ModelsAliasModel } from "../types/generated";

@Injectable({
  providedIn: 'root'
})
export class AliasesService {

  constructor(private apiService: ApiService) { }


  getAliasRecord(alias: string): Observable<ModelsAliasModel> {
    return this.apiService._getAlias(alias);
  }
}
