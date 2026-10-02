// in server/server.js
require("dotenv").config();
const crypto = require("crypto");

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");

const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const verifyAdmin = require("./verifyAdmin");

const app = express();
const prisma = new PrismaClient();

const allowedOrigins = [
  "https://wolfathletictraining.com",
  "https://www.wolfathletictraining.com",
  "http://localhost:5173",
];

const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

// --- Configure the AWS SES Client ---
const sesClient = new SESClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});

// --- Add this new email sending function ---
const sendBookingConfirmationEmail = async (customerEmail, orderDetails) => {
  const { totalAmount, slots, location } = orderDetails;
  const parsedSlots = JSON.parse(slots);
  const parsedLocation = JSON.parse(location);

  // Create a formatted list of session times for the email
  const sessionDetailsHtml = parsedSlots
    .map(
      (slot) =>
        `<li>${new Date(slot.start).toLocaleString([], {
          dateStyle: "full",
          timeStyle: "short",
        })}</li>`
    )
    .join("");

  const successPageUrl = `${process.env.FRONTEND_URL}/booking/success?payment_intent=${orderDetails.paymentIntentId}`;

  const emailBodyHtml = `
    <h1>Thank you for your booking!</h1>
    <p>Your booking with Wolves Athletic Training is confirmed. We look forward to seeing you!</p>
    <h3>Order Summary:</h3>
    <ul>
      <li><strong>Total Amount:</strong> $${totalAmount}</li>
      <li><strong>Location:</strong> ${parsedLocation.name} - ${parsedLocation.address}</li>
    </ul>
    <h3>Session Details:</h3>
    <ul>
      ${sessionDetailsHtml}
    </ul>
    <p>
      If you have not already, please complete the required health and waiver forms by clicking the link below.
    </p>
    <a href="${successPageUrl}" style="display: inline-block; padding: 10px 20px; background-color: #f39f5a; color: #05161a; text-decoration: none; border-radius: 5px;">Complete Forms</a>
    <p>If you have any questions, please reply to this email.</p>
  `;

  const sendEmailCommand = new SendEmailCommand({
    Source: process.env.SENDER_EMAIL_ADDRESS,
    Destination: { ToAddresses: [customerEmail] },
    Message: {
      Subject: { Data: "Your Wolves Athletic Training Booking is Confirmed!" },
      Body: { Html: { Data: emailBodyHtml } },
    },
  });

  try {
    await sesClient.send(sendEmailCommand);
    console.log(`✅ Confirmation email sent successfully to ${customerEmail}`);
  } catch (error) {
    console.error("❌ Error sending confirmation email:", error);
  }
};

// --- Function to send password reset email ---
const sendPasswordResetEmail = async (recipientEmail, resetURL) => {
  const emailBodyHtml = `
    <h1>Password Reset Request</h1>
    <p>You are receiving this email because a password reset request was initiated for your account.</p>
    <p>Please click the link below to reset your password. This link is valid for 15 minutes.</p>
    <a href="${resetURL}" style="display: inline-block; padding: 10px 20px; background-color: #f39f5a; color: #05161a; text-decoration: none; border-radius: 5px;">Reset Your Password</a>
    <p>If you did not request a password reset, please ignore this email.</p>
  `;

  const sendEmailCommand = new SendEmailCommand({
    Source: process.env.SENDER_EMAIL_ADDRESS,
    Destination: { ToAddresses: [recipientEmail] },
    Message: {
      Subject: { Data: "Your Password Reset Link" },
      Body: { Html: { Data: emailBodyHtml } },
    },
  });

  try {
    await sesClient.send(sendEmailCommand);
    console.log(
      `✅ Password reset email sent successfully to ${recipientEmail}`
    );
  } catch (error) {
    console.error("❌ Error sending password reset email:", error);
  }
};

// +++ ADD THIS BLOCK BEFORE app.use(express.json()) +++
// This is a special middleware for the webhook endpoint ONLY.
// It needs the raw body of the request to verify the signature.
// In server.js

// in server.js

