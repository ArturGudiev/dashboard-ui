/**
 * Диалоговое окно для выбора значения из списка
 */
import { Component, DestroyRef, HostListener, Inject, type OnInit, signal, inject , ChangeDetectionStrategy} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { CommandsService } from "../../../services/commands.service";
import { NgClass } from "@angular/common";

export interface SelectFromListDialogData<T = string> {
  returnWithIndex: boolean,
  values: T[];
  mapFunction?: (item: T) => string;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-select-from-list-dialog',
  imports: [
    NgClass
  ],
  standalone: true,
  template:`
    <div id="items-wrapper">
      @for (content of data.values; track $index) {
        <div
          class="value-item"
          [ngClass]="{'selected-item': selectedIndex() === $index}"
          (click)="closeDialogWithSelectedItem(content)"
        >
          {{$index + 1}}. {{ data.mapFunction ? data.mapFunction(content) : content }}
        </div>
      }
    </div>
  `,
  styleUrl: './select-from-list-dialog.component.scss'
})
export class SelectFromListDialog<T> implements OnInit {
  selectedIndex = signal(0);

  private dialogRef = inject(MatDialogRef<SelectFromListDialog<T>>);
  private commandsService = inject(CommandsService);
  private destroyRef = inject(DestroyRef);
  @Inject(MAT_DIALOG_DATA) public data = inject<SelectFromListDialogData<T>>(MAT_DIALOG_DATA);


  constructor() {
    this.selectedIndex.set(this.data.values.length - 1);
  }


  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent) {
    if (event.key === 'ArrowDown') {
      this.moveSelection(1);
      event.preventDefault(); // Чтобы не прокручивалась страница
    } else if (event.key === 'ArrowUp') {
      this.moveSelection(-1);
      event.preventDefault();
    } else if (event.key === 'Enter') {
      this.closeDialogWithSelectedItem(this.data.values[this.selectedIndex()]);
    }
  }

  private moveSelection(val: number) {
    const newVal = this.selectedIndex() + val;
    if (newVal >= 0 && newVal < this.data.values.length) {
      this.selectedIndex.set(newVal);
    }
  }

  /**
   * Инициализация компонента
   */
  ngOnInit(): void {
    this.commandsService.getDataStateChange().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(state => {
      this.handleCommand(state.command);
    })
  }


  /**
   * Метод закрывает диалоговое окно со значением, выбранным из списка
   */
  closeDialogWithSelectedItem(content: T) {
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
