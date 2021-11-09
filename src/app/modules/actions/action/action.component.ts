import {Component, HostListener, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from "rxjs";
import {ActivatedRoute, Router} from "@angular/router";
import {Title} from "@angular/platform-browser";
import {CommandsService} from "../../../services/commands.service";
import {Action} from "../../../models/action";
import {KnowledgeService} from "../../../services/knowledge.service";

@Component({
  selector: 'app-action',
  templateUrl: './action.component.html',
  styleUrls: ['./action.component.sass']
})
export class ActionComponent implements OnInit, OnDestroy {
  action: Action;

  routerSubscription: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private titleService: Title,
    private knowledgeService: KnowledgeService
  ) {
  }

  ngOnInit(): void {
    this.routerSubscription = this.route.params.subscribe(params => {
      let id = params['id'];
      this.knowledgeService.getAction(id).subscribe((action: Action) => {
        this.action = action;
        this.titleService.setTitle(this.action.getFullDescription());
      });
    })
  }

  @HostListener('window:keyup', ['$event'])
  keyEvent(event: KeyboardEvent) {
    // if (event.key === 'Insert' || event.key === '+' || event.key === '=') {
    //   this.openAddTaskDialog();
    // }
  }

  // onGoToNearestParent() {
  //   if (this.parentsPath && this.parentsPath.length <= 1) {
  //     return;
  //   }
  //   this.goToParentHandler(this.parentsPath.slice(-2, -1)[0]);
  // }

  // goToParentHandler(description: string) {
  //   const urls = getUrlByDescription(description);
  //   if (urls) {
  //     this.router.navigate(urls).then();
  //   }
  // }


  ngOnDestroy(): void {
    this.routerSubscription.unsubscribe();
  }

}
