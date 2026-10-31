# QuickNotes System Design

QuickNotes is moving from a browser-only app to an online service for 1 million users. This repository contains a small front-end API client (built against the JSONPlaceholder practice API) and the design documents the backend team will build from.

## How to run the API client

1. Clone the repository: `git clone https://github.com/your-username/quicknotes-system-design.git`
2. Open `index.html` in a browser (double-click it, or use a local server such as VS Code Live Server). An internet connection is needed.
3. Click **Load notes** to fetch 10 notes, use the form to add a note, and click **Delete** to remove one.

Note: JSONPlaceholder does not really save changes, so created notes disappear after a reload.

## Design documents

- [API design](docs/api-design.md)
- [Data model](docs/data-model.md)
- [Architecture](docs/architecture.md)

## What I learned

1. How to build one reusable `request()` function that checks `response.ok` and throws, so every GET, POST and DELETE handles errors the same way.
2. Showing loading, success, error and empty states and disabling buttons during requests makes an app feel reliable, and `textContent` keeps user text safe from injection.
3. Good REST design uses nouns, correct HTTP methods and meaningful status codes (201, 204, 400, 401, 403, 404, 500).
4. A relational model with a join table handles many-to-many relationships such as notes and tags, and an index matches the most common query.
5. Caches, replicas, queues and load balancers each solve one specific problem, and every one adds a trade-off, mainly consistency and complexity.
