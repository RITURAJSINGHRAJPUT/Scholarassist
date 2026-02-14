const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
    },
});

async function sendNewInquiryNotification(inquiry) {
    if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.log('Email not configured. Skipping notification.');
        return;
    }

    const mailOptions = {
        from: `"ScholarAssist" <${process.env.SMTP_USER}>`,
        to: process.env.ADMIN_EMAIL,
        subject: `New Inquiry: ${inquiry.service_type} - ${inquiry.name}`,
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #1e40af; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">New Inquiry Received</h1>
        </div>
        <div style="padding: 20px; background: #f8fafc;">
          <h2 style="color: #1e40af;">Contact Details</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px; font-weight: bold;">Name:</td><td style="padding: 8px;">${inquiry.name}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold;">Email:</td><td style="padding: 8px;">${inquiry.email}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold;">Phone:</td><td style="padding: 8px;">${inquiry.phone || 'N/A'}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold;">Academic Level:</td><td style="padding: 8px;">${inquiry.academic_level || 'N/A'}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold;">Service Type:</td><td style="padding: 8px;">${inquiry.service_type}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold;">Deadline:</td><td style="padding: 8px;">${inquiry.deadline || 'Not specified'}</td></tr>
          </table>
          <h3 style="color: #1e40af;">Message</h3>
          <p style="background: white; padding: 15px; border-radius: 8px;">${inquiry.message || 'No message provided.'}</p>
          <p style="text-align: center; margin-top: 20px;">
            <a href="${process.env.CLIENT_URL}/admin/inquiries" style="background: #1e40af; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">View in Admin Panel</a>
          </p>
        </div>
      </div>
    `,
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log('Admin notification email sent successfully.');
    } catch (error) {
        console.error('Failed to send notification email:', error.message);
    }
}

module.exports = { sendNewInquiryNotification };
