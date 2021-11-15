import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { QuestionsRoutingModule } from './questions-routing.module';
import { QuestionComponent } from './question/question.component';
import {SharedModule} from "../../shared/shared.module";
import {DashboardMaterialModule} from "../../shared/material/dashboard-material.module";


@NgModule({
  declarations: [
    QuestionComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    DashboardMaterialModule,
    QuestionsRoutingModule
  ]
})
export class QuestionsModule { }
