import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ButtonComponent } from './shared/ui/button/button.component';
import { HeaderComponent } from './shared/ui/header/header.component';
import { NavItem, UserMenuData } from './shared/ui/header/header.types';
import { FooterComponent } from './shared/ui/footer';

@Component({
  imports: [
    RouterModule, 
    ButtonComponent, 
    HeaderComponent,
    FooterComponent,
  ],
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App implements OnInit {
  protected title = 'Tanzmoment';

  // ══════════════════════════════════════════════════════════════════════════
  // DEMO CONTROLS
  // ══════════════════════════════════════════════════════════════════════════
  
  // Toggle Auth State for testing
  isAuthenticated = false;
  
  // Toggle Features
  showSearch = true;
  shrinkOnScroll = true;
  hideOnScrollDown = false;
  isHeaderFixed = true;
  isHeaderTransparent = false;
  
  // Notification count (für Demo)
  notificationCount = 3;
  
  // Current active route (simuliert)
  currentRoute = '/courses';

  // ══════════════════════════════════════════════════════════════════════════
  // NAVIGATION ITEMS 
  // ══════════════════════════════════════════════════════════════════════════
  
  navItems: NavItem[] = [
    {
      label: 'Kurse',
      route: '/courses',
      iconName: 'calendar',  
    },
    {
      label: 'Über uns',
      route: '/about',
      iconName: 'heart',  
    },
    {
      label: 'Kontakt',
      route: '/contact',
      iconName: 'mail', 
    },
  ];

  // ══════════════════════════════════════════════════════════════════════════
  // USER DATA 
  // ══════════════════════════════════════════════════════════════════════════
  
  userData: UserMenuData = {
    name: 'Anna Müller',
    email: 'anna.mueller@tanzmoment.de',
    avatar: undefined, 
    role: 'Teilnehmer',
    menuItems: [
      {
        label: 'Mein Profil',
        iconName: 'user',  // 
        route: '/profile',
      },
      {
        label: 'Meine Buchungen',
        iconName: 'calendar',  // 
        route: '/bookings',
      },
      {
        label: 'Favoriten',
        iconName: 'heart',  // 
        route: '/favorites',
      },
      {
        label: 'Einstellungen',
        iconName: 'settings',  // 
        route: '/settings',
      },
      {
        label: 'Abmelden',
        iconName: 'log-out',  // 
        divider: true,
        action: () => this.onLogout(),
      },
    ],
  };

  // ══════════════════════════════════════════════════════════════════════════
  // LIFECYCLE
  // ══════════════════════════════════════════════════════════════════════════
  
  ngOnInit(): void {
    console.log('🎨 Tanzmoment App initialized');
    console.log('📋 Header Demo Controls:');
    console.log('   - isAuthenticated:', this.isAuthenticated);
    console.log('   - showSearch:', this.showSearch);
    console.log('   - shrinkOnScroll:', this.shrinkOnScroll);
    console.log('   - notificationCount:', this.notificationCount);
    console.log('');
    console.log('💡 Tipp: Öffne die Browser Console um alle Events zu sehen!');
    console.log('💡 Tipp: Ändere isAuthenticated zu true um User Menu zu sehen');
  }

  // ══════════════════════════════════════════════════════════════════════════
  // DEMO CONTROL METHODS
  // ══════════════════════════════════════════════════════════════════════════
  
  /**
   * Toggle authentication state 
   */
  toggleAuth(): void {
    this.isAuthenticated = !this.isAuthenticated;
    console.log('🔐 Auth toggled:', this.isAuthenticated ? 'LOGGED IN' : 'LOGGED OUT');
    
    if (this.isAuthenticated) {
      console.log('👤 User:', this.userData.name);
      console.log('📧 Email:', this.userData.email);
    }
  }

  /**
   * Toggle search feature
   */
  toggleSearch(): void {
    this.showSearch = !this.showSearch;
    console.log('🔍 Search toggled:', this.showSearch ? 'ENABLED' : 'DISABLED');
  }

  /**
   * Toggle shrink on scroll
   */
  toggleShrinkOnScroll(): void {
    this.shrinkOnScroll = !this.shrinkOnScroll;
    console.log('📜 Shrink on scroll:', this.shrinkOnScroll ? 'ENABLED' : 'DISABLED');
  }

  /**
   * Toggle hide on scroll down
   */
  toggleHideOnScrollDown(): void {
    this.hideOnScrollDown = !this.hideOnScrollDown;
    console.log('👁️ Hide on scroll down:', this.hideOnScrollDown ? 'ENABLED' : 'DISABLED');
  }

  /**
   * Increment notification count
   */
  addNotification(): void {
    this.notificationCount++;
    console.log('🔔 Notification added. Count:', this.notificationCount);
  }

  /**
   * Clear all notifications
   */
  clearNotifications(): void {
    this.notificationCount = 0;
    console.log('🔕 Notifications cleared');
  }

  /**
   * Simulate route change
   */
  simulateRouteChange(route: string): void {
    this.currentRoute = route;
    console.log('🔗 Route changed to:', route);
  }

  // ══════════════════════════════════════════════════════════════════════════
  // HEADER EVENT HANDLERS
  // ══════════════════════════════════════════════════════════════════════════

  /**
   * Handle login button click
   */
  onLogin(): void {
    console.log('');
    console.log('🔐 LOGIN CLICKED');
    console.log('─────────────────');
    console.log('Action: User wants to log in');
    console.log('Next: Open login modal or navigate to /login');
    console.log('');
    
    // Für Demo: Simuliere Login
    setTimeout(() => {
      this.isAuthenticated = true;
      console.log('✅ Demo: User logged in automatically after 1s');
    }, 1000);
    
    // TODO: Implement real login
    // this.router.navigate(['/login']);
    // OR: this.authService.openLoginModal();
  }

  /**
   * Handle register button click
   */
  onRegister(): void {
    console.log('');
    console.log('📝 REGISTER CLICKED');
    console.log('───────────────────');
    console.log('Action: User wants to register');
    console.log('Next: Open registration modal or navigate to /register');
    console.log('');
    
    // TODO: Implement real registration
    // this.router.navigate(['/register']);
    // OR: this.authService.openRegisterModal();
  }

  /**
   * Handle logo click
   */
  onLogoClick(): void {
    console.log('');
    console.log('🏠 LOGO CLICKED');
    console.log('───────────────');
    console.log('Action: Navigate to home');
    console.log('');
    
    this.simulateRouteChange('/');
    
    // TODO: Implement real navigation
    // this.router.navigate(['/']);
  }

  /**
   * Handle navigation item click
   */
  onNavItemClick(item: NavItem): void {
    console.log('');
    console.log('🔗 NAVIGATION CLICKED');
    console.log('─────────────────────');
    console.log('Label:', item.label);
    console.log('Route:', item.route);
    if (item.badge) console.log('Badge:', item.badge);
    console.log('');
    
    // Simuliere Route-Wechsel
    if (item.route) {
      this.simulateRouteChange(item.route);
    }
    
    // TODO: Implement real navigation
    // this.router.navigate([item.route]);
  }

  /**
   * Handle search triggered
   */
  onSearchTriggered(): void {
    console.log('');
    console.log('🔍 SEARCH TRIGGERED');
    console.log('───────────────────');
    console.log('Action: Search overlay opened');
    console.log('Next: Implement search logic or navigate to search page');
    console.log('');
    
    // TODO: Implement search
    // this.router.navigate(['/search']);
    // OR: Show search results in overlay
  }

  /**
   * Handle user menu toggle
   */
  onUserMenuToggle(isOpen: boolean): void {
    console.log('');
    console.log('👤 USER MENU TOGGLED');
    console.log('────────────────────');
    console.log('State:', isOpen ? 'OPENED' : 'CLOSED');
    console.log('User:', this.userData.name);
    console.log('');
    
    // Optional: Track analytics
    if (isOpen) {
      // Analytics: trackEvent('user_menu_opened')
    }
  }

  /**
   * Handle notification click
   */
  onNotificationClick(): void {
    console.log('');
    console.log('🔔 NOTIFICATIONS CLICKED');
    console.log('────────────────────────');
    console.log('Unread count:', this.notificationCount);
    console.log('Action: Navigate to notifications page');
    console.log('');
    
    // TODO: Navigate to notifications
    // this.router.navigate(['/notifications']);
    
    // Optional: Mark all as read
    this.clearNotifications();
  }

  /**
   * Handle logout
   */
  onLogout(): void {
    console.log('');
    console.log('🚪 LOGOUT');
    console.log('─────────');
    console.log('Action: User logged out');
    console.log('');
    
    this.isAuthenticated = false;
    this.notificationCount = 0;
    this.simulateRouteChange('/');
    
    // TODO: Implement real logout
    // this.authService.logout();
    // this.router.navigate(['/']);
  }

  // ══════════════════════════════════════════════════════════════════════════
  // EXISTING EVENTS (von vorher - bleiben unverändert)
  // ══════════════════════════════════════════════════════════════════════════

  onExploreCoursesClick() {
    console.log('📚 Explore Courses button clicked!');
  }

  onLearnMoreClick() {
    console.log('📖 Learn More button clicked!');
  }

  onSearchChange(searchTerm: string) {
    console.log('🔍 Search term changed:', searchTerm);
  }

  onCourseClick(course: unknown) {
    console.log('🎭 Course clicked:', course);
  }

  onRegisterCourseClick(course: unknown) {
    console.log('✅ Register clicked for course:', course);
  }

  onNewsletterSubmit(email: string): void {
    console.log('Newsletter:', email);
    // TODO: Newsletter Service anbinden
  }
}