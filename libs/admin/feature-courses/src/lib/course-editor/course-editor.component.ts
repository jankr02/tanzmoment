import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
  DestroyRef,
  ChangeDetectorRef,
  OnInit,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { merge } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import {
  AdminApiService,
  AdminCourseDetail,
  AdminSession,
  AdminLocation,
  CreateCourseRequest,
} from '@tanzmoment/admin/data-access';
import { CourseDetailContent } from '@tanzmoment/shared/types';
import { CourseDetailData } from '@tanzmoment/shared/course-detail-ui';
import { CourseEditorCanvasComponent } from './canvas/course-editor-canvas.component';
import { buildCoursePreview } from './preview/build-course-preview';
import { sanitizeDetailContent } from './editors/shared/normalize';
import { HeroEditorComponent } from './editors/hero-editor/hero-editor.component';
import { QuickFactsEditorComponent } from './editors/quick-facts-editor/quick-facts-editor.component';
import { DescriptionEditorComponent } from './editors/description-editor/description-editor.component';
import { CourseFlowEditorComponent } from './editors/course-flow-editor/course-flow-editor.component';
import { InstructorEditorComponent } from './editors/instructor-editor/instructor-editor.component';
import { ScheduleEditorComponent } from './editors/schedule-editor/schedule-editor.component';
import { TestimonialsEditorComponent } from './editors/testimonials-editor/testimonials-editor.component';
import { FaqEditorComponent } from './editors/faq-editor/faq-editor.component';
import { BookingEditorComponent } from './editors/booking-editor/booking-editor.component';
import { StepSessionsComponent } from '../components/course-form-steps/step-sessions.component';

interface DanceStyleOption {
  value: string;
  label: string;
  color: string;
}

interface ContentSectionDef {
  key: keyof CourseDetailContent;
  label: string;
}

