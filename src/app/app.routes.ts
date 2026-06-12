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
import { LongTasksComponent } from "./components/pages/long-tasks/long-tasks.component";
import { LongTaskComponent } from "./components/containers/long-task/long-task.component";
import { longTaskResolver } from "./resolvers/long-task.resolver";
import { DirectionsComponent } from "./components/pages/directions/directions.component";
import { DirectionComponent } from "./components/containers/direction/direction.component";
import { DirectionStatsComponent } from "./components/pages/direction-stats/direction-stats.component";
import { directionResolver } from "./resolvers/direction.resolver";

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
  {
    path: 'long-task/:id',
    component: LongTaskComponent,
    resolve: { longTask: longTaskResolver },
    runGuardsAndResolvers: 'paramsChange',
  },
  {path: 'long-tasks', component: LongTasksComponent},
  {path: 'directions', component: DirectionsComponent},
  {
    path: 'direction/:id',
    component: DirectionComponent,
    resolve: { direction: directionResolver },
    runGuardsAndResolvers: 'paramsChange',
  },
  {
    path: 'direction/:id/stats',
    component: DirectionStatsComponent,
    resolve: { direction: directionResolver },
    runGuardsAndResolvers: 'paramsChange',
  },
  {path: 'help', component: HelpComponent},
];
