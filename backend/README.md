# NextRep Backend (Assignment 3)

This backend uses Spring Boot + Spring Data JPA + H2 (file DB) with Flyway migrations.

## Implemented

- Relational persistence (`users`, `exercises`)
- ORM entities with validation
- Full CRUD endpoints for users and exercises
- Filters and pagination for exercises
- Basic statistics endpoints
- Flyway-based schema migration and initial data seed
- Integration and service tests

## Main Endpoints

- `POST /api/register`
- `POST /api/login`
- `GET /api/users`
- `POST /api/users`
- `PUT /api/users/{id}`
- `DELETE /api/users/{id}`
- `GET /api/users/stats`
- `GET /api/exercises`
- `POST /api/exercises`
- `GET /api/exercises/{id}`
- `PUT /api/exercises/{id}`
- `DELETE /api/exercises/{id}`
- `GET /api/exercises/stats`

## Local Run

```powershell
cd "C:\Users\Pop Stelian\Desktop\NextRep\backend"
.\mvnw.cmd spring-boot:run
```

## Run Tests

```powershell
cd "C:\Users\Pop Stelian\Desktop\NextRep\backend"
.\mvnw.cmd test
```

## Notes

- Production DB is file-based H2: `./data/nextrepdb`
- Test profile uses in-memory H2 (`src/test/resources/application.properties`)
- CORS allows frontend from `http://localhost:5173`