@Component({
  selector: 'admin-course-editor',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    CourseEditorCanvasComponent,
    HeroEditorComponent,
    QuickFactsEditorComponent,
    DescriptionEditorComponent,
    CourseFlowEditorComponent,
    InstructorEditorComponent,
    ScheduleEditorComponent,
    TestimonialsEditorComponent,
    FaqEditorComponent,
    BookingEditorComponent,
    StepSessionsComponent,
  ],
  templateUrl: './course-editor.component.html',
  styleUrls: ['./course-editor.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CourseEditorComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly adminApi = inject(AdminApiService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly courseId = signal<string | null>(null);
  readonly isEditMode = computed(() => !!this.courseId());
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly publishing = signal(false);
  readonly isPublished = signal(false);
  readonly error = signal<string | null>(null);
  readonly drawerOpen = signal(true);
  readonly activeSection = signal<keyof CourseDetailContent | null>(null);

  readonly contentSections: ContentSectionDef[] = [
    { key: 'hero', label: 'Hero' },
    { key: 'quickFacts', label: 'Quick Facts' },
    { key: 'description', label: 'Beschreibung' },
    { key: 'courseFlow', label: 'Kursablauf' },
    { key: 'socialProof', label: 'Stimmen' },
    { key: 'instructor', label: 'Kursleitung' },
    { key: 'schedule', label: 'Termine' },
    { key: 'faq', label: 'FAQ' },
    { key: 'booking', label: 'Buchung' },
  ];

  readonly sessions = signal<AdminSession[]>([]);
  readonly locations = signal<AdminLocation[]>([]);
  readonly detailContent = signal<CourseDetailContent>({});
  readonly previewInstructor = signal<{
    id: string;
    firstName: string;
    lastName: string;
  } | null>(null);

  readonly danceStyles: DanceStyleOption[] = [
    { value: 'accessible', label: 'Tanzen mit Behinderung', color: '#D5DEE2' },
    { value: 'expressive', label: 'Ausdruckstanz', color: '#F2E6D9' },
    { value: 'kids', label: 'Kinderkurse', color: '#E8F0E8' },
    { value: 'mothers', label: 'Mütterkurse', color: '#F5E6F0' },
  ];

  readonly targetGroups = [
    'Erwachsene',
    'Kinder',
    'Jugendliche',
    'Mütter mit Babys',
    'Alle',
  ];

  readonly levels = [
    { value: 'ALL_LEVELS', label: 'Alle Level' },
    { value: 'BEGINNER', label: 'Anfänger' },
    { value: 'INTERMEDIATE', label: 'Mittelstufe' },
    { value: 'ADVANCED', label: 'Fortgeschritten' },
  ];

  readonly durations = [30, 45, 60, 75, 90, 120];

  readonly bookingModes = [
    { value: 'FULL_COURSE', label: 'Ganzer Kurs' },
    { value: 'PER_SESSION', label: 'Einzelsession' },
  ];

  readonly visibilityOptions = [
    { value: 'PUBLIC', label: 'Öffentlich' },
    { value: 'UNLISTED', label: 'Nicht gelistet' },
    { value: 'PRIVATE', label: 'Privat' },
  ];

  readonly form = this.fb.group({
    title: [
      '',
      [Validators.required, Validators.minLength(3), Validators.maxLength(120)],
    ],
    danceStyle: ['', Validators.required],
    targetGroup: ['', Validators.required],
    level: ['ALL_LEVELS', Validators.required],
    shortDescription: [
      '',
      [Validators.required, Validators.minLength(30), Validators.maxLength(500)],
    ],
    description: [
      '',
      [Validators.required, Validators.minLength(80), Validators.maxLength(5000)],
    ],
    catchPhrase: ['', Validators.maxLength(200)],
    imageUrl: [''],
    priceInEuros: [
      0,
      [Validators.required, Validators.min(0), Validators.max(1000)],
    ],
    isFree: [false],
    duration: [90, Validators.required],
    maxParticipants: [
      12,
      [Validators.required, Validators.min(1), Validators.max(100)],
    ],
    bookingMode: ['FULL_COURSE', Validators.required],
    visibility: ['PUBLIC', Validators.required],
    isMarkedAsHighlighted: [false],
    metaTitle: [''],
    metaDescription: [''],
    cancellationPolicyId: [''],
  });

  /** Snapshot of the form value, updated on every change to drive the preview. */
  private readonly formValue = signal(this.form.getRawValue());

  readonly preview = computed<CourseDetailData>(() => {
    const v = this.formValue();
    return buildCoursePreview({
      form: {
        title: v.title ?? '',
        danceStyle: v.danceStyle ?? '',
        targetGroup: v.targetGroup ?? '',
        level: v.level ?? '',
        shortDescription: v.shortDescription ?? '',
        description: v.description ?? '',
        catchPhrase: v.catchPhrase ?? '',
        imageUrl: v.imageUrl ?? '',
        priceInEuros: v.priceInEuros ?? 0,
        isFree: v.isFree ?? false,
        duration: v.duration ?? 90,
        maxParticipants: v.maxParticipants ?? 12,
        bookingMode: v.bookingMode ?? 'FULL_COURSE',
        visibility: v.visibility ?? 'PUBLIC',
        metaTitle: v.metaTitle ?? '',
        metaDescription: v.metaDescription ?? '',
      },
      detailContent: this.detailContent(),
      sessions: this.sessions(),
      instructor: this.previewInstructor(),
    });
  });

  /** Descriptive validation issues for all required fields (empty = valid). */
  readonly missingFields = computed<string[]>(() => {
    this.formValue();
    const issues: string[] = [];
    const fields: [string, string][] = [
      ['title', 'Titel'],
      ['danceStyle', 'Tanzstil'],
      ['targetGroup', 'Zielgruppe'],
      ['shortDescription', 'Kurzbeschreibung'],
      ['description', 'Beschreibung'],
      ['duration', 'Dauer'],
      ['maxParticipants', 'Max. Teilnehmer'],
    ];
    for (const [name, label] of fields) {
      const msg = this.fieldError(name, label);
      if (msg) issues.push(msg);
    }
    const c = this.form.controls;
    if (c.isFree.value !== true) {
      const priceMsg = this.fieldError('priceInEuros', 'Preis');
      if (priceMsg) {
        issues.push(priceMsg);
      } else if ((c.priceInEuros.value ?? 0) <= 0) {
        issues.push('Preis muss größer als 0 sein (oder „Kostenlos“ wählen)');
      }
    }
    return issues;
  });

  /** Human-readable validation message for a single control, or null if valid. */
  fieldError(name: string, label: string): string | null {
    const control = this.form.get(name);
    const errors = control?.errors;
    if (!errors) return null;
    if (errors['required']) return `${label} ist erforderlich`;
    if (errors['minlength']) {
      const { requiredLength, actualLength } = errors['minlength'];
      return `${label}: mindestens ${requiredLength} Zeichen (aktuell ${actualLength})`;
    }
    if (errors['maxlength']) {
      return `${label}: höchstens ${errors['maxlength'].requiredLength} Zeichen`;
    }
    if (errors['min']) return `${label}: mindestens ${errors['min'].min}`;
    if (errors['max']) return `${label}: höchstens ${errors['max'].max}`;
    return `${label} ist ungültig`;
  }

  ngOnInit(): void {
    // Snapshot on value AND status changes so the preview and required-field
    // summary react to enable()/disable() (e.g. the free/price toggle) too.
    merge(this.form.valueChanges, this.form.statusChanges)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.formValue.set(this.form.getRawValue());
        this.cdr.markForCheck();
      });

    this.adminApi.getLocations().subscribe({
      next: (locs) => this.locations.set(locs),
    });

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.courseId.set(id);
      this.loadCourse(id);
    } else {
      this.loading.set(false);
    }
  }

  private loadCourse(id: string): void {
    this.loading.set(true);
    this.adminApi.getCourse(id).subscribe({
      next: (course) => {
        this.patchForm(course);
        this.sessions.set(course.sessions);
        this.detailContent.set(
          (course.detailContent as CourseDetailContent) ?? {},
        );
        this.previewInstructor.set(course.instructor);
        this.isPublished.set(course.isPublished);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Kurs konnte nicht geladen werden.');
        this.loading.set(false);
      },
    });
  }

  private patchForm(course: AdminCourseDetail): void {
    this.form.patchValue({
      title: course.title,
      danceStyle: course.danceStyle,
      targetGroup: course.targetGroup,
      level: course.level,
      shortDescription: course.shortDescription,
      description: course.description,
      catchPhrase: course.catchPhrase ?? '',
      imageUrl: course.imageUrl ?? '',
      priceInEuros: course.priceInEuros,
      isFree: course.isFree,
      duration: course.duration,
      maxParticipants: course.maxParticipants,
      bookingMode: course.bookingMode,
      visibility: course.visibility,
      isMarkedAsHighlighted: course.isMarkedAsHighlighted,
      metaTitle: course.metaTitle ?? '',
      metaDescription: course.metaDescription ?? '',
      cancellationPolicyId: course.cancellationPolicyId ?? '',
    });
    if (course.isFree) {
      this.form.get('priceInEuros')?.disable();
    }
  }

  toggleDrawer(): void {
    this.drawerOpen.update((v) => !v);
  }

  selectDanceStyle(value: string): void {
    this.form.get('danceStyle')?.setValue(value);
    this.form.get('danceStyle')?.markAsTouched();
  }

  onFreeToggle(): void {
    const isFree = this.form.get('isFree')?.value;
    const price = this.form.get('priceInEuros');
    if (isFree) {
      price?.setValue(0);
      price?.disable();
    } else {
      price?.enable();
    }
  }

  openSection(key: keyof CourseDetailContent): void {
    this.activeSection.set(key);
    this.drawerOpen.set(true);
  }

  closeSection(): void {
    this.activeSection.set(null);
  }

  setSection(
    key: keyof CourseDetailContent,
    slice: CourseDetailContent[keyof CourseDetailContent] | undefined,
  ): void {
    this.detailContent.update((dc) => {
      const next = { ...dc };
      if (slice === undefined) {
        delete next[key];
      } else {
        (next as Record<string, unknown>)[key] = slice;
      }
      return next;
    });
    this.cdr.markForCheck();
  }

  setBaseField(name: 'title' | 'catchPhrase' | 'description', value: string): void {
    this.form.get(name)?.setValue(value);
    this.form.get(name)?.markAsDirty();
  }

  sectionLabel(key: keyof CourseDetailContent): string {
    return this.contentSections.find((s) => s.key === key)?.label ?? '';
  }

  onEditSection(key: string): void {
    this.openSection(key as keyof CourseDetailContent);
  }

  save(): void {
    if (this.saving()) return;

    const cleanContent = sanitizeDetailContent(this.detailContent());
    const hasContent = Object.keys(cleanContent).length > 0;
    const v = this.form.getRawValue();
    const payload: CreateCourseRequest = {
      title: v.title!,
      shortDescription: v.shortDescription!,
      description: v.description!,
      danceStyle: v.danceStyle!,
      targetGroup: v.targetGroup!,
      level: v.level!,
      duration: v.duration!,
      maxParticipants: v.maxParticipants!,
      priceInEuros: v.priceInEuros!,
      bookingMode: v.bookingMode!,
      catchPhrase: v.catchPhrase || undefined,
      imageUrl: v.imageUrl || undefined,
      isFree: v.isFree ?? false,
      visibility: v.visibility!,
      isMarkedAsHighlighted: v.isMarkedAsHighlighted ?? false,
      metaTitle: v.metaTitle || undefined,
      metaDescription: v.metaDescription || undefined,
      cancellationPolicyId: v.cancellationPolicyId || undefined,
      detailContent: hasContent
        ? (cleanContent as Record<string, unknown>)
        : undefined,
    };

    this.saving.set(true);
    this.error.set(null);

    const request$ = this.isEditMode()
      ? this.adminApi.updateCourse(this.courseId()!, payload)
      : this.adminApi.createCourse(payload);

    request$.subscribe({
      next: (result) => {
        this.saving.set(false);
        if (!this.isEditMode()) {
          this.courseId.set(result.id);
          this.router.navigate(['/admin', 'courses', result.id], {
            replaceUrl: true,
          });
          // Re-fetch so sessions, instructor, slug and any server-normalized
          // content reflect the persisted state before further editing.
          this.loadCourse(result.id);
        }
      },
      error: () => {
        this.saving.set(false);
        this.error.set('Speichern fehlgeschlagen. Bitte erneut versuchen.');
      },
    });
  }

  togglePublish(): void {
    const id = this.courseId();
    if (!id || this.publishing()) return;
    this.publishing.set(true);
    this.adminApi.togglePublishCourse(id).subscribe({
      next: (result) => {
        this.isPublished.set(result.isPublished);
        this.publishing.set(false);
      },
      error: () => this.publishing.set(false),
    });
  }

  reloadSessions(): void {
    const id = this.courseId();
    if (!id) return;
    this.adminApi.getCourse(id).subscribe({
      next: (course) => this.sessions.set(course.sessions),
    });
  }

  navigateBack(): void {
    this.router.navigate(['/admin', 'courses']);
  }
}
