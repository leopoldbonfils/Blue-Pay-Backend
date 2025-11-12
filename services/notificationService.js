const nodemailer = require('nodemailer');
const { Notification } = require('../models');

class NotificationService {
  constructor() {
    this.transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    });
  }

  async sendEmail(to, subject, html) {
    try {
      await this.transporter.sendMail({
        from: `"BluePay" <${process.env.SMTP_USER}>`,
        to,
        subject,
        html
      });
      return { success: true };
    } catch (error) {
      console.error('Email error:', error);
      return { success: false, error: error.message };
    }
  }

  async sendTransactionEmail(user, transaction) {
    const subject = `Transaction ${transaction.type === 'in' ? 'Received' : 'Sent'} - ${transaction.amount} Rwf`;
    
    const html = `
      BluePay Transaction Notification
      Hi ${user.name},
      A transaction was ${transaction.type === 'in' ? 'received' : 'sent'} on your account.
      
        
          Transaction ID:
          ${transaction.transaction_id}
        
        
          Amount:
          ${transaction.amount} Rwf
        
        
          Type:
          ${transaction.type === 'in' ? 'Received' : 'Sent'}
        
        
          Date:
          ${new Date(transaction.created_at).toLocaleString()}
        
      
      Thank you for using BluePay!
    `;

    return await this.sendEmail(user.email, subject, html);
  }

  async createNotification(userId, title, message, type = 'system', transactionId = null) {
    try {
      const notification = await Notification.create({
        user_id: userId,
        title,
        message,
        type,
        related_transaction_id: transactionId
      });
      return { success: true, notification };
    } catch (error) {
      console.error('Create notification error:', error);
      return { success: false, error: error.message };
    }
  }

  async sendWelcomeEmail(user) {
    const subject = 'Welcome to BluePay!';
    const html = `
      Welcome to BluePay, ${user.name}!
      Thank you for joining BluePay - Rwanda's modern contactless payment solution.
      Your account has been successfully created with phone number: ${user.phone}
      You can now:
      
        Send money via BluePay, Mobile Money, or Bank Transfer
        Make NFC contactless payments
        Track your transactions
        Manage your account settings
      
      If you have any questions, feel free to contact our support team.
      Best regards,The BluePay Team
    `;

    return await this.sendEmail(user.email, subject, html);
  }
}

module.exports = new NotificationService();