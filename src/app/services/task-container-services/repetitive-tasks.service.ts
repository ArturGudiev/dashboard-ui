import { Injectable } from '@angular/core';
import { Observable } from "rxjs";
import { ApiService } from "../api.service";
import { EntRepetitiveTaskExecution, ModelsRepetitiveTaskResponse } from "../../types/generated";

@Injectable({
  providedIn: 'root'
})
export class RepetitiveTasksService {

  constructor(private apiService: ApiService) { }

  getAllRepetitiveTasks(): Observable<ModelsRepetitiveTaskResponse[]> {
    return this.apiService._getAllRepetitiveTasks();
  }

  markTaskAsDone(id: number): Observable<EntRepetitiveTaskExecution> {
    return this.apiService._markRepetitiveTaskAsDone(id);
  }
}
