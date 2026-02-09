import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthStateService } from '@tanzmoment/web/features/landing';

@Component({
  selector: 'tm-expressive-page',
  standalone: true,
  imports: [CommonModule, RouterLink ],
  template: `
    <main class="placeholder-page">
      <div class="placeholder-page__container">
        <h1 class="placeholder-page__title">Ausdruckstanz</h1>
        <p class="placeholder-page__description">
          Freier, kreativer Ausdruck durch Bewegung. Entdecke deinen eigenen Tanzstil.
        </p>
        <p class="placeholder-page__coming-soon">
          Diese Seite befindet sich noch im Aufbau.
        </p>
        <a routerLink="/about" class="placeholder-page__back-link">
          &larr; Zurück zur Über-uns-Seite
        </a>
      </div>
    </main>
  `,
  styles: `
    .placeholder-page {
      min-height: 60vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--space-16) var(--space-6);
      background-color: var(--color-background);
    }

    .placeholder-page__container {
      text-align: center;
      max-width: 600px;
    }

    .placeholder-page__title {
      font-family: var(--font-headline);
      font-size: var(--font-size-h1);
      color: var(--color-text-primary);
      margin: 0 0 var(--space-4);
    }

    .placeholder-page__description {
      font-family: var(--font-body);
      font-size: var(--font-size-body-l);
      color: var(--color-text-secondary);
      margin: 0 0 var(--space-6);
    }

    .placeholder-page__coming-soon {
      font-family: var(--font-body);
      font-size: var(--font-size-body);
      color: var(--color-brand);
      margin: 0 0 var(--space-8);
      font-style: italic;
    }

    .placeholder-page__back-link {
      display: inline-block;
      font-family: var(--font-body);
      font-size: var(--font-size-body);
      color: var(--color-brand);
      text-decoration: none;
      padding: var(--space-3) var(--space-6);
      border: 2px solid var(--color-brand);
      border-radius: var(--radius-md);
      transition: all 0.2s ease;
    }

    .placeholder-page__back-link:hover {
      background-color: var(--color-brand);
      color: white;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpressivePageComponent {
  protected readonly authState = inject(AuthStateService);

  onLoginClicked(): void {
    this.authState.login(0);
  }
}
