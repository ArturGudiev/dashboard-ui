import { Routes } from '@angular/router';
import { MainPageComponent } from "./components/main-page/main-page.component";
import { TaskComponent } from "./components/tasks/task/task.component";
import { ProblemComponent } from "./components/problems/problem/problem.component";
import { StoryComponent } from "./components/story/story.component";
import { EpicComponent } from "./components/epics/epic/epic.component";
import { EpicsComponent } from "./components/epics/epics.component";
import { HelpComponent } from "./components/help/help.component";
import { QuestionComponent } from "./components/questions/question/question.component";

export const routes: Routes = [
  {path: '', component: MainPageComponent},
  // {path: 'epic', loadChildren: () => import('./modules/epics/epics.module').then(m => m.EpicsModule)},
  { path: 'task/:id', component: TaskComponent},
  // {path: 'question', loadChildren: () => import('./modules/questions/questions.module').then(m => m.QuestionsModule)},
  // {path: 'questions', loadChildren: () => import('./modules/questions/questions.module').then(m => m.QuestionsModule)},
  {path: 'question/:id', component: QuestionComponent},
  {path: 'problem/:id', component: ProblemComponent},
  {path: 'story/:id', component: StoryComponent},
  {path: 'epic/:id', component: EpicComponent},
  {path: 'epics', component: EpicsComponent},
  {path: 'help', component: HelpComponent},

  // {path: 'memory-node/:id', component: MemoryNodeComponent, resolve: {memoryNode: memoryNodeResolverResolver}, canActivate: [authGuard]},
  // {path: 'card-inspector/:id', component: CardInspectorComponent, resolve: {card: cardResolver}, canActivate: [authGuard]},
];
