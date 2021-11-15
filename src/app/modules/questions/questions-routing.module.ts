import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {QuestionComponent} from "./question/question.component";

const routes: Routes = [
  {
    path: '',
    children: [
      {path: ':id', component: QuestionComponent},
      {path: '', component: QuestionComponent}
    ]
  },
  {path: '**', redirectTo: ''},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class QuestionsRoutingModule { }
