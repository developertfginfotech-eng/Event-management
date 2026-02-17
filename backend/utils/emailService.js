const sgMail = require('@sendgrid/mail');
const nodemailer = require('nodemailer');

let testAccountCache = null;

const createTestAccount = async () => {
  if (testAccountCache) {
    return testAccountCache;
  }

  try {
    console.log('Creating test email account...');

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Timeout creating test account')), 10000)
    );

    const testAccount = await Promise.race([
      nodemailer.createTestAccount(),
      timeoutPromise
    ]);

    testAccountCache = testAccount;
    console.log('✅ Test email account created!');
    console.log('📧 Email:', testAccount.user);
    console.log('🔗 View emails at: https://ethereal.email');
    return testAccount;
  } catch (error) {
    console.error('Failed to create test account:', error.message);
    return null;
  }
};

const sendEmailToLead = async ({ to, subject, body, attachments = [], from = null }) => {
  if (!to) {
    throw new Error('Recipient email address is required');
  }

  // Try SendGrid API first (works on Render - uses HTTPS, not SMTP)
  if (process.env.EMAIL_PASSWORD && process.env.EMAIL_PASSWORD.startsWith('SG.')) {
    try {
      console.log('📧 Using SendGrid HTTP API');
      sgMail.setApiKey(process.env.EMAIL_PASSWORD);

      const fromEmail = from || process.env.EMAIL_USER || 'noreply@example.com';
      const fromName = process.env.EMAIL_FROM_NAME || 'Event Management';

      const msg = {
        to: to,
        from: {
          email: fromEmail,
          name: fromName,
        },
        subject: subject,
        html: body,
        attachments: attachments.map(att => ({
          content: att.content,
          filename: att.filename,
          type: att.contentType || 'application/octet-stream',
          disposition: 'attachment',
        })),
      };

      const response = await sgMail.send(msg);

      console.log('✅ Email sent successfully via SendGrid!');
      return {
        success: true,
        messageId: response[0].headers['x-message-id'],
        response: 'Email sent via SendGrid',
      };
    } catch (error) {
      console.error('SendGrid API error:', error.response?.body || error.message);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  // Fallback to Ethereal Email for testing (SMTP)
  console.log('⚠️  No SendGrid API key configured. Using Ethereal Email for testing...');
  const testAccount = await createTestAccount();

  if (!testAccount) {
    throw new Error('Email service not available. Please configure SendGrid API key.');
  }

  const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
    connectionTimeout: 10000,
    greetingTimeout: 10000,
  });

  const mailOptions = {
    from: from || `"${process.env.EMAIL_FROM_NAME || 'Event Management'}" <${testAccount.user}>`,
    to: to,
    subject: subject,
    html: body,
    attachments: attachments,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    const previewUrl = nodemailer.getTestMessageUrl(info);

    const result = {
      success: true,
      messageId: info.messageId,
      response: info.response,
    };

    if (previewUrl) {
      result.previewUrl = previewUrl;
      console.log('✅ Test email sent!');
      console.log('🔗 Preview URL:', previewUrl);
    }

    return result;
  } catch (error) {
    console.error('Email sending failed:', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

const sendBulkEmails = async (emails) => {
  const results = [];

  for (const email of emails) {
    try {
      const result = await sendEmailToLead(email);
      results.push({
        to: email.to,
        success: true,
        messageId: result.messageId,
      });
    } catch (error) {
      results.push({
        to: email.to,
        success: false,
        error: error.message,
      });
    }
  }

  return results;
};

const verifyEmailConfig = async () => {
  if (process.env.EMAIL_PASSWORD && process.env.EMAIL_PASSWORD.startsWith('SG.')) {
    return {
      success: true,
      message: 'SendGrid email service is configured and ready',
      mode: 'production',
      provider: 'SendGrid HTTP API',
    };
  }

  return {
    success: true,
    message: 'Using Ethereal Email (test mode). Emails will not be delivered to real addresses.',
    mode: 'test',
    provider: 'Ethereal Email',
    viewEmailsAt: 'https://ethereal.email',
  };
};

module.exports = {
  sendEmailToLead,
  sendBulkEmails,
  verifyEmailConfig,
};
