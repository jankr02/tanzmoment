# Tanzmoment – Migration Log

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
