import {NgModule} from '@angular/core';
import {RouterModule, Routes} from "@angular/router";
import {ActionComponent} from "./action/action.component";

const routes: Routes = [
  { path: '',
    children: [
      {path: ':id', component: ActionComponent},
      {path: '', component: ActionComponent}
    ] },
  { path: '**', redirectTo: '' },
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ActionsRoutingModule { }
