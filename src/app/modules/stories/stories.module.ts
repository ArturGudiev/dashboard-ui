import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StoryComponent } from './story/story.component';
import { StoriesListComponent } from './stories-list/stories-list.component';
import {StoriesRoutingModule} from "./stories-routing.module";
import {SharedModule} from "../../shared/shared.module";



@NgModule({
  declarations: [
    StoryComponent,
    StoriesListComponent
  ],
  imports: [
    CommonModule,
    StoriesRoutingModule,
    SharedModule
  ]
})
export class StoriesModule { }
