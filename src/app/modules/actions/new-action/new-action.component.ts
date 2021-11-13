import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-new-action',
  templateUrl: './new-action.component.html',
  styleUrls: ['./new-action.component.sass']
})
export class NewActionComponent implements OnInit {

  constructor() { }

  ngOnInit(): void {
    console.log('NewActionComponent.ngOnInit');
  }

  f() {
    console.log('AAA');
  }
}