// This route must be placed BEFORE any global app.use(express.json())
app.post(
  "/api/stripe-webhook",
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const sig = req.headers["stripe-signature"];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
      console.error(`❌ Webhook signature verification failed:`, err.message);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "payment_intent.succeeded") {
      const paymentIntentFromEvent = event.data.object;

      try {
        // --- CORRECT IMPLEMENTATION BASED ON THE DOCUMENTATION ---
        // Retrieve the full PaymentIntent and expand the 'latest_charge' object [cite: 19, 20]
        const paymentIntent = await stripe.paymentIntents.retrieve(
          paymentIntentFromEvent.id,
          {
            expand: ["latest_charge"], // This is the key change
          }
        );

        // The 'latest_charge' field now contains the full Charge object [cite: 22, 70]
        const charge = paymentIntent.latest_charge;

        // Safely extract billing details and metadata
        const { name, email } = charge.billing_details; // [cite: 23, 41]
        const { slots, location, totalAmount, serviceId } =
          paymentIntent.metadata;

        if (!email || !slots) {
          throw new Error(
            `Critical: Missing fulfillment data in PaymentIntent: ${paymentIntent.id}`
          );
        }

        // --- DATABASE TRANSACTION (Your existing logic is sound) ---
        const parsedSlots = JSON.parse(slots);
        const parsedLocation = JSON.parse(location);

        const newOrder = await prisma.$transaction(async (tx) => {
          const user = await tx.user.upsert({
            where: { email: email },
            update: { name: name || email },
            create: { email: email, name: name || email, role: "customer" },
          });

          const order = await tx.order.create({
            data: {
              userId: user.id,
              serviceId: parseInt(serviceId),
              totalAmount: parseFloat(totalAmount),
              status: "completed",
            },
          });

          await tx.payment.create({
            data: {
              orderId: order.id,
              amount: parseFloat(totalAmount),
              stripePaymentIntentId: paymentIntent.id,
              status: "success",
            },
          });

          const locationString =
            typeof parsedLocation === "string"
              ? parsedLocation
              : `${parsedLocation.name} - ${parsedLocation.address}`;

          for (const slot of parsedSlots) {
            await tx.bookedSession.create({
              data: {
                orderId: order.id,
                coachId: parseInt(slot.coachId),
                startTime: new Date(slot.start),
                endTime: new Date(slot.end),
                location: locationString,
              },
            });
          }
          return order;
        });

        // --- TRIGGER THE EMAIL HERE ---
        // We create an object with all the details the email function needs
        const emailDetails = {
          paymentIntentId: paymentIntent.id,
          totalAmount,
          slots,
          location,
        };

        sendBookingConfirmationEmail(email, emailDetails);
      } catch (err) {
        console.error(
          `❌ Error during post-payment fulfillment for PI: ${paymentIntentFromEvent.id}`,
          err
        );
        return res
          .status(400)
          .send({ error: { message: "Fulfillment failed." } });
      }
    } else {
      console.log(`🤷‍♀️ Unhandled event type ${event.type}.`);
    }

    res.status(200).send({ received: true });
  }
);

// Ensure any global JSON parser is placed AFTER the webhook route.
app.use(express.json());

// --- API ENDPOINTS --
// Endpoint to validate if a ZIP code is in the service area
app.get("/api/validate-zipcode/:zip", async (req, res) => {
  const { zip } = req.params;

  try {
    const serviceArea = await prisma.serviceArea.findUnique({
      where: {
        zipCode: zip,
      },
    });

    if (serviceArea) {
      res.json({
        isValid: true,
        message: "Great! You are in our service area.",
      });
    } else {
      res.json({
        isValid: false,
        message: "Sorry, you are currently outside our service area.",
      });
    }
  } catch (error) {
    console.error("Error during zip validation:", error);
    res.status(500).json({ error: "Failed to validate ZIP code." });
  }
});

// Endpoint to request service area expansion
// This endpoint allows users to request service area expansion by providing their ZIP code, name, and
app.post("/api/request-service-area", async (req, res) => {
  const { zipCode, name, email } = req.body;

  if (!zipCode || !email) {
    return res.status(400).json({ error: "Email and ZIP code are required." });
  }

  try {
    await prisma.serviceAreaRequest.create({
      data: {
        zipCode: zipCode,
        name: name,
        email: email,
      },
    });
    res.status(200).json({
      message:
        "Thank you! We've received your request and will notify you when we expand to your area.",
    });
  } catch (error) {
    console.error("Error creating service area request:", error);
    res.status(500).json({ error: "Failed to submit request." });
  }
});

// Endpoint to fetch all services
// This endpoint retrieves all services from the database
app.get("/api/services", async (req, res) => {
  try {
    const services = await prisma.service.findMany();
    res.json(services);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch services." });
  }
});

app.get("/api/services/:id", async (req, res) => {
  try {
    const service = await prisma.service.findUnique({
      where: { id: parseInt(req.params.id) },
    });
    res.json(service);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch service." });
  }
});

// Endpoiny to fetch pricing tiers
app.get("/api/pricing-tiers", async (req, res) => {
  try {
    const tiers = await prisma.pricingTier.findMany({
      orderBy: {
        sessionCount: "asc",
      },
    });
    res.json(tiers);
  } catch (error) {
    console.error("Failed to fetch pricing tiers:", error);
    res.status(500).json({ error: "Failed to fetch pricing information." });
  }
});
/**
 * @route   GET /api/coaches/availability
 * @desc    This is the definitive version that correctly handles the ISO date range from the frontend.
 */
app.get("/api/availability", async (req, res) => {
  const { date: dateStr } = req.query;

  if (!dateStr) {
    return res
      .status(400)
      .json({ error: "A date query parameter is required." });
  }

  try {
    const dayStart = new Date(`${dateStr}T00:00:00.000Z`);
    const dayEnd = new Date(`${dateStr}T23:59:59.999Z`);

    // 1. Get ALL availability blocks for the given day from ALL coaches
    const allAvailability = await prisma.availability.findMany({
      where: {
        startTime: { lt: dayEnd },
        endTime: { gt: dayStart },
      },
    });

    // 2. Get ALL booked sessions for that day
    const allBookedSessions = await prisma.bookedSession.findMany({
      where: {
        startTime: {
          gte: dayStart,
          lt: dayEnd,
        },
      },
    });

    // 3. Calculate capacity for each hour (how many coaches are working)
    const hourlyCapacity = {};
    for (const block of allAvailability) {
      const startHour = new Date(block.startTime).getUTCHours();
      const endHour = new Date(block.endTime).getUTCHours();
      for (let hour = startHour; hour < endHour; hour++) {
        hourlyCapacity[hour] = (hourlyCapacity[hour] || 0) + 1;
      }
    }

    // 4. Count bookings for each hour
    const hourlyBookings = {};
    for (const session of allBookedSessions) {
      const hour = new Date(session.startTime).getUTCHours();
      hourlyBookings[hour] = (hourlyBookings[hour] || 0) + 1;
    }

    // 5. Determine the final list of bookable slots
    const bookableSlots = [];
    // Loop from hour 0 to 23
    for (let hour = 0; hour < 24; hour++) {
      const capacity = hourlyCapacity[hour] || 0;
      const bookings = hourlyBookings[hour] || 0;

      // A slot is available if capacity > bookings
      if (capacity > bookings) {
        const slotTime = new Date(dayStart);
        slotTime.setUTCHours(hour);
        bookableSlots.push({
          startTime: slotTime.toISOString(),
          endTime: new Date(slotTime.getTime() + 60 * 60000).toISOString(),
        });
      }
    }

    res.json(bookableSlots);
  } catch (error) {
    console.error("Failed to fetch availability:", error);
    res.status(500).json({ error: "Failed to fetch availability." });
  }
});

// This is a new endpoint to find nearby parks using Google Maps APIs
app.get("/api/locations/nearby-parks", async (req, res) => {
  const { zip } = req.query;
  const apiKey = process.env.Maps_API_KEY;

  if (!zip) {
    return res.status(400).json({ error: "A ZIP code is required." });
  }

  try {
    // Step 1: Convert ZIP code to latitude and longitude using Geocoding API
    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${zip}&key=${apiKey}`;
    const geocodeResponse = await fetch(geocodeUrl);
    const geocodeData = await geocodeResponse.json();

    if (geocodeData.status !== "OK" || !geocodeData.results[0]) {
      throw new Error("Could not find location for the provided ZIP code.");
    }

    const { lat, lng } = geocodeData.results[0].geometry.location;

    // Step 2: Use the coordinates to find nearby parks using Places API
    // This is the new, more effective query
    const keywords =
      "public park with open field OR sports complex OR athletic field";
    const placesUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=8000&keyword=${encodeURIComponent(
      keywords
    )}&key=${apiKey}`;
    const placesResponse = await fetch(placesUrl);
    const placesData = await placesResponse.json();

    if (placesData.status !== "OK") {
      throw new Error("Could not find nearby parks.");
    }

    // 3. Send a clean list of the top 3-5 parks back to the frontend
    const parks = placesData.results.slice(0, 5).map((park) => ({
      place_id: park.place_id,
      name: park.name,
      address: park.vicinity,
      // Add this line to include coordinates
      location: park.geometry.location,
    }));

    res.json(parks);
  } catch (error) {
    console.error("Google Maps API Error:", error.message);
    res.status(500).json({ error: "Failed to fetch nearby locations." });
  }
});

// ---  VALIDATION ENDPOINT ---
app.post("/api/bookings/validate", async (req, res) => {
  const { slots } = req.body;

  if (!slots || slots.length === 0) {
    return res
      .status(400)
      .json({ isValid: false, message: "No slots provided for validation." });
  }

  try {
    const validatedSlots = [];
    const conflictingSlots = [];

    // Use a transaction to ensure data consistency during the check
    await prisma.$transaction(async (tx) => {
      for (const slot of slots) {
        const startTime = new Date(slot.start);
        const endTime = new Date(slot.end);

        // Find coaches who are available at this time
        const availableCoaches = await tx.availability.findMany({
          where: {
            startTime: { lte: startTime },
            endTime: { gte: endTime },
          },
          select: { coachId: true },
        });
        const availableCoachIds = availableCoaches.map((c) => c.coachId);

        // Find which of them are already booked
        const bookedCoaches = await tx.bookedSession.findMany({
          where: { startTime: startTime },
          select: { coachId: true },
        });
        const bookedCoachIds = bookedCoaches.map((c) => c.coachId);

        // Find the first coach who is available but not booked
        const unbookedCoachId = availableCoachIds.find(
          (id) => !bookedCoachIds.includes(id)
        );

        if (unbookedCoachId) {
          // Coach found! Add the assigned coachId to the slot info.
          validatedSlots.push({ ...slot, coachId: unbookedCoachId });
        } else {
          // No coach available for this slot.
          conflictingSlots.push(slot);
        }
      }
    });

    if (conflictingSlots.length > 0) {
      res.json({
        isValid: false,
        message:
          "Sorry, one or more of your selected time slots was just booked. Please choose a different time.",
      });
    } else {
      // Return the slots, now with the assigned coachId for each
      res.json({ isValid: true, slots: validatedSlots });
    }
  } catch (error) {
    console.error("Error during slot validation:", error);
    res.status(500).json({
      isValid: false,
      message: "An internal error occurred during validation.",
    });
  }
});

// --- ORDER BY PAYMENT INTENT ID ENDPOINT ---
// This endpoint retrieves the userId associated with a specific payment intent ID.
app.get("/api/order-by-pi/:paymentIntentId", async (req, res) => {
  const { paymentIntentId } = req.params;

  if (!paymentIntentId) {
    return res.status(400).json({ error: "Payment Intent ID is required." });
  }

  try {
    const payment = await prisma.payment.findFirst({
      where: {
        stripePaymentIntentId: paymentIntentId,
      },
      include: {
        order: {
          select: {
            userId: true, // We only need the userId from the related order
          },
        },
      },
    });

    if (!payment) {
      return res.status(404).json({ error: "Order not found." });
    }

    res.status(200).json({ userId: payment.order.userId });
  } catch (error) {
    console.error("Error fetching order by Payment Intent ID:", error);
    res.status(500).json({ error: "Failed to retrieve order details." });
  }
});

// --- LEGAL FORMS ENDPOINTS ---
app.post("/api/forms/submit", async (req, res) => {
  const { userId, formType, formData } = req.body;

  // Basic validation
  if (!userId || !formType || !formData) {
    return res.status(400).json({ error: "Missing required form data." });
  }

  // Ensure formType is a valid enum value
  if (formType !== "PARQ" && formType !== "WAIVER") {
    return res.status(400).json({ error: "Invalid form type." });
  }

  try {
    // Use `upsert` to either create a new form submission or update an existing one.
    // This is useful if a user needs to resubmit a form.
    const savedForm = await prisma.legalForm.upsert({
      where: {
        userId_type: {
          // This references the @@unique([userId, type]) constraint
          userId: userId,
          type: formType,
        },
      },
      update: {
        formData: formData,
        status: "COMPLETED", // Or you could add logic to set it to 'NEEDS_REVIEW'
      },
      create: {
        userId: userId,
        type: formType,
        formData: formData,
        status: "COMPLETED",
      },
    });

    res.status(200).json({
      message: `${formType} form submitted successfully!`,
      form: savedForm,
    });
  } catch (error) {
    console.error(`Error saving ${formType} form:`, error);
    res.status(500).json({ error: "Failed to save form data." });
  }
});

// in server.js

// ... after the app.post('/api/forms/submit', ...) endpoint ...

app.get("/api/users/:userId/form-status", async (req, res) => {
  const { userId } = req.params;

  try {
    const userForms = await prisma.legalForm.findMany({
      where: {
        userId: parseInt(userId),
        status: "COMPLETED", // We only care about completed forms
      },
    });

    // Check if a completed PARQ form exists in the results
    const hasCompletedParq = userForms.some((form) => form.type === "PARQ");

    // Check if a completed WAIVER form exists in the results
    const hasCompletedWaiver = userForms.some((form) => form.type === "WAIVER");

    res.status(200).json({
      hasCompletedParq,
      hasCompletedWaiver,
    });
  } catch (error) {
    console.error("Error fetching form status:", error);
    res.status(500).json({ error: "Failed to fetch form status." });
  }
});

// -- '/api/create-checkout-session' endpoint  --

app.post("/api/create-payment-intent", async (req, res) => {
  const { booking } = req.body;
  const { slots, serviceId } = booking;
  const sessionCount = slots.length;

  try {
    // --- FIX: Fetch pricing tiers directly from the database ---
    const tiersFromDb = await prisma.pricingTier.findMany();
    const priceTiers = tiersFromDb.reduce((acc, tier) => {
      acc[tier.sessionCount] = tier.pricePerSession;
      return acc;
    }, {});

    // This logic now uses the dynamic prices
    const pricePerSession = priceTiers[sessionCount] || priceTiers[1]; // Fallback to single session price
    if (!pricePerSession) {
      return res
        .status(500)
        .json({ error: "Pricing information not available." });
    }
    const totalAmountInCents = Math.round(pricePerSession * sessionCount * 100);

    const paymentIntent = await stripe.paymentIntents.create({
      amount: totalAmountInCents,
      currency: "usd",
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        serviceId: serviceId,
        slots: JSON.stringify(slots),
        location: JSON.stringify(booking.location),
        totalAmount: (totalAmountInCents / 100).toFixed(2),
        // The slots array already contains the assigned coachId for each session
        // so we can extract it during fulfillment if needed.
      },
    });

    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error("Stripe API Error:", error);
    res.status(500).json({ error: "Failed to create payment intent." });
  }
});

// in server.js, after your other app.post routes

app.post("/api/contact", async (req, res) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: "All form fields are required." });
  }

  const emailBodyHtml = `
    <h2>New Contact Form Submission</h2>
    <p><strong>Name:</strong> ${name}</p>
    <p><strong>Email:</strong> ${email}</p>
    <p><strong>Subject:</strong> ${subject}</p>
    <hr>
    <p><strong>Message:</strong></p>
    <p>${message}</p>
  `;

  const sendEmailCommand = new SendEmailCommand({
    // Send it FROM your verified sender and TO yourself.
    Source: process.env.SENDER_EMAIL_ADDRESS,
    Destination: { ToAddresses: [process.env.SENDER_EMAIL_ADDRESS] },
    Message: {
      Subject: { Data: `New Inquiry from ${name}: ${subject}` },
      Body: { Html: { Data: emailBodyHtml } },
    },
  });

  try {
    await sesClient.send(sendEmailCommand);
    res.status(200).json({ message: "Message sent successfully!" });
  } catch (error) {
    console.error("Error sending contact form email:", error);
    res.status(500).json({ error: "Failed to send message." });
  }
});

// ... admin routes, authentication, and other endpoints ...

app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    // Check if user exists, has a password, and is an admin
    if (!user || !user.password || user.role !== "admin") {
      return res
        .status(401)
        .json({ error: "Invalid credentials or not an admin." });
    }

    // Compare the provided password with the hashed password in the DB
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid credentials." });
    }

    // If credentials are valid, create a JWT
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET, // Make sure to add a JWT_SECRET to your .env file!
      { expiresIn: "8h" } // Token expires in 8 hours
    );

    res.json({ token });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "An internal error occurred." });
  }
});

// Admin route to fetch all bookings
// This route is protected by the verifyAdmin middleware
app.get("/api/admin/bookings", verifyAdmin, async (req, res) => {
  try {
    const bookings = await prisma.bookedSession.findMany({
      orderBy: {
        startTime: "desc", // Show the most recent bookings first
      },
      include: {
        order: {
          include: {
            user: true, // Include the user details (name, email)
          },
        },
        coach: {
          include: {
            user: true, // Include the coach's details
          },
        },
      },
    });
    res.json(bookings);
  } catch (error) {
    console.error("Failed to fetch admin bookings:", error);
    res.status(500).json({ error: "Failed to fetch bookings." });
  }
});

// Endpoint for the main dashboard KPI stats
app.get("/api/admin/dashboard-stats", verifyAdmin, async (req, res) => {
  try {
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const [upcomingSessions, totalRevenue, totalBookings, newUsers] =
      await prisma.$transaction([
        prisma.bookedSession.count({
          where: { startTime: { gte: new Date(), lte: sevenDaysFromNow } },
        }),
        prisma.order.aggregate({
          _sum: { totalAmount: true },
          where: { status: "completed" },
        }),
        prisma.bookedSession.count(),
        prisma.user.count({
          where: { createdAt: { gte: thirtyDaysAgo } },
        }),
      ]);

    res.json({
      upcomingSessions,
      totalRevenue: totalRevenue._sum.totalAmount || 0,
      totalBookings,
      newUsers,
    });
  } catch (error) {
    console.error("Failed to fetch dashboard stats:", error);
    res.status(500).json({ error: "Failed to fetch stats." });
  }
});

// Endpoint for the "Bookings Over Time" chart
app.get("/api/admin/bookings-over-time", verifyAdmin, async (req, res) => {
  try {
    // This raw query groups bookings by day and counts them
    const bookingsByDay = await prisma.$queryRaw`
      SELECT DATE_TRUNC('day', "startTime")::DATE as date, COUNT(id) as count
      FROM "BookedSession"
      WHERE "startTime" > NOW() - INTERVAL '30 days'
      GROUP BY DATE_TRUNC('day', "startTime")
      ORDER BY date ASC;
    `;
    const serializableData = bookingsByDay.map((item) => ({
      date: item.date,
      count: Number(item.count), // Convert the BigInt 'count' to a regular Number
    }));
    res.json(serializableData);
  } catch (error) {
    console.error("Failed to fetch chart data:", error);
    res.status(500).json({ error: "Failed to fetch chart data." });
  }
});

// Admin route to fetch all users
app.get("/api/admin/users", verifyAdmin, async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: {
        createdAt: "desc", // Show newest users first
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
    res.json(users);
  } catch (error) {
    console.error("Failed to fetch users:", error);
    res.status(500).json({ error: "Failed to fetch users." });
  }
});

// GET all coaches
app.get("/api/admin/coaches", verifyAdmin, async (req, res) => {
  try {
    const coaches = await prisma.coach.findMany({
      orderBy: { userId: "asc" }, // Keep a consistent order
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
    });
    // The isActive field is now automatically included
    res.json(coaches);
  } catch (error) {
    console.error("Failed to fetch coaches:", error);
    res.status(500).json({ error: "Failed to fetch coaches." });
  }
});

// PATCH to update a coach's status (active/inactive)
// This endpoint allows an admin to activate or deactivate a coach
app.patch("/api/admin/coaches/:id/status", verifyAdmin, async (req, res) => {
  const { id } = req.params;
  const { isActive } = req.body; // We'll send the new status (true or false)

  if (typeof isActive !== "boolean") {
    return res
      .status(400)
      .json({ error: "A boolean 'isActive' status is required." });
  }

  try {
    const updatedCoach = await prisma.coach.update({
      where: { id: parseInt(id) },
      data: { isActive: isActive },
    });
    res.json(updatedCoach);
  } catch (error) {
    console.error("Failed to update coach status:", error);
    res.status(500).json({ error: "Failed to update coach status." });
  }
});

// POST to create a new coach
app.post("/api/admin/coaches", verifyAdmin, async (req, res) => {
  const { name, email, password, bio } = req.body;

  if (!name || !email || !password) {
    return res
      .status(400)
      .json({ error: "Name, email, and password are required." });
  }

  try {
    // Check if a user with this email already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res
        .status(400)
        .json({ error: "A user with this email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Use a transaction to create the User and Coach records together
    const newCoach = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role: "coach",
        },
      });

      const coach = await tx.coach.create({
        data: {
          userId: user.id,
          bio: bio || "", // Bio is optional
        },
        include: { user: true },
      });
      return coach;
    });

    res.status(201).json(newCoach);
  } catch (error) {
    console.error("Failed to create coach:", error);
    res.status(500).json({ error: "Failed to create coach." });
  }
});

// GET availability for a specific coach
app.get("/api/admin/availability", verifyAdmin, async (req, res) => {
  const { coachId } = req.query;
  if (!coachId) {
    return res.status(400).json({ error: "A coachId is required." });
  }

  try {
    const availability = await prisma.availability.findMany({
      where: { coachId: parseInt(coachId) },
    });
    res.json(availability);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch availability." });
  }
});

