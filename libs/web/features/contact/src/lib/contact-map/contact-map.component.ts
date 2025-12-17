import {
  Component,
  Input,
  signal,
  inject,
  OnInit,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'tm-contact-map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './contact-map.component.html',
  styleUrl: './contact-map.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContactMapComponent implements OnInit {
  private readonly sanitizer = inject(DomSanitizer);

  @Input() lat = 48.4047;
  @Input() lng = 9.0567;
  @Input() zoom = 15;

  readonly isLoading = signal(true);
  readonly hasError = signal(false);

  // URL wird nur einmal berechnet und dann als Signal gespeichert
  readonly mapUrl = signal<SafeResourceUrl | null>(null);

  ngOnInit(): void {
    // URL einmalig beim Initialisieren berechnen
    const url = `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2634.5!2d${this.lng}!3d${this.lat}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDjCsDI0JzE3LjAiTiA5wrAwMyczNC4xIkU!5e0!3m2!1sde!2sde!4v1702800000000!5m2!1sde!2sde`;
    this.mapUrl.set(this.sanitizer.bypassSecurityTrustResourceUrl(url));
  }

  /**
   * Handle iframe load event
   */
  onMapLoad(): void {
    this.isLoading.set(false);
  }

  /**
   * Handle iframe error event
   */
  onMapError(): void {
    this.isLoading.set(false);
    this.hasError.set(true);
  }
}
