import { Component , ChangeDetectionStrategy} from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-help',
    standalone: true,
    imports: [],
    templateUrl: './help.component.html',
})
export class HelpComponent { }
