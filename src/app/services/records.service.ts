import {Injectable} from '@angular/core';
import {RecordItem} from "../models/record-item";
import {ApiService} from "./api.service";
import {Observable} from "rxjs";
import {GetValueDialogComponent} from "../modules/dialogs/get-value/get-value-dialog.component";
import {MatDialog} from "@angular/material/dialog";

@Injectable({
  providedIn: 'root'
})
export class RecordsService {

  constructor(private apiService: ApiService,
              private dialog: MatDialog) { }

  getRecords(tag?: string): Observable<RecordItem[]> {
    return this.apiService._getRecordItems(tag);
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
        // console.log('HERE', message);
        this.addRecord(message, tag).subscribe();
      }
    });
  }


}
