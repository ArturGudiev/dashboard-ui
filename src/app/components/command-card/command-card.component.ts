import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {CommandsService} from "../../services/commands.service";
import {animate, state, style, transition, trigger} from "@angular/animations";

@Component({
  selector: 'app-command-card',
  templateUrl: './command-card.component.html',
  styleUrls: ['./command-card.component.sass'],
  animations: [
    trigger('openClose', [
      state('open', style({
        opacity: 1,
      })),
      state('closed', style({
        opacity: 0.2,
      })),
      transition('open <=> closed', [
        animate('4s')
      ])])
  ]
})
export class CommandCardComponent implements OnInit {
  myForm = new FormGroup({
    command: new FormControl(null, [
      Validators.required
    ]),
  });

  @Output() closeCard = new EventEmitter();

  constructor(private commandsService: CommandsService) {
  }

  ngOnInit(): void {
  }

  onSubmit() {
    this.commandsService.setCommand(this.myForm.value.command);
    this.closeCard.emit();
  }

  onNoClick() {
    this.closeCard.emit();
  }

  focusOutFunction() {
    this.closeCard.emit();
  }
}
