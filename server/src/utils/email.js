const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendNewInquiryNotification(inquiry) {
    if (!process.env.RESEND_API_KEY) {
        console.log('Resend Email not configured. Skipping notification.');
        return;
    }

    const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@scholarassist.com';

    try {
        const { data, error } = await resend.emails.send({
            from: `ScholarAssist <${fromEmail}>`,
            to: [adminEmail],
            subject: `New Inquiry: ${inquiry.service_type} - ${inquiry.name}`,
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
          <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">New Inquiry Received</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">Inquiry ID: #${inquiry.id.substring(0, 8)}</p>
          </div>
          <div style="padding: 30px; background: #ffffff;">
            <h2 style="color: #1e40af; font-size: 18px; margin-top: 0; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px;">Contact Details</h2>
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
              <tr><td style="padding: 10px 0; font-weight: bold; color: #64748b; width: 150px;">Name:</td><td style="padding: 10px 0; color: #1e293b;">${inquiry.name}</td></tr>
              <tr><td style="padding: 10px 0; font-weight: bold; color: #64748b;">Email:</td><td style="padding: 10px 0; color: #1e293b;"><a href="mailto:${inquiry.email}" style="color: #3b82f6; text-decoration: none;">${inquiry.email}</a></td></tr>
              <tr><td style="padding: 10px 0; font-weight: bold; color: #64748b;">Phone:</td><td style="padding: 10px 0; color: #1e293b;">${inquiry.phone || 'N/A'}</td></tr>
              <tr><td style="padding: 10px 0; font-weight: bold; color: #64748b;">Academic Level:</td><td style="padding: 10px 0; color: #1e293b;">${inquiry.academic_level || 'N/A'}</td></tr>
              <tr><td style="padding: 10px 0; font-weight: bold; color: #64748b;">Service Type:</td><td style="padding: 10px 0;"><span style="background: #eff6ff; color: #1e40af; padding: 4px 12px; border-radius: 99px; font-size: 14px; font-weight: bold;">${inquiry.service_type}</span></td></tr>
              <tr><td style="padding: 10px 0; font-weight: bold; color: #64748b;">Deadline:</td><td style="padding: 10px 0; color: #ef4444; font-weight: bold;">${inquiry.deadline || 'Not specified'}</td></tr>
            </table>
            
            <h3 style="color: #1e40af; font-size: 18px; margin-top: 20px; border-bottom: 2px solid #f1f5f9; padding-bottom: 10px;">Message</h3>
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; color: #334155; line-height: 1.6; border: 1px solid #eef2f6;">
              ${inquiry.message || 'No message provided.'}
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="${process.env.CLIENT_URL || 'https://scholarassist.netlify.app'}/admin/inquiries" style="display: inline-block; background: #1e40af; color: white; padding: 14px 28px; text-decoration: none; border-radius: 8px; font-weight: bold; box-shadow: 0 4px 6px -1px rgba(30, 64, 175, 0.2);">View in Admin Panel</a>
            </div>
          </div>
          <div style="background: #f1f5f9; padding: 20px; text-align: center; color: #94a3b8; font-size: 12px;">
            <p style="margin: 0;">&copy; ${new Date().getFullYear()} ScholarAssist. All rights reserved.</p>
          </div>
        </div>
      `,
        });

        if (error) {
            console.error('Resend SDK Error:', error);
            return;
        }

        console.log('Admin notification email sent successfully via Resend:', data.id);
    } catch (error) {
        console.error('Failed to send Resend notification email:', error.message);
    }
}

module.exports = { sendNewInquiryNotification };
