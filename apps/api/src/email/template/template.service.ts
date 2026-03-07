// ============================================================================
// TEMPLATE SERVICE
// ============================================================================
// Compiles MJML templates at startup and provides Handlebars rendering.
// Templates are cached in memory for fast rendering.
//
// Compilation flow:
//   1. Load MJML partial files (header.mjml, footer.mjml) into memory
//   2. For each main template: substitute {{> partialName}} with raw MJML content
//   3. Compile resolved MJML → HTML
//   4. Create Handlebars template from HTML for variable injection at render time
// ============================================================================

import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
const mjml2html = require('mjml');
import Handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';

export type TemplateName =
  | 'booking-confirmed'
  | 'booking-cancelled'
  | 'booking-cancelled-by-studio'
  | 'waitlist-joined'
  | 'waitlist-promoted'
  | 'session-reminder'
  | 'refund-processed'
  | 'email-verification'
  | 'password-reset';

@Injectable()
export class TemplateService implements OnModuleInit {
  private readonly logger = new Logger(TemplateService.name);
  private readonly compiledTemplates = new Map<string, HandlebarsTemplateDelegate>();

  /**
   * Points to the mjml/ directory after webpack asset copy.
   * At runtime the bundle lives at dist/apps/api/main.js, so __dirname = dist/apps/api.
   * The webpack asset config copies src/email/template → dist/apps/api/email/template.
   */
  private readonly templateDir = path.join(__dirname, 'email', 'template', 'mjml');

  /** Raw MJML content for each partial (e.g. 'header' → '<mj-section>...</mj-section>') */
  private readonly partials = new Map<string, string>();

  async onModuleInit(): Promise<void> {
    this.registerHandlebarsHelpers();
    this.loadPartials();
    this.compileAllTemplates();
  }

  /**
   * Renders a compiled template with the given variables.
   */
  render(name: TemplateName, variables: Record<string, unknown>): string {
    const template = this.compiledTemplates.get(name);

    if (!template) {
      throw new Error(
        `Email template "${name}" not found. Available: ${[...this.compiledTemplates.keys()].join(', ')}`,
      );
    }

    return template(variables);
  }

  /**
   * Loads MJML partial files into memory.
   * Partials are substituted before MJML compilation so the result is valid MJML.
   */
  private loadPartials(): void {
    const partialsDir = path.join(this.templateDir, 'partials');

    if (!fs.existsSync(partialsDir)) {
      this.logger.warn('No partials directory found – skipping partial loading');
      return;
    }

    const files = fs.readdirSync(partialsDir).filter((f) => f.endsWith('.mjml'));

    for (const file of files) {
      const name = path.basename(file, '.mjml');
      const content = fs.readFileSync(path.join(partialsDir, file), 'utf-8');
      this.partials.set(name, content);
      this.logger.debug(`Loaded partial: ${name}`);
    }

    this.logger.log(`Loaded ${this.partials.size} email partials`);
  }

  /**
   * Compiles all non-partial MJML templates in the template directory.
   * For each file: inlines partials → compiles MJML → creates Handlebars template.
   */
  private compileAllTemplates(): void {
    if (!fs.existsSync(this.templateDir)) {
      this.logger.warn(`Template directory not found: ${this.templateDir}`);
      return;
    }

    const files = fs
      .readdirSync(this.templateDir)
      .filter(
        (f) =>
          f.endsWith('.mjml') &&
          !fs.statSync(path.join(this.templateDir, f)).isDirectory(),
      );

    for (const file of files) {
      const name = path.basename(file, '.mjml');
      const mjmlSource = fs.readFileSync(path.join(this.templateDir, file), 'utf-8');

      try {
        // Substitute {{> partialName}} with raw MJML content before compilation
        const mjmlWithPartials = this.inlinePartials(mjmlSource);

        const { html, errors } = mjml2html(mjmlWithPartials, {
          filePath: this.templateDir,
          validationLevel: 'soft',
        });

        if (errors.length > 0) {
          this.logger.warn(
            `MJML warnings for "${name}": ${errors.map((e) => e.message).join(', ')}`,
          );
        }

        this.compiledTemplates.set(name, Handlebars.compile(html));
        this.logger.debug(`Compiled template: ${name}`);
      } catch (error) {
        this.logger.error(`Failed to compile template "${name}": ${error.message}`);
      }
    }

    this.logger.log(`Compiled ${this.compiledTemplates.size} email templates`);
  }

  /**
   * Replaces {{> partialName}} markers with the corresponding raw MJML partial content.
   * Handlebars variables ({{variableName}}) are intentionally left intact for
   * post-compilation rendering.
   */
  private inlinePartials(mjmlSource: string): string {
    return mjmlSource.replace(/\{\{> (\w+)\}\}/g, (match, name) => {
      const content = this.partials.get(name);
      if (!content) {
        this.logger.warn(`Partial "${name}" not found – leaving placeholder`);
        return '';
      }
      return content;
    });
  }

  /**
   * Registers Handlebars helpers used in templates for date/price formatting.
   */
  private registerHandlebarsHelpers(): void {
    Handlebars.registerHelper('formatDate', (date: string) => {
      const d = new Date(date);
      return d.toLocaleDateString('de-DE', {
        weekday: 'long',
        day: '2-digit',
        month: 'long',
        year: 'numeric',
      });
    });

    Handlebars.registerHelper('formatTime', (date: string) => {
      const d = new Date(date);
      return d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
    });

    Handlebars.registerHelper('formatPrice', (cents: number) => {
      return (
        (cents / 100).toLocaleString('de-DE', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }) + ' €'
      );
    });

    Handlebars.registerHelper('eq', (a: unknown, b: unknown) => a === b);
    Handlebars.registerHelper('gt', (a: number, b: number) => a > b);
  }
}
