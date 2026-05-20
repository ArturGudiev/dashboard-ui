import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  input,
  OnInit,
  signal,
  output,
  viewChild,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Observable } from "rxjs";
import { FormsModule } from "@angular/forms";

import { MatFormFieldModule } from "@angular/material/form-field";
import { MatInputModule } from "@angular/material/input";

@Component({
  selector: 'app-notes',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    FormsModule
  ],
  templateUrl: './notes.component.html',
  standalone: true,
  styleUrls: ['./notes.component.sass'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotesComponent implements OnInit {
  editValue = signal<boolean>(false);
  notes = input<string>('');
  toggleEditEvent = input.required<Observable<void>>();
  updateNotes = output<string>();
  valueText = viewChild<ElementRef>('valueText');

  private destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.toggleEditEvent().pipe(takeUntilDestroyed(this.destroyRef)).subscribe(() => this.editNotesValue());
  }

  updateNotesValue() {
    const valueText = this.valueText();
    if (valueText && valueText.nativeElement && valueText.nativeElement.value !== this.notes()) {
      this.updateNotes.emit(valueText.nativeElement.value)
    }
    this.editValue.set(false);
  }

  toggleEditValue() {
    this.editValue.update(value => !value);

    if (this.editValue()) {
      afterNextRender(() => this.valueText()?.nativeElement.focus());
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
