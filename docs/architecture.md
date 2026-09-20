# NewsAI architecture

NewsAI is a modular monolith with an Angular client, a Spring Boot REST API, and MySQL persistence.

## Request flow

1. Angular calls the REST API over HTTP.
2. The JWT interceptor adds the bearer token when a user is authenticated.
3. Spring Security validates the token and role.
4. Controllers validate transport data and delegate business rules to services.
5. Services enforce ownership and use Spring Data repositories.
6. Repositories persist entities in MySQL.
7. External provider adapters call NewsAPI and Hugging Face.

## Boundaries

- The browser never receives provider API keys.
- Authorization is enforced by the backend, never only by Angular guards.
- A user-owned resource must be checked against the authenticated identity before update or deletion.
- Secrets are supplied through environment variables.

## Current evolution plan

- Introduce request/response DTOs for every public endpoint.
- Add versioned, paginated APIs and database-backed search.
- Replace direct provider calls with resilient provider interfaces.
- Add integration tests and measurable service-level indicators.
