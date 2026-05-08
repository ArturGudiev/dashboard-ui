import { Routes } from '@angular/router';
import { MainPageComponent } from "./components/pages/main-page/main-page.component";
import { TaskComponent } from "./components/containers/task/task.component";
import { ProblemComponent } from "./components/containers/problem/problem.component";
import { StoryComponent } from "./components/containers/story/story.component";
import { EpicComponent } from "./components/containers/epic/epic.component";
import { EpicsComponent } from "./components/pages/epics/epics.component";
import { HelpComponent } from "./components/pages/help/help.component";
import { QuestionComponent } from "./components/containers/question/question.component";
import { RepetitiveTasksComponent } from "./components/pages/repetitive-tasks/repetitive-tasks.component";

export const routes: Routes = [
  {path: '', component: MainPageComponent},
  { path: 'task/:id', component: TaskComponent},
  {path: 'question/:id', component: QuestionComponent},
  {path: 'problem/:id', component: ProblemComponent},
  {path: 'story/:id', component: StoryComponent},
  {path: 'epic/:id', component: EpicComponent},
  {path: 'epics', component: EpicsComponent},
  {path: 'repetitive-tasks', component: RepetitiveTasksComponent},
  {path: 'help', component: HelpComponent},
];
