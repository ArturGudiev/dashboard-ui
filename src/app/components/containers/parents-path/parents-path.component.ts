import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import { NgForOf, NgStyle } from "@angular/common";
import { MaterialModule } from "../../../modules/material/material.module";

@Component({
  selector: 'app-parents-path',
  standalone: true,
  imports: [
    MaterialModule,
    NgStyle,
    NgForOf
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

}
