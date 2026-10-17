

import "dotenv/config";

import express from "express";
import cors from "cors";
import helmet from "helmet";

import mongoose from "mongoose";

import connectDB from "./config/db.js";
import transporter, {
  verifyMailConnection
} from "./config/mail.js";

import contactRoutes from "./routes/contactRoutes.js";

import errorHandler from "./middleware/errorHandler.js";


// ======================================================
// ENVIRONMENT VALIDATION
// ======================================================

const requiredEnvironmentVariables = [
  "MONGODB_URI",
  "ADMIN_EMAIL",
  "MAIL_HOST",
  "MAIL_PORT",
  "MAIL_USER",
  "MAIL_APP_PASSWORD"
];

const missingVariables =
  requiredEnvironmentVariables.filter(
    (key) => !process.env[key]
  );

if (missingVariables.length > 0) {
  console.error("");
  console.error("❌ MISSING ENVIRONMENT VARIABLES");
  console.error(
    missingVariables.join(", ")
  );
  console.error("");

  process.exit(1);
}


// ======================================================
// EXPRESS APP
// ======================================================

const app = express();


// ======================================================
// SECURITY
// ======================================================

app.disable("x-powered-by");

app.use(
  helmet()
);


// ======================================================
 // CORS CONFIGURATION — FIXED
 // ======================================================

const allowedOrigins = [
  "https://www.siddiquilawassociates.in",
  "https://siddiquilawassociates.in",
  "http://localhost:5173",
  ...(process.env.FRONTEND_URL || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean),
]
  .map((origin) => origin.replace(/\/+$/, ""))
  .filter((origin, index, origins) =>
    origins.indexOf(origin) === index
  );

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests without an Origin header
      // (for example, server-to-server requests).
      if (!origin) {
        return callback(null, true);
      }

      const normalizedOrigin = origin.replace(/\/+$/, "");

      if (allowedOrigins.includes(normalizedOrigin)) {
        return callback(null, true);
      }

      console.error("CORS blocked origin:", origin);

      return callback(new Error("CORS origin not allowed"));
    },

    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],

    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],

    credentials: true,
    optionsSuccessStatus: 204,
  })
);


// ======================================================
// BODY PARSER
// ======================================================

app.use(
  express.json({
    limit: "10kb"
  })
);

app.use(
  express.urlencoded({
    extended: true,
    limit: "10kb"
  })
);


// ======================================================
// ROOT STATUS PAGE
// ======================================================

app.get("/", (req, res) => {

  res.status(200).json({
    success: true,

    message:
      "BPYCREATIONS Backend API is running.",

    project:
      "BPYCREATIONS Contact Form Backend",

    environment:
      process.env.NODE_ENV || "development",

    server: {
      status: "online",
      port: process.env.PORT || 5000
    },

    services: {
      api: "/api/health",
      database: "/api/health/database",
      email: "/api/health/email",
      system: "/api/status"
    },

    endpoints: {
      contact:
        "POST /api/contact"
    },

    timestamp:
      new Date().toISOString()
  });

});


// ======================================================
// OVERALL API HEALTH
// ======================================================

app.get("/api/health", (req, res) => {

  const databaseConnected =
    mongoose.connection.readyState === 1;

  const status =
    databaseConnected
      ? "healthy"
      : "degraded";

  res.status(
    databaseConnected ? 200 : 503
  ).json({

    success:
      databaseConnected,

    status,

    server: {
      status: "online"
    },

    database: {
      status:
        databaseConnected
          ? "connected"
          : "disconnected"
    },

    timestamp:
      new Date().toISOString()
  });

});


// ======================================================
// DATABASE HEALTH
// ======================================================

app.get(
  "/api/health/database",
  async (req, res) => {

    try {

      const readyState =
        mongoose.connection.readyState;

      const states = {
        0: "disconnected",
        1: "connected",
        2: "connecting",
        3: "disconnecting"
      };

      const databaseStatus =
        states[readyState] ||
        "unknown";

      const connected =
        readyState === 1;

      res.status(
        connected ? 200 : 503
      ).json({

        success: connected,

        service: "MongoDB",

        status:
          databaseStatus,

        database:
          mongoose.connection.name || null,

        host:
          mongoose.connection.host || null,

        port:
          mongoose.connection.port || null,

        timestamp:
          new Date().toISOString()
      });

    } catch (error) {

      console.error(
        "❌ Database health check error:",
        error
      );

      res.status(503).json({

        success: false,

        service: "MongoDB",

        status: "error",

        message:
          "Unable to check database status."
      });

    }

  }
);


