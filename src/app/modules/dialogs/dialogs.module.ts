import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavToDialogComponent } from './nav-to-task-dialog/nav-to-dialog.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MaterialModule} from "../../shared/material/material.module";



@NgModule({
  declarations: [
    NavToDialogComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    MaterialModule,
    ReactiveFormsModule,
  ]
})
export class DialogsModule { }
