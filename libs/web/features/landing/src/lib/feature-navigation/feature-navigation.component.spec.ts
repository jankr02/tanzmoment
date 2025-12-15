import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { FeatureNavigationComponent } from './feature-navigation.component';

describe('FeatureNavigationComponent', () => {
  let component: FeatureNavigationComponent;
  let fixture: ComponentFixture<FeatureNavigationComponent>;
  let router: Router;

  beforeEach(async () => {
    const routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    await TestBed.configureTestingModule({
      imports: [FeatureNavigationComponent],
      providers: [
        { provide: Router, useValue: routerSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(FeatureNavigationComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have 3 feature cards', () => {
    expect(component.features.length).toBe(3);
  });

  it('should render feature cards in the template', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const cards = compiled.querySelectorAll('.feature-card');
    expect(cards.length).toBe(3);
  });

  it('should navigate when feature card is clicked', () => {
    const testRoute = '/about';
    component.navigateToFeature(testRoute);
    expect(router.navigate).toHaveBeenCalledWith([testRoute]);
  });

  it('should have correct feature data structure', () => {
    const firstFeature = component.features[0];
    expect(firstFeature).toEqual({
      id: 1,
      title: 'Meine Reise ins Tanzen',
      illustration: '/assets/illustrations/About Me.svg',
      route: '/about',
      alt: 'About Me - Meine persönliche Tanzreise',
    });
  });

  it('should render feature titles correctly', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const titles = compiled.querySelectorAll('.feature-card__title');
    expect(titles[0].textContent?.trim()).toBe('Meine Reise ins Tanzen');
    expect(titles[1].textContent?.trim()).toBe('Finde Dein Tanzmoment');
    expect(titles[2].textContent?.trim()).toBe('Was bei Tanzmoment neu erblüht');
  });
});