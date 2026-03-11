---

# `docs/api.md`

```md
# API Reference

## Overview

The backend exposes a REST API from `server/server.js`.

The API supports:
- ZIP validation
- service area requests
- services and pricing
- availability lookup
- nearby park suggestions
- booking validation
- legal forms
- payment intent creation
- Stripe webhook processing
- contact email
- authentication
- admin management

---

## Public Routes

### ZIP / service area

#### `GET /api/validate-zipcode/:zip`

Validates whether a ZIP code is inside the supported service area.

#### `POST /api/request-service-area`

Creates a request when the customer is outside the current service area.

---

### Services & pricing

#### `GET /api/services`

Returns all services.

#### `GET /api/services/:id`

Returns one service by ID.

#### `GET /api/pricing-tiers`

Returns pricing tiers used in dynamic session pricing.

---

### Availability & booking support

#### `GET /api/availability`

Returns available booking slots based on date and coach availability.

#### `GET /api/locations/nearby-parks`

Returns nearby field/park suggestions based on ZIP code.

#### `POST /api/bookings/validate`

Validates requested booking slots and coach assignment availability.

---

### Orders / payments / forms

#### `GET /api/order-by-pi/:paymentIntentId`

Looks up an order by Stripe payment intent ID.

#### `POST /api/forms/submit`

Submits legal form data.
Used for PAR-Q and waiver flows.

#### `GET /api/users/:userId/form-status`

Returns the legal form completion status for a user.

#### `POST /api/create-payment-intent`

Creates a Stripe payment intent in test mode.

#### `POST /api/stripe-webhook`

Stripe webhook endpoint used to finalize orders and payments.

---

### Contact / auth

#### `POST /api/contact`

Sends a contact form submission using AWS SES.

#### `POST /api/auth/login`

Admin login endpoint.

#### `POST /api/auth/forgot-password`

Starts the password reset workflow.

---

## Admin Routes

These routes are protected by admin verification middleware.

### Bookings & dashboard

#### `GET /api/admin/bookings`

Returns admin booking list.

#### `GET /api/admin/dashboard-stats`

Returns summary dashboard metrics.

#### `GET /api/admin/bookings-over-time`

Returns booking analytics over time.

---

### Users

#### `GET /api/admin/users`

Returns user list.

---

### Coaches

#### `GET /api/admin/coaches`

Returns all coaches.

#### `POST /api/admin/coaches`

Creates or updates coach records.

---

### Availability

#### `GET /api/admin/availability`

Returns coach availability blocks.

#### `POST /api/admin/availability`

Creates an availability block.

#### `DELETE /api/admin/availability/:id`

Deletes an availability block.

---

### Service areas

#### `GET /api/admin/service-areas`

Returns service area ZIPs.

#### `POST /api/admin/service-areas`

Adds a service area ZIP.

#### `DELETE /api/admin/service-areas/:zipCode`

Deletes a service area ZIP.

#### `GET /api/geocode/zip/:zipCode`

Admin helper route to geocode ZIP code into county/state.

---

### Pricing tiers

#### `GET /api/admin/pricing-tiers`

Returns pricing tier list.

#### `POST /api/admin/pricing-tiers`

Creates or updates a pricing tier.

#### `DELETE /api/admin/pricing-tiers/:sessionCount`

Deletes a pricing tier.

---

### Forms

#### `GET /api/admin/forms`

Returns submitted legal forms for admin review.

---

## Integration Notes

### Stripe

Used for payment intents and webhook-driven order completion.

### AWS SES

Used for:

- contact form delivery
- booking confirmation emails
- password reset flows

### Google Maps

Used for:

- ZIP code geocoding
- county/state extraction
- nearby park suggestions
