import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonComponent } from '../button/button.component';
import { HeaderConfig, NavItem } from './header.types';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, ButtonComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  // Configuration
  @Input() config?: HeaderConfig;
  
  // Navigation
  @Input() showNav = true;
  @Input() navItems: NavItem[] = [];
  
  // CTA Buttons
  @Input() showLoginButton = true;
  @Input() showRegisterButton = true;
  @Input() loginText = 'Anmelden';
  @Input() registerText = 'Registrieren';
  
  // Logo
  @Input() logoUrl?: string;
  @Input() logoAlt = 'Tanzmoment Logo';
  @Input() homeUrl = '/';
  
  // Label
  @Input() showNewLabel = false;
  
  // Styling
  @Input() fixed = false;
  @Input() transparent = false;
  @Input() bgColor = '#FDF8F3'; // Default Tanzmoment accent color
  
  // Events
  @Output() loginClicked = new EventEmitter<void>();
  @Output() registerClicked = new EventEmitter<void>();
  @Output() logoClicked = new EventEmitter<void>();
  @Output() navItemClicked = new EventEmitter<NavItem>();
  
  /**
   * Handle login button click
   */
  onLoginClick(): void {
    this.loginClicked.emit();
  }
  
  /**
   * Handle register button click
   */
  onRegisterClick(): void {
    this.registerClicked.emit();
  }
  
  /**
   * Handle logo click
   */
  onLogoClick(): void {
    this.logoClicked.emit();
  }
  
  /**
   * Handle navigation item click
   */
  onNavItemClick(item: NavItem): void {
    this.navItemClicked.emit(item);
  }
}
