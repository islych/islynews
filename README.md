# NewsAI

NewsAI is a full-stack news platform built with Angular, Spring Boot, MySQL, Redis, JWT authentication, multi-provider news aggregation, and AI-assisted article summaries.

## Architecture

- `src/` — Spring Boot REST API
- `frontend/` — Angular client (Git submodule)
- `docs/` — architecture and decision records
- `docker-compose.yml` — reproducible local environment

External news responses are cached in Redis for 10 minutes by default. This protects provider quotas and makes repeated filters substantially faster. Set `NEWS_CACHE_TTL` to change the expiration.

## Local development

Requirements: Java 21+, Node.js 22+, and MySQL 8.

Set the environment variables shown in `.env.example`, then start the backend:

```powershell
mvn spring-boot:run
```

Start the frontend in another terminal:

```powershell
cd frontend
npm ci
npm start
```

The frontend is available at `http://localhost:4200` and the API at `http://localhost:8080`.

## Docker

Copy `.env.example` to `.env`, replace every placeholder, and add `MYSQL_ROOT_PASSWORD`. Then run:

```powershell
docker compose up --build
```

## API documentation

While the backend is running, Swagger UI is available at:

`http://localhost:8080/swagger-ui.html`

## Tests

```powershell
mvn test
```

The test suite uses an in-memory database and includes ownership authorization checks.

## Security

Secrets are supplied through environment variables and must never be committed. The API enforces role and object ownership checks on the backend. Rotate any credentials that were committed in earlier repository history.
