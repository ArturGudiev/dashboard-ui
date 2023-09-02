import {Component, Inject, OnInit, ViewChild} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {RecordsService} from "../../../services/records.service";
import {Observable} from "rxjs";
import {RecordItem} from "../../../models/record-item";
import {MatPaginator} from "@angular/material/paginator";

type SelectedOptionType = 'node' | 'all' | 'node_plus_children';

@Component({
  selector: 'app-records-list-dialog',
  templateUrl: './records-list-dialog.component.html',
  styleUrls: ['./records-list-dialog.component.sass']
})
export class RecordsListDialogComponent implements OnInit {
  records$: Observable<RecordItem[]>;
  selectedOption: SelectedOptionType = 'all';
  @ViewChild('paginator') paginator: MatPaginator;
  constructor(
    private recordsService: RecordsService,
    public dialogRef: MatDialogRef<RecordsListDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { tag: string } ) { }

  ngOnInit(): void {
    console.log(this.data.tag);
    // this.records$ = this.recordsService.getRecords(this.data.tag)
    this.records$ = this.recordsService.getRecords();
  }

  selectedOptionChange(val: SelectedOptionType) {
    if (val === 'node') {
      this.records$ = this.recordsService.getRecords(this.data.tag);
    }
    if (val === 'all') {
      this.records$ = this.recordsService.getRecords();
    }
    console.log('selectedOptionChange', val);
  }

  f() {
    console.log(this.paginator);
    console.log(this.paginator.length);
    console.log(this.paginator.pageSize);
    console.log(this.paginator.pageIndex  );
  }
}
