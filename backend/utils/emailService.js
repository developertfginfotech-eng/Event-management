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

const createTransporter = async () => {
  if (process.env.EMAIL_HOST && process.env.EMAIL_USER) {
    console.log('📧 Using configured SMTP:', process.env.EMAIL_HOST);
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT || 587,
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
    });
  }

  console.log('⚠️  No SMTP configured. Trying Ethereal Email for testing...');
  const testAccount = await createTestAccount();

  if (!testAccount) {
    console.error('❌ Could not create test account. Please configure SMTP in environment variables.');
    return null;
  }

  return nodemailer.createTransport({
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
};

const sendEmailToLead = async ({ to, subject, body, attachments = [], from = null }) => {
  const transporter = await createTransporter();

  if (!transporter) {
    throw new Error('Email service not available. Please try again or contact administrator.');
  }

  if (!to) {
    throw new Error('Recipient email address is required');
  }

  const mailOptions = {
    from: from || `"${process.env.EMAIL_FROM_NAME || 'Event Management'}" <${process.env.EMAIL_USER}>`,
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
  const transporter = await createTransporter();

  if (!transporter) {
    return {
      success: false,
      message: 'Email service not configured. Using Ethereal Email for testing.',
    };
  }

  try {
    await transporter.verify();

    if (testAccountCache) {
      return {
        success: true,
        message: 'Using Ethereal Email (test mode). Emails will not be delivered to real addresses.',
        mode: 'test',
        viewEmailsAt: 'https://ethereal.email',
      };
    }

    return {
      success: true,
      message: 'Email service is configured and ready',
      mode: 'production',
    };
  } catch (error) {
    return {
      success: false,
      message: `Email service configuration error: ${error.message}`,
    };
  }
};

module.exports = {
  sendEmailToLead,
  sendBulkEmails,
  verifyEmailConfig,
};
