import { inject, Injectable } from '@angular/core';
import { ApiService } from "./api.service";
import { type Observable } from "rxjs";
import { type ModelsAliasModel } from "../types/generated";

@Injectable({
  providedIn: 'root'
})
export class AliasesService {

  private apiService = inject(ApiService);


  getAliasRecord(alias: string): Observable<ModelsAliasModel> {
    return this.apiService._getAlias(alias);
  }
}
