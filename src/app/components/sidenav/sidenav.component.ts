import {Component, OnInit, ViewChild} from '@angular/core';
import {Observable, of} from 'rxjs';
import {Direction} from '@angular/cdk/bidi';
import {BreakpointObserver, BreakpointState} from '@angular/cdk/layout';
import {Router} from '@angular/router';
import {MatSidenav} from '@angular/material/sidenav';
const SMALL_WIDTH_BREAKPOINT = 720;

@Component({
  selector: 'app-sidenav',
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.sass']
})
export class SidenavComponent implements OnInit {
  public isScreenSmall = false;
  // users: Observable<User[]> = of([]);
  isDarkTheme: boolean = false;
  dir = 'ltr' as Direction;

  constructor(private breakpointObserver: BreakpointObserver,
              private router: Router
              ) { }

  @ViewChild(MatSidenav) sidenav: MatSidenav;

  ngOnInit(): void {
    this.breakpointObserver
      // .observe( [Breakpoints.XSmall  ])
      .observe([`(max-width: ${SMALL_WIDTH_BREAKPOINT}px`])
      .subscribe((state: BreakpointState) => {
        this.isScreenSmall = state.matches;
      })
    // this.users = this.userService.users;
    // this.userService.loadAll();

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

}
