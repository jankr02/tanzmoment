import {
  ChangeDetectionStrategy,
  Component,
  input,
} from '@angular/core';
import { DatePipe, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { PublicNewsListItem } from '../../types/news.types';

@Component({
  selector: 'tm-news-card',
  standalone: true,
  imports: [NgIf, DatePipe, RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './news-card.component.html',
  styleUrl: './news-card.component.scss',
})
export class NewsCardComponent {
  readonly article = input.required<PublicNewsListItem>();
}
