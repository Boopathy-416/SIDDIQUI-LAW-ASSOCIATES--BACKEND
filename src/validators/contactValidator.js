import { z } from "zod";

const normalizeMobile = (mobile) => {
  return mobile
    .replace(/\D/g, "")
    .replace(/^91/, "")
    .slice(-10);
};

export const contactSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must contain at least 2 characters")
    .max(100, "Name is too long"),

  email: z
    .string()
    .trim()
    .email("Please enter a valid email address")
    .max(254, "Email is too long")
    .optional()
    .or(z.literal("")),

  mobile: z
    .string()
    .trim()
    .min(10, "Mobile number is required")
    .transform(normalizeMobile)
    .refine(
      (mobile) => /^[6-9]\d{9}$/.test(mobile),
      "Please enter a valid Indian mobile number"
    )
});