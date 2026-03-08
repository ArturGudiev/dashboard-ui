/**
 * Диалоговое окно для выбора значения из списка
 */
import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { CommandsService } from "../../../services/commands.service";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";

@UntilDestroy()
@Component({
  selector: 'app-select-from-list-dialog',
  standalone: true,
  imports: [],
  templateUrl: './select-from-list-dialog.component.html',
  styleUrl: './select-from-list-dialog.component.scss'
})
export class SelectFromListDialog implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<SelectFromListDialog>,
    private commandsService: CommandsService,
    @Inject(MAT_DIALOG_DATA) public data: { values: string[] }
  ) { }

  /**
   * Инициалиазция компонента
   */
  ngOnInit(): void {
    this.commandsService.getDataStateChange().pipe(untilDestroyed(this)).subscribe(state => {
      this.handleCommand(state.command);
    })
  }


  /**
   * Метод закрывает диалоговое окно со значением, выбранным из списка
   */
  closeDialogWithSelectedItem(content: string) {
    this.dialogRef.close(content);
  }

  /**
   *  Обработка горячих клавиш в диалоге
   */
  handleCommand(command: string) {
    if (Number.isInteger(+command)) {
      const index = +command;
      if (index >= 1 && index <= this.data.values.length) {
        this.closeDialogWithSelectedItem(this.data.values[index - 1]);
      }
    }
  }
}
