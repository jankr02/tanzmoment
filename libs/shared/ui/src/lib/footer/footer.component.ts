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
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../icon/icon.component';
import { WaveDividerComponent } from '../wave-divider/wave-divider.component';
import { WaveVariant, WaveHeight, WaveDirection } from '../wave-divider/wave-divider.types';
import {
  FooterConfig,
  FooterNavColumn,
  FooterNavLink,
  ContactInfo,
  SocialLink,
  LegalLink,
  DEFAULT_FOOTER_NAV,
  DEFAULT_SOCIAL_LINKS,
  DEFAULT_LEGAL_LINKS,
  DEFAULT_CONTACT_INFO,
} from './footer.types';

/**
 * Footer Component V1
 *
 * Organic footer with newsletter signup, contact info, and scroll-to-top.
 * Features multiple SVG shape variants for experimentation.
 *
 * Usage:
 * <app-footer
 *   [variant]="'curve'"
 *   [showNewsletter]="true"
 *   [showScrollTop]="true"
 * />
 */
@Component({
  selector: 'tm-footer',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IconComponent,
    WaveDividerComponent,
  ],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent implements OnInit, OnDestroy {
  // ============================================================================
  // CONFIGURATION
  // ============================================================================

  @Input() config?: FooterConfig;

  // Branding
  @Input() logoUrl = 'assets/images/logo-without-name.svg';
  @Input() logoAlt = 'Tanzmoment';
  @Input() slogan = 'Bewegung. Ausdruck. Gemeinschaft.';
  @Input() homeUrl = '/';

  // Navigation
  @Input() navColumns: FooterNavColumn[] = DEFAULT_FOOTER_NAV;

  // Newsletter
  @Input() showNewsletter = true;
  @Input() newsletterTitle = 'Bleib in Bewegung';
  @Input() newsletterSubtitle = 'Erhalte Neuigkeiten über Kurse & Events';
  @Input() newsletterPlaceholder = 'Deine E-Mail';
  @Input() newsletterButtonText = 'Anmelden';

  // Contact Info
  @Input() showContactInfo = true;
  @Input() contactInfo: ContactInfo = DEFAULT_CONTACT_INFO;

  // Social Media
  @Input() socialLinks: SocialLink[] = DEFAULT_SOCIAL_LINKS;

  // Bottom Bar
  @Input() copyrightText?: string;
  @Input() legalLinks: LegalLink[] = DEFAULT_LEGAL_LINKS;
  @Input() showLanguageSelector = false;
  @Input() showThemeToggle = false;

  // Scroll-to-Top
  @Input() showScrollTop = true;
  @Input() scrollTopThreshold = 300;

  // Wave Configuration
  @Input() waveVariant: WaveVariant = 'default';
  @Input() waveHeight: WaveHeight = 'lg';
  @Input() waveFrom = 'var(--last-section-bg, var(--color-surface))';
  @Input() waveTo = 'var(--color-accent)';
  @Input() waveDirection: WaveDirection = 'down';
  @Input() waveShadow = false;

  // ============================================================================
  // EVENTS
  // ============================================================================

  @Output() newsletterSubmit = new EventEmitter<string>();
  @Output() navLinkClicked = new EventEmitter<FooterNavLink>();
  @Output() socialLinkClicked = new EventEmitter<SocialLink>();
  @Output() scrollTopClicked = new EventEmitter<void>();

  // ============================================================================
  // STATE
  // ============================================================================

  newsletterEmail = '';
  newsletterLoading = signal(false);
  newsletterSuccess = signal(false);
  newsletterError = signal('');

  showScrollTopButton = signal(false);

  currentYear = new Date().getFullYear();

  // Computed Classes
  footerClasses = computed(() => {
    const classes = ['footer'];
    if (this.showScrollTopButton()) classes.push('footer--scrollable');
    return classes.join(' ');
  });

  // ============================================================================
  // LIFECYCLE
  // ============================================================================

  ngOnInit(): void {
    if (this.config) {
      this.applyConfig(this.config);
    }

    // Set default copyright if not provided
    if (!this.copyrightText) {
      this.copyrightText = `© ${this.currentYear} Tanzmoment. Alle Rechte vorbehalten.`;
    }
  }

  ngOnDestroy(): void {
    // Cleanup if needed
  }

  // ============================================================================
  // SCROLL HANDLING
  // ============================================================================

  @HostListener('window:scroll')
  onWindowScroll(): void {
    if (!this.showScrollTop) return;

    const scrollY = window.scrollY;
    this.showScrollTopButton.set(scrollY > this.scrollTopThreshold);
  }

  scrollToTop(): void {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
    this.scrollTopClicked.emit();
  }

  // ============================================================================
  // NEWSLETTER
  // ============================================================================

  async onNewsletterSubmit(): Promise<void> {
    // Validate email
    if (!this.newsletterEmail || !this.isValidEmail(this.newsletterEmail)) {
      this.newsletterError.set('Bitte gib eine gültige E-Mail-Adresse ein.');
      return;
    }

    this.newsletterLoading.set(true);
    this.newsletterError.set('');

    try {
      // Emit to parent component for handling
      this.newsletterSubmit.emit(this.newsletterEmail);

      // Simulate API call (replace with actual service)
      await this.delay(1500);

      this.newsletterSuccess.set(true);
      this.newsletterEmail = '';

      // Reset success message after 3 seconds
      setTimeout(() => {
        this.newsletterSuccess.set(false);
      }, 3000);
    } catch (error) {
      this.newsletterError.set(
        'Ein Fehler ist aufgetreten. Bitte versuche es später erneut.'
      );
    } finally {
      this.newsletterLoading.set(false);
    }
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // ============================================================================
  // NAVIGATION
  // ============================================================================

  onNavLinkClick(link: FooterNavLink): void {
    this.navLinkClicked.emit(link);
  }

  onSocialLinkClick(link: SocialLink): void {
    this.socialLinkClicked.emit(link);
  }

  // ============================================================================
  // CONTACT INFO
  // ============================================================================

  get formattedAddress(): string {
    if (!this.contactInfo.address) return '';
    return this.contactInfo.city
      ? `${this.contactInfo.address}, ${this.contactInfo.city}`
      : this.contactInfo.address;
  }

  openMap(): void {
    if (this.contactInfo.mapUrl) {
      window.open(this.contactInfo.mapUrl, '_blank', 'noopener,noreferrer');
    }
  }

  // ============================================================================
  // CONFIGURATION
  // ============================================================================

  private applyConfig(config: FooterConfig): void {
    if (config.logoUrl) this.logoUrl = config.logoUrl;
    if (config.logoAlt) this.logoAlt = config.logoAlt;
    if (config.slogan) this.slogan = config.slogan;
    if (config.homeUrl) this.homeUrl = config.homeUrl;

    if (config.navColumns) this.navColumns = config.navColumns;

    if (config.showNewsletter !== undefined)
      this.showNewsletter = config.showNewsletter;
    if (config.newsletterTitle) this.newsletterTitle = config.newsletterTitle;
    if (config.newsletterSubtitle)
      this.newsletterSubtitle = config.newsletterSubtitle;
    if (config.newsletterPlaceholder)
      this.newsletterPlaceholder = config.newsletterPlaceholder;
    if (config.newsletterButtonText)
      this.newsletterButtonText = config.newsletterButtonText;

    if (config.showContactInfo !== undefined)
      this.showContactInfo = config.showContactInfo;
    if (config.contactInfo)
      this.contactInfo = { ...DEFAULT_CONTACT_INFO, ...config.contactInfo };

    if (config.socialLinks) this.socialLinks = config.socialLinks;

    if (config.copyrightText) this.copyrightText = config.copyrightText;
    if (config.legalLinks) this.legalLinks = config.legalLinks;
    if (config.showLanguageSelector !== undefined)
      this.showLanguageSelector = config.showLanguageSelector;
    if (config.showThemeToggle !== undefined)
      this.showThemeToggle = config.showThemeToggle;

    if (config.showScrollTop !== undefined)
      this.showScrollTop = config.showScrollTop;
    if (config.scrollTopThreshold)
      this.scrollTopThreshold = config.scrollTopThreshold;

    if (config.waveVariant) this.waveVariant = config.waveVariant;
    if (config.waveHeight) this.waveHeight = config.waveHeight;
    if (config.waveFrom) this.waveFrom = config.waveFrom;
    if (config.waveTo) this.waveTo = config.waveTo;
    if (config.waveDirection) this.waveDirection = config.waveDirection;
    if (config.waveShadow !== undefined) this.waveShadow = config.waveShadow;
  }
}
