import {NgModule} from '@angular/core';
import {RouterModule, Routes} from "@angular/router";
import {EpicComponent} from "./epic/epic.component";
import {EpicsListComponent} from "./epics-list/epics-list.component";

const routes: Routes = [
  { path: '',
    children: [
      {path: ':id', component: EpicComponent},
      {path: '', component: EpicsListComponent}
    ] },
  { path: '**', redirectTo: '' },
];


@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EpicsRoutingModule { }
