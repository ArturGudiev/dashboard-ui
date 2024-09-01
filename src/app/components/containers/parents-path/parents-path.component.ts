import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NgForOf, NgStyle } from "@angular/common";
import { MaterialModule } from "../../../modules/material/material.module";
import { LongClickDirectiveDirective } from "../../../directives/long-click-directive.directive";

@Component({
  selector: 'app-parents-path',
  standalone: true,
  imports: [
    MaterialModule,
    NgStyle,
    NgForOf,
    LongClickDirectiveDirective
  ],
  templateUrl: './parents-path.component.html',
  styleUrls: ['./parents-path.component.sass']
})
export class ParentsPathComponent implements OnInit {

  @Input() parentsPath: string[] = [];
  @Output() onParentClick = new EventEmitter<string>();
  constructor() { }

  ngOnInit(): void {
  }

  longClick() {
    console.log('longClick');
  }
}
