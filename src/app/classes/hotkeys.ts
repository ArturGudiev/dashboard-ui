import { Observable } from "rxjs";
import { DOCUMENT, inject, Injectable } from "@angular/core";
import { EventManager } from "@angular/platform-browser";

type Options = {
  element: Document | HTMLElement;
  keys: string;
};

@Injectable({ providedIn: 'root' })
export class Hotkeys {
  private eventManager = inject(EventManager);
  private document = inject(DOCUMENT);

  defaults: Partial<Options> = {
    element: this.document,
  };

  addShortcut(options: Partial<Options>) {
    const merged = { ...this.defaults, ...options };
    const event = `keydown.${merged.keys}`;

    return new Observable<Event>(observer => {
      const handler = (e: Event) => {
        e.preventDefault();
        observer.next(e);
      };

      const dispose = this.eventManager.addEventListener(
        merged.element, event, handler
      );

      return () => {
        dispose();
      };
    });
  }
}
