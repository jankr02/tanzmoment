# API: Courses Endpoint

**Version:** 1.0  
**Base URL:** `/api/courses`

---

## Endpoints

### GET /api/courses

Paginierte Liste aller veröffentlichten Kurse mit optionalen Filtern.

#### Query Parameters

| Parameter     | Type     | Required | Default | Description                  |
| ------------- | -------- | -------- | ------- | ---------------------------- |
| `danceStyle`  | string   | No       | -       | Filter nach Tanzstil         |
| `location`    | string   | No       | -       | Filter nach Ort              |
| `dateFrom`    | ISO 8601 | No       | -       | Sessions ab diesem Datum     |
| `dateTo`      | ISO 8601 | No       | -       | Sessions bis zu diesem Datum |
| `highlighted` | boolean  | No       | -       | Nur featured Kurse           |
| `page`        | number   | No       | 1       | Seitennummer                 |
| `limit`       | number   | No       | 5       | Einträge pro Seite (max: 50) |

#### Gültige Werte

**danceStyle:**

- `accessible` – Tanzen mit Behinderung
- `expressive` – Ausdruckstanz
- `kids` – Tanzen für Kinder
- `mothers` – Tanzen für Mütter

**location:**

- `moessingen` – Mössingen
- `bodelshausen` – Bodelshausen

#### Request Example

```bash
# Alle Kurse
GET /api/courses

# Gefiltert nach Tanzstil
GET /api/courses?danceStyle=expressive

# Mit Pagination
GET /api/courses?page=2&limit=5

# Kombinierte Filter
GET /api/courses?danceStyle=kids&location=moessingen&dateFrom=2025-01-01T00:00:00.000Z
```

#### Response Example

```json
{
  "data": [
    {
      "id": "clx1234567890",
      "slug": "ausdruckstanz-frei-verbunden",
      "title": "Ausdruckstanz – frei & verbunden",
      "catchPhrase": "Mein Tipp ...",
      "shortDescription": "Deinen wahren Ausdruck findest du...",
      "danceStyle": "expressive",
      "targetGroup": "Erwachsene jeden Alters",
      "level": "ALL_LEVELS",
      "duration": 90,
      "priceInCents": 2500,
      "imageUrl": "/assets/images/courses/expressive-frei.jpg",
      "isMarkedAsHighlighted": true,
      "maxParticipants": 12,
      "instructor": {
        "id": "clx0987654321",
        "firstName": "Sarah",
        "lastName": "Müller",
        "imageUrl": "/assets/images/instructors/sarah-mueller.jpg"
      },
      "nextSession": {
        "startTime": "2025-01-15T18:00:00.000Z",
        "endTime": "2025-01-15T19:30:00.000Z",
        "location": "Mössingen"
      },
      "upcomingSessionCount": 6
    }
  ],
  "meta": {
    "total": 9,
    "page": 1,
    "limit": 5,
    "totalPages": 2,
    "hasMore": true
  }
}
```

---

### GET /api/courses/highlighted

Gibt nur die als "highlighted" markierten Kurse zurück.

#### Query Parameters

| Parameter | Type   | Required | Default | Description     |
| --------- | ------ | -------- | ------- | --------------- |
| `limit`   | number | No       | 3       | Maximale Anzahl |

#### Request Example

```bash
GET /api/courses/highlighted
GET /api/courses/highlighted?limit=2
```

#### Response Example

```json
[
  {
    "id": "clx1234567890",
    "slug": "ausdruckstanz-frei-verbunden",
    "title": "Ausdruckstanz – frei & verbunden",
    ...
  }
]
```

---

### GET /api/courses/:slug

Gibt Details eines einzelnen Kurses zurück.

#### Path Parameters

| Parameter | Type   | Description             |
| --------- | ------ | ----------------------- |
| `slug`    | string | URL-freundliche Kurs-ID |

#### Request Example

```bash
GET /api/courses/ausdruckstanz-frei-verbunden
```

#### Response

Vollständiges Course-Objekt mit allen Sessions.

#### Error Response (404)

```json
{
  "statusCode": 404,
  "message": "Course with slug \"invalid-slug\" not found",
  "error": "Not Found"
}
```

---

## Sortierung

Die Kursliste wird standardmäßig sortiert nach:

1. **Highlighted zuerst** – Kurse mit `isMarkedAsHighlighted: true` erscheinen oben
2. **Erstellungsdatum** – Neueste Kurse zuerst

---

## Filter-Logik

### Datum-Filter

- `dateFrom` ohne `dateTo`: Alle Sessions ab dem angegebenen Datum
- `dateFrom` mit `dateTo`: Sessions im angegebenen Zeitraum
- Nur Sessions mit Status `SCHEDULED` werden berücksichtigt

### Location-Filter

Der Location-Filter nutzt **partial matching** (case-insensitive):

- `moessingen` matcht "Mössingen", "Studio Mössingen", etc.
- `bodelshausen` matcht "Bodelshausen", "Tanzraum Bodelshausen", etc.

### Kombinierte Filter

Alle Filter werden mit **AND** verknüpft:

```
danceStyle=expressive AND location=moessingen AND dateFrom >= 2025-01-01
```

---

## Error Handling

| Status | Beschreibung              |
| ------ | ------------------------- |
| 200    | Erfolgreich               |
| 400    | Ungültige Query-Parameter |
| 404    | Kurs nicht gefunden       |
| 500    | Server-Fehler             |

### Validation Errors (400)

```json
{
  "statusCode": 400,
  "message": ["danceStyle must be one of: accessible, expressive, kids, mothers"],
  "error": "Bad Request"
}
```

---

## Swagger / OpenAPI

Die API ist vollständig mit Swagger dokumentiert. Die interaktive Dokumentation ist verfügbar unter:

```
http://localhost:3000/api/docs
```
