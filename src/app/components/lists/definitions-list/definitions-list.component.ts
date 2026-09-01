import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { type Definition } from '../../../models/definition';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-definitions-list',
  imports: [MatTableModule, MatButtonModule, MatIconModule],
  templateUrl: './definitions-list.component.html',
  standalone: true,
  styleUrls: ['./definitions-list.component.sass'],
})
export class DefinitionsListComponent {
  definitions = input.required<Definition[]>();
  showAddButton = input<boolean>(false);
  definitionClick = output<Definition>();
  addDefinition = output<void>();

  readonly displayedColumns: string[] = ['position', 'name', 'value'];

  onDefinitionClick(definition: Definition): void {
    this.definitionClick.emit(definition);
  }
}
