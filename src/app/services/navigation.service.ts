import { inject, Injectable } from '@angular/core';
import { Router } from "@angular/router";
import { AliasesService } from "./aliases.service";
import { AlertService } from "./alert.service";
import { TasksService } from "./task-container-services/tasks.service";
import { type ModelsAliasModel } from "../types/generated";

@Injectable({
  providedIn: 'root'
})
export class NavigationService {


  private router = inject(Router);
  private alertService = inject(AlertService);
  private tasksService = inject(TasksService);
  private aliasService = inject(AliasesService);

  navigateByInput(navItem: string) {
    if (!navItem) {
      return;
    }
    if (Number.isInteger(+navItem)) {
      this.navigateToTask(+navItem);
      return;
    }
    const arr = navItem.split(' ');
    if (['help','h'].includes(arr[0])) {
      this.router.navigate(['help']).then();;
      return;
    }
    if (['epics'].includes(arr[0])) {
      this.router.navigate(['epics']).then();;
      return;
    }
    if (['long', 'long-tasks'].includes(arr[0])) {
      this.router.navigate(['long-tasks']).then();;
      return;
    }
    if (['directions'].includes(arr[0])) {
      this.router.navigate(['directions']).then();
      return;
    }
    if (['d', 'direction'].includes(arr[0]) && Number.isInteger(+arr[1])) {
      this.router.navigate(['direction', arr[1]]).then();
      return;
    }
    if (['rep', 'repetitive-tasks'].includes(arr[0])) {
      this.router.navigate(['repetitive-tasks']).then();;
      return;
    }
    if (['e', 'epic'].includes(arr[0]) && Number.isInteger(+arr[1])) {
      this.router.navigate(['epic', arr[1]]).then();
      return;
    }
    if (['t', 'task'].includes(arr[0]) && Number.isInteger(+arr[1])) {
      this.router.navigate(['epic', arr[1]]).then();
      return;
    }
    if (['s', 'story'].includes(arr[0]) && Number.isInteger(+arr[1])) {
      this.router.navigate(['story', arr[1]]).then();
      return;
    }

    this.aliasService.getAliasRecord(navItem).subscribe(
      {
        next: val => {
          this.navigateByAlias(val);
        },
        error: (error) => {
          this.alertService.showAlert('Alias not found');
          console.error('Alias not found:', error);
        }
      })
  }

  private navigateByAlias(val: ModelsAliasModel) {
    const id = val.itemId;
    if (!id) {
      return;
    }
    if (val.type === 'epic') {
      this.navigateToEpic(id);
    }
    if (val.type === 'task') {
      this.navigateToTask(id);
    }
    if (val.type === 'story') {
      this.navigateToStory(id);
    }
    if (val.type === 'problem') {
      this.navigateToProblem(id);
    }
    if (val.type === 'question') {
      this.navigateToQuestion(id);
    }
    if (val.type === 'definition') {
      this.navigateToDefinition(id);
    }
    if (val.type === 'action') {
      this.navigateToAction(id);
    }
    // if (val.type === 'knowledge') {
    //   this.navigateToKnowledge(id);
    // }
    if (val.type === 'knowledge-node') {
      this.navigateToKnowledgeNode(id);
    }

    if (val.type === 'repetitive-task') {
      this.navigateToScheduledTask(id);
    }
  }

  navigateToEpic(id: number) {
    this.router.navigate(['epic', id]).then();
  }

  navigateToTask(id: number) {
    this.tasksService.getTask(id).subscribe({
      next: res => {
          if (res) {
            this.router.navigate(['task', id], {state: res}).then()
          }
        },
      error: () => {
        this.alertService.showAlert(`No such task with id ${id}`, 2000, 'info');
      }
    })
    ;
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
