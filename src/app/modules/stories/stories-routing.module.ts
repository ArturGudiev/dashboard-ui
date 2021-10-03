import {NgModule} from '@angular/core';
import {RouterModule, Routes} from "@angular/router";
import {StoriesListComponent} from "./stories-list/stories-list.component";
import {StoryComponent} from "./story/story.component";


const routes: Routes = [
  {
    path: '',
    children: [
      {path: ':id', component: StoryComponent},
      {path: '', component: StoriesListComponent}
    ]
  },
  {path: '**', redirectTo: ''},
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class StoriesRoutingModule {
}

