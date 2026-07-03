import { patchState, signalStore, withMethods, withState } from '@ngrx/signals';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
}

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  initialized: boolean;
}

const AUTH_USER_STORAGE_KEY = 'auth_user';

function readStoredUser(): AuthUser | null {
  const raw = sessionStorage.getItem(AUTH_USER_STORAGE_KEY);
  if (!raw) {
    return null;
  }
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export const AuthStore = signalStore(
  { providedIn: 'root' },
  withState<AuthState>({
    user: readStoredUser(),
    isAuthenticated: !!readStoredUser(),
    initialized: false,
  }),
  withMethods((store) => ({
    setUser(user: AuthUser): void {
      sessionStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(user));
      patchState(store, { user, isAuthenticated: true, initialized: true });
    },

    clearUser(): void {
      sessionStorage.removeItem(AUTH_USER_STORAGE_KEY);
      patchState(store, { user: null, isAuthenticated: false, initialized: true });
    },

    setInitialized(): void {
      patchState(store, { initialized: true });
    },
  })),
);
