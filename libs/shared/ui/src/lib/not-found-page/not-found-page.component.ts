import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  inject,
} from '@angular/core';
import { Router } from '@angular/router';
import { SeoService } from '@tanzmoment/shared/services';
import { ButtonComponent } from '../button/button.component';

@Component({
  selector: 'ui-not-found-page',
  standalone: true,
  imports: [ButtonComponent],
  templateUrl: './not-found-page.component.html',
  styleUrl: './not-found-page.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NotFoundPageComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly seo = inject(SeoService);

  ngOnInit(): void {
    this.seo.setMetadata({
      title: 'Seite nicht gefunden | Tanzmoment',
      description:
        'Diese Seite konnte leider nicht gefunden werden. Entdecke stattdessen unsere Tanzkurse.',
    });
  }

  onHomeClick(): void {
    this.router.navigate(['/']);
  }

  onCoursesClick(): void {
    this.router.navigate(['/courses']);
  }
}
