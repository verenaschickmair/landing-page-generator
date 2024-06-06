import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-warning-modal',
  templateUrl: './warning-modal.component.html',
  styleUrls: ['./warning-modal.component.css'],
})
export class WarningModalComponent implements OnInit {
  @Input() message = '';
  @Input() mode = '';

  @Output() closeModal = new EventEmitter<boolean>();
  @Output() accept = new EventEmitter<boolean>();

  constructor() {}

  ngOnInit() {}

  public closeWarningModal(): void {
    this.closeModal.emit();
  }

  public acceptWarning(): void {
    this.accept.emit();
    this.closeModal.emit();
  }
}
