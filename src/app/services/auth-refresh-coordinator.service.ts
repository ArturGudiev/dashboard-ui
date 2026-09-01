import { Injectable } from '@angular/core';
import { Observable, throwError, timer } from 'rxjs';
import { catchError, filter, finalize, map, take, tap } from 'rxjs/operators';
import type { LoginUserResponse } from './auth.service';

const LOCK_KEY = 'auth_refresh_lock';
const LOCK_TTL_MS = 15_000;
const CHANNEL_NAME = 'auth-refresh';

type RefreshMessage =
  | { type: 'refreshed' }
  | { type: 'refresh-failed' }
  | { type: 'logout'; tabId: string };

interface RefreshLock {
  tabId: string;
  at: number;
}

@Injectable({ providedIn: 'root' })
export class AuthRefreshCoordinator {
  private readonly tabId = crypto.randomUUID();
  private readonly channel =
    typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel(CHANNEL_NAME) : null;
  private inFlightRefresh$: Observable<void> | null = null;
  private readonly logoutListeners = new Set<() => void>();

  constructor() {
    this.channel?.addEventListener('message', (event: MessageEvent<RefreshMessage>) => {
      if (event.data?.type === 'logout' && event.data.tabId !== this.tabId) {
        this.logoutListeners.forEach((listener) => listener());
      }
    });
  }

  onLogout(callback: () => void): void {
    this.logoutListeners.add(callback);
  }

  broadcastLogout(): void {
    const message: RefreshMessage = { type: 'logout', tabId: this.tabId };
    this.channel?.postMessage(message);
  }

  refreshWithLock(refreshFn: () => Observable<LoginUserResponse>): Observable<void> {
    if (!this.inFlightRefresh$) {
      this.inFlightRefresh$ = this.leadOrFollow(refreshFn).pipe(
        finalize(() => {
          this.inFlightRefresh$ = null;
        }),
      );
    }
    return this.inFlightRefresh$;
  }

  private leadOrFollow(refreshFn: () => Observable<LoginUserResponse>): Observable<void> {
    if (this.tryAcquireLock()) {
      return refreshFn().pipe(
        tap(() => {
          const message: RefreshMessage = { type: 'refreshed' };
          this.channel?.postMessage(message);
        }),
        catchError((error) => {
          const message: RefreshMessage = { type: 'refresh-failed' };
          this.channel?.postMessage(message);
          return throwError(() => error);
        }),
        finalize(() => this.releaseLock()),
        map(() => undefined),
      );
    }

    if (this.channel) {
      return this.waitForPeerRefreshViaChannel();
    }

    return this.waitForPeerRefreshViaLock();
  }

  private tryAcquireLock(): boolean {
    const now = Date.now();
    const current = this.readLock();
    if (current && now - current.at < LOCK_TTL_MS && current.tabId !== this.tabId) {
      return false;
    }

    const lock: RefreshLock = { tabId: this.tabId, at: now };
    localStorage.setItem(LOCK_KEY, JSON.stringify(lock));
    return this.readLock()?.tabId === this.tabId;
  }

  private releaseLock(): void {
    const current = this.readLock();
    if (current?.tabId === this.tabId) {
      localStorage.removeItem(LOCK_KEY);
    }
  }

  private readLock(): RefreshLock | null {
    const raw = localStorage.getItem(LOCK_KEY);
    if (!raw) {
      return null;
    }
    try {
      return JSON.parse(raw) as RefreshLock;
    } catch {
      return null;
    }
  }

  private waitForPeerRefreshViaChannel(): Observable<void> {
    return new Observable<void>((subscriber) => {
      const timeout = setTimeout(() => {
        cleanup();
        subscriber.error(new Error('Refresh timeout'));
      }, LOCK_TTL_MS);

      const onMessage = (event: MessageEvent<RefreshMessage>) => {
        if (event.data?.type === 'refreshed') {
          cleanup();
          subscriber.next();
          subscriber.complete();
        }
        if (event.data?.type === 'refresh-failed') {
          cleanup();
          subscriber.error(new Error('Peer refresh failed'));
        }
      };

      const cleanup = () => {
        clearTimeout(timeout);
        this.channel?.removeEventListener('message', onMessage);
      };

      this.channel?.addEventListener('message', onMessage);
    });
  }

  private waitForPeerRefreshViaLock(): Observable<void> {
    return timer(0, 200).pipe(
      map(() => this.readLock()),
      filter((lock) => {
        if (!lock) {
          return true;
        }
        return Date.now() - lock.at >= LOCK_TTL_MS;
      }),
      take(1),
      map(() => undefined),
    );
  }
}
