import {
  Component,
  ChangeDetectionStrategy,
  Input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';

interface DanceStyleOption {
  value: string;
  label: string;
  color: string;
}

@Component({
  selector: 'admin-step-basics',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './step-basics.component.html',
  styleUrls: ['./step-basics.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StepBasicsComponent {
  @Input({ required: true }) form!: FormGroup;

  readonly danceStyles: DanceStyleOption[] = [
    { value: 'accessible', label: 'Accessible Dance', color: '#D5DEE2' },
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

  selectDanceStyle(value: string): void {
    this.form.get('danceStyle')?.setValue(value);
    this.form.get('danceStyle')?.markAsTouched();
  }
}
