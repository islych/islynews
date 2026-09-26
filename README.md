# Isly News

Isly News is a personal full-stack news platform that combines local journalism, international news aggregation, and AI-assisted reading tools in a responsive editorial interface.

## Highlights

- Multilingual local and international news with search and filters
- AI-assisted summaries powered by `csebuetnlp/mT5_multilingual_XLSum`
- Stored key points, five tags, and related-article recommendations
- Reading-time estimates, comments, likes, and saved articles
- Reader, journalist, and administrator roles
- Journalist profiles, editorial review, email verification, and notifications
- Responsive desktop and mobile experiences

## Technology stack

Angular 21, TypeScript, Tailwind CSS, Java 21, Spring Boot, Spring Security, MySQL, Redis, Hugging Face, NewsAPI, GNews, Maven, npm, and Docker Compose.

## Architecture

- `src/` — Spring Boot REST API
- `frontend/` — Angular client
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

## Responsible use

External publishers remain the original sources of their articles. Full-page extraction is disabled by default and is intended only for local development demonstrations. Production integrations should display permitted previews and direct readers to the publisher.

## Security

Secrets are supplied through environment variables and must never be committed. The API enforces role and object ownership checks on the backend. Rotate any credentials that were committed in earlier repository history.

## Status

This is an evolving personal portfolio project. Feedback and contributions are welcome.
