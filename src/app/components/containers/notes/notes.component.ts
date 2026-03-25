import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild
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
    styleUrls: ['./notes.component.sass']
})
export class NotesComponent implements OnInit {
  editValue = false;
  @Input() notes: string = '';
  @Input({required: true}) toggleEditEvent!: Observable<void>;
  @Output() updateNotes = new EventEmitter();
  @ViewChild('valueText') valueText!: ElementRef;

  constructor(private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.toggleEditEvent.pipe(untilDestroyed(this)).subscribe(() => this.editNotesValue());
  }


  updateNotesValue() {
    if (this.valueText && this.valueText.nativeElement && this.valueText.nativeElement.value !== this.notes) {
      this.updateNotes.emit(this.valueText.nativeElement.value)
    }
    this.editValue = false;
  }

  toggleEditValue() {
    this.editValue = !this.editValue;
    this.cdr.detectChanges(); // without it it won't focus automatically todo find out why

    if (this.editValue) {
      this.valueText.nativeElement.focus();
    }
  }

  private editNotesValue() {
    this.updateNotesValue();
    this.toggleEditValue();
  }

  onFocusIn() {
    this.valueText.nativeElement.selectionStart = this.notes ? this.notes.length : 0;
    this.valueText.nativeElement.selectionEnd = this.notes ? this.notes.length : 0;
  }
}
