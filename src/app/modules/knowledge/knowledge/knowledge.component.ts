import {ChangeDetectorRef, Component, ElementRef, NgZone, OnInit, ViewChild} from '@angular/core';
import {Subscription} from "rxjs";
import {CdkTextareaAutosize} from "@angular/cdk/text-field";
import {ActivatedRoute, Router} from "@angular/router";
import {Title} from "@angular/platform-browser";
import {KnowledgeService} from "../../../services/knowledge.service";
import {TasksService} from "../../../services/tasks.service";
import {getUrlByDescription} from "../../../shared/libs/dashboard.lib";
import {take} from "rxjs/operators";
import {Knowledge} from "../../../models/knowledge";

@Component({
  selector: 'app-knowledge',
  templateUrl: './knowledge.component.html',
  styleUrls: ['./knowledge.component.sass']
})
export class KnowledgeComponent implements OnInit {
  knowledge: Knowledge;
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
      this.knowledgeService.getKnowledge(id).subscribe((knowledge: Knowledge) => {
        this.knowledge = knowledge;
        this.titleService.setTitle(this.knowledge.getFullDescription());

        const parentsPath$ = this.knowledgeService.getKnowledgeParentsPath(this.knowledge);
        parentsPath$.subscribe((res: string[]) => {
          this.parentsPath = res;
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
    this.updateKnowledgeValue();
    this.routerSubscription.unsubscribe();
  }


  updateKnowledgeValue() {
    if (this.valueText && this.valueText.nativeElement.value !== this.knowledge.value) {
      this.knowledge.value = this.valueText.nativeElement.value;
      this.knowledgeService.updateKnowledge(this.knowledge).subscribe(knowledge => {
        this.knowledge = knowledge;
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
    return !this.editValue || (this.valueText && this.valueText.nativeElement.value === this.knowledge.value);
  }

  updateKnowledgeExtension($event: FocusEvent) {
    if (this.extension.nativeElement.value !== this.knowledge.extension) {
      this.knowledge.extension = this.extension.nativeElement.value;
      this.knowledgeService.updateKnowledge(this.knowledge).subscribe(knowledge => {
        this.knowledge = knowledge;
        this.cdr.detectChanges();
        this.showTextArea = false;
        setTimeout(() => this.showTextArea = true, 0);
      });
      this.cdr.detectChanges();
    }
  }
}
