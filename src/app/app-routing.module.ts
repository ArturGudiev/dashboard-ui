import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {MainPageComponent} from "./components/main-page/main-page.component";

const routes: Routes = [
  {path: '',  component: MainPageComponent},
  {path: '/m', component: MainPageComponent},
  {path: 'epic', loadChildren: () => import('./modules/epics/epics.module').then(m => m.EpicsModule)},
  {path: 'problem', loadChildren: () => import('./modules/problems/problems.module').then(m => m.ProblemsModule)},
  {path: 'story', loadChildren: () => import('./modules/stories/stories.module').then(m => m.StoriesModule)},
  {path: 'task', loadChildren: () => import('./modules/tasks/tasks.module').then(m => m.TasksModule)},
  {path: 'tasks', redirectTo: 'task'},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
