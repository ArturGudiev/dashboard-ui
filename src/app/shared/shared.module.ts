import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SubtasksComponent } from './components/subtasks/subtasks.component';
import {MaterialModule} from "./material/material.module";
import { ParentsPathComponent } from './components/parents-path/parents-path.component';



@NgModule({
  declarations: [
    SubtasksComponent,
    ParentsPathComponent
  ],
    exports: [
        SubtasksComponent,
        ParentsPathComponent
    ],
  imports: [
    CommonModule,
    MaterialModule
  ]
})
export class SharedModule { }
