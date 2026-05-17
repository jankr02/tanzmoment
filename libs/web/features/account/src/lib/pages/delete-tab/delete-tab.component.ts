import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { Router } from '@angular/router';
import { ButtonComponent } from '@tanzmoment/shared/ui';
import { DeleteAccountModalComponent } from '../../components/delete-account-modal/delete-account-modal.component';

@Component({
  selector: 'tm-delete-tab',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, ButtonComponent, DeleteAccountModalComponent],
  templateUrl: './delete-tab.component.html',
  styleUrl: './delete-tab.component.scss',
})
export class DeleteTabComponent {
  private readonly router = inject(Router);

  protected readonly modalOpen = signal(false);

  protected open(): void {
    this.modalOpen.set(true);
  }

  protected onClosed(): void {
    this.modalOpen.set(false);
  }

  protected onDeleted(): void {
    this.modalOpen.set(false);
    this.router.navigate(['/'], {
      queryParams: { 'account-deleted': '1' },
    });
  }
}
