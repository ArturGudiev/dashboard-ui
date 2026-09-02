import { ChangeDetectionStrategy, Component, DestroyRef, inject, input, OnInit, output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { type Definition } from '../../../models/definition';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommandsService } from '../../../services/commands.service';
import { type TaskContainer } from '../../../models/interfaces/task-container';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-definitions-list',
  imports: [MatTableModule, MatButtonModule, MatIconModule],
  templateUrl: './definitions-list.component.html',
  standalone: true,
  styleUrls: ['./definitions-list.component.sass'],
})
export class DefinitionsListComponent implements OnInit {
  container = input.required<TaskContainer>();
  definitions = input.required<Definition[]>();
  showAddButton = input<boolean>(false);
  definitionClick = output<Definition>();
  addDefinition = output<void>();

  readonly displayedColumns: string[] = ['name', 'value'];

  private commandsService = inject(CommandsService);
  private destroyRef = inject(DestroyRef);

  ngOnInit(): void {
    this.commandsService.getDataStateChange()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((state) => {
        this.handleTaskCommand(state.command);
      });
  }

  private handleTaskCommand(command: string): void {
    const cmd = command.split(' ')[0];
    if (['definition', 'd+', 'def+'].includes(cmd)) {
      this.addDefinition.emit();
    }
  }

  onDefinitionClick(definition: Definition): void {
    this.definitionClick.emit(definition);
  }
}
