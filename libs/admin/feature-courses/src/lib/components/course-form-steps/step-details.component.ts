import {
  Component,
  ChangeDetectionStrategy,
  Input,
} from '@angular/core';
import { ReactiveFormsModule, FormGroup } from '@angular/forms';

@Component({
  selector: 'admin-step-details',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './step-details.component.html',
  styleUrls: ['./step-basics.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StepDetailsComponent {
  @Input({ required: true }) form!: FormGroup;
}
