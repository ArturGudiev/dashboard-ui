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
import { StatesComponent } from "./components/pages/states/states.component";
import { StateComponent } from "./components/containers/state/state.component";
import { stateResolver } from "./resolvers/state.resolver";
import { StateRequirementComponent } from "./components/containers/state-requirement/state-requirement.component";
import { stateRequirementResolver } from "./resolvers/state-requirement.resolver";
import { LoginComponent } from "./components/pages/login/login.component";
import { SidenavComponent } from "./components/pages/sidenav/sidenav.component";
import { DueDateTasksComponent } from "./components/pages/due-date-tasks/due-date-tasks.component";
import { FileComponent } from "./components/pages/file/file.component";
import { KnowledgeNodeComponent } from "./components/containers/knowledge-node/knowledge-node.component";
import { knowledgeNodeResolver } from "./resolvers/knowledge-node.resolver";
import { DefinitionComponent } from "./components/containers/definition/definition.component";
import { definitionResolver } from "./resolvers/definition.resolver";
import { KnowledgeBitComponent } from "./components/containers/knowledge-bit/knowledge-bit.component";
import { knowledgeBitResolver } from "./resolvers/knowledge-bit.resolver";
import { ScriptsComponent } from "./components/pages/scripts/scripts.component";
import { authGuard, guestGuard } from "./guards/auth.guard";

const protectedRoutes: Routes = [
  {path: '', component: MainPageComponent},
  {
    path: 'files',
    children: [
      {
        path: '**',
        component: FileComponent,
        runGuardsAndResolvers: 'paramsChange',
      },
    ],
  },
  {
    path: 'knowledge-node/:id',
    component: KnowledgeNodeComponent,
    resolve: { knowledgeNode: knowledgeNodeResolver },
    runGuardsAndResolvers: 'paramsChange',
  },
  {
    path: 'definition/:id',
    component: DefinitionComponent,
    resolve: { definition: definitionResolver },
    runGuardsAndResolvers: 'paramsChange',
  },
  {
    path: 'knowledge-bit/:id',
    component: KnowledgeBitComponent,
    resolve: { knowledgeBit: knowledgeBitResolver },
    runGuardsAndResolvers: 'paramsChange',
  },
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
  {path: 'states', component: StatesComponent},
  {path: 'due-date-tasks', component: DueDateTasksComponent},
  {
    path: 'state/:id',
    component: StateComponent,
    resolve: { state: stateResolver },
    runGuardsAndResolvers: 'paramsChange',
  },
  {
    path: 'state-requirement/:id',
    component: StateRequirementComponent,
    resolve: { stateRequirement: stateRequirementResolver },
    runGuardsAndResolvers: 'paramsChange',
  },
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
  {path: 'scripts', component: ScriptsComponent},
];

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [guestGuard],
  },
  {
    path: '',
    component: SidenavComponent,
    canActivate: [authGuard],
    children: protectedRoutes,
  },
];
