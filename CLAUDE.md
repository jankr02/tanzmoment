# CLAUDE.md – Tanzmoment

> Projektkontext für Claude Code. Diese Datei liegt im Repo-Root und wird automatisch geladen.

## 🎯 Projekt

**Tanzmoment** ist eine Web-Applikation für ein Tanzstudio – Kursverwaltung, Buchung und Marketing-Website in einem. Die Kundin ist die Mutter meines besten Freundes – Qualität und Detailliebe zählen besonders.

**Brand-Kern:** warm, ruhig, naturverbunden, inklusiv, künstlerisch.
**Zielgruppen:** Accessible Dance (Menschen mit Behinderung), Expressive Dance, Kinderkurse, Mütter-Programme – jede Gruppe hat eigene Farbschemata und Messaging.

---

## ⚙️ Tech Stack

| Layer         | Technologie                                                      |
| ------------- | ---------------------------------------------------------------- |
| **Monorepo**  | Nx (apps + libs Workspace)                                       |
| **Frontend**  | Angular 20 (Standalone Components, Signals, zoneless wo möglich) |
| **State**     | TanStack Query (Server State), RxJS (Reactivity)                 |
| **Styling**   | SCSS + CSS Custom Properties (Design Tokens)                     |
| **Backend**   | NestJS (Node 20, TypeScript)                                     |
| **API**       | REST + OpenAPI/Swagger                                           |
| **Auth**      | JWT (E-Mail/Passwort, optional Social Login)                     |
| **DB**        | PostgreSQL + Prisma ORM                                          |
| **Payments**  | Stripe Checkout + Webhooks                                       |
| **Queue**     | BullMQ (Redis)                                                   |
| **E-Mail**    | Resend/SendGrid + MJML Templates                                 |
| **Testing**   | Jest (Backend), Vitest (Frontend), Playwright (E2E)              |
| **CI/CD**     | GitHub Actions                                                   |
| **Container** | Docker Compose (Postgres, Redis, Backend, Frontend)              |
| **i18n**      | Angular i18n (DE/EN)                                             |

---

## 🏗️ Architektur-Regeln

### Nx Monorepo – STRIKT einhalten

```
apps/
  web/          → Routing-Shell ONLY (keine Logik, keine Components)
  api/          → NestJS Bootstrap + App Module ONLY
libs/
  shared/       → DTOs, Types, Interfaces (FE + BE shared)
  ui/           → Reusable UI Components (Buttons, Cards, Inputs, ...)
  features/     → Feature-Module (courses, booking, auth, instructor, ...)
  data-access/  → Services, API-Calls, State Management
  util/         → Helper Functions, Pipes, Directives
```

**Goldene Regel:** Apps sind minimale Routing-Shells. ALLE Components, Services und Business-Logik gehören in `libs/`.

### Angular Patterns

- **Standalone Components** – immer, keine NgModules
- **Signals** für lokalen State, `signal()`, `computed()`, `effect()`
- **TanStack Query** für Server-State (kein manuelles HTTP-Caching)
- **RxJS** nur wo Streams wirklich Sinn machen (Events, WebSockets)
- **Lazy Loading** für alle Feature-Routes
- **`ngZone.run()`** bei async Operationen außerhalb von Zone.js
- **OnPush Change Detection** als Default
- **Barrel Exports** (`index.ts`) für jede Library

### NestJS Patterns

- **Controller → Service → Repository** Schichtung
- **DTOs mit class-validator** für Input-Validation
- **Swagger-Decorators** an jedem Endpoint
- **Guards** für Auth, **Interceptors** für Logging/Transform
- **Prisma Service** als Injectable für DB-Zugriff
- **Enums** verwenden: `PaymentStatus`, `BookingStatus`, `CourseLevel`, etc.
- **Jede Migration dokumentieren** (Prisma Migrate)

### Datenbank

