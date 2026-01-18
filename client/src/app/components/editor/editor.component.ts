import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';
import * as CodeMirror from 'codemirror';

import { ApiService } from 'src/app/services/api.service';

export type CodeEditorMode = 'javascript' | 'html' | 'htmlmixed';

@Component({
    selector: 'app-editor',
    template: `<textarea #editorHolder></textarea>`,
    standalone: false
})
export class EditorComponent implements AfterViewInit, ControlValueAccessor {
  constructor(private apiService: ApiService) {}

  @ViewChild('editorHolder', { static: true })
  editorHolder: any;

  @Input()
  mode: CodeEditorMode = 'htmlmixed';

  @Input()
  lineNumbers: boolean = true;

  @Input()
  readonly: boolean = false;

  private code = '';

  @Output() codeChanged: EventEmitter<string> = new EventEmitter<string>();

  onTouched: (() => void) | undefined;
  onChanged: ((v: any) => void) | undefined;

  codeMirrorInstance: any;

  ngAfterViewInit(): void {
    this.codeMirrorInstance = CodeMirror.fromTextArea(
      this.editorHolder.nativeElement,
      {
        value: this.code ? this.code : '',
        mode: this.mode,
        theme: 'material',
        lineNumbers: this.lineNumbers,
        autoRefresh: true,
        lineWrapping: true,
      } as CodeMirror.EditorConfiguration
    );

    this.apiService.data$.subscribe((data) => {
      this.code = data;
      if (this.codeMirrorInstance.doc.getValue() !== this.code)
        this.codeMirrorInstance.doc.setValue(this.code);
    });

    this.codeMirrorInstance.on('change', (inst: any, obj: any) => {
      if (inst.doc.getValue() !== this.code) {
        this.code = inst.doc.getValue();
        if (this.onChanged) {
          this.onChanged(this.code);
        }
        this.apiService.data$.next(this.code);
      }
    });
  }

  writeValue(str: string): void {
    if (str !== this.code) {
      this.code = str;
      this.codeMirrorInstance.doc.setValue(this.code);
    }
  }

  setDisabledState(isDisabled: boolean): void {
    this.readonly = isDisabled;
    this.codeMirrorInstance.setOption('readOnly', isDisabled);
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  registerOnChange(fn: any): void {
    this.onChanged = fn;
  }
}
