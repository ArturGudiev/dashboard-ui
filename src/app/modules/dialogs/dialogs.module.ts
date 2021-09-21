import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavToTaskDialogComponent } from './nav-to-task-dialog/nav-to-task-dialog.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MaterialModule} from "../../shared/material/material.module";



@NgModule({
  declarations: [
    NavToTaskDialogComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    MaterialModule,
    ReactiveFormsModule,
  ]
})
export class DialogsModule { }
