# Wolves Athletic Training

Wolves Athletic Training is a full-stack web application for a youth soccer academy. It combines a public-facing website with a booking, payment, legal forms, and admin workflow so parents can register and pay online while the academy owner manages services, availability, service areas, and bookings from a single system.

This repository is a **monorepo** with separate `client` and `server` folders.

## Project Summary

The application supports the following core use cases:

- display the academy brand, services, and contact information
- validate whether a customer is inside the service area using ZIP code
- let parents select a service and available sessions
- collect legal forms such as PAR-Q and waiver
- create Stripe payment intents and complete bookings after successful payment
- send transactional emails using AWS SES
- provide an admin workflow for coaches, pricing tiers, service areas, bookings, and dashboard statistics

This project was also used as a capstone to demonstrate not only application development, but also:

- database design with Prisma + PostgreSQL
- API design with Express
- integrations with Stripe, Google Maps, and AWS SES
- deployment and hosting on a self-built Ubuntu server
- reverse proxy setup with Nginx
- process management and production operations

---

## Key Features

### Public / customer-facing

- Home page and marketing content
- Services page with ZIP-code service area validation
- Dynamic pricing tiers
- Availability-based booking flow
- Stripe payment integration (test mode)
- PAR-Q and waiver collection
- Contact form with email delivery
- Nearby park suggestions using Google Maps APIs

### Admin / internal

- Admin login
- Dashboard statistics
- Booking and revenue reporting
- Coach management
- Availability management
- Pricing tier management
- Service area management
- Legal form review
- Password reset flow

---

## Tech Stack

### Frontend

- React
- Vite
- React Router
- Stripe.js / React Stripe
- Google Maps React library
- Recharts
- FullCalendar

### Backend

- Node.js
- Express
- Prisma ORM
- PostgreSQL
- Docker
- AWS SES SDK
- Stripe SDK
- JSON Web Tokens
- bcrypt

### Infrastructure / Hosting

- Ubuntu Server
- Nginx reverse proxy
- PM2
- Dockerized PostgreSQL
- Self-hosted deployment on custom-built hardware

---

## Repository Structure

```text
.
├── client/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── .env.example
├── server/
│   ├── prisma/
│   │   └── schema.prisma
│   ├── server.js
│   ├── verifyAdmin.js
│   ├── createAdmin.js
│   ├── package.json
│   └── .env.example
├── docs/
├── docker/
├── nginx/
├── package.json
└── README.md
```

Architecture

At a high level, the production stack is:

Browser -> Nginx -> Node/Express API -> Prisma -> PostgreSQL

External services:

Stripe (payments, test mode)

AWS SES (emails)

Google Maps APIs (ZIP geocoding and nearby parks)

See:

docs/architecture.md

docs/database.md

docs/api.md

Local Development Setup

1. Install dependencies

From the repo root:

npm install
npm install --prefix client
npm install --prefix server 2. Configure environment variables

Copy the example files:

cp client/.env.example client/.env
cp server/.env.example server/.env

Fill in the required values for:

database connection

Stripe test keys

AWS SES credentials

Google Maps API key

JWT secret

any frontend VITE\_ variables

3. Start PostgreSQL with Docker
   docker compose -f docker/compose.yaml up -d
4. Generate Prisma client and apply schema
   cd server
   npx prisma generate
   npx prisma migrate dev
5. Run the app

From the repo root:

npm run dev

This starts:

the backend on the server port

the frontend with Vite dev server

Production Deployment (Ubuntu Server)

This project is designed to be deployed on a self-hosted Ubuntu server.

Production setup includes:

custom-built workstation/server hardware

Ubuntu Server LTS

Nginx reverse proxy

Dockerized PostgreSQL

PM2 process management

domain + TLS

environment files stored securely on the server

See:

docs/deployment-ubuntu-nginx.md

nginx/wolves.conf.example

Security Notes

No real secrets should be committed to Git.

Use only .env.example files in the repo.

Stripe is configured in test mode for development/capstone use.

Stripe webhook requests should be verified using the webhook signing secret.

AWS SES keys and Google Maps API keys should be stored only in server environment variables.

Admin routes are protected by token-based authentication and role verification middleware.

Database

The backend uses Prisma with PostgreSQL.

Main models include:

User

Coach

Service

Availability

Order

BookedSession

Payment

LegalForm

ServiceArea

PricingTier

ServiceAreaRequest

See:

server/prisma/schema.prisma

docs/database.md

Testing

Testing was performed in phases throughout development rather than waiting until the end. This included:

route-level testing while building APIs

form validation testing

payment-flow verification using Stripe test cards

admin workflow checks

user acceptance testing with the academy owner and parent testers

See:

docs/testing.md
