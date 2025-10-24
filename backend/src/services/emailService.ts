import nodemailer from 'nodemailer';
import { config } from '../config/env';
import { IUser } from '../types';

// Create email transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    service: config.email.service,
    host: config.email.host,
    port: config.email.port,
    secure: config.email.secure,
    auth: {
      user: config.email.auth.user,
      pass: config.email.auth.pass
    }
  });
};

// Email templates
const emailTemplates = {
  welcome: (user: IUser) => ({
    subject: 'Welcome to Services Hub!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #f97316;">Welcome to Services Hub!</h1>
        <p>Hi ${user.name},</p>
        <p>Welcome to Services Hub! We're excited to have you on board.</p>
        <p>Your account has been created successfully. You can now:</p>
        <ul>
          <li>Browse and book services</li>
          <li>Create service requests</li>
          <li>Connect with skilled professionals</li>
        </ul>
        <p>If you have any questions, feel free to contact our support team.</p>
        <p>Best regards,<br>The Services Hub Team</p>
      </div>
    `,
    text: `Welcome to Services Hub! Hi ${user.name}, Welcome to Services Hub! We're excited to have you on board. Your account has been created successfully.`
  }),

  emailVerification: (user: IUser, token: string) => ({
    subject: 'Verify Your Email Address',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #f97316;">Verify Your Email</h1>
        <p>Hi ${user.name},</p>
        <p>Please verify your email address to complete your registration.</p>
        <a href="${config.app.url}/verify-email?token=${token}" 
           style="background-color: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
          Verify Email Address
        </a>
        <p>If the button doesn't work, copy and paste this link into your browser:</p>
        <p>${config.app.url}/verify-email?token=${token}</p>
        <p>This link will expire in 24 hours.</p>
        <p>Best regards,<br>The Services Hub Team</p>
      </div>
    `,
    text: `Hi ${user.name}, Please verify your email address by clicking this link: ${config.app.url}/verify-email?token=${token}`
  }),

  passwordReset: (user: IUser, token: string) => ({
    subject: 'Reset Your Password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #f97316;">Reset Your Password</h1>
        <p>Hi ${user.name},</p>
        <p>You requested to reset your password. Click the button below to create a new password.</p>
        <a href="${config.app.url}/reset-password?token=${token}" 
           style="background-color: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
          Reset Password
        </a>
        <p>If the button doesn't work, copy and paste this link into your browser:</p>
        <p>${config.app.url}/reset-password?token=${token}</p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <p>Best regards,<br>The Services Hub Team</p>
      </div>
    `,
    text: `Hi ${user.name}, Reset your password by clicking this link: ${config.app.url}/reset-password?token=${token}`
  }),

  serviceRequestCreated: (user: IUser, serviceRequest: any) => ({
    subject: 'Service Request Created Successfully',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #f97316;">Service Request Created</h1>
        <p>Hi ${user.name},</p>
        <p>Your service request has been created successfully!</p>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Request Details:</h3>
          <p><strong>Category:</strong> ${serviceRequest.category}</p>
          <p><strong>Type:</strong> ${serviceRequest.type}</p>
          <p><strong>Price:</strong> $${serviceRequest.price}</p>
          <p><strong>Description:</strong> ${serviceRequest.description}</p>
        </div>
        <p>We'll notify you when sellers respond to your request.</p>
        <p>Best regards,<br>The Services Hub Team</p>
      </div>
    `,
    text: `Hi ${user.name}, Your service request has been created successfully! Category: ${serviceRequest.category}, Price: $${serviceRequest.price}`
  }),

  serviceRequestAccepted: (user: IUser, serviceRequest: any, seller: any) => ({
    subject: 'Your Service Request Has Been Accepted!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #f97316;">Service Request Accepted</h1>
        <p>Hi ${user.name},</p>
        <p>Great news! Your service request has been accepted by a seller.</p>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Seller Details:</h3>
          <p><strong>Name:</strong> ${seller.name}</p>
          <p><strong>Email:</strong> ${seller.email}</p>
          <p><strong>Phone:</strong> ${seller.phone || 'Not provided'}</p>
        </div>
        <p>You can now communicate with the seller to arrange the service.</p>
        <p>Best regards,<br>The Services Hub Team</p>
      </div>
    `,
    text: `Hi ${user.name}, Your service request has been accepted by ${seller.name}. Contact: ${seller.email}`
  }),

  sellerApproved: (user: IUser) => ({
    subject: 'Congratulations! Your Seller Profile Has Been Approved',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #f97316;">Seller Profile Approved!</h1>
        <p>Hi ${user.name},</p>
        <p>Congratulations! Your seller profile has been approved by our team.</p>
        <p>You can now:</p>
        <ul>
          <li>Receive service requests</li>
          <li>Accept and complete jobs</li>
          <li>Build your reputation</li>
          <li>Earn money from your services</li>
        </ul>
        <a href="${config.app.url}/seller/dashboard" 
           style="background-color: #f97316; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
          Go to Seller Dashboard
        </a>
        <p>Best regards,<br>The Services Hub Team</p>
      </div>
    `,
    text: `Hi ${user.name}, Congratulations! Your seller profile has been approved. You can now receive service requests.`
  }),

  sellerRejected: (user: IUser, reason: string) => ({
    subject: 'Seller Profile Application Update',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #f97316;">Seller Profile Application</h1>
        <p>Hi ${user.name},</p>
        <p>Thank you for your interest in becoming a seller on Services Hub.</p>
        <p>Unfortunately, we cannot approve your seller profile at this time.</p>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3>Reason:</h3>
          <p>${reason}</p>
        </div>
        <p>You can reapply with additional information or corrections.</p>
        <p>If you have any questions, please contact our support team.</p>
        <p>Best regards,<br>The Services Hub Team</p>
      </div>
    `,
    text: `Hi ${user.name}, Your seller profile application was not approved. Reason: ${reason}`
  })
};

