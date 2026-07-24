import { inject, Injectable } from '@angular/core';
import { Router } from "@angular/router";
import { AliasesService } from "./aliases.service";
import { AlertService } from "./alert.service";
import { TasksService } from "./task-container-services/tasks.service";
import { type ModelsAliasModel } from "../types/generated";

const FILES_ROOT_MARKERS = [
  '/dashboard_files/',
  '\\dashboard_files\\',
  '/dashboard/files/',
  '\\dashboard\\files\\',
  '/data/files/',
  '\\data\\files\\',
];

const FILES_TOP_DIRS = new Set([
  'tasks',
  'problems',
  'questions',
  'actions',
  'definitions',
  'knowledge-bits',
  'knowledge-nodes',
  'stories',
  'epics',
  'scheduled-tasks',
  'states',
]);

/**
 * Converts a stored file-alias path (often absolute Windows/Unix under FILES_DIR)
 * into route segments for `/files/...`.
 */
export function relativeFilesPathSegments(filePath: string): string[] {
  let normalized = filePath.trim().replace(/\\/g, '/');
  if (!normalized) {
    return [];
  }

  // Drop trailing .bin used by rclone crypt on disk.
  if (normalized.toLowerCase().endsWith('.bin')) {
    normalized = normalized.slice(0, -4);
  }

  const lower = normalized.toLowerCase();
  for (const marker of FILES_ROOT_MARKERS) {
    const markerNorm = marker.replace(/\\/g, '/').toLowerCase();
    const idx = lower.lastIndexOf(markerNorm);
    if (idx >= 0) {
      return normalized
        .slice(idx + markerNorm.length)
        .split('/')
        .filter(Boolean);
    }
  }

  // Match ".../files/<relative>" even when the root folder name is just "files".
  const filesIdx = lower.lastIndexOf('/files/');
  if (filesIdx >= 0) {
    return normalized
      .slice(filesIdx + '/files/'.length)
      .split('/')
      .filter(Boolean);
  }

  const parts = normalized.split('/').filter(Boolean);
  // Strip Windows drive letter segment ("C:").
  if (parts[0]?.match(/^[A-Za-z]:$/)) {
    parts.shift();
  }

  const topIdx = parts.findIndex((p) => FILES_TOP_DIRS.has(p.toLowerCase()));
  if (topIdx >= 0) {
    return parts.slice(topIdx);
  }

  // Already relative (no leading slash / drive).
  if (!filePath.trim().startsWith('/') && !/^[A-Za-z]:[\\/]/.test(filePath.trim())) {
    return parts;
  }

  return [];
}

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
    if (['states'].includes(arr[0])) {
      this.router.navigate(['states']).then();
      return;
    }
    if (['state'].includes(arr[0]) && Number.isInteger(+arr[1])) {
      this.router.navigate(['state', arr[1]]).then();
      return;
    }
    if (['sr', 'state-requirement'].includes(arr[0]) && Number.isInteger(+arr[1])) {
      this.router.navigate(['state-requirement', arr[1]]).then();
      return;
    }
    if (['directions'].includes(arr[0])) {
      this.router.navigate(['directions']).then();
      return;
    }
    if (['due', 'due-date', 'due-date-tasks'].includes(arr[0])) {
      this.router.navigate(['due-date-tasks']).then();
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
    if (val.type === 'file') {
      this.navigateToFileAlias(val.filePath);
      return;
    }

    const id = val.itemId;
    if (!id) {
      this.alertService.showAlert('Alias has no target id');
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
    if (val.type === 'knowledge-node') {
      this.navigateToKnowledgeNode(id);
    }

    if (val.type === 'repetitive-task') {
      this.navigateToScheduledTask(id);
    }
  }

  /** Open a file alias in the files viewer (`/files/<relative-path>`). */
  private navigateToFileAlias(filePath: string | undefined): void {
    if (!filePath) {
      this.alertService.showAlert('File alias has no path');
      return;
    }
    const segments = relativeFilesPathSegments(filePath);
    if (!segments.length) {
      this.alertService.showAlert(`Could not resolve file path: ${filePath}`);
      return;
    }
    void this.router.navigate(['files', ...segments]);
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
