import express from "express";

import { createContact } from "../controllers/contactController.js";

import { contactRateLimiter } from "../middleware/rateLimiter.js";

const router = express.Router();

router.post(
  "/",
  contactRateLimiter,
  createContact
);

export default router;