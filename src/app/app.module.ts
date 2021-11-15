import {NgModule} from '@angular/core';
import {BrowserModule, HammerModule} from '@angular/platform-browser';
import {AppComponent} from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {DashboardMaterialModule} from './shared/material/dashboard-material.module';
import {RouterModule, Routes} from '@angular/router';
import {SidenavComponent} from './components/sidenav/sidenav.component';
import {ToolbarComponent} from './components/toolbar/toolbar.component';
import {HttpClientModule} from '@angular/common/http';
import {DialogsModule} from "./modules/dialogs/dialogs.module";
import {ReactiveFormsModule} from "@angular/forms";
import {CommandCardComponent} from './components/command-card/command-card.component';
import {MainPageComponent} from './components/main-page/main-page.component';
import {MatIconModule} from "@angular/material/icon";
import {HIGHLIGHT_OPTIONS, HighlightModule} from "ngx-highlightjs";


const routes: Routes = [
  {path: '',  component: MainPageComponent},
  {path: 'knowledge-tree', loadChildren: () => import('./modules/knowledge-tree/knowledge-tree.module').then(m => m.KnowledgeTreeModule)},
  {path: 'epic', loadChildren: () => import('./modules/epics/epics.module').then(m => m.EpicsModule)},
  {path: 'action', loadChildren: () => import('./modules/actions/actions.module').then(m => m.ActionsModule)},
  {path: 'problem', loadChildren: () => import('./modules/problems/problems.module').then(m => m.ProblemsModule)},
  {path: 'question', loadChildren: () => import('./modules/questions/questions.module').then(m => m.QuestionsModule)},
  {path: 'definition', loadChildren: () => import('./modules/definitions/definitions.module').then(m => m.DefinitionsModule)},
  {path: 'story', loadChildren: () => import('./modules/stories/stories.module').then(m => m.StoriesModule)},
  {path: 'task', loadChildren: () => import('./modules/tasks/tasks.module').then(m => m.TasksModule)},
  {path: 'tasks', redirectTo: 'task'},
];

@NgModule({
  declarations: [
    AppComponent,
    SidenavComponent,
    ToolbarComponent,
    CommandCardComponent,
    MainPageComponent,
  ],
    imports: [
        HammerModule,
      MatIconModule,
        HttpClientModule,
        DialogsModule,
        BrowserModule,
        BrowserAnimationsModule,
        DashboardMaterialModule,
        RouterModule.forRoot(routes),
      // AppRoutingModule,
        ReactiveFormsModule,
        HighlightModule
    ],
  providers: [
    {
      provide: HIGHLIGHT_OPTIONS,
      useValue: {
        fullLibraryLoader: () => import('highlight.js'),
      }
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
