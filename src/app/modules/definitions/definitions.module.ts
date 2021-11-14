import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DefinitionsRoutingModule } from './definitions-routing.module';
import { DefinitionComponent } from './definition/definition.component';
import {SharedModule} from "../../shared/shared.module";
import {FormsModule} from "@angular/forms";
import {DashboardMaterialModule} from "../../shared/material/dashboard-material.module";


@NgModule({
  declarations: [
    DefinitionComponent
  ],
  imports: [
    CommonModule,
    SharedModule,
    FormsModule,
    DashboardMaterialModule,
    DefinitionsRoutingModule
  ]
})
export class DefinitionsModule { }
