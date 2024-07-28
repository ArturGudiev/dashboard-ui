import { Injectable } from '@angular/core';
import {Router} from "@angular/router";
import {AliasesService} from "./aliases.service";
import {AliasesRecord} from "../models/alias-record";
import {AlertService} from "./alert.service";

@Injectable({
  providedIn: 'root'
})
export class NavigationService {


  constructor(private router: Router,
              private alertService: AlertService,
              private aliasService: AliasesService) { }

  navigateByInput(navItem: string) {
    if ( !navItem ) {
      return;
    }
    if (Number.isInteger(+navItem)) {
      this.router.navigate(['task', navItem]).then();
    }
    const arr = navItem.split(' ');
    if (['e', 'epic'].includes(arr[0]) && Number.isInteger(+arr[1])) {
      this.router.navigate(['epic', arr[1]]).then();
    }
    if (['t', 'task'].includes(arr[0]) && Number.isInteger(+arr[1])) {
      this.router.navigate(['epic', arr[1]]).then();
    }
    if (['s', 'story'].includes(arr[0]) && Number.isInteger(+arr[1])) {
      this.router.navigate(['story', arr[1]]).then();
    }

    this.aliasService.getAliasRecord(navItem).subscribe(
      {
        next: val => {
          console.log('ALIAS HERE', val);
          this.navigateByAlias(val);
        },
        error: (error) => {
          this.alertService.showAlert('Alias not found');
          console.log('Error alias not found: ', error);
        }
      })


  }

  private navigateByAlias(val: AliasesRecord) {
    const arr = val.destination.split(' ');
    if( arr[0] === 'epic') {
      this.navigateToEpic(+arr[1]);
    }
    if( arr[0] === 'task') {
      this.navigateToTask(+arr[1]);
    }
    if( arr[0] === 'story') {
      this.navigateToStory(+arr[1]);
    }
    if( arr[0] === 'problem') {
      this.navigateToProblem(+arr[1]);
    }
    if( arr[0] === 'question') {
      this.navigateToQuestion(+arr[1]);
    }
    if( arr[0] === 'definition') {
      this.navigateToDefinition(+arr[1]);
    }
    if( arr[0] === 'action') {
      this.navigateToAction(+arr[1]);
    }
    if( arr[0] === 'knowledge') {
      this.navigateToKnowledge(+arr[1]);
    }
    if( arr[0] === 'knowledge-node') {
      this.navigateToKnowledgeNode(+arr[1]);
    }

    if( arr[0] === 'scheduled-task') {
      this.navigateToScheduledTask(+arr[1]);
    }
  }

  navigateToEpic(id: number) {
    this.router.navigate(['epic', id]).then();
  }

  navigateToTask(id: number) {
    this.router.navigate(['task', id]).then();
  }

  navigateToStory(id: number) {
    this.router.navigate(['story', id]).then();
  }

  navigateToProblem(id: number) {
    this.router.navigate(['problem', id]).then();
  }

  navigateToQuestion(id: number) {
    this.router.navigate(['question', id]).then();
  }

  navigateToDefinition(id: number) {
    this.router.navigate(['definition', id]).then();
  }

  navigateToAction(id: number) {
    this.router.navigate(['action', id]).then();
  }

  navigateToKnowledge(id: number) {
    this.router.navigate(['knowledge', id]).then();
  }

  navigateToKnowledgeNode(id: number) {
    this.router.navigate(['knowledge-node', id]).then();
  }

  navigateToScheduledTask(id: number) {
    this.router.navigate(['scheduled-task', id]).then();
  }
}
