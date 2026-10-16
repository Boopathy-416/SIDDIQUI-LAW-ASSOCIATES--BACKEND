import Contact from "../models/Contact.js";
import transporter from "../config/mail.js";
import { contactSchema } from "../validators/contactValidator.js";

export const createContact = async (req, res, next) => {
  try {
    // ==========================================
    // 1. VALIDATE REQUEST BODY
    // ==========================================

    const validationResult = contactSchema.safeParse(req.body);

    if (!validationResult.success) {
      const errors =
        validationResult.error.issues.map(
          (issue) => issue.message
        );

      return res.status(400).json({
        success: false,
        message: "Please check the form details.",
        errors
      });
    }

    const { name, email, mobile } =
      validationResult.data;

    // ==========================================
    // 2. CHECK EXISTING CONTACT
    // ==========================================

    const existingContact = await Contact.findOne({
      mobile
    }).lean();

    if (existingContact) {
      return res.status(409).json({
        success: false,
        message:
          "This mobile number has already been submitted."
      });
    }

    // ==========================================
    // 3. CREATE CONTACT
    // ==========================================

    const contact = await Contact.create({
      name,
      email: email || null,
      mobile
    });

    // ==========================================
    // 4. SEND ADMIN EMAIL
    // ==========================================

    try {
      await transporter.sendMail({
        from: `"Website Contact Form" <${process.env.MAIL_USER}>`,

        to: process.env.ADMIN_EMAIL,

        replyTo: email || process.env.MAIL_USER,

        subject: `New Contact Form Submission - ${name}`,

        text: `
New contact form submission

Name: ${name}
Email: ${email || "Not provided"}
Mobile: ${mobile}

Submitted At:
${contact.createdAt.toISOString()}

Contact ID:
${contact._id}
        `,

        html: `
          <div style="font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px;">
            
            <h2 style="margin-bottom: 20px;">
              New Contact Form Submission
            </h2>

            <table style="border-collapse: collapse; width: 100%;">
              
              <tr>
                <td style="padding: 10px; font-weight: bold;">
                  Name
                </td>
                <td style="padding: 10px;">
                  ${escapeHtml(name)}
                </td>
              </tr>

              <tr>
                <td style="padding: 10px; font-weight: bold;">
                  Email
                </td>
                <td style="padding: 10px;">
                  ${escapeHtml(email || "Not provided")}
                </td>
              </tr>

              <tr>
                <td style="padding: 10px; font-weight: bold;">
                  Mobile
                </td>
                <td style="padding: 10px;">
                  ${escapeHtml(mobile)}
                </td>
              </tr>

              <tr>
                <td style="padding: 10px; font-weight: bold;">
                  Submitted
                </td>
                <td style="padding: 10px;">
                  ${contact.createdAt.toISOString()}
                </td>
              </tr>

            </table>

          </div>
        `
      });

      console.log(
        `Admin email sent for contact ${contact._id}`
      );
    } catch (emailError) {
      /*
       * IMPORTANT:
       * Contact has already been safely stored.
       *
       * We don't delete the contact simply because
       * the email service temporarily failed.
       *
       * The API still reports successful database
       * submission while logging the mail failure.
       */

      console.error(
        "Admin email failed:",
        emailError.message
      );
    }

    // ==========================================
    // 5. SUCCESS RESPONSE
    // ==========================================

    return res.status(201).json({
      success: true,
      message:
        "Your contact details have been submitted successfully.",
      data: {
        id: contact._id
      }
    });
  } catch (error) {
    return next(error);
  }
};


// ==========================================
// HTML ESCAPE
// ==========================================

const escapeHtml = (value) => {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
};