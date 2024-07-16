import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HotkeyModule } from "angular2-hotkeys";
import { NotesComponent } from './components/notes/notes.component';
import { ParentsPathComponent } from './components/parents-path/parents-path.component';
import { SubproblemsComponent } from './components/subproblems/subproblems.component';
import { SubquestionsComponent } from './components/subquestions/subquestions.component';
import { SubStoriesComponent } from './components/substories/sub-stories.component';
import { TasksListComponent } from './components/tasks-list/tasks-list.component';
import { TaskContainerDescriptionComponent } from './components/task-container-description/task-container-description.component';
import { TaskContainerComponent } from './components/task-container/task-container.component';
import { HoverClassDirective } from './directives/hover-class.directive';
import { DashboardMaterialModule } from "./material/dashboard-material.module";
import { EpicsListComponent } from './components/epics-list/epics-list.component';
import { MultitaskingComponent } from './components/multitasking/multitasking.component';
import { MultitaskingItemComponent } from './components/multitasking-item/multitasking-item.component';



@NgModule({
  declarations: [
    TasksListComponent,
    ParentsPathComponent,
    TaskContainerDescriptionComponent,
    SubStoriesComponent,
    SubproblemsComponent,
    SubquestionsComponent,
    NotesComponent,
    HoverClassDirective,
    TaskContainerComponent,
    EpicsListComponent,
    MultitaskingComponent,
    MultitaskingItemComponent
  ],
    exports: [
        TasksListComponent,
        ParentsPathComponent,
        TaskContainerDescriptionComponent,
        SubStoriesComponent,
        SubproblemsComponent,
        SubquestionsComponent,
        NotesComponent,
        TaskContainerComponent,
        MultitaskingComponent
    ],
  imports: [
    CommonModule,
    FormsModule,
    HotkeyModule,
    DashboardMaterialModule,
    ReactiveFormsModule,
  ]
})
export class SharedModule { }
