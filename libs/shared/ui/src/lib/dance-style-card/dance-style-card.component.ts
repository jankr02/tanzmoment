// ============================================================================
// DANCE STYLE CARD COMPONENT - V2 (Organic Design)
// ============================================================================
// Standalone Angular Component mit horizontalem Layout
// Verwendet auf der Course Overview Page in der Dance Styles Section
// ============================================================================

import {
  Component,
  Input,
  Output,
  EventEmitter,
  ChangeDetectionStrategy,
  HostBinding,
  HostListener,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  DanceStyleCardData,
  DanceStyleId,
  DanceStyleColorScheme,
  DanceStyleNavigationMode,
  DANCE_STYLE_COLOR_SCHEMES,
} from './dance-style-card.types';
import { ButtonComponent } from '../button/button.component';

// Re-export types for convenience
export * from './dance-style-card.types';

@Component({
  selector: 'ui-dance-style-card',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  templateUrl: './dance-style-card.component.html',
  styleUrl: './dance-style-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    role: 'article',
    '[class.dance-style-card-host]': 'true',
    '[class.dance-style-card-host--disabled]': 'disabled',
  },
})
export class DanceStyleCardComponent {
  // ───────────────────────────────────────────────────────────────────────────
  // INJECTIONS
  // ───────────────────────────────────────────────────────────────────────────

  private readonly router = inject(Router);

  // ───────────────────────────────────────────────────────────────────────────
  // INPUTS
  // ───────────────────────────────────────────────────────────────────────────

  /** Daten für die Tanzstil-Karte */
  @Input({ required: true }) data!: DanceStyleCardData;

  /** Optional: Deaktiviert die Karte */
  @Input() disabled = false;

  /** Navigation-Modus: 'emit' (Event) oder 'navigate' (Router) */
  @Input() navigationMode: DanceStyleNavigationMode = 'emit';

  // ───────────────────────────────────────────────────────────────────────────
  // OUTPUTS
  // ───────────────────────────────────────────────────────────────────────────

  /** Event wenn Karte geklickt wird */
  @Output() cardClick = new EventEmitter<DanceStyleId>();

  // ───────────────────────────────────────────────────────────────────────────
  // HOST BINDINGS
  // ───────────────────────────────────────────────────────────────────────────

  @HostBinding('tabindex')
  get tabIndex(): number {
    return this.disabled ? -1 : 0;
  }

  @HostBinding('attr.aria-label')
  get ariaLabel(): string {
    return `${this.data.label}. ${this.data.description}`;
  }

  // ───────────────────────────────────────────────────────────────────────────
  // HOST LISTENERS
  // ───────────────────────────────────────────────────────────────────────────

  @HostListener('click')
  onClick(): void {
    if (!this.disabled) {
      this.handleInteraction();
    }
  }

  @HostListener('keydown.enter', ['$event'])
  @HostListener('keydown.space', ['$event'])
  onKeydown(event: Event): void {
    event.preventDefault();
    if (!this.disabled) {
      this.handleInteraction();
    }
  }

  /** Zentrale Interaktions-Logik für Click und Keyboard */
  private handleInteraction(): void {
    if (this.navigationMode === 'navigate' && this.data.route) {
      this.router.navigate([this.data.route]);
    } else {
      this.cardClick.emit(this.data.id);
    }
  }

  // ───────────────────────────────────────────────────────────────────────────
  // COMPUTED PROPERTIES
  // ───────────────────────────────────────────────────────────────────────────

  /** Farbschema basierend auf DanceStyleId */
  get colorScheme(): DanceStyleColorScheme {
    return (
      DANCE_STYLE_COLOR_SCHEMES[this.data.id] ??
      DANCE_STYLE_COLOR_SCHEMES['expressive']
    );
  }

  /** CTA Button Text */
  get ctaText(): string {
    return this.data.ctaText ?? 'Mehr erfahren';
  }

  /** Prüft ob Illustration vorhanden ist */
  get hasIllustration(): boolean {
    return !!this.data.illustrationUrl;
  }
}