// Send email function
export const sendEmail = async (
  to: string,
  subject: string,
  html: string,
  text?: string
): Promise<void> => {
  try {
    const transporter = createTransporter();
    
    await transporter.sendMail({
      from: `"Services Hub" <${config.email.auth.user}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, '') // Strip HTML tags for text version
    });
  } catch (error) {
    console.error('Email sending failed:', error);
    throw new Error('Failed to send email');
  }
};

// Send welcome email
export const sendWelcomeEmail = async (user: IUser): Promise<void> => {
  const template = emailTemplates.welcome(user);
  await sendEmail(user.email, template.subject, template.html, template.text);
};

// Send email verification
export const sendVerificationEmail = async (user: IUser, token: string): Promise<void> => {
  const template = emailTemplates.emailVerification(user, token);
  await sendEmail(user.email, template.subject, template.html, template.text);
};

// Send password reset email
export const sendPasswordResetEmail = async (user: IUser, token: string): Promise<void> => {
  const template = emailTemplates.passwordReset(user, token);
  await sendEmail(user.email, template.subject, template.html, template.text);
};

// Send service request created email
export const sendServiceRequestCreatedEmail = async (user: IUser, serviceRequest: any): Promise<void> => {
  const template = emailTemplates.serviceRequestCreated(user, serviceRequest);
  await sendEmail(user.email, template.subject, template.html, template.text);
};

// Send service request accepted email
export const sendServiceRequestAcceptedEmail = async (user: IUser, serviceRequest: any, seller: any): Promise<void> => {
  const template = emailTemplates.serviceRequestAccepted(user, serviceRequest, seller);
  await sendEmail(user.email, template.subject, template.html, template.text);
};

// Send seller approved email
export const sendSellerApprovedEmail = async (user: IUser): Promise<void> => {
  const template = emailTemplates.sellerApproved(user);
  await sendEmail(user.email, template.subject, template.html, template.text);
};

// Send seller rejected email
export const sendSellerRejectedEmail = async (user: IUser, reason: string): Promise<void> => {
  const template = emailTemplates.sellerRejected(user, reason);
  await sendEmail(user.email, template.subject, template.html, template.text);
};

// Send custom email
export const sendCustomEmail = async (
  to: string,
  subject: string,
  content: string,
  isHtml: boolean = true
): Promise<void> => {
  await sendEmail(to, subject, isHtml ? content : '', isHtml ? undefined : content);
};

// Send bulk emails
export const sendBulkEmails = async (
  recipients: string[],
  subject: string,
  html: string,
  text?: string
): Promise<void> => {
  const promises = recipients.map(email => 
    sendEmail(email, subject, html, text)
  );
  
  await Promise.allSettled(promises);
};

export default {
  sendEmail,
  sendWelcomeEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendServiceRequestCreatedEmail,
  sendServiceRequestAcceptedEmail,
  sendSellerApprovedEmail,
  sendSellerRejectedEmail,
  sendCustomEmail,
  sendBulkEmails
};
