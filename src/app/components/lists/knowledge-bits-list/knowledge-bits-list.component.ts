import { ChangeDetectionStrategy, Component, DestroyRef, inject, input, OnInit, output } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { type Knowledge } from '../../../models/knowledge';
import { type TaskContainer } from '../../../models/interfaces/task-container';
import { CommandsService } from '../../../services/commands.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-knowledge-bits-list',
  imports: [MatTableModule, MatButtonModule, MatIconModule],
  templateUrl: './knowledge-bits-list.component.html',
  standalone: true,
  styleUrls: ['./knowledge-bits-list.component.sass'],
})
export class KnowledgeBitsListComponent implements OnInit {
  container = input.required<TaskContainer>();
  knowledgeBits = input.required<Knowledge[]>();
  showAddButton = input<boolean>(false);
  knowledgeBitClick = output<Knowledge>();
  addKnowledgeBit = output<void>();

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
    if (['knowledge', 'k+', 'kb+', 'knowledge-bit', 'kb'].includes(cmd)) {
      this.addKnowledgeBit.emit();
    }
  }

  firstLine(value: string): string {
    const line = value.split(/\r?\n/)[0] ?? '';
    return line.trim();
  }

  onKnowledgeBitClick(knowledgeBit: Knowledge): void {
    this.knowledgeBitClick.emit(knowledgeBit);
  }
}
