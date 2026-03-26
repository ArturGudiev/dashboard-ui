import { Component, OnInit, ViewChild } from '@angular/core';
import { Direction } from '@angular/cdk/bidi';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Router, RouterOutlet } from '@angular/router';
import { MatSidenav, MatSidenavContainer } from '@angular/material/sidenav';
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { UntilDestroy, untilDestroyed } from "@ngneat/until-destroy";
import { MatToolbar } from "@angular/material/toolbar";
import { MatListItem, MatNavList } from "@angular/material/list";
import { ToolbarComponent } from "../toolbar/toolbar.component";
import { CommandsService } from "../../../services/commands.service";

@UntilDestroy()
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
export class SidenavComponent implements OnInit {
  public isScreenSmall = false;
  isDarkTheme: boolean = false;
  dir = 'ltr' as Direction;
  showCard = false;

  constructor(
    private breakpointObserver: BreakpointObserver,
    private router: Router,
    private commandService: CommandsService
  ) { }

  @ViewChild(MatSidenav) sidenav!: MatSidenav;
  myForm = new FormGroup({
    command: new FormControl(null, [
      Validators.required
    ]),
  });



  ngOnInit(): void {

    this.commandService.getDataStateChange().pipe(untilDestroyed(this)).subscribe(state => {
      if (state.command === 'command'){
        this.showCard = !this.showCard;
      }
    })

    this.router.events.subscribe(() => {
      if (this.isScreenSmall) {
        this.sidenav.close();
      }
    })
  }

  toggleTheme() {
    this.isDarkTheme = !this.isDarkTheme;
  }

  toggleDir() {
    this.dir = this.dir == 'ltr' ? 'rtl' : 'ltr';
  }

  onSubmit() {
    if (this.myForm.value.command) {
      this.commandService.setCommand(this.myForm.value.command);
    }
  }

  onNoClick() { }

}
