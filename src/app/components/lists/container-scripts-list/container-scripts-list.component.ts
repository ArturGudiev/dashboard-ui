import { ChangeDetectionStrategy, Component, DestroyRef, inject, input, output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { type ScriptListItem } from '../../../models/script';
import { type TaskContainer } from '../../../models/interfaces/task-container';
import { ScriptsApiService } from '../../../services/scripts-api.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-container-scripts-list',
  standalone: true,
  templateUrl: './container-scripts-list.component.html',
  styleUrls: ['./container-scripts-list.component.sass'],
  imports: [
    MatTableModule,
    MatButtonModule,
    MatIconModule,
  ],
})
export class ContainerScriptsListComponent {
  container = input.required<TaskContainer>();
  scripts = input.required<ScriptListItem[]>();

  addScriptClick = output<void>();
  scriptClick = output<ScriptListItem>();
  refreshScripts = output<void>();

  readonly displayedColumns: string[] = ['name', 'delete'];

  private scriptsApi = inject(ScriptsApiService);
  private destroyRef = inject(DestroyRef);

  onAddScriptClick(): void {
    this.addScriptClick.emit();
  }

  onScriptClick(script: ScriptListItem): void {
    this.scriptClick.emit(script);
  }

  onDeleteScript(script: ScriptListItem, event: MouseEvent): void {
    event.stopPropagation();
    this.scriptsApi.delete(script.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.refreshScripts.emit());
  }
}
