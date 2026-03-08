import { Injectable } from '@angular/core';
import { Observable } from "rxjs";
import { SetDisabledHotkeys } from "../state/app.actions";
import { SelectFromListDialog } from "../components/dialogs/select-from-list-dialog/select-from-list-dialog.component";
import { Store } from "@ngxs/store";
import { MatDialog } from "@angular/material/dialog";
import { TaskContainerService } from "./task-container-services/task-container.service";
import { tap } from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class UtilsService {

  constructor(
    private store: Store,
    private dialog: MatDialog,
    private taskContainerService: TaskContainerService,
  ) { }

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

}
