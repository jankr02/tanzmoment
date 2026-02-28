# Tanzmoment – Migration Log

## Migration: add_cancellation_policy_and_extensions

**Datum:** 2026-02-25
**Autor:** Jan (Phase 6 – Booking System)
**Abhängigkeit:** add_webhook_event_log_cleanup_payment_status

### Beschreibung

Erweitert das System um strukturierte Stornierungsrichtlinien, Batch-Stornierung und DSGVO-Felder:

1. **CancellationPolicy-Modell:** Konfigurierbare Erstattungsregeln (Full/Partial/None) per Kurs
2. **CancelledBy-Enum:** Wer hat storniert (USER / ADMIN / SYSTEM)
3. **Booking-Erweiterung:** `cancelledBy`, `cancelledByAdminId` für Audit-Trail
4. **Payment-Erweiterung:** `stripeRefundId` (Idempotenz), `refundReason` (Tracking)
5. **Course-Umbennung:** `cancellationPolicy` (JSONB) → `cancellationPolicyJson`, neues FK-Feld

### Schema-Änderungen

| Model/Enum | Änderung | Beschreibung |
|------------|----------|-------------|
| CancellationPolicy | + neues Model | fullRefundHours, partialRefundHours, partialRefundPercent |
| CancelledBy | + neuer Enum | USER, ADMIN, SYSTEM |
| Course | ~ `cancellationPolicy` → `cancellationPolicyJson` | Umbenennung (JSONB bleibt erhalten) |
| Course | + `cancellationPolicyId` | FK zu CancellationPolicy (optional) |
| Booking | + `cancelledBy` | Wer hat storniert (CancelledBy enum) |
| Booking | + `cancelledByAdminId` | Admin-ID bei Admin-Stornierung |
| Payment | + `stripeRefundId` | Stripe Refund ID (unique, für Idempotenz) |
| Payment | + `refundReason` | Grund der Erstattung (String) |

### Rollback

```sql
ALTER TABLE "bookings" DROP COLUMN "cancelledBy", DROP COLUMN "cancelledByAdminId";
ALTER TABLE "payments" DROP COLUMN "stripeRefundId", DROP COLUMN "refundReason";
ALTER TABLE "courses" RENAME COLUMN "cancellationPolicyJson" TO "cancellationPolicy";
ALTER TABLE "courses" DROP COLUMN "cancellationPolicyId";
DROP TABLE "cancellation_policies";
DROP TYPE "CancelledBy";
```

---

## Migration: add_webhook_event_log_cleanup_payment_status

**Datum:** 2026-02-25
**Autor:** Jan
**Abhängigkeit:** add_booking_mode_guest_checkout_cancellation_policy

### Beschreibung

1. **WebhookEvent-Tabelle:** Speichert verarbeitete Stripe Webhook-Events zur Deduplication
2. **PaymentStatus-Cleanup:** `SUCCEEDED` entfernt (redundant mit `PAID`)

### Schema-Änderungen

| Model/Enum | Änderung | Beschreibung |
|------------|----------|-------------|
| WebhookEvent | + neues Model | Stripe Event-ID, Typ, Status, Error |
| WebhookEventStatus | + neuer Enum | PROCESSED, FAILED, SKIPPED |
| PaymentStatus | - `SUCCEEDED` | Redundant, Stripe `succeeded` → `PAID` |

### Rollback

```sql
-- npx prisma migrate resolve --rolled-back add_webhook_event_log_cleanup_payment_status
```

---

## Migration: add_booking_mode_guest_checkout_cancellation_policy

**Datum:** 2026-02-23
**Autor:** Jan
**Abhängigkeit:** init (20251029164759_init)

### Beschreibung

Erweitert das Booking-System für flexibles Buchungsmodell:

1. **BookingMode Enum:** Kurs kann als `FULL_COURSE` oder `SINGLE_SESSION` gebucht werden
2. **Guest Checkout:** Buchung ohne Account (Gast-Daten direkt am Booking)
3. **Cancellation Policy:** Konfigurierbare Stornierungsregeln pro Kurs (JSON)
4. **Cancellation Token:** Token-basierte Stornierung für Gäste

### Schema-Änderungen

| Model | Änderung | Beschreibung |
|-------|----------|-------------|
| Course | + `bookingMode` | Enum: FULL_COURSE / SINGLE_SESSION |
| Course | + `isFree` | Boolean, default false |
| Course | + `cancellationPolicy` | JSONB, nullable |
| Course | + `bookings` relation | 1:n Relation zu Booking |
| Booking | + `courseId` (required) | FK zu Course |
| Booking | ~ `userId` → optional | Nullable für Guest Checkout |
| Booking | ~ `sessionId` → optional | Nullable für FULL_COURSE Modus |
| Booking | + `guestEmail` | Nullable, für Gäste |
| Booking | + `guestFirstName` | Nullable, für Gäste |
| Booking | + `guestLastName` | Nullable, für Gäste |
| Booking | + `guestPhone` | Nullable, für Gäste |
| Booking | + `cancellationToken` | Unique, für Token-basierte Stornierung |
| Booking | + unique(guestEmail, courseId, sessionId) | Doppelbuchungs-Schutz für Gäste |
| Payment | ~ `userId` → optional | Nullable für Guest Checkout |

### Daten-Migration

Bestehende Bookings: `courseId` wird aus der Session-Relation abgeleitet.

### Rollback

```sql
-- Bei Problemen: Migration rückgängig machen
-- npx prisma migrate resolve --rolled-back add_booking_mode_guest_checkout_cancellation_policy
```
