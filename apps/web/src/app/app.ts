import { Component, isDevMode, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SplashScreenComponent } from './shared/ui/splash-screen';
import { RouterOutlet } from '@angular/router';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    SplashScreenComponent,
    RouterOutlet,
    // ... andere imports
  ],
  template: `
    <!-- Splash Screen -->
    <app-splash-screen
      [duration]="4000"
      [autoFade]="true"
      [showSkipButton]="true"
      (completed)="onSplashCompleted()"
    />

    <!-- Main Content -->
    <router-outlet />
    <!-- oder deine Landing Page -->
  `,
  styleUrl: './app.scss',
})
export class AppComponent {
  // Splash Screen nur in Production anzeigen, nicht während der Entwicklung
  showSplash = signal(!isDevMode());

  onSplashCompleted(): void {
    this.showSplash.set(false);
  }
}
