import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { KnowledgeRoutingModule } from './knowledge-routing.module';
import { KnowledgeComponent } from './knowledge/knowledge.component';
import {SharedModule} from "../../shared/shared.module";
import {DashboardMaterialModule} from "../../shared/material/dashboard-material.module";
import {FormsModule} from "@angular/forms";
import {QuillModule} from "ngx-quill";
import {HighlightModule} from "ngx-highlightjs";


@NgModule({
  declarations: [
    KnowledgeComponent
  ],
  imports: [
    SharedModule,
    CommonModule,
    FormsModule,
    KnowledgeRoutingModule,
    DashboardMaterialModule,
    QuillModule.forRoot(),
    HighlightModule,
  ]
})
export class KnowledgeModule { }
