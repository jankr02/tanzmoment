import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeroGalleryComponent } from './hero-gallery.component';

describe('HeroGalleryComponent', () => {
  let component: HeroGalleryComponent;
  let fixture: ComponentFixture<HeroGalleryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HeroGalleryComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HeroGalleryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have 5 slides', () => {
    expect(component.slides.length).toBe(5);
  });

  it('should start at slide 0', () => {
    expect(component.currentSlideIndex()).toBe(0);
  });

  it('should navigate to next slide', () => {
    component.nextSlide();
    expect(component.currentSlideIndex()).toBe(1);
  });

  it('should navigate to previous slide', () => {
    component.previousSlide();
    expect(component.currentSlideIndex()).toBe(4);
  });

  it('should wrap around when going forward from last slide', () => {
    component.goToSlide(4);
    component.nextSlide();
    expect(component.currentSlideIndex()).toBe(0);
  });
});