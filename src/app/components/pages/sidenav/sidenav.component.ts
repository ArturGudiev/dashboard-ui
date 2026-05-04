import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MatSidenav, MatSidenavContainer } from '@angular/material/sidenav';
import { MatToolbar } from "@angular/material/toolbar";
import { MatListItem, MatNavList } from "@angular/material/list";
import { ToolbarComponent } from "../toolbar/toolbar.component";

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  imports: [
    ToolbarComponent,
    MatSidenavContainer,
    MatSidenav,
    MatToolbar,
    MatNavList,
    MatListItem,
    RouterOutlet
  ],
  standalone: true,
  styleUrls: ['./sidenav.component.sass']
})
export class SidenavComponent { }
