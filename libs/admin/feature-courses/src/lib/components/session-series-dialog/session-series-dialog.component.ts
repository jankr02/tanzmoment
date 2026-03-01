import {
  Component,
  ChangeDetectionStrategy,
  Input,
  Output,
  EventEmitter,
  inject,
  signal,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  ReactiveFormsModule,
  FormBuilder,
  Validators,
} from '@angular/forms';
import { AdminApiService, AdminLocation } from '@tanzmoment/admin/data-access';

@Component({
  selector: 'admin-session-series-dialog',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './session-series-dialog.component.html',
  styleUrls: ['./session-series-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SessionSeriesDialogComponent {
  private readonly fb = inject(FormBuilder);
  private readonly adminApi = inject(AdminApiService);

  @Input({ required: true }) courseId!: string;
  @Input({ required: true }) locations!: AdminLocation[];
  @Input() courseDuration = 90;

  @Output() readonly created = new EventEmitter<{ created: number }>();
  @Output() readonly closed = new EventEmitter<void>();

  readonly submitting = signal(false);
  readonly error = signal<string | null>(null);
  readonly previewDates = signal<string[]>([]);

  readonly weekdayLabels = [
    'Sonntag',
    'Montag',
    'Dienstag',
    'Mittwoch',
    'Donnerstag',
    'Freitag',
    'Samstag',
  ];

  readonly form = this.fb.group({
    weekday: [3, [Validators.required, Validators.min(0), Validators.max(6)]],
    startTime: ['17:00', Validators.required],
    durationMinutes: [90, [Validators.required, Validators.min(15)]],
    seriesStartDate: ['', Validators.required],
    seriesEndDate: ['', Validators.required],
    locationId: ['', Validators.required],
  });

  readonly hasPreview = computed(() => this.previewDates().length > 0);

  ngOnInit(): void {
    this.form.patchValue({ durationMinutes: this.courseDuration });
  }

  generatePreview(): void {
    const values = this.form.getRawValue();
    if (!values.seriesStartDate || !values.seriesEndDate) return;

    const start = new Date(values.seriesStartDate);
    const end = new Date(values.seriesEndDate);
    const weekday = values.weekday!;
    const dates: string[] = [];

    const current = new Date(start);
    while (current.getDay() !== weekday) {
      current.setDate(current.getDate() + 1);
    }

    while (current <= end) {
      dates.push(this.formatDate(current));
      current.setDate(current.getDate() + 7);
    }

    this.previewDates.set(dates);
  }

  submit(): void {
    if (this.form.invalid) return;
    this.submitting.set(true);
    this.error.set(null);

    const v = this.form.getRawValue();

    this.adminApi
      .createSessionSeries({
        courseId: this.courseId,
        weekday: v.weekday!,
        startTime: v.startTime!,
        durationMinutes: v.durationMinutes!,
        seriesStartDate: v.seriesStartDate!,
        seriesEndDate: v.seriesEndDate!,
        locationId: v.locationId!,
      })
      .subscribe({
        next: (result) => {
          this.submitting.set(false);
          this.created.emit({ created: result.created });
        },
        error: () => {
          this.submitting.set(false);
          this.error.set('Terminserie konnte nicht erstellt werden.');
        },
      });
  }

  private formatDate(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    const weekday = this.weekdayLabels[date.getDay()];
    return `${weekday}, ${day}.${month}.${year}`;
  }
}
