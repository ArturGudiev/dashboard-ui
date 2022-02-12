import {
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import {Observable, Subscription} from "rxjs";

@Component({
  selector: 'app-notes',
  templateUrl: './notes.component.html',
  styleUrls: ['./notes.component.sass']
})
export class NotesComponent implements OnInit, OnDestroy {
  editValue = false;
  @Input() notes: string = '';
  @Input() toggleEditEvent: Observable<void>;
  @Output() updateNotes = new EventEmitter();
  @ViewChild('valueText') valueText: ElementRef;
  private eventsSubscription: Subscription;

  constructor(private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.eventsSubscription = this.toggleEditEvent.subscribe(() => this.editNotesValue());
  }


  ngOnDestroy() {
    this.eventsSubscription.unsubscribe();
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

    // todo unfocus below doesn't work find out why
    // if (!this.editValue && this.valueText && this.valueText.nativeElement) {
    //   setTimeout(() => this.valueText.nativeElement.blur(), 30);
    //   this.cdr.detectChanges();
    // }

    // todo if use code below focus will be in the beginning
    // this.editValue = true;
    // setTimeout(() => {
    //   if(this.valueText && this.valueText.nativeElement){
    //     this.valueText.nativeElement.focus();
    //   }
    //   this.cdr.detectChanges(); // without it it won't focus automatically todo find out why
    // }, 25)
  }
}
