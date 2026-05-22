import { linkedSignal } from '@angular/core';

/** View model for a route-resolved container; clears when route id and resolved entity diverge (param change). */
export function linkedContainerForView<T extends { id: number }>(
  routeId: () => number | string,
  resolved: () => T,
) {
  return linkedSignal({
    source: () => ({ routeId: Number(routeId()), container: resolved() }),
    computation: (s) => (Number(s.container.id) === s.routeId ? s.container : null),
  });
}
