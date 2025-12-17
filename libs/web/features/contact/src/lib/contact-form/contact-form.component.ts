import {
  Component,
  Output,
  EventEmitter,
  signal,
  ChangeDetectionStrategy,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import {
  InputComponent,
  TextareaComponent,
  CheckboxComponent,
  SelectComponent,
  ButtonComponent,
  SelectOption,
} from '@tanzmoment/shared/ui';
import {
  ContactService,
  ContactFormDto,
  ContactFormError,
} from '@tanzmoment/shared/services';

export interface ContactFormValue {
  name: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
  privacyAccepted: boolean;
}

@Component({
  selector: 'tm-contact-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    InputComponent,
    TextareaComponent,
    CheckboxComponent,
    SelectComponent,
    ButtonComponent,
  ],
  templateUrl: './contact-form.component.html',
  styleUrl: './contact-form.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactFormComponent {
  private readonly fb = inject(FormBuilder);
  private readonly contactService = inject(ContactService);

  @Output() formSubmitted = new EventEmitter<boolean>();

  // ───────────────────────────────────────────────────────────────────────────
  // FORM STATE
  // ───────────────────────────────────────────────────────────────────────────

  readonly isSubmitting = signal(false);
  readonly submitSuccess = signal(false);
  readonly submitError = signal<string | null>(null);

  // ───────────────────────────────────────────────────────────────────────────
  // SUBJECT OPTIONS
  // ───────────────────────────────────────────────────────────────────────────

  readonly subjectOptions: SelectOption[] = [
    { value: 'kursanfrage', label: 'Kursanfrage' },
    { value: 'anmeldung', label: 'Anmeldung' },
    { value: 'feedback', label: 'Feedback' },
    { value: 'kooperation', label: 'Kooperation / Zusammenarbeit' },
    { value: 'sonstiges', label: 'Sonstiges' },
  ];

  // ───────────────────────────────────────────────────────────────────────────
  // FORM DEFINITION
  // ───────────────────────────────────────────────────────────────────────────

  readonly contactForm: FormGroup = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    phone: [''],
    subject: ['', [Validators.required, Validators.minLength(3)]],
    message: [
      '',
      [Validators.required, Validators.minLength(10), Validators.maxLength(500)],
    ],
    privacyAccepted: [false, [Validators.requiredTrue]],
  });

  // ───────────────────────────────────────────────────────────────────────────
  // ERROR MESSAGES
  // ───────────────────────────────────────────────────────────────────────────

  getErrorMessage(fieldName: string): string {
    const control = this.contactForm.get(fieldName);
    if (!control || !control.errors || !control.touched) return '';

    const errors = control.errors;

    const errorMessages: Record<string, Record<string, string>> = {
      name: {
        required: 'Bitte gib deinen Namen an.',
        minlength: 'Der Name muss mindestens 2 Zeichen lang sein.',
      },
      email: {
        required: 'Bitte gib deine E-Mail-Adresse an.',
        email: 'Bitte gib eine gültige E-Mail-Adresse an.',
      },
      phone: {
        pattern: 'Bitte gib eine gültige Telefonnummer an.',
      },
      subject: {
        required: 'Bitte wähle einen Betreff aus.',
        minlength: 'Der Betreff muss mindestens 3 Zeichen lang sein.',
      },
      message: {
        required: 'Bitte schreib uns eine Nachricht.',
        minlength: 'Die Nachricht muss mindestens 10 Zeichen lang sein.',
        maxlength: 'Die Nachricht darf maximal 500 Zeichen lang sein.',
      },
      privacyAccepted: {
        required: 'Bitte akzeptiere die Datenschutzerklärung.',
      },
    };

    const fieldErrors = errorMessages[fieldName];
    if (!fieldErrors) return '';

    for (const errorKey of Object.keys(errors)) {
      if (fieldErrors[errorKey]) {
        return fieldErrors[errorKey];
      }
    }

    return '';
  }

  hasError(fieldName: string): boolean {
    const control = this.contactForm.get(fieldName);
    return !!(control && control.invalid && control.touched);
  }

  // ───────────────────────────────────────────────────────────────────────────
  // FORM SUBMISSION
  // ───────────────────────────────────────────────────────────────────────────

  onSubmit(): void {
    // Mark all fields as touched to show validation errors
    this.contactForm.markAllAsTouched();

    if (this.contactForm.invalid) {
      return;
    }

    this.isSubmitting.set(true);
    this.submitError.set(null);
    this.submitSuccess.set(false);

    // Prepare form data
    const formData: ContactFormDto = {
      name: this.contactForm.get('name')?.value,
      email: this.contactForm.get('email')?.value,
      phone: this.contactForm.get('phone')?.value || undefined,
      subject: this.contactForm.get('subject')?.value,
      message: this.contactForm.get('message')?.value,
      privacyAccepted: this.contactForm.get('privacyAccepted')?.value,
    };

    // Send via ContactService
    this.contactService.sendContactForm(formData).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.submitSuccess.set(true);
        this.contactForm.reset();
        this.formSubmitted.emit(true);

        // Reset success message after 5 seconds
        setTimeout(() => {
          this.submitSuccess.set(false);
        }, 5000);
      },
      error: (error: ContactFormError) => {
        this.isSubmitting.set(false);
        this.submitError.set(error.message);
        this.formSubmitted.emit(false);
      },
    });
  }
}