// ======================================================
// EMAIL HEALTH
// ======================================================

app.get(
  "/api/health/email",
  async (req, res) => {

    try {

      await transporter.verify();

      res.status(200).json({

        success: true,

        service: "SMTP Email",

        status: "connected",

        provider:
          process.env.MAIL_HOST,

        adminEmail:
          process.env.ADMIN_EMAIL,

        timestamp:
          new Date().toISOString()
      });

    } catch (error) {

      console.error(
        "❌ Email health check error:",
        error
      );

      res.status(503).json({

        success: false,

        service: "SMTP Email",

        status: "error",

        message:
          "Email service is unavailable."
      });

    }

  }
);


// ======================================================
// COMPLETE SYSTEM STATUS
// ======================================================

app.get(
  "/api/status",
  async (req, res) => {

    const databaseConnected =
      mongoose.connection.readyState === 1;

    let emailConnected = false;

    try {

      await transporter.verify();

      emailConnected = true;

    } catch (error) {

      console.error(
        "❌ Email status check failed:",
        error.message
      );

    }

    const systemHealthy =
      databaseConnected &&
      emailConnected;

    res.status(
      systemHealthy ? 200 : 503
    ).json({

      success: systemHealthy,

      application: {
        name:
          "BPYCREATIONS Backend",

        environment:
          process.env.NODE_ENV ||
          "development",

        status: "online"
      },

      services: {

        api: {
          status: "online"
        },

        mongodb: {
          status:
            databaseConnected
              ? "connected"
              : "disconnected"
        },

        email: {
          status:
            emailConnected
              ? "connected"
              : "disconnected"
        }

      },

      endpoints: {

        root: "/",

        health:
          "/api/health",

        database:
          "/api/health/database",

        email:
          "/api/health/email",

        status:
          "/api/status",

        contact:
          "POST /api/contact"

      },

      timestamp:
        new Date().toISOString()
    });

  }
);


// ======================================================
// CONTACT API
// ======================================================

app.use(
  "/api/contact",
  contactRoutes
);


// ======================================================
// 404 HANDLER
// ======================================================

app.use(
  (req, res) => {

    console.warn(
      `⚠️ 404 - ${req.method} ${req.originalUrl}`
    );

    res.status(404).json({

      success: false,

      message:
        "API endpoint not found.",

      method:
        req.method,

      path:
        req.originalUrl,

      availableEndpoints: [
        "/",
        "/api/health",
        "/api/health/database",
        "/api/health/email",
        "/api/status",
        "POST /api/contact"
      ]

    });

  }
);


// ======================================================
// GLOBAL ERROR HANDLER
// ======================================================

app.use(errorHandler);


// ======================================================
// SERVER START
// ======================================================

const PORT =
  Number(process.env.PORT) || 5000;


const startServer = async () => {

  try {

    console.log("");
    console.log(
      "=========================================="
    );

    console.log(
      "🚀 Starting BPYCREATIONS Backend..."
    );

    console.log(
      "=========================================="
    );


    // --------------------------------------------
    // MongoDB
    // --------------------------------------------

    await connectDB();


    // --------------------------------------------
    // HTTP SERVER
    // --------------------------------------------

    app.listen(
      PORT,
      () => {

        console.log("");
        console.log(
          "✅ SERVER: ONLINE"
        );

        console.log(
          `🌐 http://localhost:${PORT}`
        );

        console.log("");
        console.log(
          "📊 STATUS URLS"
        );

        console.log(
          `   Root       : http://localhost:${PORT}/`
        );

        console.log(
          `   Health     : http://localhost:${PORT}/api/health`
        );

        console.log(
          `   Database   : http://localhost:${PORT}/api/health/database`
        );

        console.log(
          `   Email      : http://localhost:${PORT}/api/health/email`
        );

        console.log(
          `   Full Status: http://localhost:${PORT}/api/status`
        );

        console.log("");

        console.log(
          "📨 CONTACT API"
        );

        console.log(
          `   POST http://localhost:${PORT}/api/contact`
        );

        console.log("");
        console.log(
          "=========================================="
        );

      }
    );


    // --------------------------------------------
    // Email
    // --------------------------------------------

    await verifyMailConnection();


  } catch (error) {

    console.error("");
    console.error(
      "=========================================="
    );

    console.error(
      "❌ SERVER STARTUP FAILED"
    );

    console.error(
      "=========================================="
    );

    console.error(
      error
    );

    console.error("");

    process.exit(1);

  }

};


startServer();