// POST to create a new availability block
app.post("/api/admin/availability", verifyAdmin, async (req, res) => {
  const { coachId, start, end } = req.body;
  if (!coachId || !start || !end) {
    return res
      .status(400)
      .json({ error: "Coach ID, start, and end times are required." });
  }

  try {
    const newAvailability = await prisma.availability.create({
      data: {
        coachId: parseInt(coachId),
        startTime: new Date(start),
        endTime: new Date(end),
      },
    });
    res.status(201).json(newAvailability);
  } catch (error) {
    res.status(500).json({ error: "Failed to create availability." });
  }
});

// DELETE an availability block by its ID
app.delete("/api/admin/availability/:id", verifyAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.availability.delete({
      where: { id: parseInt(id) },
    });
    res.status(204).send(); // 204 No Content for successful deletion
  } catch (error) {
    res.status(500).json({ error: "Failed to delete availability." });
  }
});

// GET all serviceable ZIP codes
app.get("/api/admin/service-areas", verifyAdmin, async (req, res) => {
  try {
    const areas = await prisma.serviceArea.findMany({
      orderBy: { zipCode: "asc" },
    });
    res.json(areas);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch service areas." });
  }
});

// POST to add a new serviceable ZIP code
app.post("/api/admin/service-areas", verifyAdmin, async (req, res) => {
  const { zipCode, county, state } = req.body;
  if (!zipCode || !county || !state) {
    return res
      .status(400)
      .json({ error: "ZIP code, county, and state are required." });
  }
  try {
    const newArea = await prisma.serviceArea.create({
      data: { zipCode, county, state },
    });
    res.status(201).json(newArea);
  } catch (error) {
    // P2002 is the Prisma error code for a unique constraint violation
    if (error.code === "P2002") {
      return res.status(400).json({ error: "This ZIP code already exists." });
    }
    res.status(500).json({ error: "Failed to add service area." });
  }
});

// DELETE a serviceable ZIP code
app.delete(
  "/api/admin/service-areas/:zipCode",
  verifyAdmin,
  async (req, res) => {
    const { zipCode } = req.params;
    try {
      await prisma.serviceArea.delete({
        where: { zipCode: zipCode },
      });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete service area." });
    }
  }
);

// Endpoint to geocode a ZIP code and return county and state
// This endpoint uses the Google Maps Geocoding API to find the county and state for a given ZIP code.

