import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ApiService } from 'src/app/services/api.service';
import { AuthService } from 'src/app/services/auth.service';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-result',
  templateUrl: './result.component.html',
  styleUrls: ['./result.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class ResultComponent implements OnInit, AfterViewInit {
  @ViewChild('refinementPrompt')
  public promptInput!: ElementRef<HTMLTextAreaElement>;
  public code = '';
  public iframeCode = '';
  public selectedIframeCode = '';
  public selectedVersion?: number;
  public currentVersion?: string;

  public refinementData = '';
  public editMode = false;
  public shouldShowModal = false;
  public enableSelect = false;

  public loading = false;
  public loadingSpinner = false;
  public isInitial = false;

  private subscriptions = new Subscription();

  constructor(
    private apiService: ApiService,
    private authService: AuthService,
    private route: ActivatedRoute,
    private cdRef: ChangeDetectorRef,
    private storageService: StorageService,
    private router: Router
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    const isInitial = this.route.snapshot.queryParams['initial'];

    if (id) {
      this.subscriptions.add(
        this.authService.user$.subscribe(async (user) => {
          if (user) {
            if (!isInitial) {
              await this.loadVersion(user, id);
            } else {
              this.router.navigate([], {
                queryParams: null,
              });
            }
            this.storageService.currentFile$.next(id);
            this.cdRef.detectChanges();
          }
        })
      );
    }

    this.subscriptions.add(
      this.apiService.data$.subscribe((data) => {
        this.code = data;
        this.appendToIframe(data);
        this.cdRef.detectChanges();
      })
    );

    this.subscriptions.add(
      this.apiService.loading$.subscribe((loading) => {
        this.loading = loading;
        if (!loading) {
          this.addExternalStyles();
        }
        this.cdRef.detectChanges();
      })
    );

    this.subscriptions.add(
      this.apiService.mainLoader$.subscribe((loader) => {
        this.loadingSpinner = loader;
        this.cdRef.detectChanges();
      })
    );
  }

  ngAfterViewInit(): void {
    this.addExternalStyles();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  public async loadVersion(user: any, fileName: any): Promise<void> {
    this.apiService.loading$.next(true);
    await this.storageService.downloadFile(user.id, fileName);
    this.apiService.loading$.next(false);
    this.cdRef.detectChanges();
  }

  public appendToIframe(doc: string): void {
    const iframe = document.getElementById('iframe');

    if (iframe) {
      const iframeDocument = iframe as HTMLIFrameElement;

      if (iframeDocument.contentDocument) {
        const contentDocument = iframeDocument.contentDocument;

        // Append the new document to the iframe
        if (doc) {
          contentDocument.body.innerHTML = doc;
        }

        //prevent all links from opening in new tab
        contentDocument.querySelectorAll('a').forEach((link) => {
          link.addEventListener('click', (event) => {
            event.preventDefault();
          });
        });

        if (!this.loading && (this.enableSelect || this.selectedIframeCode)) {
          // Select and apply styles and event listeners to child nodes
          const sectionNodes = contentDocument.querySelectorAll(
            'section, header, footer'
          );

          // Loop through all nodes and apply styles and event listeners
          sectionNodes.forEach((node, i) => {
            const element = node as HTMLElement;

            // Create edit icon div
            const editDiv = document.createElement('span');
            editDiv.classList.add('edit-icon');

            // Add SVG pencil icon
            const svgIcon = `
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
              </svg>`;
            editDiv.innerHTML = svgIcon;

            const text = document.createTextNode('Select');
            editDiv.appendChild(text);
            element.appendChild(editDiv);
            editDiv.style.display = 'none';

            //Mouseover
            element.addEventListener('mouseover', () => {
              element.classList.toggle('pointer');
              editDiv.style.display = 'flex';
            });

            //Mouseout
            element.addEventListener('mouseout', () => {
              element.classList.toggle('pointer');
              if (!element.classList.contains('selected')) {
                editDiv.style.display = 'none';
              } else {
                editDiv.style.display = 'flex';
              }
            });

            //Click
            element.addEventListener('click', () => {
              element.classList.toggle('selected');
              editDiv.style.display = 'none';

              const tempId = element.id;
              const tempDiv = document.createElement('div');
              tempDiv.innerHTML = this.code;
              const selectedContent = tempDiv.querySelector(`#${tempId}`);

              if (selectedContent && selectedContent.outerHTML) {
                this.selectedIframeCode =
                  !this.selectedIframeCode ||
                  this.selectedIframeCode !== selectedContent.outerHTML
                    ? selectedContent.outerHTML
                    : '';
              }

              if (this.selectedVersion === i + 1) {
                this.selectedVersion = undefined;
              } else {
                this.selectedVersion = i + 1;
              }

              sectionNodes.forEach((node) => {
                if ((node as HTMLElement) !== element) {
                  node.classList.remove('selected');
                  (node as HTMLElement).getElementsByTagName(
                    'span'
                  )[0].style.display = 'none';
                }
              });

              this.cdRef.detectChanges();
            });
          });
        } else {
          this.selectedIframeCode = '';
          this.selectedVersion = undefined;
        }

        this.iframeCode = contentDocument.body.innerHTML;
        this.cdRef.detectChanges();
      }
    }
  }

  public async sendPrompt(): Promise<void> {
    if (this.promptInput.nativeElement.value.length > 0) {
      this.apiService.loading$.next(true);

      this.apiService
        .sendRefinementPrompt(
          this.promptInput.nativeElement.value,
          this.selectedIframeCode.length > 0
            ? this.selectedIframeCode
            : this.code,
          !this.selectedIframeCode.length
        )
        .then((changedCode) => {
          changedCode.text().then((refinedCode) => {
            if (!refinedCode) {
              this.apiService.loading$.next(false);
              this.cdRef.detectChanges();
              return;
            }

            const tempDiv = document.createElement('html');
            tempDiv.innerHTML = this.code;

            if (
              this.selectedIframeCode &&
              tempDiv.innerHTML.includes(this.selectedIframeCode)
            ) {
              const replacedCode = tempDiv.innerHTML.replace(
                this.selectedIframeCode,
                refinedCode
              );

              const editCode =
                '<!DOCTYPE html>\n<html lang="en">\n' +
                replacedCode +
                '\n</html>';
              this.iframeCode = editCode;
              this.code = editCode;
              this.apiService.data$.next(editCode);

              this.apiService.loading$.next(false);
              this.promptInput.nativeElement.value = '';
              this.appendToIframe(this.iframeCode);

              this.cdRef.detectChanges();
            }
          });
        });
    }
  }
  public showModal(currentVersion: any): void {
    this.shouldShowModal = !!currentVersion;
    this.storageService.currentFile$.next(currentVersion + '.html');
    this.cdRef.detectChanges();
  }

  public toggleSelectMode(): void {
    this.enableSelect = !this.enableSelect;
    this.appendToIframe(this.iframeCode);
    if (!this.enableSelect) {
      this.selectedIframeCode = '';
      this.selectedVersion = undefined;
    }
    this.cdRef.detectChanges();
  }

  private addExternalStyles(): void {
    const iframe = document.getElementById('iframe');
    //add link only if not already added
    if (iframe) {
      const iframeDocument = iframe as HTMLIFrameElement;
      const contentDocument = iframeDocument.contentDocument;
      const link = contentDocument?.head.querySelectorAll('link');
      const head = contentDocument?.head;

      if (contentDocument && !link?.length && head) {
        const linkElement = contentDocument.createElement('link');
        linkElement.rel = 'stylesheet';
        linkElement.href = 'styles.css';
        linkElement.type = 'text/css';
        head?.appendChild(linkElement);
      }
    }
  }
}
