import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {ProblemComponent} from "./problem/problem.component";
import {ProblemsListComponent} from "./problems-list/problems-list.component";


const routes: Routes = [
  {
    path: '',
    children: [
      {path: ':id', component: ProblemComponent},
      {path: '', component: ProblemsListComponent}
    ]
  },
  {path: '**', redirectTo: ''},
];
@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProblemsRoutingModule { }
