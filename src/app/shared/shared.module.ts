import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SubtasksComponent } from './components/subtasks/subtasks.component';
import {MaterialModule} from "./material/material.module";



@NgModule({
  declarations: [
    SubtasksComponent
  ],
  exports: [
    SubtasksComponent
  ],
  imports: [
    CommonModule,
    MaterialModule
  ]
})
export class SharedModule { }
