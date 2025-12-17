import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DirectionsInfo } from './contact-directions.types';

@Component({
  selector: 'tm-contact-directions',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contact-directions.component.html',
  styleUrl: './contact-directions.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactDirectionsComponent {
  @Input({ required: true }) directions!: DirectionsInfo;

  /**
   * Get icon for transport type
   */
  getTransportIcon(type: 'bus' | 'train' | 'tram'): string {
    const icons: Record<string, string> = {
      bus: 'M8 6v6h8V6H8zM6 4h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-1l1 2v1h-2l-2-3h-4l-2 3H6v-1l1-2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2zm1 12a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm10 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z',
      train:
        'M4 15.5C4 17.43 5.57 19 7.5 19L6 20.5v.5h12v-.5L16.5 19c1.93 0 3.5-1.57 3.5-3.5V5c0-3.5-3.58-4-8-4s-8 .5-8 4v10.5zm8 1.5c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm6-7H6V5h12v5z',
      tram: 'M19 16.94V8.5c0-2.79-2.61-3.4-6.01-3.49L13.5 2H12l-.5 3h-1L10 2H8.5l.5 3.01C5.6 5.1 3 5.73 3 8.5v8.44c0 1.45 1.19 2.56 2.59 2.56L4 21v1h2l2-2h6l2 2h2v-1l-1.59-1.5c1.4 0 2.59-1.11 2.59-2.56zM12 18.5c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm5-6H7V8.5h10V12.5z',
    };
    return icons[type] || icons['bus'];
  }
}
