import {Component, OnDestroy, OnInit} from '@angular/core';
import {Observable, Subscription} from "rxjs";
import {ActivatedRoute, Router} from "@angular/router";
import {KnowledgeService} from "../../../services/knowledge.service";
import {KnowledgeNode} from "../../../models/knowledge-node";
import {getUrlByDescription} from "../../../shared/libs/dashboard.lib";
import {Title} from "@angular/platform-browser";
import {Knowledge} from "../../../models/knowledge";
import {GetValueDialogComponent} from "../../dialogs/get-value/get-value-dialog.component";
import {MatDialog} from "@angular/material/dialog";
import {Definition} from "../../../models/definition";
import {Action} from "../../../models/action";
import {DefinitionDialogComponent} from "../../dialogs/definition/definition-dialog.component";
import {ActionDialogComponent} from "../../dialogs/action-dialog/action-dialog.component";
import {KnowledgeDialogComponent} from "../../dialogs/knowledge-dialog/knowledge-dialog.component";

@Component({
  selector: 'app-knowledge-node',
  templateUrl: './knowledge-node.component.html',
  styleUrls: ['./knowledge-node.component.sass']
})
export class KnowledgeNodeComponent implements OnInit, OnDestroy {
  private routerSubscription: Subscription;
  knowledgeNode: KnowledgeNode;
  subnodes: KnowledgeNode[];
  parentsPath: string[];
  definitions: Definition[];
  actions: Action[];
  knowledgeBits: Knowledge[];

  constructor(private route: ActivatedRoute,
              private router: Router,
              private titleService: Title,
              private dialog: MatDialog,
              private knowledgeService: KnowledgeService) { }

  ngOnInit(): void {
    this.routerSubscription = this.route.params.subscribe(params => {
      let id = params['id'];
      this.knowledgeService.getKnowledgeNode(id).subscribe((knowledgeNode: KnowledgeNode) => {
        this.knowledgeNode = knowledgeNode;
        this.titleService.setTitle(this.knowledgeNode.getFullDescription());
        this.refreshKnowledgeNodes();
        this.refreshDefinitions();
        this.refreshActions();
        this.refreshKnowledgeBits();
        const parentsPath$ = this.knowledgeService.getKnowledgeNodeParentsPath(this.knowledgeNode);
        parentsPath$.subscribe((res: string[]) => {
          this.parentsPath = res;
        });
      });
    });
  }

  ngOnDestroy(): void {
    this.routerSubscription.unsubscribe();
  }

  goToParentHandler(description: string) {
    const urls = getUrlByDescription(description);
    if (urls) {
      this.router.navigate(urls).then();
    }
  }

  onGoToNearestParent() {
    if (this.parentsPath && this.parentsPath.length <= 1) {
      return;
    }
    this.goToParentHandler(this.parentsPath.slice(-2, -1)[0]);
  }

  refreshKnowledgeNodes() {
    this.knowledgeService.getKnowledgeNodeChildren(this.knowledgeNode._id)
      .subscribe((nodes: KnowledgeNode[]) => {
        return this.subnodes = nodes;
      })
  }

  addKnowledgeNode() {
    const dialogRef = this.dialog.open(GetValueDialogComponent, {data: { title: 'Description' }});
    dialogRef.afterClosed().subscribe((description: string) => {
      if (description) {
        // this.tasksService.createNewTask(obj).subscribe(() => this.refreshSubtasks());
        const obj = {description: description, tags: [this.knowledgeNode.getFullDescription()]}
        this.knowledgeService.createNewChildKnowledgeNode({id: this.knowledgeNode._id, name: description})
          .subscribe(() => this.refreshKnowledgeNodes());
      }
    });
  }

  refreshDefinitions(): Observable<Definition[]> {
    const definitions$ = this.knowledgeService.getDefinitions(this.knowledgeNode.getFullDescription());
    definitions$.subscribe(definitions => {
      return this.definitions = definitions;
    });
    return definitions$;
  }

  addDefinition() {
    // this.knowledgeService.addDefinition();
    const dialogRef = this.dialog.open(DefinitionDialogComponent, {
      height: '400px',
      width: '800px',
    });
    dialogRef.afterClosed().subscribe((obj: any) => {
      if (obj) {
        const definitionObject = {name: obj.name, value: obj.value, tags: [this.knowledgeNode.getFullDescription()]}
        this.knowledgeService.createNewDefinition(definitionObject).subscribe(() => this.refreshDefinitions());
      }
    });
  }

  refreshActions() {
    const actionsSubscription$ = this.knowledgeService.getActions(this.knowledgeNode.getFullDescription());
    actionsSubscription$.subscribe(actions => {
      this.actions = actions;
    });
    return actionsSubscription$;
  }

  refreshKnowledgeBits() {
    const knowledgeBitsSubscription$ = this.knowledgeService.getKnowledgeBits(this.knowledgeNode.getFullDescription());
    knowledgeBitsSubscription$.subscribe(knowledgeBits => this.knowledgeBits = knowledgeBits);
    return knowledgeBitsSubscription$;
  }

  addAction() {
    const dialogRef = this.dialog.open(ActionDialogComponent, {
      height: '600px',
      width: '800px',
    });
    dialogRef.afterClosed().subscribe((obj: any) => {
      if (obj) {
        const action = {name: obj.name, value: obj.value, tags: [this.knowledgeNode.getFullDescription()], extension: obj.extension};
        this.knowledgeService.createNewAction(action).subscribe(() => this.refreshActions());
      }
    });
  }

  addKnowledge() {
    const dialogRef = this.dialog.open(KnowledgeDialogComponent, {
      height: '600px',
      width: '800px',
    });
    dialogRef.afterClosed().subscribe((obj: any) => {
      if (obj) {
        const knowledge = {name: obj.name, value: obj.value, tags: [this.knowledgeNode.getFullDescription()], extension: obj.extension};
        this.knowledgeService.createNewKnowledge(knowledge).subscribe(() => this.refreshKnowledgeBits());
      }
    });
  }

}
