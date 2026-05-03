import { Injectable, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';

import { SEO_DEFAULTS, SeoMetadata } from './seo.types';

@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly titleService = inject(Title);
  private readonly metaService = inject(Meta);
  private readonly document = inject(DOCUMENT);

  setMetadata(metadata: SeoMetadata = {}): void {
    const title = this.composeTitle(metadata.title);
    const description = metadata.description ?? SEO_DEFAULTS.defaultDescription;
    const url = this.absoluteUrl(metadata.url ?? '/');
    const image = this.absoluteUrl(metadata.image ?? SEO_DEFAULTS.defaultImage);
    const type = metadata.type ?? 'website';

    this.titleService.setTitle(title);
    this.metaService.updateTag({ name: 'description', content: description });

    if (metadata.noIndex) {
      this.metaService.updateTag({ name: 'robots', content: 'noindex, nofollow' });
    } else {
      this.metaService.removeTag("name='robots'");
    }

    this.metaService.updateTag({ property: 'og:title', content: title });
    this.metaService.updateTag({ property: 'og:description', content: description });
    this.metaService.updateTag({ property: 'og:url', content: url });
    this.metaService.updateTag({ property: 'og:image', content: image });
    this.metaService.updateTag({ property: 'og:type', content: type });
    this.metaService.updateTag({ property: 'og:site_name', content: SEO_DEFAULTS.siteName });
    this.metaService.updateTag({ property: 'og:locale', content: SEO_DEFAULTS.locale });

    this.metaService.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.metaService.updateTag({ name: 'twitter:title', content: title });
    this.metaService.updateTag({ name: 'twitter:description', content: description });
    this.metaService.updateTag({ name: 'twitter:image', content: image });

    this.setCanonical(url);
  }

  private composeTitle(title?: string): string {
    if (!title) return SEO_DEFAULTS.defaultTitle;
    if (title.includes(SEO_DEFAULTS.siteName)) return title;
    return `${title}${SEO_DEFAULTS.titleSuffix}`;
  }

  private absoluteUrl(pathOrUrl: string): string {
    if (/^https?:\/\//i.test(pathOrUrl)) return pathOrUrl;
    const path = pathOrUrl.startsWith('/') ? pathOrUrl : `/${pathOrUrl}`;
    return `${SEO_DEFAULTS.siteUrl}${path}`;
  }

  private setCanonical(url: string): void {
    let link = this.document.querySelector(
      "link[rel='canonical']"
    ) as HTMLLinkElement | null;

    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', 'canonical');
      this.document.head.appendChild(link);
    }

    link.setAttribute('href', url);
  }
}
