import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {QuestionComponent} from "./question/question.component";
import {QuestionsComponent} from "./questions/questions.component";

const routes: Routes = [
  {
    path: '',
    children: [
      {path: ':id', component: QuestionComponent},
      {path: '', component: QuestionsComponent}
    ]
  },
  {path: '**', redirectTo: ''},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class QuestionsRoutingModule { }
