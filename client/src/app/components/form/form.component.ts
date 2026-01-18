import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { DatabaseService } from 'src/app/services/database.service';
import { StorageService } from 'src/app/services/storage.service';

@Component({
    selector: 'app-form',
    templateUrl: './form.component.html',
    styleUrls: ['./form.component.css'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    standalone: false
})
export class FormComponent implements OnInit {
  public useGPT4 = false;

  public formGroup = new FormGroup({
    name: new FormControl('', Validators.required),
    description: new FormControl(''),
    goals: new FormControl(''),
    target_group: new FormControl(''),
    colors: new FormArray([new FormControl('#16a34a')]),
    additional_info: new FormControl(''),
    creativity: new FormControl(50),
    model: new FormControl(''),
  });

  constructor(
    private authService: AuthService,
    private apiService: ApiService,
    private cdRef: ChangeDetectorRef,
    private databaseService: DatabaseService,
    private storageService: StorageService
  ) {}

  ngOnInit(): void {
    const project = sessionStorage.getItem('project');
    const sessionProject = project ? JSON.parse(project) : null;

    if (sessionProject) {
      this.formGroup.patchValue(sessionProject);
      this.removeColorControl();
      for (const color of sessionProject.colors) {
        this.addColorControl(color);
      }
    }
  }

  public initGeneration(): void {
    this.formGroup.value.model = this.useGPT4
      ? 'gpt-4-1106-preview'
      : 'gpt-3.5-turbo';

    sessionStorage.setItem('project', JSON.stringify(this.formGroup.value));

    this.apiService
      .sendInitialPrompt(this.formGroup.value)
      .then(async (res) => {
        if (!res) {
          return;
        }
        //STORAGE
        await this.storageService.uploadFile(
          this.authService.user$.value?.id,
          res.fileName,
          res.data
        );

        const fileName = this.storageService.getFileName(res.fileName);

        //DATABASE
        await this.databaseService.setData(
          'landingpages/',
          this.authService.user$.value?.id + '/' + fileName,
          this.formGroup.value
        );

        setTimeout(async () => {
          await this.storageService.downloadFiles(
            this.authService.user$.value?.id
          );
          this.cdRef.detectChanges();
        }, 3000);
      });
  }

  public addColorControl(color = '#ffffff'): void {
    (this.formGroup.controls.colors as FormArray).push(new FormControl(color));
  }

  public removeColorControl(): void {
    (this.formGroup.controls.colors as FormArray).removeAt(
      (this.formGroup.controls.colors as FormArray).length - 1
    );
  }

  public onChangeColor(index: any, color: Event): void {
    (this.formGroup.controls.colors as FormArray).at(index).setValue(color);
  }

  public goBack(): void {
    history.back();
  }
}
