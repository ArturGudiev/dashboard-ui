import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SubtasksComponent } from './components/subtasks/subtasks.component';
import {DashboardMaterialModule} from "./material/dashboard-material.module";
import { ParentsPathComponent } from './components/parents-path/parents-path.component';
import { TaskContainerDescriptionComponent } from './components/task-container-description/task-container-description.component';
import { SubStoriesComponent } from './components/substories/sub-stories.component';
import { SubproblemsComponent } from './components/subproblems/subproblems.component';
import { SubquestionsComponent } from './components/subquestions/subquestions.component';
import { SubdefinitionsComponent } from './components/subdefinitions/subdefinitions.component';
import { SubactionsComponent } from './components/subactions/subactions.component';
import { SubknowledgeComponent } from './components/subknowledge/subknowledge.component';
import { KnowledgeSubnodesComponent } from './components/knowledge-subnodes/knowledge-subnodes.component';
import { NotesComponent } from './components/notes/notes.component';
import {FormsModule} from "@angular/forms";
import { HoverClassDirective } from './directives/hover-class.directive';
import { TaskContainerComponent } from './components/task-container/task-container.component';
import {HotkeyModule} from "angular2-hotkeys";



@NgModule({
  declarations: [
    SubtasksComponent,
    ParentsPathComponent,
    TaskContainerDescriptionComponent,
    SubStoriesComponent,
    SubproblemsComponent,
    SubquestionsComponent,
    SubdefinitionsComponent,
    SubactionsComponent,
    SubknowledgeComponent,
    KnowledgeSubnodesComponent,
    NotesComponent,
    HoverClassDirective,
    TaskContainerComponent,
  ],
    exports: [
        SubtasksComponent,
        ParentsPathComponent,
        TaskContainerDescriptionComponent,
        SubStoriesComponent,
        SubproblemsComponent,
        SubquestionsComponent,
        SubdefinitionsComponent,
        SubactionsComponent,
        SubknowledgeComponent,
        KnowledgeSubnodesComponent,
        NotesComponent,
        TaskContainerComponent
    ],
  imports: [
    CommonModule,
    FormsModule,
    HotkeyModule,
    DashboardMaterialModule
  ]
})
export class SharedModule { }
