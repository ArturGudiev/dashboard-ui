import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';

@Component({
  selector: 'app-parents-path',
  templateUrl: './parents-path.component.html',
  styleUrls: ['./parents-path.component.sass']
})
export class ParentsPathComponent implements OnInit {

  @Input() parentsPath: string[];
  @Output() onParentClick = new EventEmitter<string>();
  constructor() { }

  ngOnInit(): void {
  }

}
