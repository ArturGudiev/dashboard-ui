import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
} from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { type TaskContainer } from '../../../models/interfaces/task-container';
import { FilesService, type FileListItem } from '../../../services/files.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-container-files-list',
  standalone: true,
  imports: [MatIconModule],
  templateUrl: './container-files-list.component.html',
  styleUrls: ['./container-files-list.component.sass'],
})
export class ContainerFilesListComponent {
  container = input.required<TaskContainer>();

  private filesService = inject(FilesService);
  private router = inject(Router);

  private readonly filesResource = rxResource({
    params: () => {
      const c = this.container();
      return { type: c.type, id: c.id };
    },
    stream: ({ params }) => this.filesService.listContainerFiles(params.type, params.id),
    defaultValue: [] as FileListItem[],
  });

  readonly files = computed(() => this.filesResource.value() ?? []);
  readonly hasFiles = computed(() => this.files().length > 0);

  fileLabel(file: FileListItem): string {
    const parts = file.path.split('/');
    return parts[parts.length - 1] || file.path;
  }

  onFileClick(file: FileListItem): void {
    if (file.isDir) {
      return;
    }
    const segments = file.path.split('/').filter(Boolean);
    void this.router.navigate(['files', ...segments]);
  }
}
