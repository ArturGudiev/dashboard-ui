import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { type MmNode } from '../../../shared/libs/mm-parser.lib';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-mm-node',
  standalone: true,
  imports: [MatIconModule, MmNodeComponent],
  templateUrl: './mm-node.component.html',
  styleUrls: ['./mm-node.component.sass'],
})
export class MmNodeComponent {
  readonly node = input.required<MmNode>();
  readonly depth = input(0);
  readonly toggle = output<string>();
}
