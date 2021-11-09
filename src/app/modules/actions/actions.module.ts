import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActionComponent } from './action/action.component';
import {ActionsRoutingModule} from "./actions-routing.module";



@NgModule({
  declarations: [
    ActionComponent
  ],
  imports: [
    CommonModule,
    ActionsRoutingModule
  ]
})
export class ActionsModule { }
