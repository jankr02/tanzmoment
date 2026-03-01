import {
  Component,
  ChangeDetectionStrategy,
  inject,
  OnInit,
  signal,
  computed,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, takeUntil } from 'rxjs/operators';
import {
  AdminApiService,
  AdminCourseListItem,
  AdminCourseQueryParams,
} from '@tanzmoment/admin/data-access';

interface ConfirmAction {
  title: string;
  message: string;
  confirmLabel: string;
  variant: 'danger' | 'warning' | 'primary';
  onConfirm: () => void;
}

interface FilterOption {
  value: string;
  label: string;
}

@Component({
  selector: 'admin-course-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './course-list.component.html',
  styleUrls: ['./course-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CourseListComponent implements OnInit, OnDestroy {
  private readonly adminApi = inject(AdminApiService);
  private readonly router = inject(Router);
  private readonly destroy$ = new Subject<void>();
  private readonly searchSubject$ = new Subject<string>();

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly courses = signal<AdminCourseListItem[]>([]);
  readonly meta = signal<{
    total: number;
    page: number;
    limit: number;
    totalPages: number;
    hasMore: boolean;
  } | null>(null);

  readonly searchQuery = signal('');
  readonly statusFilter = signal('');
  readonly danceStyleFilter = signal('');
  readonly currentPage = signal(1);

  readonly confirmAction = signal<ConfirmAction | null>(null);

  readonly isEmpty = computed(
    () => !this.loading() && this.courses().length === 0
  );

  readonly statusOptions: FilterOption[] = [
    { value: '', label: 'Alle Status' },
    { value: 'DRAFT', label: 'Entwurf' },
    { value: 'ACTIVE', label: 'Aktiv' },
    { value: 'PAUSED', label: 'Pausiert' },
    { value: 'ARCHIVED', label: 'Archiviert' },
    { value: 'CANCELLED', label: 'Abgesagt' },
  ];

  readonly danceStyleOptions: FilterOption[] = [
    { value: '', label: 'Alle Tanzstile' },
    { value: 'accessible', label: 'Accessible Dance' },
    { value: 'expressive', label: 'Ausdruckstanz' },
    { value: 'kids', label: 'Kinderkurse' },
    { value: 'mothers', label: 'Mütterkurse' },
  ];

  ngOnInit(): void {
    this.searchSubject$
      .pipe(debounceTime(300), takeUntil(this.destroy$))
      .subscribe((query) => {
        this.searchQuery.set(query);
        this.currentPage.set(1);
        this.loadCourses();
      });

    this.loadCourses();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadCourses(): void {
    this.loading.set(true);
    this.error.set(null);

    const params: AdminCourseQueryParams = {
      page: this.currentPage(),
      limit: 20,
    };

    const search = this.searchQuery();
    if (search) {
      params.search = search;
    }

    const status = this.statusFilter();
    if (status) {
      params.status = status;
    }

    const danceStyle = this.danceStyleFilter();
    if (danceStyle) {
      params.danceStyle = danceStyle;
    }

    this.adminApi.getCourses(params).subscribe({
      next: (response) => {
        this.courses.set(response.data);
        this.meta.set(response.meta);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Kurse konnten nicht geladen werden.');
        this.loading.set(false);
      },
    });
  }

  onSearchInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.searchSubject$.next(value);
  }

  onStatusChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.statusFilter.set(value);
    this.currentPage.set(1);
    this.loadCourses();
  }

  onDanceStyleChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.danceStyleFilter.set(value);
    this.currentPage.set(1);
    this.loadCourses();
  }

  onPreviousPage(): void {
    const page = this.currentPage();
    if (page > 1) {
      this.currentPage.set(page - 1);
      this.loadCourses();
    }
  }

  onNextPage(): void {
    const m = this.meta();
    if (m && this.currentPage() < m.totalPages) {
      this.currentPage.set(this.currentPage() + 1);
      this.loadCourses();
    }
  }

  onEdit(course: AdminCourseListItem): void {
    this.router.navigate(['/admin/courses', course.id]);
  }

  onDuplicate(course: AdminCourseListItem): void {
    this.showConfirmDialog({
      title: 'Kurs duplizieren',
      message: `Möchtest du den Kurs "${course.title}" duplizieren? Es wird eine Kopie als Entwurf erstellt.`,
      confirmLabel: 'Duplizieren',
      variant: 'primary',
      onConfirm: () => {
        this.adminApi.duplicateCourse(course.id).subscribe({
          next: () => this.loadCourses(),
          error: () =>
            this.error.set('Kurs konnte nicht dupliziert werden.'),
        });
      },
    });
  }

  onTogglePublish(course: AdminCourseListItem): void {
    const action = course.isPublished ? 'zurückziehen' : 'veröffentlichen';
    const label = course.isPublished ? 'Zurückziehen' : 'Veröffentlichen';

    this.showConfirmDialog({
      title: `Kurs ${action}`,
      message: `Möchtest du den Kurs "${course.title}" ${action}?`,
      confirmLabel: label,
      variant: course.isPublished ? 'warning' : 'primary',
      onConfirm: () => {
        this.adminApi.togglePublishCourse(course.id).subscribe({
          next: () => this.loadCourses(),
          error: () =>
            this.error.set(`Kurs konnte nicht ${action} werden.`),
        });
      },
    });
  }

  onArchive(course: AdminCourseListItem): void {
    this.showConfirmDialog({
      title: 'Kurs archivieren',
      message: `Möchtest du den Kurs "${course.title}" wirklich archivieren? Bestehende Buchungen bleiben erhalten.`,
      confirmLabel: 'Archivieren',
      variant: 'danger',
      onConfirm: () => {
        this.adminApi.archiveCourse(course.id).subscribe({
          next: () => this.loadCourses(),
          error: () =>
            this.error.set('Kurs konnte nicht archiviert werden.'),
        });
      },
    });
  }

  getStatusColor(status: string): string {
    const colors: Record<string, string> = {
      DRAFT: '#6B7280',
      ACTIVE: '#059669',
      PAUSED: '#D97706',
      ARCHIVED: '#9CA3AF',
      CANCELLED: '#DC2626',
      FULL: '#2563EB',
    };
    return colors[status] ?? '#6B7280';
  }

  getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      DRAFT: 'Entwurf',
      ACTIVE: 'Aktiv',
      PAUSED: 'Pausiert',
      ARCHIVED: 'Archiviert',
      CANCELLED: 'Abgesagt',
      FULL: 'Ausgebucht',
    };
    return labels[status] ?? status;
  }

  getDanceStyleLabel(style: string): string {
    const labels: Record<string, string> = {
      accessible: 'Accessible Dance',
      expressive: 'Ausdruckstanz',
      kids: 'Kinderkurse',
      mothers: 'Mütterkurse',
    };
    return labels[style] ?? style;
  }

  trackCourse(_index: number, course: AdminCourseListItem): string {
    return course.id;
  }

  showConfirmDialog(action: ConfirmAction): void {
    this.confirmAction.set(action);
  }

  onConfirmAction(): void {
    const action = this.confirmAction();
    if (action) {
      action.onConfirm();
      this.confirmAction.set(null);
    }
  }

  onCancelAction(): void {
    this.confirmAction.set(null);
  }
}
