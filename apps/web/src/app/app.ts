import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ButtonComponent } from './shared/ui/button/button.component';
import { CourseCardComponent } from './shared/ui';
import { InputComponent } from './shared/ui';
import { HeaderComponent } from './shared/ui/header/header.component';
import { NavItem } from './shared/ui/header/header.types';

@Component({
  imports: [
    RouterModule, 
    ButtonComponent, 
    CourseCardComponent, 
    InputComponent,
    HeaderComponent  // ← Header Component hinzugefügt
  ],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected title = 'Tanzmoment';

  // Navigation Items für Header
  navItems: NavItem[] = [
    {
      label: 'Kurse',
      route: '/courses',
    },
    {
      label: 'Über uns',
      route: '/about',
    },
    {
      label: 'Kontakt',
      route: '/contact',
    },
  ];

  // ──────────────────────────────────────────────────────────────────────────
  // HEADER EVENTS
  // ──────────────────────────────────────────────────────────────────────────

  /**
   * Handle login button click
   */
  onLogin(): void {
    console.log('Login clicked');
    // TODO: Navigate to login page or open login modal
    // this.router.navigate(['/login']);
  }

  /**
   * Handle register button click
   */
  onRegister(): void {
    console.log('Register clicked');
    // TODO: Navigate to registration page or open registration modal
    // this.router.navigate(['/register']);
  }

  /**
   * Handle navigation item click
   */
  onNavItemClick(item: NavItem): void {
    console.log('Nav item clicked:', item);
    // TODO: Handle navigation
    // this.router.navigate([item.route]);
  }

  // ──────────────────────────────────────────────────────────────────────────
  // EXISTING EVENTS (von vorher)
  // ──────────────────────────────────────────────────────────────────────────

  onExploreCoursesClick() {
    console.log('Explore Courses button clicked!');
  }

  onLearnMoreClick() {
    console.log('Learn More button clicked!');
  }

  onSearchChange(searchTerm: string) {
    console.log('Search term changed:', searchTerm);
  }

  onCourseClick(course: any) {
    console.log('Course clicked:', course);
  }

  onRegisterClick(course: any) {
    console.log('Register clicked for course:', course);
  }
}