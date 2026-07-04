import {
  Component,
  ChangeDetectionStrategy,
  input,
  output,
} from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Wraps a read-only canvas section with an admin editing affordance: on hover
 * it shows an outline and an "edit" button; clicking emits `edit` so the shell
 * opens the matching section editor. Purely an overlay — the wrapped section
 * component stays untouched.
 */
@Component({
  selector: 'admin-editable-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './editable-section.component.html',
  styleUrl: './editable-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditableSectionComponent {
  readonly label = input.required<string>();
  readonly active = input(false);
  readonly edit = output<void>();
}
