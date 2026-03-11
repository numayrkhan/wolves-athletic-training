# Testing

## Overview

Testing was performed continuously during development rather than waiting until the end of the project. This helped identify usability, API, and data issues early, making fixes simpler and less risky.

Testing methods included:

- manual route and feature verification
- API-level testing while building endpoints
- form validation checks
- payment-flow verification using Stripe test mode
- user feedback from the academy owner
- informal testing by parents and non-technical users

---

## Testing Strategy

### 1. Phase-based testing

As each page, feature, and API route was built, it was tested immediately.

Examples:

- testing the Home page hero, stats row, and contact button as each section was added
- testing ZIP-code validation before building the full booking flow
- testing legal forms before wiring them into checkout
- testing payment intent creation before implementing webhook completion

This reduced the cost of debugging later.

### 2. API testing

Endpoints in `server.js` were tested using:

- browser requests from the frontend
- direct request inspection during development
- backend logging and Prisma query verification

Focus areas:

- request validation
- correct DB writes
- correct response shape
- handling of invalid or missing input

### 3. Payment testing

Stripe test mode was used to verify:

- payment intent creation
- successful payments
- failed payments
- webhook completion flow
- order lookup by payment intent ID

### 4. Admin workflow testing

Admin routes were tested to verify:

- login access
- dashboard stats
- creating coach records
- managing availability
- adding/deleting service areas
- creating pricing tiers

### 5. User acceptance testing

In addition to the academy owner, friends and family who are parents were asked to go through the booking flow and provide feedback on:

- ease of understanding
- form clarity
- confidence in completing payment
- confusion points or hesitation

This feedback led to improvements such as:

- making the waiver/consent more obvious
- clarifying ZIP entry helper text
- improving booking confirmation messaging

---

## Representative Test Scenarios

### Booking flow

1. Visit the Home page.
2. Go to Services.
3. Enter ZIP code.
4. Select a valid service.
5. Complete required forms.
6. Continue to payment.
7. Submit Stripe test payment.
8. Verify order creation and confirmation.

Expected result:

- successful order, payment, and session creation
- confirmation email sent

### Invalid ZIP

1. Enter unsupported ZIP.
   Expected result:

- service area request path shown instead of booking flow

### Contact form

1. Submit valid contact form.
   Expected result:

- server accepts request
- SES email sent successfully

### Admin management

1. Log in as admin.
2. Add availability block.
3. Add service area ZIP.
4. Add pricing tier.
   Expected result:

- changes persist in database and appear in UI

---

## Known Issues / Risks

Examples of issues considered during testing:

- timezone handling for sessions
- accidental double-submit in checkout
- SES sandbox restrictions
- contrast/accessibility adjustments on dark theme
- input trimming for ZIP codes and email values

These were either resolved during development or documented for future iteration work.

---

## Why continuous testing mattered

If all testing had been delayed until the very end, improving flows like ZIP gating, legal forms, and payment confirmation would have been more complicated because they touch multiple layers of the system. Testing while building made it easier to isolate bugs, gather feedback earlier, and improve the user experience incrementally.