- **Prisma Schema** als Single Source of Truth
- **Enums** für Status-Felder (nicht Strings)
- Relations: `User ↔ Instructor ↔ Course ↔ Session ↔ Booking ↔ Payment`
- Seed-Scripts für Entwicklungsdaten pflegen
- Migrations mit beschreibenden Namen: `npx prisma migrate dev --name add_booking_status_enum`

---

## 🎨 Design System (Kurzfassung)

### Farben (CSS Custom Properties)

```scss
--color-primary-dark: #688b68; // Brand / CTA
--color-primary: #fbd8cf; // Sanftes Rosa
--color-primary-light: #f2ece3; // Heller Hintergrund
--color-secondary-dark: #d0a373; // Wärme
--color-secondary: #e6b854; // Akzent/Gold
--color-accent: #fdf8f3; // Helle Fläche
--color-soft-accent: #a9cdd4; // Info/Soft Blue
--color-text-primary: #2e2a25; // Haupttext
--color-text-secondary: #5e5a55; // Sekundärtext
--color-border: #e6ded7; // Rahmen
```

### Typografie

- **Headlines:** DM Serif Display
- **Body:** Nunito (400, 500, 700)
- **CTAs:** Rubik (500)

### Spacing & Radius

- 4px Grid: `--space-1` bis `--space-12`
- Radius: `--radius-sm: 8px`, `--radius-md: 12px`, `--radius-lg: 18px`
- Shadows: weich (`rgba(0,0,0, .06–.10)`)

### Motion

- UI-Controls: 150–250ms
- Karten/Sections: 300–450ms
- Easing: `cubic-bezier(.2,.7,.2,1)`
- **Immer `prefers-reduced-motion` respektieren**

### Accessibility (WCAG AA)

- Kontrast: 4.5:1 Fließtext, 3:1 große Headlines
- Touch-Targets: min 44×44px
- Focus-Visible auf allen interaktiven Elementen
- Labels mit `for`/`id` verknüpft
- `aria-live="polite"` für dynamische Status

---

## 📁 Dateistruktur-Konventionen

```
libs/features/courses/
  src/
    lib/
      components/
        course-card/
          course-card.component.ts
          course-card.component.scss
          course-card.component.html
          course-card.component.spec.ts
        course-list/
        course-detail/
      services/
        course.service.ts
      types/
        course.types.ts
      utils/
    index.ts                  ← Barrel Export
```

**Namenskonventionen:**

- Components: `kebab-case` (Angular CLI Standard)
- Services: `*.service.ts`
- Types/Interfaces: `*.types.ts` oder `*.model.ts`
- Enums: PascalCase (`BookingStatus`, `PaymentStatus`)
- SCSS-Dateien: Component-scoped, Design Tokens per `var(--...)`
- Test-Dateien: `*.spec.ts` neben der Quelldatei

---

## 🧪 Testing

- **Unit Tests:** Jeder Service und jede Pipe
- **Component Tests:** Wichtige UI-Komponenten (Rendering, Interaktion)
- **E2E:** Kritische User-Flows (Buchung, Auth)
- **Kein Mock-First:** Lieber echte Service-Integration als Mock-Overhead
- Test-Kommandos: `nx test <project>`, `nx e2e <project>`

---

## 🔀 Git & Workflow

