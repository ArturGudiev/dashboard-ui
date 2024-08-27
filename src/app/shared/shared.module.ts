import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NotesComponent } from './components/notes/notes.component';
import { ParentsPathComponent } from './components/parents-path/parents-path.component';
import { ProblemsListComponent } from './components/problems-list/problems-list.component';
import { SubStoriesComponent } from './components/substories/sub-stories.component';
import { TasksListComponent } from './components/tasks-list/tasks-list.component';
import { TaskContainerDescriptionComponent } from './components/task-container-description/task-container-description.component';
import { TaskContainerComponent } from './components/task-container/task-container.component';
import { HoverClassDirective } from './directives/hover-class.directive';
import { DashboardMaterialModule } from "./material/dashboard-material.module";
import { MultitaskingComponent } from './components/multitasking/multitasking.component';
import { MultitaskingItemComponent } from './components/multitasking-item/multitasking-item.component';
import { HotkeyModule } from "angular2-hotkeys";
import { QuestionsListComponent } from "./components/questions-list/questions-list.component";
import { EpicsListComponent } from "../components/lists/epics-list/epics-list.component";



@NgModule({
  declarations: [
    TasksListComponent,
    ParentsPathComponent,
    TaskContainerDescriptionComponent,
    SubStoriesComponent,
    ProblemsListComponent,
    QuestionsListComponent,
    NotesComponent,
    HoverClassDirective,
    TaskContainerComponent,
    MultitaskingComponent,
    MultitaskingItemComponent,
    TasksListComponent,
    TasksListComponent
  ],
  exports: [
    TasksListComponent,
    ParentsPathComponent,
    TaskContainerDescriptionComponent,
    SubStoriesComponent,
    ProblemsListComponent,
    QuestionsListComponent,
    NotesComponent,
    TaskContainerComponent,
    MultitaskingComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    HotkeyModule,
    DashboardMaterialModule,
    ReactiveFormsModule,
    EpicsListComponent,
  ]
})
export class SharedModule { } // TODO make all components standalone
