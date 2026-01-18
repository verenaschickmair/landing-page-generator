import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';
import { DatabaseService } from 'src/app/services/database.service';
import { StorageService } from 'src/app/services/storage.service';

@Component({
    selector: 'app-modal',
    templateUrl: './modal.component.html',
    styleUrls: ['./modal.component.css'],
    standalone: false
})
export class ModalComponent implements OnInit, OnDestroy {
  @Input() saveMode? = false;
  @Input() namingMode? = false;

  @Output() closeModal = new EventEmitter<boolean>();
  @Output() setVersionName = new EventEmitter<string>();

  private subscriptions = new Subscription();

  constructor(
    private databaseService: DatabaseService,
    private authService: AuthService,
    public storageService: StorageService,
    private cdRef: ChangeDetectorRef
  ) {}

  public url = '';
  public versionName = '';

  ngOnInit() {
    if (this.storageService.currentFile$.getValue()) {
      this.subscriptions.add(
        this.databaseService
          .readData(
            'landingpages',
            this.authService.user$.value?.id +
              '/' +
              this.storageService.currentFile$.getValue().split('.')[0]
          )
          .subscribe((data: any) => {
            this.url = data.url;
            this.cdRef.detectChanges();
          })
      );
    }
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  public saveVersion(): void {
    if (!this.versionName.length) {
      this.versionName = this.storageService.currentFile$
        .getValue()
        .split('.')[0];
    }
    this.versionName = this.versionName.toLowerCase().replace(/ /g, '-');
    this.setVersionName.emit(this.versionName);
    this.closeModal.emit(false);
  }

  public clickCloseModal(): void {
    this.closeModal.emit(false);
  }
}
