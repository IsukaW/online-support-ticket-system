const nodemailer = require('nodemailer');

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

/**
 * Send email
 */
const sendEmail = async ({ to, subject, text, html }) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to,
      subject,
      text,
      html,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✉️  Email sent: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`❌ Error sending email: ${error.message}`);
    throw error;
  }
};

/**
 * Send welcome email
 */
const sendWelcomeEmail = async (user) => {
  const subject = 'Welcome to Ticket Support System';
  const html = `
    <h1>Welcome ${user.name}!</h1>
    <p>Thank you for registering with our Ticket Support System.</p>
    <p>You can now create and manage your support tickets.</p>
    <br>
    <p>Best regards,<br>Support Team</p>
  `;
  
  await sendEmail({ to: user.email, subject, html });
};

/**
 * Send ticket created notification
 */
const sendTicketCreatedEmail = async (user, ticket) => {
  const subject = `Ticket Created: ${ticket.title}`;
  const html = `
    <h2>Your ticket has been created</h2>
    <p>Hi ${user.name},</p>
    <p>Your support ticket has been successfully created.</p>
    <br>
    <p><strong>Ticket ID:</strong> ${ticket._id}</p>
    <p><strong>Title:</strong> ${ticket.title}</p>
    <p><strong>Priority:</strong> ${ticket.priority}</p>
    <p><strong>Status:</strong> ${ticket.status}</p>
    <br>
    <p>We'll get back to you as soon as possible.</p>
    <p>Best regards,<br>Support Team</p>
  `;
  
  await sendEmail({ to: user.email, subject, html });
};

/**
 * Send ticket updated notification
 */
const sendTicketUpdatedEmail = async (user, ticket) => {
  const subject = `Ticket Updated: ${ticket.title}`;
  const html = `
    <h2>Your ticket has been updated</h2>
    <p>Hi ${user.name},</p>
    <p>Your support ticket has been updated.</p>
    <br>
    <p><strong>Ticket ID:</strong> ${ticket._id}</p>
    <p><strong>Status:</strong> ${ticket.status}</p>
    <br>
    <p>Best regards,<br>Support Team</p>
  `;
  
  await sendEmail({ to: user.email, subject, html });
};

/**
 * Send password reset email
 */
const sendPasswordResetEmail = async (user, resetToken) => {
  const resetUrl = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
  const subject = 'Password Reset Request';
  const html = `
    <h2>Password Reset Request</h2>
    <p>Hi ${user.name},</p>
    <p>You requested a password reset. Click the link below to reset your password:</p>
    <a href="${resetUrl}">${resetUrl}</a>
    <p>This link will expire in 1 hour.</p>
    <p>If you didn't request this, please ignore this email.</p>
    <br>
    <p>Best regards,<br>Support Team</p>
  `;
  
  await sendEmail({ to: user.email, subject, html });
};

module.exports = {
  sendEmail,
  sendWelcomeEmail,
  sendTicketCreatedEmail,
  sendTicketUpdatedEmail,
  sendPasswordResetEmail,
};
