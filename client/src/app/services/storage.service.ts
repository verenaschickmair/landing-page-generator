import { Injectable } from '@angular/core';
import {
  deleteObject,
  getDownloadURL,
  getMetadata,
  getStorage,
  listAll,
  ref,
  uploadBytes,
} from '@angular/fire/storage';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { ApiService } from './api.service';
import { DatabaseService } from './database.service';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  constructor(
    private apiService: ApiService,
    private databaseService: DatabaseService,
    private router: Router
  ) {}

  private storage = getStorage();
  public files$ = new BehaviorSubject<any[]>([]);
  public currentFile$ = new BehaviorSubject<string>('');

  public clearFiles(): void {
    this.files$.next([]);
  }

  public saveUniqueFile(file: any): void {
    let files = this.files$.getValue();
    files = files.filter((f) => f.name !== file.name);
    files.push(file);
    files.sort((a, b) => {
      return Date.parse(b.createdAt) - Date.parse(a.createdAt);
    });

    this.files$.next(files);
  }

  public async uploadFile(
    path: string,
    fileName: string,
    code: string,
    overwrite = false
  ): Promise<void> {
    let file = new Blob([code], { type: 'text/html' });
    fileName = this.getFileName(fileName, overwrite);
    const storageRef = ref(this.storage, `${path}/${fileName}.html`);

    await uploadBytes(storageRef, file);
  }

  public getFileName(fileName: string, overwrite = false): string {
    const files = this.files$.getValue();
    let existingFile = files.find((f) => f.name === fileName + '.html');

    if (existingFile && !overwrite) {
      let i = 1;
      while (files.find((f) => f.name === fileName + '-copy-' + i + '.html')) {
        i++;
      }
      fileName = fileName + '-copy-' + i;
    }
    return fileName;
  }

  public async downloadFiles(path: string): Promise<void> {
    const storageRef = ref(this.storage, path);

    listAll(storageRef).then((list) => {
      list.items.map((ref) => {
        getMetadata(ref).then((metadata) => {
          let file = {
            id: metadata.generation,
            name: metadata.name,
            createdAt: metadata.updated,
            content: '',
          };

          getDownloadURL(ref).then((url) => {
            fetch(url)
              .then((response) => response.text())
              .then((content) => {
                file.content = content;
                this.saveUniqueFile(file);
              });
          });
        });
      });
    });
  }

  public async downloadFile(path: string, fileName: string): Promise<void> {
    getDownloadURL(ref(this.storage, `${path}/${fileName}`))
      .then((url) => {
        const xhr = new XMLHttpRequest();
        xhr.onload = () => {
          const blob = xhr.response;
          this.apiService.data$.next(blob);
        };
        xhr.open('GET', url);
        xhr.send();
      })
      .catch(() => {
        this.router.navigate(['/results'], {
          queryParams: null,
        });
      });
  }

  public async deleteFile(
    path: string,
    fileName: string,
    overwrite = false
  ): Promise<void> {
    const storageRef = ref(this.storage, `${path}/${fileName}`);
    await deleteObject(storageRef).then(async () => {
      if (!overwrite) {
        await this.databaseService.deleteData(
          'landingpages/' + path,
          fileName.split('.')[0]
        );
      }
      this.downloadFiles(path);
    });
  }
}
