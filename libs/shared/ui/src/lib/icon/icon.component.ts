import { 
  Component, 
  Input, 
  OnInit,
  ChangeDetectionStrategy,
  inject
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { IconName, IconSize, IconColor, ICON_SIZES, ICON_COLORS } from './icon.types';

/**
 * Icon Component V3 - Final Fixed Version
 * 
 * Renders SVG icons without innerHTML to avoid sanitization issues.
 * Uses bypassSecurityTrustHtml() for SVG paths.
 * 
 * Usage:
 * <app-icon name="calendar" size="md" color="primary" />
 * <app-icon name="heart" size="lg" [ariaLabel]="'Favorit hinzufügen'" />
 */
@Component({
  selector: 'app-icon',
  standalone: true,
  imports: [CommonModule],
  template: `
    <span 
      class="icon-wrapper"
      [class]="iconClasses"
      [attr.aria-label]="ariaLabel"
      [attr.role]="ariaLabel ? 'img' : 'presentation'"
      [style.width.px]="iconSize"
      [style.height.px]="iconSize"
      [innerHTML]="svgContent"
    ></span>
  `,
  styles: [`
    .icon-wrapper {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
      vertical-align: middle;
      
      :host-context(button) & {
        pointer-events: none;
      }
      
      ::ng-deep svg {
        width: 100%;
        height: 100%;
        display: block;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconComponent implements OnInit {
  @Input({ required: true }) name!: IconName;
  @Input() size: IconSize = 'md';
  @Input() color: IconColor = 'current';
  @Input() className?: string;
  @Input() ariaLabel?: string;
  
  svgContent: SafeHtml = '';
  
  // ══════════════════════════════════════════════════════════════════════════
  // ICON REGISTRY
  // ══════════════════════════════════════════════════════════════════════════
  
  private iconRegistry: Record<IconName, string> = {
    // Navigation & UI Icons
    'calendar': '<path d="M8 2v4M16 2v4"/><path d="M3 10h18"/><rect x="3" y="4" width="18" height="18" rx="2"/>',
    
    'heart': '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>',

    'lighthouse': '<path d="M12 20.47V10.59"/><path d="M12 14.12C12 14.12 6.35 14.12 4.94 8.47C10.59 8.47 12 14.12 12 14.12Z"/><path d="M12 10.59C12 10.59 17.65 10.59 19.06 4.24C12.71 4.24 12 10.59 12 10.59Z"/>',

    'mail': '<path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8"/><rect x="3" y="5" width="18" height="14" rx="2"/>',

    'phone': '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>',

    'map-pin': '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>',

    'search': '<circle cx="11" cy="11" r="8"/><path d="m22 22-5.5-5.5"/>',
    
    'bell': '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
    
    'user': '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    
    'users': '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    
    'settings': '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
    
    'log-out': '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>',
    
    'chevron-down': '<polyline points="6 9 12 15 18 9"/>',

    'chevron-up': '<polyline points="6 15 12 9 18 15"/>',

    'x': '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
    
    'check-circle': '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',

    'filter': '<polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>',

    'info': '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',

    // Course / Fact Icons
    'euro': '<path d="M4 10h12"/><path d="M4 14h12"/><path d="M19 6.3a9 9 0 1 0 0 11.4"/>',

    'clock': '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',

    'bar-chart': '<line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>',

    'wheelchair': '<circle cx="11" cy="4" r="2"/><path d="M9 9 7 20h7l2-5"/><path d="M9 9H7L5 14"/><path d="M7 20a4 4 0 0 0 8 0"/>',

    'sparkle': '<path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3z"/><path d="M5 3v4M19 17v4M3 5h4M17 19h4"/>',

    'music': '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',

    // Booking & Status Icons
    'alert-circle': '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>',

    'x-circle': '<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>',

    'user-check': '<path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><polyline points="17 11 19 13 23 9"/>',

    'lock': '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',

    'calendar-x': '<path d="M8 2v4M16 2v4"/><path d="M3 10h18"/><rect x="3" y="4" width="18" height="18" rx="2"/><path d="m14 14-4 4"/><path d="m10 14 4 4"/>',

    // Admin Icons
    'layout-dashboard': '<rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/>',

    'book-open': '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>',

    'clipboard-list': '<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><path d="M9 14h.01M13 14h2M9 18h.01M13 18h2"/>',

    'wallet': '<path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"/><path d="M4 6v12a2 2 0 0 0 2 2h14v-4"/><path d="M18 12a2 2 0 0 0 0 4h4v-4z"/>',

    'chevrons-right': '<polyline points="13 17 18 12 13 7"/><polyline points="6 17 11 12 6 7"/>',

    'chevrons-left': '<polyline points="11 17 6 12 11 7"/><polyline points="18 17 13 12 18 7"/>',

    'external-link': '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>',

    'menu': '<line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/>',

    'home': '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',

    'arrow-left': '<line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>',
    'chevron-right': '<polyline points="9 18 15 12 9 6"/>',
    'chevron-left': '<polyline points="15 18 9 12 15 6"/>',
    'trash-2': '<polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14H6L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/>',
    'download': '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>',

    'newspaper': '<path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8M15 18h-5M10 6h8v4h-8z"/>',

    // Social Media Icons
    'instagram': '<rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>',
    
    'facebook': '<path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>',
    
    // Dance Style Icons
    'contemporary': '<path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>',
    
    'modern': '<path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',
    
    'jazz': '<path d="M9 18V5l12-2v13"/><path d="M9 9l12-2"/>',
    
    'ballet': '<path d="M3 12h18"/><path d="M12 3v18"/>',
    
    'improvisation': '<circle cx="9.5" cy="11" r="6.5"/><circle cx="16" cy="16.5" r="3.2"/>',
    
    'ausdruckstanz': '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/><circle cx="9" cy="7" r="4"/>',
  };
  
  private readonly sanitizer = inject(DomSanitizer);
  
  // ══════════════════════════════════════════════════════════════════════════
  // LIFECYCLE
  // ══════════════════════════════════════════════════════════════════════════
  
  ngOnInit(): void {
    this.loadIcon();
  }
  
  // ══════════════════════════════════════════════════════════════════════════
  // GETTERS
  // ══════════════════════════════════════════════════════════════════════════
  
  get iconClasses(): string {
    const classes = ['icon'];
    if (this.className) classes.push(this.className);
    return classes.join(' ');
  }
  
  get iconSize(): number {
    return ICON_SIZES[this.size];
  }
  
  get iconColor(): string {
    return ICON_COLORS[this.color];
  }
  
  // ══════════════════════════════════════════════════════════════════════════
  // ICON LOADING
  // ══════════════════════════════════════════════════════════════════════════
  
  private loadIcon(): void {
    const pathData = this.iconRegistry[this.name];
    
    if (!pathData) {
      console.warn(`[IconComponent] Icon "${this.name}" not found in registry`);
      return;
    }
    
    // ✅ Build complete SVG with all attributes
    const svg = `
      <svg 
        width="${this.iconSize}" 
        height="${this.iconSize}" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="${this.iconColor}" 
        stroke-width="2" 
        stroke-linecap="round" 
        stroke-linejoin="round"
        xmlns="http://www.w3.org/2000/svg"
      >
        ${pathData}
      </svg>
    `;
    
    // ✅ Bypass sanitization for trusted SVG content
    this.svgContent = this.sanitizer.bypassSecurityTrustHtml(svg);
  }
}