- **Branch-Naming:** `feature/course-detail-page`, `fix/header-responsive`, `chore/update-deps`
- **Commit-Messages:** Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`, `refactor:`)
- **PRs:** Gegen `develop` Branch, mit beschreibendem Titel
- **CI:** Lint → Build → Test auf jedem Push

---

## 📐 Responsive Breakpoints

```scss
$breakpoints: (
  sm: 480px,
  md: 768px,
  lg: 1024px,
  xl: 1280px,
);
```

- **Container:** max 1200–1320px
- **Grid:** 12 Spalten Desktop → 6 Tablet → 4/2 Mobile
- **Mobile-First** Ansatz

---

## 🚫 Don'ts

- Keine Logik in `apps/` – gehört in `libs/`
- Keine hartcodierten Farben/Werte – immer Design Tokens
- Keine `any` Types – TypeScript strict mode
- Keine deutschen Wörter in Code oder Kommentaren
- Kein Debugging-Code: `console.log`, `debugger`, auskommentierter Code, `// TODO: remove`
- Keine überflüssigen Kommentare die nur den Code wiederholen
- Keine unkommentierten Code-Blöcke
- Keine Mock-Implementierungen wenn echte Services verfügbar
- Keine stark gesättigten Farben oder überladene Schatten
- Keine Buttons ohne Label (Icon-only nur mit `aria-label`)
- Kein `localStorage` für Auth-Tokens – nur HttpOnly Cookies oder Memory

---

## ✅ Do's

- Immer Barrel Exports aktualisieren bei neuen Dateien
- Design Tokens für alle visuellen Werte nutzen
- Skeleton Screens für Ladezustände
- GPU-beschleunigte Animationen (`transform`, `opacity`)
- Wave Divider für organische Seitenübergänge
- Prisma Migrations benennen und dokumentieren
- OpenAPI-Specs aktuell halten
- `prefers-reduced-motion` bei jeder Animation

---

## 💬 Kommunikation mit Claude Code

### Sprache

- **Code, Kommentare, Variablen, Commit-Messages:** IMMER Englisch
- **Chat / Erklärungen:** Deutsch ist okay
- Keine deutschen Wörter in Code – auch nicht in Kommentaren

### Code-Kommentare

- **Nur sinnvolle Kommentare:** Erklären WARUM, nicht WAS
- **Kein Debugging-Code:** Keine `console.log`, `debugger`, `// TODO: remove`, `// test`, auskommentierter Code oder temporäre Notizen
- **Keine überflüssigen Kommentare:** Kein `// get user by id` über `getUserById()` – der Code spricht für sich

### Antwortformat

- **Klarer Überblick zuerst:** Was → Warum → Wie
- **Dateistruktur mitliefern** wenn Dateien erstellt/geändert werden
- **Bei UI:** Screens, Layouts, Token-Referenzen klar benennen
- **Bei API:** Endpoint-Pfad, Input/Output-Schema, Beispiel-Payload
- **Bei Architektur:** Mermaid-Diagramme oder kurze Flows
- **Bei offenen Entscheidungen:** Pro/Contra + Empfehlung mit Begründung
- **Kein unnötiges Blabla** – strukturiert, klar, actionable

<!-- nx configuration start-->
<!-- Leave the start & end comments to automatically receive updates. -->

## General Guidelines for working with Nx

- For navigating/exploring the workspace, invoke the `nx-workspace` skill first - it has patterns for querying projects, targets, and dependencies
- When running tasks (for example build, lint, test, e2e, etc.), always prefer running the task through `nx` (i.e. `nx run`, `nx run-many`, `nx affected`) instead of using the underlying tooling directly
- Prefix nx commands with the workspace's package manager (e.g., `pnpm nx build`, `npm exec nx test`) - avoids using globally installed CLI
- You have access to the Nx MCP server and its tools, use them to help the user
- For Nx plugin best practices, check `node_modules/@nx/<plugin>/PLUGIN.md`. Not all plugins have this file - proceed without it if unavailable.
- NEVER guess CLI flags - always check nx_docs or `--help` first when unsure

## Scaffolding & Generators

- For scaffolding tasks (creating apps, libs, project structure, setup), ALWAYS invoke the `nx-generate` skill FIRST before exploring or calling MCP tools

## When to use nx_docs

- USE for: advanced config options, unfamiliar flags, migration guides, plugin configuration, edge cases
- DON'T USE for: basic generator syntax (`nx g @nx/react:app`), standard commands, things you already know
- The `nx-generate` skill handles generator discovery internally - don't call nx_docs just to look up generator syntax

<!-- nx configuration end-->
