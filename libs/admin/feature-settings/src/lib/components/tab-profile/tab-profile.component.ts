import {
  Component,
  ChangeDetectionStrategy,
  signal,
  inject,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminApiService, UpdateStudioSettingsRequest } from '@tanzmoment/admin/data-access';

@Component({
  selector: 'tm-tab-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tab-profile.component.html',
  styleUrls: ['./tab-profile.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabProfileComponent implements OnInit {
  private readonly api = inject(AdminApiService);

  readonly loading = signal(true);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);

  readonly form = signal<UpdateStudioSettingsRequest>({
    name: '',
    tagline: '',
    description: '',
    email: '',
    phone: '',
    website: '',
    address: '',
  });

  ngOnInit(): void {
    this.api.getStudioSettings().subscribe({
      next: (settings) => {
        this.form.set({
          name: settings.name,
          tagline: settings.tagline ?? '',
          description: settings.description ?? '',
          email: settings.email ?? '',
          phone: settings.phone ?? '',
          website: settings.website ?? '',
          address: settings.address ?? '',
        });
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Einstellungen konnten nicht geladen werden.');
        this.loading.set(false);
      },
    });
  }

  updateField(field: keyof UpdateStudioSettingsRequest, value: string): void {
    this.form.update((f) => ({ ...f, [field]: value }));
  }

  save(): void {
    if (this.saving()) return;

    this.saving.set(true);
    this.error.set(null);
    this.successMessage.set(null);

    const payload: UpdateStudioSettingsRequest = {};
    const f = this.form();
    if (f.name?.trim()) payload.name = f.name.trim();
    if (f.tagline !== undefined) payload.tagline = f.tagline?.trim() || undefined;
    if (f.description !== undefined) payload.description = f.description?.trim() || undefined;
    if (f.email !== undefined) payload.email = f.email?.trim() || undefined;
    if (f.phone !== undefined) payload.phone = f.phone?.trim() || undefined;
    if (f.website !== undefined) payload.website = f.website?.trim() || undefined;
    if (f.address !== undefined) payload.address = f.address?.trim() || undefined;

    this.api.updateStudioSettings(payload).subscribe({
      next: () => {
        this.saving.set(false);
        this.successMessage.set('Einstellungen gespeichert.');
        setTimeout(() => this.successMessage.set(null), 3000);
      },
      error: () => {
        this.saving.set(false);
        this.error.set('Speichern fehlgeschlagen. Bitte versuche es erneut.');
      },
    });
  }
}
