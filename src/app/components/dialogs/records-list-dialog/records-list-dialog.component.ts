import { ChangeDetectionStrategy, Component, computed, inject, signal, ViewChild } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { RecordsService } from "../../../services/records.service";
import { type RecordItem } from "../../../models/record-item";
import { MatPaginator, type PageEvent } from "@angular/material/paginator";
import { type IArrayResponse } from "../../../services/api.service";
import { MatButtonToggle, type MatButtonToggleChange, MatButtonToggleGroup } from "@angular/material/button-toggle";
import { MatProgressSpinner } from "@angular/material/progress-spinner";
import { type IArrayParams } from "../../../models/interfaces/array-params";

type SelectedOptionType = 'node' | 'all' | 'node_plus_children';

@Component({
    selector: 'app-records-list-dialog',
    templateUrl: './records-list-dialog.component.html',
    imports: [
    MatProgressSpinner,
    MatButtonToggleGroup,
    MatButtonToggle,
    MatPaginator,
],
    styleUrls: ['./records-list-dialog.component.sass'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecordsListDialogComponent {
  readonly recordsResponse = signal<IArrayResponse<RecordItem> | null>(null);
  readonly recordsLength = computed(() => this.recordsResponse()?.arrInfo.length ?? 0);
  selectedOption: SelectedOptionType = 'all';
  @ViewChild('paginator') paginator!: MatPaginator;
  private arrayParams: IArrayParams = {
    offset: 0,
    pageSize: 10
  };

  dialogRef = inject(MatDialogRef<RecordsListDialogComponent>);
  data = inject<{ tag: string }>(MAT_DIALOG_DATA);
  recordsService = inject(RecordsService);

  constructor() {
    this.refreshRecords();
  }

  selectedOptionChange($event: MatButtonToggleChange) {
    this.selectedOption = $event.value;
    this.refreshRecords();
  }

  paginationParamsChanged(obj: PageEvent) {
    this.arrayParams.pageSize = obj.pageSize;
    this.arrayParams.offset = obj.pageSize * obj.pageIndex;
    this.refreshRecords();
  }

  refreshRecords() {
    const records$ = this.selectedOption === 'node'
      ? this.recordsService.getRecords(this.arrayParams, this.data.tag)
      : this.recordsService.getRecords(this.arrayParams);

    records$.subscribe(resp => this.recordsResponse.set(resp));
  }

}
