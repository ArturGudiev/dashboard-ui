import { ChangeDetectorRef, Component, inject, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { RecordsService } from "../../../services/records.service";
import { Observable } from "rxjs";
import { RecordItem } from "../../../models/record-item";
import { MatPaginator, PageEvent } from "@angular/material/paginator";
import { IArrayResponse } from "../../../services/api.service";
import { MatButtonToggle, MatButtonToggleChange, MatButtonToggleGroup } from "@angular/material/button-toggle";
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { AsyncPipe } from "@angular/common";
import { IArrayParams } from "../../../models/interfaces/array-params";

type SelectedOptionType = 'node' | 'all' | 'node_plus_children';

@Component({
    selector: 'app-records-list-dialog',
    templateUrl: './records-list-dialog.component.html',
    imports: [
    MatProgressSpinner,
    MatButtonToggleGroup,
    MatButtonToggle,
    MatPaginator,
    AsyncPipe
],
    styleUrls: ['./records-list-dialog.component.sass']
})
export class RecordsListDialogComponent {
  records$!: Observable<IArrayResponse<RecordItem>>;
  selectedOption: SelectedOptionType = 'all';
  @ViewChild('paginator') paginator!: MatPaginator;
  private arrayParams: IArrayParams = {
    offset: 0,
    pageSize: 10
  };
  recordItemsResponse!: IArrayResponse<RecordItem>;
  
  dialogRef = inject(MatDialogRef<RecordsListDialogComponent>);
  data = inject<{ tag: string }>(MAT_DIALOG_DATA);
  recordsService = inject(RecordsService);
  cdr = inject(ChangeDetectorRef);

  selectedOptionChange($event: MatButtonToggleChange) {
    this.selectedOption = $event.value;
    this.refreshRecords();
  }

  f() {
    console.log(this.paginator);
    console.log(this.paginator.length);
    console.log(this.paginator.pageSize);
    console.log(this.paginator.pageIndex  );
  }

  paginationParamsChanged(obj: PageEvent) {
    console.log('g ', obj);
    this.arrayParams.pageSize = obj.pageSize;
    this.arrayParams.offset = obj.pageSize * obj.pageIndex;
    this.refreshRecords();
  }

  refreshRecords() {
    if (this.selectedOption === 'node') {
      this.records$ = this.recordsService.getRecords(this.arrayParams, this.data.tag);
      // this.records$ = this.recordsService.getRecords(this.arrayParams);

    } else
    if (this.selectedOption === 'all') {
      this.records$ = this.recordsService.getRecords(this.arrayParams);
    } else {
      this.records$ = this.recordsService.getRecords(this.arrayParams);
    }
    this.records$.subscribe(resp => {
      console.log('resp length', resp.arrInfo);
      this.recordItemsResponse = resp;
    });

    this.cdr.detectChanges();
  }

}
