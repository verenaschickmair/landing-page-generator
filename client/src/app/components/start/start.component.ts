import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-start',
  templateUrl: './start.component.html',
  styleUrls: ['./start.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StartComponent implements OnInit {
  public user: any;
  public versions: any[] = [];
  public deleteMode = false;

  constructor(
    private authService: AuthService,
    private cdRef: ChangeDetectorRef,
    private storageService: StorageService,
    private router: Router
  ) {}

  async ngOnInit(): Promise<void> {
    this.listenToUser();
  }

  private listenToUser(): void {
    this.authService.user$.subscribe((user) => {
      this.user = user;
      this.listenToFiles();
      this.cdRef.detectChanges();
    });
  }

  private listenToFiles(): void {
    this.storageService.files$.subscribe((files) => {
      if (!files.length) {
        this.loadVersions();
      } else {
        this.versions = files;
      }
      this.cdRef.detectChanges();
    });
  }

  public async loadVersions(): Promise<void> {
    if (!this.user) return;
    await this.storageService.downloadFiles(this.user.id);
    this.cdRef.detectChanges();
  }

  public logout(): void {
    this.authService.logout();
  }

  public createVersion(): void {
    this.router.navigate(['form']);
  }

  public openWarningModal(): void {
    this.deleteMode = true;
    this.cdRef.detectChanges();
  }

  public async deleteVersion(file: string): Promise<void> {
    await this.storageService.deleteFile(this.user.id, file);
    this.cdRef.detectChanges();
  }
}
