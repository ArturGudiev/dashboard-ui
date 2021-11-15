import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {KnowledgeNodeComponent} from "./knowledge-node/knowledge-node.component";

const routes: Routes = [
  { path: 'node',
    children: [
      {path: ':id', component: KnowledgeNodeComponent},
      {path: '', redirectTo: '1'},
    ] },
  { path: '**', redirectTo: 'node' },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class KnowledgeTreeRoutingModule { }
