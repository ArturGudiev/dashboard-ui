import { Component } from '@angular/core';
import { MultitaskingComponent } from "../../multitasking/multitasking.component";

@Component({
    selector: 'app-main-page',
    templateUrl: './main-page.component.html',
    standalone: true,
    imports: [ MultitaskingComponent ],
})
export class MainPageComponent { }
