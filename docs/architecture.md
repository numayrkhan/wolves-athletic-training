---

# `docs/architecture.md`

```md
# Architecture

## Overview

Wolves Athletic Training is a full-stack monorepo application composed of a frontend client, a backend API server, a PostgreSQL database, and several third-party integrations.

The production architecture is:

**Client Browser -> Nginx -> Node/Express -> Prisma -> PostgreSQL**

External dependencies:
- Stripe for payment processing
- AWS SES for outbound transactional email
- Google Maps APIs for geocoding ZIP codes and finding nearby parks

---

## Layers

### 1. Presentation Layer

The frontend lives in `client/` and is built with:

- React
- Vite
- React Router
- Stripe React components
- Google Maps React package

Responsibilities:

- render public pages
- collect user input
- validate forms client-side
- call backend APIs
- guide the user through the booking flow

### 2. Application Layer

The backend lives in `server/` and is built with:

- Node.js
- Express
- Prisma ORM

Responsibilities:

- expose REST endpoints
- validate requests
- enforce business rules
- coordinate integrations
- manage authentication and admin authorization

### 3. Data Layer

The database is PostgreSQL, managed through Prisma.

Responsibilities:

- store users, coaches, services, availability, orders, payments, legal forms, service areas, and pricing tiers
- enforce relational integrity
- support business reporting and admin operations

---

## Deployment Model

### Server

The app is intended to run on a self-built Ubuntu server with:

- Nginx as reverse proxy
- PM2 as process manager for the Node app
- PostgreSQL in Docker
- TLS certificates on the domain

### Reverse Proxy

Nginx terminates HTTPS and proxies requests to the Node application on localhost.

### Database

PostgreSQL runs in a Docker container and persists data on mounted storage.

---

## Runtime Flow

### Public booking flow

1. Parent visits the public site.
2. Parent enters a ZIP code.
3. Server validates whether service is available in that area.
4. Parent selects a service and requested times.
5. Parent completes legal forms.
6. Frontend requests a Stripe payment intent from the backend.
7. Parent completes payment in Stripe test mode.
8. Stripe webhook confirms payment.
9. Server creates order, payment record, and booked sessions.
10. Confirmation email is sent via AWS SES.

### Admin flow

1. Admin signs in.
2. Admin views dashboard metrics.
3. Admin manages coaches, availability, pricing tiers, service areas, bookings, and forms.

---

## Notable Design Choices

### Monorepo structure

A monorepo was used to keep the frontend, backend, docs, and deployment assets in one place.

### Prisma

Prisma was selected to keep the schema explicit and provide a type-safe database client.

### Self-hosting

The project was designed to be self-hosted to demonstrate real deployment knowledge and infrastructure ownership, not just cloud-managed services.

### Stripe test mode

Test mode is used so the full payment workflow can be shown without processing live transactions during capstone evaluation.

---

## Future Evolution

Potential architectural upgrades:

- split staging and production environments
- add centralized monitoring
- move PostgreSQL to a managed service if traffic grows
- add CDN/static asset optimization
- add worker queue for emails and asynchronous jobs
