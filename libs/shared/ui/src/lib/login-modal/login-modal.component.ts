import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  signal,
  inject,
  PLATFORM_ID,
  OnChanges,
  SimpleChanges,
  OnDestroy,
} from '@angular/core';
import { CommonModule, isPlatformBrowser, DOCUMENT } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../icon/icon.component';
import { ButtonComponent } from '../button/button.component';
import { InputComponent } from '../input/input.component';

@Component({
  selector: 'ui-login-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, IconComponent, ButtonComponent, InputComponent],
  templateUrl: './login-modal.component.html',
  styleUrls: ['./login-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginModalComponent implements OnChanges, OnDestroy {
  @Input() isOpen = false;
  @Output() closed = new EventEmitter<void>();
  @Output() loginSubmitted = new EventEmitter<{ email: string; password: string }>();

  private readonly platformId = inject(PLATFORM_ID);
  private readonly document = inject(DOCUMENT);

  readonly email = signal('');
  readonly password = signal('');
  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  private escListener?: () => void;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen']) {
      if (this.isOpen) {
        this.lockScroll();
        this.addEscListener();
      } else {
        this.unlockScroll();
        this.removeEscListener();
        this.reset();
      }
    }
  }

  ngOnDestroy(): void {
    this.unlockScroll();
    this.removeEscListener();
  }

  onSubmit(): void {
    const emailVal = this.email().trim();
    const passwordVal = this.password();

    if (!emailVal || !passwordVal) {
      this.errorMessage.set('Bitte E-Mail und Passwort eingeben.');
      return;
    }

    this.errorMessage.set(null);
    this.loading.set(true);
    this.loginSubmitted.emit({ email: emailVal, password: passwordVal });
  }

  setError(message: string): void {
    this.errorMessage.set(message);
    this.loading.set(false);
  }

  setLoading(state: boolean): void {
    this.loading.set(state);
  }

  onBackdropClick(): void {
    if (!this.loading()) {
      this.closed.emit();
    }
  }

  onClose(): void {
    if (!this.loading()) {
      this.closed.emit();
    }
  }

  private reset(): void {
    this.email.set('');
    this.password.set('');
    this.errorMessage.set(null);
    this.loading.set(false);
  }

  private lockScroll(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.document.body.style.overflow = 'hidden';
    }
  }

  private unlockScroll(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.document.body.style.overflow = '';
    }
  }

  private addEscListener(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    const handler = (e: Event) => {
      if ((e as KeyboardEvent).key === 'Escape' && !this.loading()) {
        this.closed.emit();
      }
    };
    this.document.addEventListener('keydown', handler);
    this.escListener = () => this.document.removeEventListener('keydown', handler);
  }

  private removeEscListener(): void {
    this.escListener?.();
    this.escListener = undefined;
  }
}
