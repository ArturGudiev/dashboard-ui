import {ChangeDetectorRef, Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Subscription} from "rxjs";
import {ActivatedRoute, Router} from "@angular/router";
import {Title} from "@angular/platform-browser";
import {Action} from "../../../models/action";
import {KnowledgeService} from "../../../services/knowledge.service";
import {CdkTextareaAutosize} from "@angular/cdk/text-field";
import {take} from "rxjs/operators";
import {TasksService} from "../../../services/tasks.service";
import {getUrlByDescription} from "../../../shared/libs/dashboard.lib";

@Component({
  selector: 'app-action',
  templateUrl: './action.component.html',
  styleUrls: ['./action.component.sass']
})
export class ActionComponent implements OnInit, OnDestroy {
  action: Action;
  text1 = '';
  parentsPath: string[];
  showTextArea = true;
  routerSubscription: Subscription;
  editValue = false;
  @ViewChild('valueText') valueText: ElementRef;
  @ViewChild('extensionInput') extension: ElementRef;
  @ViewChild('autosize') autosize: CdkTextareaAutosize;


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private titleService: Title,
    private knowledgeService: KnowledgeService,
    private tasksService: TasksService,
    private cdr: ChangeDetectorRef,
    private _ngZone: NgZone
  ) {
  }

  ngOnInit(): void {
    this.routerSubscription = this.route.params.subscribe(params => {
      let id = params['id'];
      this.knowledgeService.getAction(id).subscribe((action: Action) => {
        this.action = action;
        this.titleService.setTitle(this.action.getFullDescription());

        const parentsPath$ = this.knowledgeService.getParentsPath(this.action);
        parentsPath$.subscribe((res: string[]) => {
          this.parentsPath = res;
          console.log('SSSS', res);
        });
      });
    });
  }

  goToParentHandler(description: string) {
    const urls = getUrlByDescription(description);
    if (urls) {
      this.router.navigate(urls).then();
    }
  }


  triggerResize() {
    // Wait for changes to be applied, then trigger textarea resize.
    this._ngZone.onStable.pipe(take(1)).subscribe(() => this.autosize.resizeToFitContent(true));
  }

  ngOnDestroy(): void {
    this.updateActionValue();
    this.routerSubscription.unsubscribe();
  }


  updateActionValue() {
    if (this.valueText && this.valueText.nativeElement.value !== this.action.value) {
      this.action.value = this.valueText.nativeElement.value;
      this.knowledgeService.updateAction(this.action).subscribe(action => {
        this.action = action;
      });
    }
    this.editValue = false;
  }

  onGoToNearestParent() {
    if (this.parentsPath && this.parentsPath.length <= 1) {
      return;
    }
    this.goToParentHandler(this.parentsPath.slice(-2, -1)[0]);
  }

  toggleEditValue() {
    this.editValue = !this.editValue;
    this.cdr.detectChanges();
    if (this.editValue) {
      this.valueText.nativeElement.focus();
    }
  }

  isSaveIconDisabled() {
    return !this.editValue || (this.valueText && this.valueText.nativeElement.value === this.action.value);
  }

  updateActionExtension($event: FocusEvent) {
    if (this.extension.nativeElement.value !== this.action.extension) {
      this.action.extension = this.extension.nativeElement.value;
      this.knowledgeService.updateAction(this.action).subscribe(action => {
        this.action = action;
        this.cdr.detectChanges();
        this.showTextArea = false;
        setTimeout(() => this.showTextArea = true, 0);
      });
      this.cdr.detectChanges();
    }
  }
}
