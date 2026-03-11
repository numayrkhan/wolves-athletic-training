---

# `docs/database.md`

```md
# Database

## Overview

The Wolves Athletic Training backend uses PostgreSQL with Prisma ORM.

The database models the academy's users, coaches, services, bookings, payments, legal forms, service areas, and pricing tiers.

Prisma schema file:
- `server/prisma/schema.prisma`

---

## Core Models

### User

Stores all platform users, including:

- admin
- coach
- customer

Important fields:

- `id`
- `name`
- `email`
- `role`
- `password`
- `passwordResetToken`
- `passwordResetExpires`
- `googleId`
- `createdAt`

Relations:

- one user can have many orders
- one user can optionally map to one coach record
- one user can have many legal forms

### Coach

Represents an internal coach profile attached to a user.

Important fields:

- `id`
- `bio`
- `userId`
- `isActive`

Relations:

- one coach has many availability blocks
- one coach has many booked sessions

### Service

Represents a product or training offering.

Important fields:

- `id`
- `name`
- `description`
- `price`
- `duration`

Relations:

- one service can appear on many orders

### Availability

Stores time windows when a coach is available to be booked.

Important fields:

- `id`
- `startTime`
- `endTime`
- `coachId`

### Order

Represents a completed or in-progress booking purchase.

Important fields:

- `id`
- `orderTime`
- `status`
- `totalAmount`
- `userId`
- `serviceId`

Relations:

- one order belongs to one user
- one order belongs to one service
- one order can have one payment
- one order can contain many booked sessions

### BookedSession

Represents an individual scheduled session created after checkout.

Important fields:

- `id`
- `startTime`
- `endTime`
- `location`
- `orderId`
- `coachId`

### Payment

Stores payment transaction metadata.

Important fields:

- `id`
- `amount`
- `status`
- `stripePaymentIntentId`
- `createdAt`
- `orderId`

Notes:

- `orderId` is unique
- `stripePaymentIntentId` is indexed

### LegalForm

Stores PAR-Q and waiver data.

Important fields:

- `id`
- `userId`
- `type`
- `status`
- `submittedAt`
- `formData`

Constraint:

- `@@unique([userId, type])`
  This ensures only one form of each type per user.

### ServiceArea

Stores valid supported ZIP codes.

Important fields:

- `zipCode`
- `county`
- `state`

### PricingTier

Stores dynamic pricing by session count.

Important fields:

- `sessionCount`
- `pricePerSession`

### ServiceAreaRequest

Stores requests from customers outside the current service area.

Important fields:

- `id`
- `zipCode`
- `name`
- `email`
- `status`
- `createdAt`

---

## Enums

### FormType

- `PARQ`
- `WAIVER`

### FormStatus

- `PENDING`
- `COMPLETED`
- `NEEDS_REVIEW`

### RequestStatus

- `RECEIVED`
- `CONTACTED`
- `SERVICED`

---

## Prisma Workflow

Generate client:

```bash
npx prisma generate
```

Run development migrations:

npx prisma migrate dev

Run production migrations:

npx prisma migrate deploy

Open Prisma Studio:

npx prisma studio
Data Dictionary

A condensed data dictionary can be generated from the schema and included in project documentation. Key field groups include:

user identity and role

pricing and services

bookings and payments

legal forms

service area validation
