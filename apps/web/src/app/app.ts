import { Component, isDevMode, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent, NavItem } from '@tanzmoment/shared/ui';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    HeaderComponent  // ✅ Header importieren
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.scss']
})
export class AppComponent {
    title = 'Tanzmoment';
  
  // Navigation Items für den Header
  navItems: NavItem[] = [
    {
      label: 'Kurse',
      route: '/courses',
      iconName: 'calendar'
    },
    {
      label: 'Über uns',
      route: '/about',
      iconName: 'heart'
    },
    {
      label: 'Kontakt',
      route: '/contact',
      iconName: 'mail'
    }
  ];
  
  // Event Handlers
  onLoginClick(): void {
    console.log('Login clicked');
    // Später: Navigate to login page
  }
  
  onRegisterClick(): void {
    console.log('Register clicked');
    // Später: Navigate to register page
  }
}