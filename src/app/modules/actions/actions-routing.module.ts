import {NgModule} from '@angular/core';
import {RouterModule, Routes} from "@angular/router";
import {ActionComponent} from "./action/action.component";
import {NewActionComponent} from "./new-action/new-action.component";

const routes: Routes = [
  { path: '',
    children: [
      {path: 'new', component: NewActionComponent},
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
