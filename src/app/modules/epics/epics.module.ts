import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EpicComponent } from './epic/epic.component';
import { EpicsListComponent } from './epics-list/epics-list.component';
import {EpicsRoutingModule} from "./epics-routing.module";
import {SharedModule} from "../../shared/shared.module";
import {DragDropModule} from "@angular/cdk/drag-drop";
import {DashboardMaterialModule} from "../../shared/material/dashboard-material.module";



@NgModule({
  declarations: [
    EpicComponent,
    EpicsListComponent
  ],
    imports: [
        CommonModule,
        EpicsRoutingModule,
        SharedModule,
        DragDropModule,
        DashboardMaterialModule
    ]
})
export class EpicsModule { }
