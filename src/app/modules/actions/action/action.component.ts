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
import {ProblemsService} from "../../../services/problems.service";
import {Problem} from "../../../models/problem";

@Component({
  selector: 'app-action',
  templateUrl: './action.component.html',
  styleUrls: ['./action.component.sass']
})
export class ActionComponent implements OnInit, OnDestroy {
  action: Action;
  parentsPath: string[];
  showTextArea = true;
  routerSubscription: Subscription;
  editValue = false;
  @ViewChild('valueText') valueText: ElementRef;
  @ViewChild('extensionInput') extension: ElementRef;
  @ViewChild('autosize') autosize: CdkTextareaAutosize;
  refreshProblemsSubscription: Subscription;

  problems: Problem[];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private titleService: Title,
    private knowledgeService: KnowledgeService,
    private tasksService: TasksService,
    private cdr: ChangeDetectorRef,
    private _ngZone: NgZone,
    private problemsService: ProblemsService
  ) {
  }

  ngOnInit(): void {
    this.routerSubscription = this.route.params.subscribe(params => {
      let id = params['id'];
      this.knowledgeService.getAction(id).subscribe((action: Action) => {
        this.action = action;
        this.titleService.setTitle(this.action.getFullDescription());
        this.refreshProblems();
        const parentsPath$ = this.knowledgeService.getActionParentsPath(this.action);
        parentsPath$.subscribe((res: string[]) => {
          this.parentsPath = res;
        });
      });
    });
    this.refreshProblemsSubscription = this.problemsService.getRefreshProblemsDataStateChange().subscribe(state => {
      if (this.action === state.taskContainer) { this.refreshProblems(); }
    });
  }

  goToParentHandler(description: string) {
    const urls = getUrlByDescription(description);
    if (urls) {
      this.router.navigate(urls).then();
    }
  }

  addProblem(): void {
    this.problemsService.openAddProblemDialog(this.action);
  }

  solveTheProblem(problem: Problem): void {
    this.problemsService.callSolveTheProblemDialog(problem, this.action);
  }

  refreshProblems() {
    this.problemsService.getProblems(this.action.getFullDescription())
      .subscribe(problems => this.problems = problems.filter((p: Problem) => !p.solution));
  }

  triggerResize() {
    // Wait for changes to be applied, then trigger textarea resize.
    this._ngZone.onStable.pipe(take(1)).subscribe(() => this.autosize.resizeToFitContent(true));
  }

  ngOnDestroy(): void {
    this.updateActionValue();
    this.routerSubscription.unsubscribe();
    this.refreshProblemsSubscription.unsubscribe();
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
