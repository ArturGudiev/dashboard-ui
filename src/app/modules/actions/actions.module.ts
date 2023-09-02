import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {ActionComponent} from './action/action.component';
import {ActionsRoutingModule} from "./actions-routing.module";
import {SharedModule} from "../../shared/shared.module";
import {FormsModule} from "@angular/forms";
import {QuillModule} from 'ngx-quill'

import {HttpClientModule} from "@angular/common/http";
import {DashboardMaterialModule} from "../../shared/material/dashboard-material.module";
import {HighlightModule} from "ngx-highlightjs";
import { NewActionComponent } from './new-action/new-action.component';
import {RouterModule} from "@angular/router";


@NgModule({
  declarations: [
    ActionComponent,
    NewActionComponent
  ],
    imports: [
        CommonModule,
        SharedModule,
        DashboardMaterialModule,
        ActionsRoutingModule,
        FormsModule,
        SharedModule,
        HttpClientModule,
        QuillModule.forRoot(),
        HighlightModule,

    ]
})
export class ActionsModule { }
