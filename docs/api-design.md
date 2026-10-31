# QuickNotes API Design

Base URL: `https://api.quicknotes.example/v1`. All bodies are JSON. Authenticated endpoints need `Authorization: Bearer <token>`.

## Endpoints

| Method | Path                       | Description                                                          | Success status |
| ------ | -------------------------- | -------------------------------------------------------------------- | -------------- |
| POST   | `/auth/login`              | Exchange email and password for a token                              | 200 OK         |
| GET    | `/notes`                   | List the current user's notes (supports `?page=1&limit=10&tag=work`) | 200 OK         |
| POST   | `/notes`                   | Create a note                                                        | 201 Created    |
| GET    | `/notes/{id}`              | Get one note                                                         | 200 OK         |
| PUT    | `/notes/{id}`              | Replace a note                                                       | 200 OK         |
| PATCH  | `/notes/{id}`              | Partially update a note                                              | 200 OK         |
| DELETE | `/notes/{id}`              | Delete a note                                                        | 204 No Content |
| GET    | `/tags`                    | List the user's tags                                                 | 200 OK         |
| POST   | `/notes/{id}/tags`         | Attach a tag to a note                                               | 201 Created    |
| DELETE | `/notes/{id}/tags/{tagId}` | Detach a tag from a note                                             | 204 No Content |

## Create a note

`POST /notes`

```json
{
  "title": "Buy milk",
  "body": "Two litres, semi-skimmed",
  "tags": ["shopping"]
}
```

Response `201 Created` (with header `Location: /v1/notes/101`):

```json
{
  "id": 101,
  "title": "Buy milk",
  "body": "Two litres, semi-skimmed",
  "tags": ["shopping"],
  "userId": 1,
  "createdAt": "2026-10-31T09:30:00Z",
  "updatedAt": "2026-10-31T09:30:00Z"
}
```

## List notes

`GET /notes?page=1&limit=2`

Response `200 OK`:

```json
{
  "data": [
    {
      "id": 101,
      "title": "Buy milk",
      "body": "Two litres",
      "tags": ["shopping"],
      "createdAt": "2026-10-31T09:30:00Z"
    },
    {
      "id": 100,
      "title": "Call Amina",
      "body": "",
      "tags": [],
      "createdAt": "2026-10-30T14:02:00Z"
    }
  ],
  "page": 1,
  "limit": 2,
  "total": 57
}
```

## Error codes

| Status                    | Meaning           | When                                                            |
| ------------------------- | ----------------- | --------------------------------------------------------------- |
| 400 Bad Request           | Invalid input     | Missing title, title longer than 100 characters, malformed JSON |
| 401 Unauthorized          | Not authenticated | Missing, invalid or expired token                               |
| 403 Forbidden             | Not allowed       | Trying to read or change another user's note                    |
| 404 Not Found             | Missing resource  | Note or tag id does not exist                                   |
| 429 Too Many Requests     | Rate limit hit    | Too many requests from one client                               |
| 500 Internal Server Error | Server fault      | Unexpected failure; safe to retry later                         |

Example error body (all errors share this shape):

```json
{
  "error": {
    "code": 400,
    "message": "Validation failed",
    "details": [
      { "field": "title", "issue": "must be 100 characters or fewer" }
    ]
  }
}
```
