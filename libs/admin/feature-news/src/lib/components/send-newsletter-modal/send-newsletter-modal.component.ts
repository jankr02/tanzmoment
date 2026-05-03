import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface SendModalSubmit {
  mode: 'TEST' | 'NOW' | 'SCHEDULED';
  email?: string;
  scheduledAt?: string;
}

@Component({
  selector: 'admin-send-newsletter-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './send-newsletter-modal.component.html',
  styleUrl: './send-newsletter-modal.component.scss',
})
export class SendNewsletterModalComponent {
  @Input() title = 'Newsletter versenden';
  @Input() defaultEmail = '';
  @Input() saving = false;
  @Output() send = new EventEmitter<SendModalSubmit>();
  @Output() cancelClick = new EventEmitter<void>();

  readonly mode = signal<'TEST' | 'NOW' | 'SCHEDULED'>('TEST');
  testEmail = '';
  scheduledAt = '';
  errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    if (this.defaultEmail) this.testEmail = this.defaultEmail;
  }

  submit(): void {
    this.errorMessage.set(null);

    if (this.mode() === 'TEST') {
      if (!this.testEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.testEmail)) {
        this.errorMessage.set('Bitte gib eine gültige Test-E-Mail-Adresse ein.');
        return;
      }
      this.send.emit({ mode: 'TEST', email: this.testEmail });
      return;
    }

    if (this.mode() === 'SCHEDULED') {
      if (!this.scheduledAt) {
        this.errorMessage.set('Bitte wähle einen Versandzeitpunkt.');
        return;
      }
      const dt = new Date(this.scheduledAt);
      if (isNaN(dt.getTime()) || dt.getTime() < Date.now()) {
        this.errorMessage.set('Versandzeitpunkt liegt in der Vergangenheit.');
        return;
      }
      this.send.emit({ mode: 'SCHEDULED', scheduledAt: dt.toISOString() });
      return;
    }

    this.send.emit({ mode: 'NOW' });
  }

  cancel(): void {
    this.cancelClick.emit();
  }
}
