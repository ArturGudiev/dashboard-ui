import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SubtasksComponent } from './components/subtasks/subtasks.component';
import {MaterialModule} from "./material/material.module";
import { ParentsPathComponent } from './components/parents-path/parents-path.component';
import { TaskContainerDescriptionComponent } from './components/task-container-description/task-container-description.component';
import { SubStoriesComponent } from './components/substories/sub-stories.component';
import { SubproblemsComponent } from './components/subproblems/subproblems.component';
import { SubquestionsComponent } from './components/subquestions/subquestions.component';
import { SubdefinitionsComponent } from './components/subdefinitions/subdefinitions.component';



@NgModule({
  declarations: [
    SubtasksComponent,
    ParentsPathComponent,
    TaskContainerDescriptionComponent,
    SubStoriesComponent,
    SubproblemsComponent,
    SubquestionsComponent,
    SubdefinitionsComponent
  ],
    exports: [
        SubtasksComponent,
        ParentsPathComponent,
        TaskContainerDescriptionComponent,
        SubStoriesComponent,
        SubproblemsComponent,
        SubquestionsComponent,
        SubdefinitionsComponent
    ],
  imports: [
    CommonModule,
    MaterialModule
  ]
})
export class SharedModule { }
