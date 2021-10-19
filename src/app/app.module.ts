import {NgModule} from '@angular/core';
import {BrowserModule, HammerModule} from '@angular/platform-browser';
import {AppComponent} from './app.component';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {MaterialModule} from './shared/material/material.module';
import {RouterModule, Routes} from '@angular/router';
import {SidenavComponent} from './components/sidenav/sidenav.component';
import {ToolbarComponent} from './components/toolbar/toolbar.component';
import {HttpClientModule} from '@angular/common/http';
import {DialogsModule} from "./modules/dialogs/dialogs.module";
import {ReactiveFormsModule} from "@angular/forms";
import { CommandCardComponent } from './components/command-card/command-card.component';
import { MainPageComponent } from './components/main-page/main-page.component';
import {SwipeAngularListModule} from "swipe-angular-list";


const routes: Routes = [
  {path: '',  component: MainPageComponent},
  {path: 'epic', loadChildren: () => import('./modules/epics/epics.module').then(m => m.EpicsModule)},
  {path: 'problem', loadChildren: () => import('./modules/problems/problems.module').then(m => m.ProblemsModule)},
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
        HammerModule,  // < ----- ******************************** IMPORTANT ******************
        SwipeAngularListModule, // < ----- ********************,
        HttpClientModule,
        DialogsModule,
        BrowserModule,
        BrowserAnimationsModule,
        RouterModule,
        MaterialModule,
        RouterModule.forRoot(routes),
        ReactiveFormsModule
    ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
