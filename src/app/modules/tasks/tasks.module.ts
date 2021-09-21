import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RouterModule, Routes} from '@angular/router';
import { TaskComponent } from './task/task.component';
import { TasksListComponent } from './tasks-list/tasks-list.component';
import {MaterialModule} from '../../shared/material/material.module';
import { NewTaskDialogComponent } from './new-task-dialog/new-task-dialog.component';
import {ReactiveFormsModule} from '@angular/forms';


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
    MaterialModule,
    CommonModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
  ]
})
export class TasksModule { }
