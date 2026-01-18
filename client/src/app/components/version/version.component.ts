import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { DatabaseService } from 'src/app/services/database.service';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-version',
  templateUrl: './version.component.html',
  styleUrls: ['./version.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VersionComponent implements OnInit, OnDestroy {
  @Input() code = '';
  @Input() currentVersion?: any;
  @Output() showModal = new EventEmitter<any>();

  public showSidebar = true;
  public shouldShowModal = false;
  public namingMode = false;
  public loading = false;
  public pageInfos: any;
  private user?: any;
  public versions: any[] = [];

  public deleteMode = false;
  public deployMode = false;
  public navigateMode = false;
  public regenerateMode = false;

  private subscriptions = new Subscription();
  private pageInfoSubscription = new Subscription();

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private storageService: StorageService,
    private databaseService: DatabaseService,
    private cdRef: ChangeDetectorRef,
    public router: Router,
  ) {}

  ngOnInit() {
    this.listenToUser();
    this.listenToFiles();
    this.listenToLoading();
    this.listenToCurrentFile();
    this.listenToPageInfos();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private listenToLoading(): void {
    this.subscriptions.add(
      this.apiService.loading$.subscribe((loading) => {
        this.loading = loading;
        this.cdRef.detectChanges();
      }),
    );
  }

  public logout(): void {
    this.authService.logout();
  }

  public toggleSidebar(): void {
    this.showSidebar = !this.showSidebar;
  }

  private listenToUser(): void {
    this.subscriptions.add(
      this.authService.user$.subscribe((user) => {
        if (!user) return;
        this.user = user;
        this.loadVersions();
        this.cdRef.detectChanges();
      }),
    );
  }

  private listenToFiles(): void {
    this.subscriptions.add(
      this.storageService.files$.subscribe((files) => {
        this.versions = files;
        this.cdRef.detectChanges();
      }),
    );
  }

  private listenToCurrentFile(): void {
    this.subscriptions.add(
      this.storageService.currentFile$.subscribe((file) => {
        this.currentVersion = file;
        this.listenToPageInfos();
        this.cdRef.detectChanges();
      }),
    );
  }

  private listenToPageInfos(): void {
    if (!this.user || !this.currentVersion) return;

    this.pageInfoSubscription.unsubscribe();
    this.pageInfoSubscription = new Subscription();

    this.pageInfoSubscription.add(
      this.databaseService
        .readData(
          'landingpages',
          this.user.id + '/' + this.currentVersion.split('.')[0],
        )
        .subscribe((infos) => {
          this.pageInfos = infos;
          this.cdRef.detectChanges();
        }),
    );
  }

  public async loadVersion(file: any): Promise<void> {
    if (!this.user || file.name === this.currentVersion) return;

    this.storageService.currentFile$.next(file.name);
    await this.storageService.downloadFile(this.user.id, file.name);

    this.cdRef.detectChanges();
  }

  public async loadVersions(): Promise<void> {
    if (!this.user) return;
    this.storageService.clearFiles();
    await this.storageService.downloadFiles(this.user.id);
    this.cdRef.detectChanges();
  }

  public async showSavingModal(): Promise<void> {
    if (!this.user) return;
    this.showModalVersion(true, true);
  }

  public async saveVersion(fileName: string): Promise<void> {
    if (!this.user) return;

    if (!fileName) {
      fileName = this.currentVersion.split('.')[0];
    }

    this.apiService.loading$.next(true);
    this.storageService
      .uploadFile(this.user.id, fileName, this.code)
      .then(async () => {
        setTimeout(async () => {
          this.databaseService.updateData(
            'landingpages',
            this.user.id + '/' + fileName,
            this.pageInfos,
          );
          await this.loadVersions();
          setTimeout(async () => {
            this.loadVersion({ name: this.versions[0].name });
            this.apiService.loading$.next(false);
            this.cdRef.detectChanges();
          }, 2000);
        }, 2000);
      });
  }

  public deployVersion(): void {
    if (!this.user || !this.currentVersion || !this.code) return;

    if (!this.deployMode) {
      this.deployMode = true;
      this.cdRef.detectChanges();
      return;
    } else {
      this.apiService.loading$.next(true);
      this.apiService
        .deployVersion(this.code, this.user.id, this.currentVersion)
        .then(async (res) => {
          if (!res) {
            console.error('Error deploying version');
            return;
          }
          setTimeout(async () => {
            let url = await res.json();
            await this.databaseService.updateData(
              'landingpages',
              this.user.id + '/' + this.currentVersion.split('.')[0],
              JSON.parse(url),
            );
            this.apiService.loading$.next(false);
            this.showModal.emit(this.currentVersion);
          }, 5000);
        });
    }
  }

  public async deleteVersion(): Promise<void> {
    if (!this.user || !this.currentVersion) return;

    if (!this.deleteMode) {
      this.deleteMode = true;
      this.cdRef.detectChanges();
      return;
    } else {
      this.apiService.loading$.next(true);
      this.storageService
        .deleteFile(this.user.id, this.currentVersion)
        .then(async () => {
          await this.databaseService.deleteData(
            'landingpages',
            this.user.id + '/' + this.currentVersion.split('.')[0],
          );
          setTimeout(async () => {
            this.loadVersions();
            setTimeout(async () => {
              this.storageService.currentFile$.next(this.versions[0].name);
              this.apiService.loading$.next(false);
              this.cdRef.detectChanges();
            }, 2000);
          }, 2000);
        });
    }
  }

  public showModalVersion(shouldShow = false, namingMode = false): void {
    this.namingMode = namingMode;
    this.shouldShowModal = shouldShow;
    this.cdRef.detectChanges();
  }

  public regeneratePage(): void {
    if (this.pageInfos) {
      this.apiService.controller.abort('Start regeneration');
      this.apiService
        .sendInitialPrompt(this.pageInfos)
        .then(async (res: any) => {
          if (!res) {
            return;
          }
          await this.storageService.deleteFile(
            this.user.id,
            this.currentVersion,
            true,
          );
          setTimeout(async () => {
            await this.storageService.uploadFile(
              this.user.id,
              this.currentVersion.split('.')[0],
              res.data,
              true,
            );
            setTimeout(async () => {
              await this.storageService.downloadFiles(this.user.id);
              this.cdRef.detectChanges();
            }, 3000);
          }, 3000);
        });
    } else {
      console.error('No page infos in database');
    }
  }
}
