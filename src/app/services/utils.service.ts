import { inject, Injectable } from '@angular/core';
import { Observable } from "rxjs";
import { SetDisabledHotkeys } from "../state/app.actions";
import { SelectFromListDialog } from "../components/dialogs/select-from-list-dialog/select-from-list-dialog.component";
import { Store } from "@ngxs/store";
import { MatDialog } from "@angular/material/dialog";
import { map, tap } from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class UtilsService {

  private store = inject(Store);
  private dialog = inject(MatDialog);

  selectFromList(values: string[]): Observable<string> {
    this.store.dispatch(new SetDisabledHotkeys(true));
    const dialogRef = this.dialog.open(SelectFromListDialog,
      {
        data: {
          values: values
        },
        height: '600px',
        width: '1000px'
      });
    return dialogRef.afterClosed().pipe(tap(
      () => this.store.dispatch(new SetDisabledHotkeys(false))
    ));
  }

  selectIndexFromList(values: string[]): Observable<number> {
    this.store.dispatch(new SetDisabledHotkeys(true));
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
      tap(() => this.store.dispatch(new SetDisabledHotkeys(false)))
    );
  }


}
