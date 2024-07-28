import { Routes } from '@angular/router';
import { MainPageComponent } from "./components/main-page/main-page.component";

export const routes: Routes = [
  {path: '', component: MainPageComponent},
  // {path: 'epic', loadChildren: () => import('./modules/epics/epics.module').then(m => m.EpicsModule)},
  // {path: 'problem', loadChildren: () => import('./modules/problems/problems.module').then(m => m.ProblemsModule)},
  // {path: 'question', loadChildren: () => import('./modules/questions/questions.module').then(m => m.QuestionsModule)},
  // {path: 'questions', loadChildren: () => import('./modules/questions/questions.module').then(m => m.QuestionsModule)},
  // {path: 'story', loadChildren: () => import('./modules/stories/stories.module').then(m => m.StoriesModule)},
  // {path: 'task', loadChildren: () => import('./modules/tasks/tasks.module').then(m => m.TasksModule)},
];
