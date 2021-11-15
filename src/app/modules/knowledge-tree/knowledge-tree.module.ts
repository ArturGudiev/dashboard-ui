import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { KnowledgeTreeRoutingModule } from './knowledge-tree-routing.module';
import { KnowledgeNodeComponent } from './knowledge-node/knowledge-node.component';
import {SharedModule} from "../../shared/shared.module";
import {DashboardMaterialModule} from "../../shared/material/dashboard-material.module";


@NgModule({
  declarations: [
    KnowledgeNodeComponent
  ],
  imports: [
    CommonModule,
    KnowledgeTreeRoutingModule,
    DashboardMaterialModule,
    SharedModule
  ]
})
export class KnowledgeTreeModule { }
