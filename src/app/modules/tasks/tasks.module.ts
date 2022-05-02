import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RouterModule, Routes} from '@angular/router';
import { TaskComponent } from './task/task.component';
import { TasksListComponent } from './tasks-list/tasks-list.component';
import {DashboardMaterialModule} from '../../shared/material/dashboard-material.module';
import { NewTaskDialogComponent } from './new-task-dialog/new-task-dialog.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {SharedModule} from "../../shared/shared.module";


const routes: Routes = [
  { path: '',
    children: [
      {path: ':id', component: TaskComponent},
      {path: '', component: TasksListComponent}
    ] },
  { path: '**', redirectTo: '' },
];

@NgModule({
  declarations: [
    TaskComponent,
    TasksListComponent,
    NewTaskDialogComponent
  ],
  imports: [
    DashboardMaterialModule,
    FormsModule,
    CommonModule,
    ReactiveFormsModule,
    SharedModule,
    RouterModule.forChild(routes),
  ]
})
export class TasksModule { }
