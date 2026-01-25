import { Injectable } from '@angular/core';
import { MatSnackBar } from "@angular/material/snack-bar";

@Injectable({
  providedIn: 'root'
})
export class MessageService {

  constructor(
    private snackBar: MatSnackBar,
  ) { }

  showMessage(message: string) {
    this.snackBar.open(message, 'Splash', {
      horizontalPosition: 'center', //start, end, left, right
      verticalPosition: 'bottom',  // top, bottom
    });
  }
}
