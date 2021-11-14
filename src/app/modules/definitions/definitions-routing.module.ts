import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {DefinitionComponent} from "./definition/definition.component";

const routes: Routes = [
  { path: '',
    children: [
      {path: ':id', component: DefinitionComponent},
      {path: '', component: DefinitionComponent}
    ] },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DefinitionsRoutingModule { }
