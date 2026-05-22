import { inject, Injectable } from '@angular/core';
import { type Observable } from "rxjs";
import { AppStore } from "../state/app.store";
import { SelectFromListDialog } from "../components/dialogs/select-from-list-dialog/select-from-list-dialog.component";
import { MatDialog } from "@angular/material/dialog";
import { map, tap } from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class UtilsService {

  private appStore = inject(AppStore);
  private dialog = inject(MatDialog);

  selectFromList(values: string[]): Observable<string> {
    this.appStore.setDisabledHotkeys(true);
    const dialogRef = this.dialog.open(SelectFromListDialog,
      {
        data: {
          values: values
        },
        height: '600px',
        width: '1000px'
      });
    return dialogRef.afterClosed().pipe(tap(
      () => this.appStore.setDisabledHotkeys(false)
    ));
  }

  selectIndexFromList(values: string[]): Observable<number> {
    this.appStore.setDisabledHotkeys(true);
    const dialogRef = this.dialog.open(SelectFromListDialog,
      {
        data: {
          values: values.map((el, index) => ({ index, value: el })),
          mapFunction: (el: {index: number, value: string}) => el.value
        },
        height: '600px',
        width: '1000px'
      });
    return dialogRef.afterClosed().pipe(
      map((el) => el.index),
      tap(() => this.appStore.setDisabledHotkeys(false))
    );
  }


}
