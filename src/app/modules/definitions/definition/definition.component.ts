import {ChangeDetectorRef, Component, ElementRef, NgZone, OnInit, ViewChild} from '@angular/core';
import {Observable, Subscription} from "rxjs";
import {CdkTextareaAutosize} from "@angular/cdk/text-field";
import {ActivatedRoute, Router} from "@angular/router";
import {Title} from "@angular/platform-browser";
import {KnowledgeService} from "../../../services/knowledge.service";
import {TasksService} from "../../../services/tasks.service";
import {getUrlByDescription} from "../../../shared/libs/dashboard.lib";
import {take} from "rxjs/operators";
import {Definition} from "../../../models/definition";
import {TaskC} from "../../../models/task-class";
import {TaskContainerService} from "../../../services/task-container.service";

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
  subtasks: TaskC[];
  refreshTasksSubscription: Subscription;
  isLoading = true;
  parentsPath$: Observable<string[]>;


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private titleService: Title,
    private knowledgeService: KnowledgeService,
    private tasksService: TasksService,
    private cdr: ChangeDetectorRef,
    private taskContainerService: TaskContainerService,
    private _ngZone: NgZone
  ) {
  }

  ngOnInit(): void {
    this.routerSubscription = this.route.params.subscribe(params => {
      let id = params['id'];
      this.knowledgeService.getDefinition(id).subscribe((definition: Definition) => {
        this.parentsPath$ = this.knowledgeService.getDefinitionParentsPath(definition);
        this.definition = definition;
        this.isLoading = false;
        this.titleService.setTitle(this.definition.getFullDescription());
        this.refreshSubtasks();
        const parentsPath$ = this.taskContainerService.getParentsPath(this.definition);
        parentsPath$.subscribe((res: string[]) => {
          this.parentsPath = res;
        });
      });
    });

    this.refreshTasksSubscription = this.tasksService.getRefreshTasksDataStateChange().subscribe(state => {
      if (this.definition === state.taskContainer) { this.refreshSubtasks(); }
    });
  }

  ngOnDestroy(): void {
    this.isLoading = true;
    this.updateDefinitionValue();
    this.routerSubscription.unsubscribe();
    this.refreshTasksSubscription.unsubscribe();
  }

  goToParentHandler(description: string) {
    const urls = getUrlByDescription(description);
    if (urls) {
      this.router.navigate(urls).then();
    }
  }

  refreshSubtasks(): void {
    this.tasksService.getTasks(this.definition.getFullDescription())
      .subscribe(newSubtasks => this.subtasks = newSubtasks);
  }

  addSubtask() {
    this.tasksService.openAddTaskDialog(this.definition);
  }

  onSubtaskDoneClick(subtask: TaskC) {
    this.tasksService.finishTask(subtask).subscribe(() => this.refreshSubtasks());
  }


  triggerResize() {
    // Wait for changes to be applied, then trigger textarea resize.
    this._ngZone.onStable.pipe(take(1)).subscribe(() => this.autosize.resizeToFitContent(true));
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
