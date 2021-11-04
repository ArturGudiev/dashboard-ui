import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProblemsRoutingModule } from './problems-routing.module';
import { ProblemComponent } from './problem/problem.component';
import {SharedModule} from "../../shared/shared.module";
import { ProblemsListComponent } from './problems-list/problems-list.component';
import {DashboardMaterialModule} from "../../shared/material/dashboard-material.module";


@NgModule({
  declarations: [
    ProblemComponent,
    ProblemsListComponent
  ],
  imports: [
    CommonModule,
    ProblemsRoutingModule,
    SharedModule,
    DashboardMaterialModule
  ]
})
export class ProblemsModule { }
