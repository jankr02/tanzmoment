import {
  Component,
  ChangeDetectionStrategy,
  inject,
  signal,
  computed,
  OnInit,
} from '@angular/core';
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
import { StepBasicsComponent } from '../course-form-steps/step-basics.component';
import { StepDetailsComponent } from '../course-form-steps/step-details.component';
import { StepContentComponent } from '../course-form-steps/step-content.component';
import { StepSettingsComponent } from '../course-form-steps/step-settings.component';
import { StepSessionsComponent } from '../course-form-steps/step-sessions.component';
import { StepPreviewComponent } from '../course-form-steps/step-preview.component';

interface StepDef {
  key: string;
  label: string;
  icon: string;
}

@Component({
  selector: 'admin-course-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    StepBasicsComponent,
    StepDetailsComponent,
    StepContentComponent,
    StepSettingsComponent,
    StepSessionsComponent,
    StepPreviewComponent,
  ],
  templateUrl: './course-form.component.html',
  styleUrls: ['./course-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CourseFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly adminApi = inject(AdminApiService);

  readonly courseId = signal<string | null>(null);
  readonly isEditMode = computed(() => !!this.courseId());
  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly currentStep = signal(0);
  readonly sessions = signal<AdminSession[]>([]);
  readonly locations = signal<AdminLocation[]>([]);
  readonly detailContent = signal<CourseDetailContent>({});

  readonly steps = computed<StepDef[]>(() => {
    const base: StepDef[] = [
      { key: 'basics', label: 'Grundlagen', icon: '1' },
      { key: 'details', label: 'Details', icon: '2' },
      { key: 'content', label: 'Inhalte', icon: '3' },
      { key: 'settings', label: 'Einstellungen', icon: '4' },
    ];

    if (this.isEditMode()) {
      base.push({ key: 'sessions', label: 'Termine', icon: '5' });
      base.push({ key: 'preview', label: 'Vorschau', icon: '6' });
    } else {
      base.push({ key: 'preview', label: 'Vorschau', icon: '5' });
    }

    return base;
  });

  readonly form = this.fb.group({
    title: ['', [Validators.required, Validators.minLength(3)]],
    danceStyle: ['', Validators.required],
    targetGroup: ['ADULTS', Validators.required],
    level: ['ALL_LEVELS', Validators.required],
    shortDescription: ['', [Validators.required, Validators.maxLength(200)]],
    description: ['', Validators.required],
    catchPhrase: [''],
    imageUrl: [''],
    priceInEuros: [0, [Validators.required, Validators.min(0)]],
    isFree: [false],
    duration: [90, Validators.required],
    maxParticipants: [12, [Validators.required, Validators.min(1)]],
    bookingMode: ['FULL_COURSE', Validators.required],
    visibility: ['PUBLIC', Validators.required],
    isMarkedAsHighlighted: [false],
    metaTitle: [''],
    metaDescription: [''],
    cancellationPolicyId: [''],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    this.adminApi.getLocations().subscribe({
      next: (locs) => this.locations.set(locs),
    });

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
  }

  isStepValid(stepIndex: number): boolean {
    const stepKey = this.steps()[stepIndex]?.key;
    switch (stepKey) {
      case 'basics': {
        const c = this.form.controls;
        return (
          c.title.valid &&
          c.danceStyle.valid &&
          c.targetGroup.valid &&
          c.level.valid &&
          c.shortDescription.valid
        );
      }
      case 'details':
        return this.form.controls.description.valid;
      case 'content':
        return true;
      case 'settings': {
        const c = this.form.controls;
        return (
          c.priceInEuros.valid &&
          c.duration.valid &&
          c.maxParticipants.valid &&
          c.bookingMode.valid
        );
      }
      case 'sessions':
      case 'preview':
        return true;
      default:
        return false;
    }
  }

  isStepCompleted(stepIndex: number): boolean {
    return stepIndex < this.currentStep() && this.isStepValid(stepIndex);
  }

  nextStep(): void {
    const max = this.steps().length - 1;
    if (this.currentStep() < max) {
      this.currentStep.update((s) => s + 1);
    }
  }

  prevStep(): void {
    if (this.currentStep() > 0) {
      this.currentStep.update((s) => s - 1);
    }
  }

  goToStep(index: number): void {
    for (let i = 0; i < index; i++) {
      if (!this.isStepValid(i)) return;
    }
    this.currentStep.set(index);
  }

  onDetailContentChanged(content: CourseDetailContent): void {
    this.detailContent.set(content);
  }

  get previewData() {
    const v = this.form.getRawValue();
    return {
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
      isMarkedAsHighlighted: v.isMarkedAsHighlighted ?? false,
      metaTitle: v.metaTitle ?? '',
      metaDescription: v.metaDescription ?? '',
      detailContent: this.detailContent(),
    };
  }

  save(): void {
    if (this.saving()) return;

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
      detailContent: this.hasContentData()
        ? (this.detailContent() as Record<string, unknown>)
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
          this.router.navigate(['/admin', 'courses', result.id]);
        }
      },
      error: () => {
        this.saving.set(false);
        this.error.set('Speichern fehlgeschlagen. Bitte erneut versuchen.');
      },
    });
  }

  onSessionsChanged(): void {
    const id = this.courseId();
    if (!id) return;
    this.adminApi.getCourse(id).subscribe({
      next: (course) => this.sessions.set(course.sessions),
    });
  }

  navigateBack(): void {
    this.router.navigate(['/admin', 'courses']);
  }

  private hasContentData(): boolean {
    const c = this.detailContent();
    return !!(
      c.description?.highlights?.length ||
      c.courseFlow?.steps?.length ||
      c.socialProof?.testimonials?.length ||
      c.faq?.items?.length
    );
  }
}
