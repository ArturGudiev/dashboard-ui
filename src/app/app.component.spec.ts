import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { EMPTY } from 'rxjs';
import { AlertService } from './services/alert.service';
import { DashboardService } from './services/dashboard.service';
import { WebsocketService } from './services/websocket.service';
import { AuthStore } from './state/auth.store';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        {
          provide: DashboardService,
          useValue: {
            updateDoneTasksNumber: () => undefined,
          },
        },
        {
          provide: WebsocketService,
          useValue: {
            connect: () => undefined,
            close: () => undefined,
            connected$: EMPTY,
            onEvent: () => EMPTY,
          },
        },
        {
          provide: AuthStore,
          useValue: {
            isAuthenticated: signal(false),
          },
        },
        {
          provide: AlertService,
          useValue: {
            data$: EMPTY,
          },
        },
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it(`should have the 'dashboard-ui' title`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app.title).toEqual('dashboard-ui');
  });
});
