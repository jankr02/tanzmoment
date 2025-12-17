// ============================================================================
// EMPTY STATE COMPONENT
// ============================================================================
// Shows an empty state with illustration, text and actions
// Various presets for different scenarios
// ============================================================================

import {
  Component,
  input,
  output,
  computed,
  ChangeDetectionStrategy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

import { ButtonComponent } from '../button/button.component';
import { IconComponent } from '../icon/icon.component';

import {
  EmptyStateVariant,
  EmptyStateIllustration,
  EmptyStateAction,
  EmptyStateConfig,
  EMPTY_STATE_PRESETS,
} from './empty-state.types';

// Re-export types
export * from './empty-state.types';

@Component({
  selector: 'ui-empty-state',
  standalone: true,
  imports: [CommonModule, RouterLink, ButtonComponent, IconComponent],
  templateUrl: './empty-state.component.html',
  styleUrl: './empty-state.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyStateComponent {
  // ───────────────────────────────────────────────────────────────────────────
  // INPUTS
  // ───────────────────────────────────────────────────────────────────────────

  /** Variant (uses preset) */
  readonly variant = input<EmptyStateVariant>('no-results');

  /** Custom title (overrides preset) */
  readonly title = input<string | null>(null);

  /** Custom message (overrides preset) */
  readonly message = input<string | null>(null);

  /** Custom illustration (overrides preset) */
  readonly illustration = input<EmptyStateIllustration | null>(null);

  /** Custom actions (overrides preset) */
  readonly actions = input<EmptyStateAction[] | null>(null);

  /** Compact display */
  readonly compact = input(false);

  /** Centered (for full pages) */
  readonly centered = input(true);

  /** Number of active filters (for display) */
  readonly activeFilterCount = input(0);

  // ───────────────────────────────────────────────────────────────────────────
  // OUTPUTS
  // ───────────────────────────────────────────────────────────────────────────

  /** Reset filters */
  readonly clearFilters = output<void>();

  /** Reload */
  readonly retry = output<void>();

  /** Custom action */
  readonly customAction = output<EmptyStateAction>();

  // ───────────────────────────────────────────────────────────────────────────
  // COMPUTED
  // ───────────────────────────────────────────────────────────────────────────

  /** Effective configuration (preset + overrides) */
  readonly config = computed<EmptyStateConfig>(() => {
    const preset = EMPTY_STATE_PRESETS[this.variant()];

    return {
      variant: this.variant(),
      title: this.title() ?? preset.title,
      message: this.message() ?? preset.message,
      illustration: this.illustration() ?? preset.illustration,
      actions: this.actions() ?? preset.actions,
    };
  });

  /** Illustration SVG Path */
  readonly illustrationPath = computed(() => {
    const ill = this.config().illustration;
    if (!ill || ill === 'none') return null;

    return `/assets/illustrations/empty-state/${ill}.svg`;
  });

  /** Show illustration */
  readonly showIllustration = computed(() => {
    const ill = this.config().illustration;
    return ill && ill !== 'none';
  });

  /** CSS Klassen */
  readonly cssClasses = computed(() => ({
    'empty-state': true,
    'empty-state--compact': this.compact(),
    'empty-state--centered': this.centered(),
    [`empty-state--${this.variant()}`]: true,
  }));

  // ───────────────────────────────────────────────────────────────────────────
  // METHODS
  // ───────────────────────────────────────────────────────────────────────────

  /**
   * Action Button Click Handler
   */
  onActionClick(action: EmptyStateAction): void {
    switch (action.action) {
      case 'clear-filters':
        this.clearFilters.emit();
        break;

      case 'retry':
        this.retry.emit();
        break;

      case 'home':
        // Navigation is handled via RouterLink in template
        break;

      case 'custom':
        if (action.customHandler) {
          action.customHandler();
        }
        this.customAction.emit(action);
        break;
    }
  }

  /**
   * Returns button variant for action
   */
  getButtonVariant(
    action: EmptyStateAction
  ): 'primary' | 'secondary' | 'ghost' {
    return action.variant ?? 'primary';
  }

  /**
   * Is action a link to the home page?
   */
  isHomeAction(action: EmptyStateAction): boolean {
    return action.action === 'home';
  }
}
