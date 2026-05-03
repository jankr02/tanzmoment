import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
  signal,
} from '@angular/core';
import { NgIf } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'tm-newsletter-unsubscribe-page',
  standalone: true,
  imports: [NgIf, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './newsletter-unsubscribe-page.component.html',
  styleUrl: './newsletter-pages.scss',
})
export class NewsletterUnsubscribePageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);

  readonly isError = signal(false);

  ngOnInit(): void {
    this.isError.set(this.route.snapshot.queryParamMap.get('error') === '1');
  }
}
