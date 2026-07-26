import { Observable } from "rxjs";
import { DOCUMENT, inject, Injectable } from "@angular/core";
import { EventManager } from "@angular/platform-browser";
import { AppStore } from "../state/app.store";

type Options = {
  element: Document | HTMLElement;
  keys: string;
};

const EDITABLE_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT']);

@Injectable({ providedIn: 'root' })
export class Hotkeys {
  private eventManager = inject(EventManager);
  private document = inject(DOCUMENT);
  private appStore = inject(AppStore);

  defaults: Partial<Options> = {
    element: this.document,
  };

  addShortcut(options: Partial<Options> & Pick<Options, 'keys'>) {
    const merged = { ...this.defaults, ...options };
    const event = `keydown.${merged.keys}`;
    const element = this.resolveEventElement(merged.element);

    return new Observable<Event>(observer => {
      const handler = (e: Event) => {
        if (this.appStore.disabledHotkeys() || this.isEditableTarget(e)) {
          return;
        }
        e.preventDefault();
        observer.next(e);
      };

      const dispose = this.eventManager.addEventListener(
        element, event, handler
      );

      return () => {
        dispose();
      };
    });
  }

  private resolveEventElement(element: Document | HTMLElement | undefined): HTMLElement {
    const target = element ?? this.document;
    return target instanceof Document ? target.documentElement : target;
  }

  private isEditableTarget(e: Event): boolean {
    const target = e.target;
    if (!(target instanceof HTMLElement)) {
      return false;
    }
    if (EDITABLE_TAGS.has(target.tagName)) {
      return true;
    }
    return target.isContentEditable;
  }
}
