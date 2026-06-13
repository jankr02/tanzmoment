import {
  Component,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
  inject,
  signal,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
} from '@angular/forms';
import {
  AdminApiService,
  AdminSession,
  AdminLocation,
} from '@tanzmoment/admin/data-access';
import { StatusBadgeComponent } from '../status-badge/status-badge.component';
import { SessionSeriesDialogComponent } from '../session-series-dialog/session-series-dialog.component';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'admin-step-sessions',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DatePipe,
    StatusBadgeComponent,
    SessionSeriesDialogComponent,
    ConfirmDialogComponent,
  ],
  templateUrl: './step-sessions.component.html',
  styleUrls: ['./step-sessions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StepSessionsComponent {
  private readonly fb = inject(FormBuilder);
  private readonly adminApi = inject(AdminApiService);

  @Input({ required: true }) courseId!: string;
  @Input({ required: true }) sessions!: AdminSession[];
  @Input({ required: true }) locations!: AdminLocation[];
  @Input() courseDuration = 90;

  @Output() readonly sessionCreated = new EventEmitter<void>();
  @Output() readonly sessionCancelled = new EventEmitter<void>();

  readonly showAddForm = signal(false);
  readonly showSeriesDialog = signal(false);
  readonly cancelSessionId = signal<string | null>(null);
  readonly saving = signal(false);
  readonly addError = signal<string | null>(null);

  readonly addForm = this.fb.group({
    date: ['', Validators.required],
    startTime: ['17:00', Validators.required],
    endTime: ['18:30', Validators.required],
    locationId: ['', Validators.required],
  });

  /** Today as YYYY-MM-DD for the date input's min attribute. */
  get minDate(): string {
    return new Date().toISOString().split('T')[0];
  }

  addSession(): void {
    if (this.addForm.invalid) return;

    const v = this.addForm.getRawValue();
    const startTime = `${v.date}T${v.startTime}:00.000Z`;
    const endTime = `${v.date}T${v.endTime}:00.000Z`;

    if (new Date(startTime).getTime() < Date.now()) {
      this.addError.set(
        'Der Termin liegt in der Vergangenheit. Bitte wähle ein Datum in der Zukunft.',
      );
      return;
    }

    if (new Date(endTime).getTime() <= new Date(startTime).getTime()) {
      this.addError.set('Das Ende muss nach dem Start liegen.');
      return;
    }

    this.addError.set(null);
    this.saving.set(true);

    this.adminApi
      .createSession({
        courseId: this.courseId,
        startTime,
        endTime,
        locationId: v.locationId!,
      })
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.showAddForm.set(false);
          this.addForm.reset({ startTime: '17:00', endTime: '18:30' });
          this.sessionCreated.emit();
        },
        error: (err: HttpErrorResponse) => {
          this.saving.set(false);
          this.addError.set(
            err.error?.message ??
              'Termin konnte nicht erstellt werden. Bitte erneut versuchen.',
          );
        },
      });
  }

  confirmCancel(sessionId: string): void {
    this.cancelSessionId.set(sessionId);
  }

  cancelSession(): void {
    const id = this.cancelSessionId();
    if (!id) return;

    this.adminApi.cancelSession(id).subscribe({
      next: () => {
        this.cancelSessionId.set(null);
        this.sessionCancelled.emit();
      },
    });
  }

  onSeriesCreated(): void {
    this.showSeriesDialog.set(false);
    this.sessionCreated.emit();
  }

  formatTime(iso: string): string {
    const d = new Date(iso);
    return `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
  }

  formatDate(iso: string): string {
    const d = new Date(iso);
    const day = d.getDate().toString().padStart(2, '0');
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const year = d.getFullYear();
    return `${day}.${month}.${year}`;
  }
}
