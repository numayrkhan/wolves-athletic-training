# Wolves Athletic Training

**Live Website:** https://wolfathletictraining.com/  
**Repository:** https://github.com/numayrkhan/wolves-athletic-training  

Wolves Athletic Training is a full-stack web platform built for a youth soccer academy to streamline online bookings, service selection, payments, legal form collection, and internal scheduling workflows. The system combines a modern React/Vite frontend with a Node.js/Express backend, Prisma ORM, and PostgreSQL, and is deployed on a self-hosted Ubuntu server using Docker, Nginx, and PM2.

This project showcases end-to-end software engineering across product design, API development, relational database design, third-party integrations, and production-style deployment. In addition to the customer-facing booking experience, the platform includes administrative workflows for pricing tiers, coach availability, service areas, bookings, legal forms, and account management.

---

## Core Highlights

- Full-stack monorepo architecture with separate `client` and `server` applications
- Online service selection, booking, and payment workflow
- Stripe integration for payment intents and webhook-based order completion
- AWS SES integration for transactional email and contact form delivery
- Google Maps integration for ZIP validation, geocoding, and nearby field suggestions
- Prisma + PostgreSQL data model supporting users, coaches, services, bookings, payments, legal forms, and service areas
- Self-hosted deployment on a custom Ubuntu server with Nginx reverse proxy, Dockerized PostgreSQL, and PM2 process management

---

## Tech Stack

**Frontend:** React, Vite, React Router, Stripe.js  
**Backend:** Node.js, Express, Prisma ORM  
**Database:** PostgreSQL (Docker)  
**Infrastructure:** Ubuntu Server, Nginx, PM2, Docker  
**Integrations:** Stripe, AWS SES, Google Maps APIs  

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
Architecture

At a high level, the production stack is:

Browser → Nginx → Node/Express API → Prisma → PostgreSQL

External Services

Stripe — payments (test mode)

AWS SES — transactional and contact email delivery

Google Maps APIs — ZIP geocoding and nearby parks/field lookup

Additional Documentation

docs/architecture.md

docs/database.md

docs/api.md

Local Development Setup
1. Install dependencies

From the repo root:

npm install
npm install --prefix client
npm install --prefix server
2. Configure environment variables

Copy the example files:

cp client/.env.example client/.env
cp server/.env.example server/.env

Fill in the required values for:

database connection

Stripe test keys

AWS SES credentials

Google Maps API key

JWT secret

frontend VITE_* variables

3. Start PostgreSQL with Docker
docker compose -f docker/compose.yaml up -d
4. Generate Prisma client and apply schema
cd server
npx prisma generate
npx prisma migrate dev
5. Run the application

From the repo root:

npm run dev

This starts:

the backend server

the frontend Vite development server

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

Deployment references

docs/deployment-ubuntu-nginx.md

nginx/wolves.conf.example

Security Notes

No real secrets should ever be committed to Git

Only .env.example files should exist in the repository

Stripe is configured in test mode for development and demonstration

Stripe webhook requests should be verified using the webhook signing secret

AWS SES keys and Google Maps API keys should be stored only in server environment variables

Admin routes are protected by token-based authentication and role verification middleware

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

References

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

Roadmap

Potential future improvements include:

switching Stripe from test mode to live mode

expanding coach-facing workflows and dashboards

enhancing analytics and reporting

adding a user portal for customers

improving production monitoring and observability

refining scheduling and conflict-resolution workflows
