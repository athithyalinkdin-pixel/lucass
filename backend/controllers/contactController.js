const pool = require('../config/db');
const nodemailer = require('nodemailer');

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;

if (!EMAIL_USER || !EMAIL_PASS) {
  console.warn('WARNING: Email credentials (EMAIL_USER, EMAIL_PASS) are missing. Email features will not work.');
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: EMAIL_USER,
    pass: EMAIL_PASS
  }
});

const submitContactForm = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Name, email, and message are required.' });
    }

    // 1. Save to Database
    const [result] = await pool.query(
      'INSERT INTO contact_messages (name, email, phone, subject, message) VALUES (?, ?, ?, ?, ?)',
      [name, email, phone || null, subject || 'General Inquiry', message]
    );

    // 2. Send Email
    const mailOptions = {
      from: EMAIL_USER,
      to: EMAIL_USER,
      subject: `New Contact Submission: ${subject || 'General Inquiry'}`,
      html: `
        <h3>New Contact Message</h3>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || 'N/A'}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <hr/>
        <p><strong>Message:</strong></p>
        <p>${message}</p>
      `
    };

    // We don't block the response on email sending, but we log if it fails.
    transporter.sendMail(mailOptions).catch(err => {
      console.error('Failed to send contact email:', err);
    });

    res.status(201).json({ message: 'Message sent successfully', id: result.insertId });
  } catch (error) {
    console.error('Error submitting contact form:', error.message);
    res.status(500).json({ 
      success: false,
      message: process.env.NODE_ENV === 'production' ? 'Internal Server Error' : error.message 
    });
  }
};

module.exports = {
  submitContactForm
};
