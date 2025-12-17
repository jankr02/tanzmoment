import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnDestroy,
  HostListener,
  signal,
  computed,
  effect,
  PLATFORM_ID,
  inject,
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { ButtonComponent } from '../button/button.component';
import { IconComponent } from '../icon/icon.component';
import { HeaderConfig, NavItem, UserMenuData, DEFAULT_NAV_ITEMS } from './header.types';

@Component({
  selector: 'tm-header',
  standalone: true,
  imports: [CommonModule, ButtonComponent, IconComponent],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent implements OnInit, OnDestroy {
  
  // ============================================================================
  // PLATFORM CHECK (SSR-Safe)
  // ============================================================================

  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);
  private router = inject(Router);
  private routerSubscription?: Subscription;

  // ============================================================================
  // CONFIGURATION
  // ============================================================================

  @Input() config?: HeaderConfig;

  // Navigation
  @Input() showNav = true;
  @Input() navItems: NavItem[] = DEFAULT_NAV_ITEMS;
  @Input() activeRoute?: string;

  /** Automatically detected current route */
  currentRoute = signal<string>('');
  
  // CTA Buttons
  @Input() showLoginButton = true;
  @Input() showRegisterButton = true;
  @Input() loginText = 'Anmelden';
  @Input() registerText = 'Registrieren';
  
  // User Menu
  @Input() isAuthenticated = false;
  @Input() userData?: UserMenuData;
  @Input() showUserMenu = false;
  
  // Logo
  @Input() logoUrl?: string;
  @Input() logoAlt = 'Tanzmoment Logo';
  @Input() homeUrl = '/';
  
  // Label
  @Input() showNewLabel = false;
  
  // Scroll Behavior
  @Input() shrinkOnScroll = true;
  @Input() hideOnScrollDown = false;
  @Input() scrollThreshold = 50;
  
  // Styling
  @Input() fixed = false;
  @Input() transparent = false;
  @Input() bgColor = '#FDF8F3';
  
  // Search
  @Input() showSearch = false;
  
  // Notifications
  @Input() notificationCount = 0;
  
  // ============================================================================
  // EVENTS
  // ============================================================================
  
  @Output() loginClicked = new EventEmitter<void>();
  @Output() registerClicked = new EventEmitter<void>();
  @Output() logoClicked = new EventEmitter<void>();
  @Output() navItemClicked = new EventEmitter<NavItem>();
  @Output() searchTriggered = new EventEmitter<void>();
  @Output() userMenuToggled = new EventEmitter<boolean>();
  @Output() notificationClicked = new EventEmitter<void>();
  
  // ============================================================================
  // STATE SIGNALS
  // ============================================================================
  
  // Mobile Menu State
  mobileMenuOpen = signal(false);
  
  // Scroll State
  private lastScrollY = signal(0);
  scrolledDown = signal(false);
  isScrolled = signal(false);
  headerHidden = signal(false);
  
  // User Menu State
  userMenuOpen = signal(false);
  
  // Search State
  searchOpen = signal(false);
  
  // Computed Classes
  headerClasses = computed(() => {
    const classes = ['header'];
    
    if (this.fixed) classes.push('header--fixed');
    if (this.transparent) classes.push('header--transparent');
    if (this.scrolledDown()) classes.push('header--scrolled');
    if (this.isScrolled() && this.shrinkOnScroll) classes.push('header--shrink');
    if (this.headerHidden()) classes.push('header--hidden');
    if (this.mobileMenuOpen()) classes.push('header--menu-open');
    if (this.searchOpen()) classes.push('header--search-open');
    
    return classes.join(' ');
  });
  
  // ============================================================================
  // CONSTRUCTOR 
  // ============================================================================
  
  constructor() {
    effect(() => {
      if (this.searchOpen() && this.isBrowser) {
        setTimeout(() => {
          const searchInput = document.querySelector('.header__search-input') as HTMLInputElement;
          searchInput?.focus();
        }, 100);
      }
    });
  }
  
  // ============================================================================
  // LIFECYCLE
  // ============================================================================
  
  ngOnInit(): void {
    // ✅ SSR-Safe: Only access window in browser
    if (this.isBrowser) {
      this.lastScrollY.set(window.scrollY);
    }

    if (this.config) {
      this.applyConfig(this.config);
    }

    // Set initial route and subscribe to route changes
    this.currentRoute.set(this.router.url);
    this.routerSubscription = this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.currentRoute.set((event as NavigationEnd).urlAfterRedirects);
      });
  }

  ngOnDestroy(): void {
    // ✅ SSR-Safe: Only access document in browser
    if (this.isBrowser) {
      document.body.style.overflow = '';
    }

    // Cleanup router subscription
    this.routerSubscription?.unsubscribe();
  }
  
  // ============================================================================
  // SCROLL HANDLING
  // ============================================================================
  
  @HostListener('window:scroll')
  onWindowScroll(): void {
    // ✅ SSR-Safe: Only run in browser
    if (!this.isBrowser) return;
    
    const currentScrollY = window.scrollY;
    const lastY = this.lastScrollY();
    
    this.isScrolled.set(currentScrollY > this.scrollThreshold);
    
    if (currentScrollY > lastY && currentScrollY > this.scrollThreshold) {
      this.scrolledDown.set(true);
      
      if (this.hideOnScrollDown) {
        this.headerHidden.set(true);
      }
    } else if (currentScrollY < lastY) {
      this.scrolledDown.set(false);
      this.headerHidden.set(false);
    }
    
    this.lastScrollY.set(currentScrollY);
  }
  
  // ============================================================================
  // KEYBOARD HANDLING
  // ============================================================================
  
  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.searchOpen()) {
      this.closeSearch();
    } else if (this.mobileMenuOpen()) {
      this.closeMobileMenu();
    } else if (this.userMenuOpen()) {
      this.closeUserMenu();
    }
  }
  
  // ============================================================================
  // MOBILE MENU
  // ============================================================================
  
  toggleMobileMenu(): void {
    // ✅ SSR-Safe: Only access document in browser
    if (!this.isBrowser) return;
    
    this.mobileMenuOpen.update(open => !open);
    document.body.style.overflow = this.mobileMenuOpen() ? 'hidden' : '';
  }
  
  closeMobileMenu(): void {
    // ✅ SSR-Safe: Only access document in browser
    if (!this.isBrowser) return;
    
    this.mobileMenuOpen.set(false);
    document.body.style.overflow = '';
  }
  
  // ============================================================================
  // SEARCH
  // ============================================================================
  
  toggleSearch(): void {
    this.searchOpen.update(open => !open);
    this.searchTriggered.emit();
  }
  
  closeSearch(): void {
    this.searchOpen.set(false);
  }
  
  // ============================================================================
  // USER MENU
  // ============================================================================
  
  toggleUserMenu(): void {
    this.userMenuOpen.update(open => !open);
    this.userMenuToggled.emit(this.userMenuOpen());
  }
  
  closeUserMenu(): void {
    this.userMenuOpen.set(false);
  }
  
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    // ✅ SSR-Safe: Only run in browser
    if (!this.isBrowser) return;
    
    const target = event.target as HTMLElement;
    const userMenuElement = document.querySelector('.header__user-menu');
    
    if (userMenuElement && !userMenuElement.contains(target)) {
      this.closeUserMenu();
    }
  }
  
  // ============================================================================
  // NAVIGATION
  // ============================================================================

  isActiveRoute(item: NavItem): boolean {
    // Use manually set activeRoute if provided, otherwise use auto-detected route
    const route = this.activeRoute || this.currentRoute();
    if (!route) return false;

    const itemRoute = item.route || item.url;
    if (!itemRoute) return false;

    // Check if current route starts with the nav item route
    // This handles sub-routes like /courses/123 matching /courses
    return route === itemRoute || route.startsWith(itemRoute + '/');
  }
  
  onNavItemClick(item: NavItem): void {
    this.navItemClicked.emit(item);
    this.closeMobileMenu();
  }
  
  // ============================================================================
  // BUTTON HANDLERS
  // ============================================================================
  
  onLoginClick(): void {
    this.loginClicked.emit();
    this.closeMobileMenu();
  }
  
  onRegisterClick(): void {
    this.registerClicked.emit();
    this.closeMobileMenu();
  }
  
  onLogoClick(): void {
    this.logoClicked.emit();
    this.closeMobileMenu();
  }
  
  onNotificationClick(): void {
    this.notificationClicked.emit();
  }
  
  // ============================================================================
  // CONFIGURATION
  // ============================================================================
  
  private applyConfig(config: HeaderConfig): void {
    if (config.showNav !== undefined) this.showNav = config.showNav;
    if (config.navItems) this.navItems = config.navItems;
    if (config.showLoginButton !== undefined) this.showLoginButton = config.showLoginButton;
    if (config.showRegisterButton !== undefined) this.showRegisterButton = config.showRegisterButton;
    if (config.loginText) this.loginText = config.loginText;
    if (config.registerText) this.registerText = config.registerText;
    if (config.logoUrl) this.logoUrl = config.logoUrl;
    if (config.logoAlt) this.logoAlt = config.logoAlt;
    if (config.homeUrl) this.homeUrl = config.homeUrl;
    if (config.fixed !== undefined) this.fixed = config.fixed;
    if (config.transparent !== undefined) this.transparent = config.transparent;
  }
}