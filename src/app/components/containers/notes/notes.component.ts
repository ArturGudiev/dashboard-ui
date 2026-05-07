import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  input,
  OnInit,
  signal,
  output,
  viewChild,
  inject,
} from '@angular/core';
import { Observable } from "rxjs";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { FormsModule } from "@angular/forms";

import { MaterialModule } from "../../../modules/material/material.module";

@UntilDestroy()
@Component({
  selector: 'app-notes',
  imports: [
    MaterialModule,
    FormsModule
  ],
  templateUrl: './notes.component.html',
  standalone: true,
  styleUrls: ['./notes.component.sass']
})
export class NotesComponent implements OnInit {
  editValue = signal<boolean>(false);
  notes = input<string>('');
  toggleEditEvent = input.required<Observable<void>>();
  updateNotes = output<string>();
  valueText = viewChild<ElementRef>('valueText');

  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.toggleEditEvent().pipe(untilDestroyed(this)).subscribe(() => this.editNotesValue());
  }


  updateNotesValue() {
    const valueText = this.valueText();
    if (valueText && valueText.nativeElement && valueText.nativeElement.value !== this.notes()) {
      this.updateNotes.emit(valueText.nativeElement.value)
    }
    this.editValue.set(false);
  }

  toggleEditValue() {
    this.editValue.set(!this.editValue());
    this.cdr.detectChanges(); // without it it won't focus automatically todo find out why

    if (this.editValue()) {
      this.valueText()?.nativeElement.focus();
    }
  }

  private editNotesValue() {
    this.updateNotesValue();
    this.toggleEditValue();
  }

  onFocusIn() {
    const valueText = this.valueText();
    if (valueText && valueText.nativeElement) {
      valueText.nativeElement.selectionStart = this.notes() ? this.notes().length : 0;
      valueText.nativeElement.selectionEnd = this.notes() ? this.notes().length : 0;
    }
  }
}
