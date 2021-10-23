import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavToDialogComponent } from './nav-to-task-dialog/nav-to-dialog.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {MaterialModule} from "../../shared/material/material.module";
import { CommandDialogComponent } from './command-dialog/command-dialog.component';
import { GetValueDialogComponent } from './get-value/get-value-dialog.component';



@NgModule({
  declarations: [
    NavToDialogComponent,
    CommandDialogComponent,
    GetValueDialogComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    MaterialModule,
    ReactiveFormsModule,
  ]
})
export class DialogsModule { }
