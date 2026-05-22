import { inject, Injectable } from '@angular/core';
import { type RecordItem } from "../models/record-item";
import { ApiService, type IArrayResponse } from "./api.service";
import { type Observable } from "rxjs";
import { GetValueDialogComponent } from "../components/dialogs/get-value/get-value-dialog.component";
import { MatDialog } from "@angular/material/dialog";
import { type IArrayParams } from "../models/interfaces/array-params";

@Injectable({
  providedIn: 'root'
})
export class RecordsService {

  private apiService = inject(ApiService);
  private dialog = inject(MatDialog);

  getRecords(arrayParams: IArrayParams, tag?: string): Observable<IArrayResponse<RecordItem>> {
    return this.apiService._getRecordItems(arrayParams, tag);
  }

  addRecord(message: string, tag?: string): Observable<RecordItem> {
    return this.apiService._addRecord(message, tag);
  }

  callAddRecordDialog(tag?: string) {

    const dialogRef = this.dialog.open(GetValueDialogComponent,
      {
        height: '600px',
        width: '800px',
        data: {title: 'Record', multiline: true}});
    dialogRef.afterClosed().subscribe((message: string) => {
      if (message) {
        this.addRecord(message, tag).subscribe();
      }
    });
  }


}
