import { Component, ViewChild } from '@angular/core';
import { FileListComponent } from '../file-list/file-list.component';

@Component({
  selector: 'app-main-view',
  templateUrl: './main-view.component.html',
  styleUrls: ['./main-view.component.scss']
})
export class MainViewComponent {
  @ViewChild(FileListComponent) fileListComponent!: FileListComponent;

  refreshFileList(): void {
    this.fileListComponent.loadFiles();  // Explicitly call loadFiles on the child component
  }
}
