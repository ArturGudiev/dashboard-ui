import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SubtasksComponent } from './components/subtasks/subtasks.component';
import {MaterialModule} from "./material/material.module";
import { ParentsPathComponent } from './components/parents-path/parents-path.component';
import { TaskContainerDescriptionComponent } from './components/task-container-description/task-container-description.component';



@NgModule({
  declarations: [
    SubtasksComponent,
    ParentsPathComponent,
    TaskContainerDescriptionComponent
  ],
    exports: [
        SubtasksComponent,
        ParentsPathComponent,
        TaskContainerDescriptionComponent
    ],
  imports: [
    CommonModule,
    MaterialModule
  ]
})
export class SharedModule { }
