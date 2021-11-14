import {ChangeDetectorRef, Component, ElementRef, NgZone, OnInit, ViewChild} from '@angular/core';
import {Subscription} from "rxjs";
import {CdkTextareaAutosize} from "@angular/cdk/text-field";
import {ActivatedRoute, Router} from "@angular/router";
import {Title} from "@angular/platform-browser";
import {KnowledgeService} from "../../../services/knowledge.service";
import {TasksService} from "../../../services/tasks.service";
import {getUrlByDescription} from "../../../shared/libs/dashboard.lib";
import {take} from "rxjs/operators";
import {Definition} from "../../../models/definition";

@Component({
  selector: 'app-definition',
  templateUrl: './definition.component.html',
  styleUrls: ['./definition.component.sass']
})
export class DefinitionComponent implements OnInit {
  definition: Definition;
  parentsPath: string[];
  routerSubscription: Subscription;
  editValue = false;
  @ViewChild('definitionValueInput') definitionValueInput: ElementRef;
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
      this.knowledgeService.getDefinition(id).subscribe((definition: Definition) => {
        this.definition = definition;
        this.titleService.setTitle(this.definition.getFullDescription());

        const parentsPath$ = this.knowledgeService.getDefinitionParentsPath(this.definition);
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
    this.updateDefinitionValue();
    this.routerSubscription.unsubscribe();
  }


  updateDefinitionValue() {
    if (this.definitionValueInput && this.definitionValueInput.nativeElement.value !== this.definition.value) {
      this.definition.value = this.definitionValueInput.nativeElement.value;
      this.knowledgeService.updateDefinition(this.definition).subscribe(definition => {
        this.definition = definition;
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
      this.definitionValueInput.nativeElement.focus();
    }
  }

  isSaveIconDisabled() {
    return !this.editValue || (this.definitionValueInput && this.definitionValueInput.nativeElement.value === this.definition.value);
  }

  changeDefinitionValue(val: any) {
    if (this.definition) {
      this.definition.value = val;
    }
  }
}