app.get("/api/geocode/zip/:zipCode", verifyAdmin, async (req, res) => {
  const { zipCode } = req.params;
  const apiKey = process.env.Maps_API_KEY; // Your Google Maps API Key

  if (!zipCode || zipCode.length !== 5) {
    return res
      .status(400)
      .json({ error: "A valid 5-digit ZIP code is required." });
  }

  try {
    const geocodeUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${zipCode}&key=${apiKey}`;
    const geocodeResponse = await fetch(geocodeUrl);
    const geocodeData = await geocodeResponse.json();

    if (geocodeData.status !== "OK" || !geocodeData.results[0]) {
      throw new Error("Could not find location for the provided ZIP code.");
    }

    const addressComponents = geocodeData.results[0].address_components;

    // Find the county and state from the address components array
    const countyComponent = addressComponents.find((c) =>
      c.types.includes("administrative_area_level_2")
    );
    const stateComponent = addressComponents.find((c) =>
      c.types.includes("administrative_area_level_1")
    );

    const county = countyComponent
      ? countyComponent.long_name.replace(" County", "")
      : "";
    const state = stateComponent ? stateComponent.short_name : "";

    res.json({ county, state });
  } catch (error) {
    console.error("Geocoding API Error:", error.message);
    res.status(500).json({ error: "Failed to fetch location data." });
  }
});

// GET all pricing tiers for the admin
app.get("/api/admin/pricing-tiers", verifyAdmin, async (req, res) => {
  try {
    const tiers = await prisma.pricingTier.findMany({
      orderBy: { sessionCount: "asc" },
    });
    res.json(tiers);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch pricing tiers." });
  }
});

// PATCH to update a specific pricing tier
app.patch(
  "/api/admin/pricing-tiers/:sessionCount",
  verifyAdmin,
  async (req, res) => {
    const { sessionCount } = req.params;
    const { pricePerSession } = req.body;

    if (!pricePerSession || isNaN(parseFloat(pricePerSession))) {
      return res
        .status(400)
        .json({ error: "A valid price per session is required." });
    }

    try {
      const updatedTier = await prisma.pricingTier.update({
        where: { sessionCount: parseInt(sessionCount) },
        data: { pricePerSession: parseFloat(pricePerSession) },
      });
      res.json(updatedTier);
    } catch (error) {
      console.error("Failed to update pricing tier:", error);
      res.status(500).json({ error: "Failed to update pricing tier." });
    }
  }
);

// POST to create a new pricing tier
app.post("/api/admin/pricing-tiers", verifyAdmin, async (req, res) => {
  const { sessionCount, pricePerSession } = req.body;

  if (!sessionCount || !pricePerSession) {
    return res
      .status(400)
      .json({ error: "Session count and price are required." });
  }

  try {
    const newTier = await prisma.pricingTier.create({
      data: {
        sessionCount: parseInt(sessionCount),
        pricePerSession: parseFloat(pricePerSession),
      },
    });
    res.status(201).json(newTier);
  } catch (error) {
    if (error.code === "P2002") {
      return res
        .status(400)
        .json({ error: `A tier for ${sessionCount} sessions already exists.` });
    }
    res.status(500).json({ error: "Failed to create pricing tier." });
  }
});

// DELETE a pricing tier
app.delete(
  "/api/admin/pricing-tiers/:sessionCount",
  verifyAdmin,
  async (req, res) => {
    const { sessionCount } = req.params;
    try {
      await prisma.pricingTier.delete({
        where: { sessionCount: parseInt(sessionCount) },
      });
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete pricing tier." });
    }
  }
);

// Endpoint to fetch all legal forms submitted by users
// This endpoint is protected by the verifyAdmin middleware
app.get("/api/admin/forms", verifyAdmin, async (req, res) => {
  try {
    const forms = await prisma.legalForm.findMany({
      orderBy: {
        submittedAt: "desc", // Show the most recent first
      },
      include: {
        user: {
          select: { name: true, email: true }, // Include the user's details
        },
      },
    });
    res.json(forms);
  } catch (error) {
    console.error("Failed to fetch forms:", error);
    res.status(500).json({ error: "Failed to fetch forms." });
  }
});

// PATCH to update the admin profile password
// This endpoint allows an admin to change their password
app.patch("/api/admin/profile/password", verifyAdmin, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user.userId; // We get the userId from our verifyAdmin middleware

  if (!currentPassword || !newPassword) {
    return res
      .status(400)
      .json({ error: "Current and new passwords are required." });
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    // Verify the current password
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Incorrect current password." });
    }

    // Hash the new password and update the user
    const newHashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { password: newHashedPassword },
    });

    res.status(200).json({ message: "Password updated successfully." });
  } catch (error) {
    console.error("Failed to update password:", error);
    res.status(500).json({ error: "Failed to update password." });
  }
});

// Endpoint to handle the "Forgot Password" request
app.post("/api/auth/forgot-password", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // We send a success message even if the user isn't found
      // This prevents people from guessing which emails are registered.
      return res.status(200).json({
        message:
          "If a user with that email exists, a password reset link has been sent.",
      });
    }

    // Generate a random token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const passwordResetToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    // Set an expiration time (e.g., 15 minutes from now)
    const passwordResetExpires = new Date(Date.now() + 15 * 60 * 1000);

    await prisma.user.update({
      where: { email },
      data: { passwordResetToken, passwordResetExpires },
    });

    // Create the reset URL and send the email (implementation is conceptual)
    const resetURL = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;
    // You would use your SES email function here to send an email with this resetURL.
    // For now, we'll log it to the console for testing.
    await sendPasswordResetEmail(user.email, resetURL);

    res.status(200).json({
      message:
        "If a user with that email exists, a password reset link has been sent.",
    });
  } catch (error) {
    res.status(500).json({ error: "An error occurred." });
  }
});

// Endpoint to handle the actual password reset
app.patch("/api/auth/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  try {
    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: hashedToken,
        passwordResetExpires: { gt: new Date() }, // Check if the token is not expired
      },
    });

    if (!user) {
      return res
        .status(400)
        .json({ error: "Token is invalid or has expired." });
    }

    const newHashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: newHashedPassword,
        passwordResetToken: null, // Invalidate the token
        passwordResetExpires: null,
      },
    });

    res.status(200).json({ message: "Password has been reset successfully." });
  } catch (error) {
    res.status(500).json({ error: "An error occurred." });
  }
});

// --- Start the server ---
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
