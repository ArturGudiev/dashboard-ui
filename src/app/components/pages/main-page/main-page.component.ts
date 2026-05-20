import { Component , ChangeDetectionStrategy} from '@angular/core';
import { MultitaskingComponent } from "../../multitasking/multitasking.component";

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    standalone: true,
    imports: [ MultitaskingComponent ],
})
export class MainPageComponent { }
