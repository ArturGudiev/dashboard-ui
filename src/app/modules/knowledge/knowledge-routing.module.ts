import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {KnowledgeComponent} from "./knowledge/knowledge.component";

const routes: Routes = [
  { path: '',
    children: [
      // {path: 'new', component: NewKnowledgeComponent},
      {path: ':id', component: KnowledgeComponent},
      {path: '', component: KnowledgeComponent}
    ] },
  { path: '**', redirectTo: '' },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class KnowledgeRoutingModule { }
