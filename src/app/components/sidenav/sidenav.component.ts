import {Component, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Direction} from '@angular/cdk/bidi';
import {BreakpointObserver, BreakpointState} from '@angular/cdk/layout';
import {Router} from '@angular/router';
import {MatSidenav} from '@angular/material/sidenav';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {CommandsService} from "../../services/commands.service";
import {Subscription} from "rxjs";

const SMALL_WIDTH_BREAKPOINT = 720;

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.sass']
})
export class SidenavComponent implements OnInit, OnDestroy {
  public isScreenSmall = false;
  // users: Observable<User[]> = of([]);
  isDarkTheme: boolean = false;
  dir = 'ltr' as Direction;
  showCard = false;
  private commandSubscription: Subscription;

  constructor(private breakpointObserver: BreakpointObserver,
              private router: Router,
              private commandService: CommandsService
              ) { }

  @ViewChild(MatSidenav) sidenav: MatSidenav;
  myForm = new FormGroup({
    command: new FormControl(null, [
      Validators.required
    ]),
  });



  ngOnInit(): void {
    this.breakpointObserver
      // .observe( [Breakpoints.XSmall  ])
      .observe([`(max-width: ${SMALL_WIDTH_BREAKPOINT}px`])
      .subscribe((state: BreakpointState) => {
        this.isScreenSmall = state.matches;
      })
    // this.users = this.userService.users;
    // this.userService.loadAll();

    this.commandSubscription = this.commandService.getDataStateChange().subscribe(state => {
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
    this.commandService.setCommand(this.myForm.value.command);
  }

  onNoClick() { }

  ngOnDestroy(): void {
    this.commandSubscription.unsubscribe();
  }
}
