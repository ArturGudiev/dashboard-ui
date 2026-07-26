import { DestroyRef, inject, Injectable } from '@angular/core';
import { filter, Subject } from 'rxjs';
import { AppConfigService } from './app-config.service';

export type DashboardWsEvent = {
  type: string;
};

@Injectable({ providedIn: 'root' })
export class WebsocketService {
  private readonly appConfig = inject(AppConfigService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly eventsSubject = new Subject<DashboardWsEvent>();
  private readonly connectedSubject = new Subject<void>();

  private socket: WebSocket | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private reconnectAttempt = 0;
  private intentionallyClosed = false;

  readonly events$ = this.eventsSubject.asObservable();
  readonly connected$ = this.connectedSubject.asObservable();

  constructor() {
    this.destroyRef.onDestroy(() => this.close());
  }

  connect(): void {
    this.intentionallyClosed = false;
    this.openSocket();
  }

  close(): void {
    this.intentionallyClosed = true;
    if (this.reconnectTimer != null) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.socket) {
      this.socket.close();
      this.socket = null;
    }
  }

  onEvent(type: string) {
    return this.events$.pipe(filter((event) => event.type === type));
  }

  private openSocket(): void {
    if (this.intentionallyClosed) {
      return;
    }
    if (
      this.socket &&
      (this.socket.readyState === WebSocket.OPEN ||
        this.socket.readyState === WebSocket.CONNECTING)
    ) {
      return;
    }

    const url = this.buildWsUrl();
    const socket = new WebSocket(url);
    this.socket = socket;

    socket.onopen = () => {
      this.reconnectAttempt = 0;
      this.connectedSubject.next();
    };

    socket.onmessage = (message) => {
      try {
        const event = JSON.parse(String(message.data)) as DashboardWsEvent;
        if (event?.type) {
          this.eventsSubject.next(event);
        }
      } catch {
        // Ignore malformed payloads.
      }
    };

    socket.onclose = () => {
      if (this.socket === socket) {
        this.socket = null;
      }
      this.scheduleReconnect();
    };

    socket.onerror = () => {
      socket.close();
    };
  }

  private scheduleReconnect(): void {
    if (this.intentionallyClosed || this.reconnectTimer != null) {
      return;
    }
    const delay = Math.min(1000 * 2 ** this.reconnectAttempt, 30000);
    this.reconnectAttempt += 1;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.openSocket();
    }, delay);
  }

  private buildWsUrl(): string {
    const base = this.appConfig.baseUrl;
    if (base.startsWith('http://') || base.startsWith('https://')) {
      const url = new URL(base);
      url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
      const path = url.pathname.replace(/\/$/, '');
      url.pathname = `${path}/ws`;
      return url.toString();
    }

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const prefix = base.replace(/\/$/, '');
    return `${protocol}//${window.location.host}${prefix}/ws`;
  }
}
