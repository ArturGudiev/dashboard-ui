import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from "@angular/forms";
import { HotkeyModule } from "angular2-hotkeys";
import { KnowledgeSubnodesComponent } from './components/knowledge-subnodes/knowledge-subnodes.component';
import { NotesComponent } from './components/notes/notes.component';
import { ParentsPathComponent } from './components/parents-path/parents-path.component';
import { SubactionsComponent } from './components/subactions/subactions.component';
import { SubdefinitionsComponent } from './components/subdefinitions/subdefinitions.component';
import { SubknowledgeComponent } from './components/subknowledge/subknowledge.component';
import { SubproblemsComponent } from './components/subproblems/subproblems.component';
import { SubquestionsComponent } from './components/subquestions/subquestions.component';
import { SubStoriesComponent } from './components/substories/sub-stories.component';
import { SubtasksComponent } from './components/subtasks/subtasks.component';
import { TaskContainerDescriptionComponent } from './components/task-container-description/task-container-description.component';
import { TaskContainerComponent } from './components/task-container/task-container.component';
import { HoverClassDirective } from './directives/hover-class.directive';
import { DashboardMaterialModule } from "./material/dashboard-material.module";
import { EpicsListComponent } from './components/epics-list/epics-list.component';



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
    EpicsListComponent
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
