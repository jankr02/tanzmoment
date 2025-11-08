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
    
    'mail': '<path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8"/><rect x="3" y="5" width="18" height="14" rx="2"/>',
    
    'search': '<circle cx="11" cy="11" r="8"/><path d="m22 22-5.5-5.5"/>',
    
    'bell': '<path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>',
    
    'user': '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    
    'users': '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    
    'settings': '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
    
    'log-out': '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>',
    
    'chevron-down': '<polyline points="6 9 12 15 18 9"/>',
    
    'x': '<line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>',
    
    'check-circle': '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',
    
    // Dance Style Icons
    'contemporary': '<path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>',
    
    'modern': '<path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>',
    
    'jazz': '<path d="M9 18V5l12-2v13"/><path d="M9 9l12-2"/>',
    
    'ballet': '<path d="M3 12h18"/><path d="M12 3v18"/>',
    
    'improvisation': '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>',
    
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