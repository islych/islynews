# ADR 0001: Keep a modular monolith

## Status

Accepted

## Decision

Keep one Spring Boot deployment while separating code by business capability. Do not introduce microservices until independent scaling or ownership is demonstrated.

## Consequences

- Local development and deployment stay simple.
- Transactions remain straightforward.
- Module boundaries must be enforced in code and tests.
- Capabilities can be extracted later if measurements justify it.
