# QuickNotes Data Model

## Entities

**users**

| Column        | Type         | Key / notes        |
| ------------- | ------------ | ------------------ |
| id            | BIGINT       | PK, auto-increment |
| email         | VARCHAR(255) | UNIQUE, NOT NULL   |
| password_hash | VARCHAR(255) | NOT NULL           |
| created_at    | TIMESTAMP    | default now        |

**notes**

| Column                  | Type         | Key / notes             |
| ----------------------- | ------------ | ----------------------- |
| id                      | BIGINT       | PK                      |
| user_id                 | BIGINT       | FK → users.id, NOT NULL |
| title                   | VARCHAR(100) | NOT NULL                |
| body                    | TEXT         | optional                |
| created_at / updated_at | TIMESTAMP    | default now             |

**tags**

| Column  | Type        | Key / notes               |
| ------- | ----------- | ------------------------- |
| id      | BIGINT      | PK                        |
| user_id | BIGINT      | FK → users.id             |
| name    | VARCHAR(50) | NOT NULL, UNIQUE per user |

**note_tags** (join table)

| Column  | Type   | Key / notes              |
| ------- | ------ | ------------------------ |
| note_id | BIGINT | PK (part), FK → notes.id |
| tag_id  | BIGINT | PK (part), FK → tags.id  |

## Relationships

- **One-to-many:** one user has many notes (`notes.user_id`), and one user has many tags (`tags.user_id`). Each note and tag belongs to exactly one user.
- **Many-to-many:** a note can have many tags and a tag can label many notes. This is modelled by the join table `note_tags`, whose composite primary key `(note_id, tag_id)` prevents duplicates.

## CREATE TABLE statements

```sql
CREATE TABLE users (
  id            BIGINT AUTO_INCREMENT PRIMARY KEY,
  email         VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  created_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE notes (
  id         BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id    BIGINT NOT NULL,
  title      VARCHAR(100) NOT NULL,
  body       TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE tags (
  id      BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  name    VARCHAR(50) NOT NULL,
  UNIQUE (user_id, name),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE note_tags (
  note_id BIGINT NOT NULL,
  tag_id  BIGINT NOT NULL,
  PRIMARY KEY (note_id, tag_id),
  FOREIGN KEY (note_id) REFERENCES notes(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id)  REFERENCES tags(id)  ON DELETE CASCADE
);
```

## Index

```sql
CREATE INDEX idx_notes_user_created ON notes (user_id, created_at DESC);
```

Reason: the most common query is "latest notes for one user" (`GET /notes`). Without this index the database scans the whole notes table (hundreds of millions of rows); with it, it jumps straight to that user's rows already sorted by date.

## Example queries

```sql
-- 1. Latest 10 notes of user 1
SELECT id, title, body, created_at
FROM notes WHERE user_id = 1
ORDER BY created_at DESC LIMIT 10;

-- 2. JOIN: notes of user 1 with their tags
SELECT n.id, n.title, t.name AS tag
FROM notes n
JOIN note_tags nt ON nt.note_id = n.id
JOIN tags t       ON t.id = nt.tag_id
WHERE n.user_id = 1 AND t.name = 'work';

-- 3. Number of notes per user
SELECT user_id, COUNT(*) AS note_count
FROM notes GROUP BY user_id ORDER BY note_count DESC;
```

## SQL or NoSQL?

I choose a relational SQL database (e.g. PostgreSQL). QuickNotes data is clearly structured and relational (users, notes, tags and a many-to-many link), and we need integrity guarantees such as foreign keys, unique tags and transactional writes when attaching tags. JOINs make tag filtering simple, and a single primary with read replicas easily handles the estimated load (see architecture.md). NoSQL would be considered later only if a single database can no longer hold the data, for example by sharding notes by `user_id`.
