import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  signal,
  computed,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminApiService } from '@tanzmoment/admin/data-access';
import type { AdminCustomerDetail, CustomerNote } from '@tanzmoment/admin/data-access';
import { IconComponent } from '@tanzmoment/shared/ui';

interface ConfirmAction {
  title: string;
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
}

@Component({
  selector: 'tm-customer-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, IconComponent],
  templateUrl: './customer-detail.component.html',
  styleUrls: ['./customer-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomerDetailComponent implements OnInit {
  private readonly adminApi = inject(AdminApiService);
  private readonly route = inject(ActivatedRoute);

  readonly loading = signal(true);
  readonly error = signal<string | null>(null);
  readonly customer = signal<AdminCustomerDetail | null>(null);
  readonly noteContent = signal('');
  readonly addingNote = signal(false);
  readonly deletingNoteId = signal<string | null>(null);
  readonly confirmAction = signal<ConfirmAction | null>(null);
  readonly successMessage = signal<string | null>(null);

  readonly fullName = computed(() => {
    const c = this.customer();
    if (!c) return '';
    return `${c.firstName} ${c.lastName}`;
  });

  readonly canSubmitNote = computed(() => this.noteContent().trim().length > 0);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) this.loadCustomer(id);
  }

  onSubmitNote(): void {
    const customer = this.customer();
    if (!customer || !this.canSubmitNote() || this.addingNote()) return;

    this.addingNote.set(true);
    this.adminApi.addCustomerNote(customer.id, this.noteContent().trim()).subscribe({
      next: (note) => {
        this.customer.update((c) =>
          c ? { ...c, notes: [note, ...c.notes] } : c,
        );
        this.noteContent.set('');
        this.addingNote.set(false);
        this.showSuccess('Notiz gespeichert.');
      },
      error: () => {
        this.addingNote.set(false);
      },
    });
  }

  onDeleteNote(note: CustomerNote): void {
    this.confirmAction.set({
      title: 'Notiz löschen',
      message: 'Möchtest du diese Notiz wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.',
      confirmLabel: 'Löschen',
      onConfirm: () => this.executeDeleteNote(note.id),
    });
  }

  onCancelAction(): void {
    this.confirmAction.set(null);
  }

  onConfirmAction(): void {
    this.confirmAction()?.onConfirm();
    this.confirmAction.set(null);
  }

  getBookingStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      PENDING: 'Ausstehend',
      CONFIRMED: 'Bestätigt',
      CANCELLED: 'Storniert',
      WAITLISTED: 'Warteliste',
      ATTENDED: 'Teilgenommen',
      NO_SHOW: 'Nicht erschienen',
      COMPLETED: 'Abgeschlossen',
    };
    return labels[status] ?? status;
  }

  getBookingStatusClass(status: string): string {
    const classes: Record<string, string> = {
      CONFIRMED: 'status--confirmed',
      CANCELLED: 'status--cancelled',
      PENDING: 'status--pending',
      WAITLISTED: 'status--waitlisted',
      ATTENDED: 'status--attended',
      NO_SHOW: 'status--no-show',
    };
    return classes[status] ?? 'status--default';
  }

  getPaymentStatusLabel(status: string): string {
    const labels: Record<string, string> = {
      PAID: 'Bezahlt',
      PENDING: 'Offen',
      REFUNDED: 'Erstattet',
      FAILED: 'Fehlgeschlagen',
      PARTIAL_REFUND: 'Teilerstattung',
    };
    return labels[status] ?? status;
  }

  formatDate(date: string | Date | null): string {
    if (!date) return '—';
    return new Intl.DateTimeFormat('de-DE', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(new Date(date));
  }

  formatDateTime(date: string | Date | null): string {
    if (!date) return '—';
    return new Intl.DateTimeFormat('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  }

  formatEuro(cents: number): string {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
    }).format(cents / 100);
  }

  private loadCustomer(id: string): void {
    this.loading.set(true);
    this.error.set(null);
    this.adminApi.getCustomer(id).subscribe({
      next: (customer) => {
        this.customer.set(customer);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Teilnehmer konnte nicht geladen werden.');
        this.loading.set(false);
      },
    });
  }

  private executeDeleteNote(noteId: string): void {
    this.deletingNoteId.set(noteId);
    this.adminApi.deleteCustomerNote(noteId).subscribe({
      next: () => {
        this.customer.update((c) =>
          c ? { ...c, notes: c.notes.filter((n) => n.id !== noteId) } : c,
        );
        this.deletingNoteId.set(null);
        this.showSuccess('Notiz gelöscht.');
      },
      error: () => {
        this.deletingNoteId.set(null);
      },
    });
  }

  private showSuccess(message: string): void {
    this.successMessage.set(message);
    setTimeout(() => this.successMessage.set(null), 3000);
  }
}
