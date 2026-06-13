import {
  Component,
  ChangeDetectionStrategy,
  Input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';

@Component({
  selector: 'admin-step-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './step-settings.component.html',
  styleUrls: ['./step-basics.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StepSettingsComponent {
  @Input({ required: true }) form!: FormGroup;

  readonly durations = [30, 45, 60, 75, 90, 120];
  readonly visibilityOptions = [
    { value: 'PUBLIC', label: 'Öffentlich' },
    { value: 'UNLISTED', label: 'Nicht gelistet' },
    { value: 'PRIVATE', label: 'Privat' },
  ];

  onFreeToggle(): void {
    const isFree = this.form.get('isFree')?.value;
    if (isFree) {
      this.form.get('priceInEuros')?.setValue(0);
      this.form.get('priceInEuros')?.disable();
    } else {
      this.form.get('priceInEuros')?.enable();
    }
  }
}
