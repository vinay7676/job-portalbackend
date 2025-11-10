// mailer.js
import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

// ✅ Create transporter (no verification, safe defaults)
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // Use STARTTLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ✅ Safe sendMail utility (does not crash if email fails)
const sendMail = async (to, subject, htmlContent) => {
  const mailOptions = {
    from: `Job Portal HR <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html: htmlContent,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${to}. Message ID: ${info.messageId}`);
  } catch (error) {
    console.warn(`⚠️ Email sending skipped or failed for ${to}: ${error.message}`);
    // Do NOT throw here — prevents Render crash
  }
};

// =========================================================
// ✉️ Template 1: Acceptance Email
// =========================================================
export const sendAcceptanceEmail = (candidateEmail, jobTitle, hrName, hrEmail) => {
  const subject = `Congratulations! You've been selected for the ${jobTitle} role.`;

  const hrSignature = hrName
    ? `HR ${hrName}<br><a href="mailto:${hrEmail}" style="color:#28a745;text-decoration:none;">${hrEmail}</a>`
    : "The Recruitment Team";

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <h2 style="color: #28a745;">🎉 Congratulations!</h2>
      <p>We’re delighted to inform you that your application for <strong>${jobTitle}</strong> has been successful!</p>
      <p>The HR team will contact you soon regarding next steps.</p>
      <p style="margin-top:30px; font-size:0.9em; color:#666;">
        Best regards,<br>
        ${hrSignature}
      </p>
    </div>
  `;

  return sendMail(candidateEmail, subject, htmlContent);
};

// =========================================================
// ✉️ Template 2: Rejection Email
// =========================================================
export const sendRejectionEmail = (candidateEmail, jobTitle, hrName, hrEmail) => {
  const subject = `Update on your application for ${jobTitle}`;

  const hrSignature = hrName
    ? `HR ${hrName}<br><a href="mailto:${hrEmail}" style="color:#dc3545;text-decoration:none;">${hrEmail}</a>`
    : "The Recruitment Team";

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
      <h2 style="color: #dc3545;">😔 Application Update</h2>
      <p>Thank you for applying for the <strong>${jobTitle}</strong> role.</p>
      <p>Unfortunately, we won’t be moving forward with your application at this time.</p>
      <p>We truly appreciate your effort and encourage you to apply again in the future.</p>
      <p style="margin-top:30px; font-size:0.9em; color:#666;">
        Best regards,<br>
        ${hrSignature}
      </p>
    </div>
  `;

  return sendMail(candidateEmail, subject, htmlContent);
};
