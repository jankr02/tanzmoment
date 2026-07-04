import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconComponent } from '@tanzmoment/shared/ui';

/**
 * Visual icon picker over the shared icon registry, replacing free-text icon
 * name inputs. Emits the selected icon name (or '' for none).
 */
@Component({
  selector: 'admin-icon-picker',
  standalone: true,
  imports: [CommonModule, IconComponent],
  templateUrl: './icon-picker.component.html',
  styleUrl: './icon-picker.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconPickerComponent {
  @Input() value = '';
  @Input() label = 'Icon';
  @Output() readonly valueChange = new EventEmitter<string>();

  /** Curated, content-relevant subset of the icon registry. */
  readonly icons: string[] = [
    'check-circle',
    'sparkle',
    'heart',
    'music',
    'calendar',
    'clock',
    'map-pin',
    'users',
    'user',
    'user-check',
    'euro',
    'wallet',
    'book-open',
    'info',
    'bell',
    'home',
    'phone',
    'mail',
    'ballet',
    'contemporary',
    'improvisation',
    'wheelchair',
    'lighthouse',
    'bar-chart',
  ];

  select(icon: string): void {
    this.valueChange.emit(this.value === icon ? '' : icon);
  }
}
