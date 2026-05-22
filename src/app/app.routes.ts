import { type Routes } from '@angular/router';
import { MainPageComponent } from "./components/pages/main-page/main-page.component";
import { TaskComponent } from "./components/containers/task/task.component";
import { taskResolver } from "./resolvers/task.resolver";
import { ProblemComponent } from "./components/containers/problem/problem.component";
import { problemResolver } from "./resolvers/problem.resolver";
import { StoryComponent } from "./components/containers/story/story.component";
import { storyResolver } from "./resolvers/story.resolver";
import { EpicComponent } from "./components/containers/epic/epic.component";
import { epicResolver } from "./resolvers/epic.resolver";
import { EpicsComponent } from "./components/pages/epics/epics.component";
import { HelpComponent } from "./components/pages/help/help.component";
import { QuestionComponent } from "./components/containers/question/question.component";
import { questionResolver } from "./resolvers/question.resolver";
import { RepetitiveTasksComponent } from "./components/pages/repetitive-tasks/repetitive-tasks.component";

export const routes: Routes = [
  {path: '', component: MainPageComponent},
  {
    path: 'task/:id',
    component: TaskComponent,
    resolve: { task: taskResolver },
    runGuardsAndResolvers: 'paramsChange',
  },
  {
    path: 'question/:id',
    component: QuestionComponent,
    resolve: { question: questionResolver },
    runGuardsAndResolvers: 'paramsChange',
  },
  {
    path: 'problem/:id',
    component: ProblemComponent,
    resolve: { problem: problemResolver },
    runGuardsAndResolvers: 'paramsChange',
  },
  {
    path: 'story/:id',
    component: StoryComponent,
    resolve: { story: storyResolver },
    runGuardsAndResolvers: 'paramsChange',
  },
  {
    path: 'epic/:epicId',
    component: EpicComponent,
    resolve: { epic: epicResolver },
    runGuardsAndResolvers: 'paramsChange',
  },
  {path: 'epics', component: EpicsComponent},
  {path: 'repetitive-tasks', component: RepetitiveTasksComponent},
  {path: 'help', component: HelpComponent},
];
