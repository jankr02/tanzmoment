import {
  Component,
  ChangeDetectionStrategy,
  signal,
  inject,
  OnInit,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminApiService, AdminLocation } from '@tanzmoment/admin/data-access';

interface LocationForm {
  name: string;
  address: string;
}

@Component({
  selector: 'tm-tab-locations',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './tab-locations.component.html',
  styleUrls: ['./tab-locations.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TabLocationsComponent implements OnInit {
  private readonly api = inject(AdminApiService);

  readonly loading = signal(true);
  readonly locations = signal<AdminLocation[]>([]);
  readonly error = signal<string | null>(null);

  readonly showAddForm = signal(false);
  readonly addForm = signal<LocationForm>({ name: '', address: '' });
  readonly adding = signal(false);

  readonly editingId = signal<string | null>(null);
  readonly editForm = signal<LocationForm>({ name: '', address: '' });
  readonly saving = signal(false);

  ngOnInit(): void {
    this.loadLocations();
  }

  private loadLocations(): void {
    this.api.getLocations().subscribe({
      next: (locations) => {
        this.locations.set(locations);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('Standorte konnten nicht geladen werden.');
        this.loading.set(false);
      },
    });
  }

  openAddForm(): void {
    this.addForm.set({ name: '', address: '' });
    this.showAddForm.set(true);
  }

  cancelAdd(): void {
    this.showAddForm.set(false);
  }

  updateAddField(field: keyof LocationForm, value: string): void {
    this.addForm.update((f) => ({ ...f, [field]: value }));
  }

  addLocation(): void {
    const f = this.addForm();
    if (!f.name.trim() || this.adding()) return;

    this.adding.set(true);
    this.api.createLocation({ name: f.name.trim(), address: f.address.trim() || undefined }).subscribe({
      next: (location) => {
        this.locations.update((list) => [...list, location]);
        this.showAddForm.set(false);
        this.adding.set(false);
      },
      error: () => {
        this.adding.set(false);
        this.error.set('Standort konnte nicht erstellt werden.');
      },
    });
  }

  startEdit(location: AdminLocation): void {
    this.editingId.set(location.id);
    this.editForm.set({ name: location.name, address: location.address ?? '' });
  }

  cancelEdit(): void {
    this.editingId.set(null);
  }

  updateEditField(field: keyof LocationForm, value: string): void {
    this.editForm.update((f) => ({ ...f, [field]: value }));
  }

  saveEdit(id: string): void {
    const f = this.editForm();
    if (!f.name.trim() || this.saving()) return;

    this.saving.set(true);
    this.api
      .updateLocation(id, { name: f.name.trim(), address: f.address.trim() || undefined })
      .subscribe({
        next: (updated) => {
          this.locations.update((list) =>
            list.map((l) => (l.id === id ? updated : l))
          );
          this.editingId.set(null);
          this.saving.set(false);
        },
        error: () => {
          this.saving.set(false);
          this.error.set('Standort konnte nicht gespeichert werden.');
        },
      });
  }

  toggleActive(location: AdminLocation): void {
    this.api.updateLocation(location.id, { isActive: !location.isActive }).subscribe({
      next: (updated) => {
        this.locations.update((list) =>
          list.map((l) => (l.id === location.id ? updated : l))
        );
      },
      error: () => {
        this.error.set('Status konnte nicht geändert werden.');
      },
    });
  }
}
