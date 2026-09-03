import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { createNodemailerTransporter, getMailSenderDetails } from "../../../config/nodemailer.config";
import { winstonLogger } from "../../../config/logger.config";

@Injectable()
export class EmailService {

  constructor(private readonly configService: ConfigService) { }

  async sendSignUpOtpEmail(email: string, otp: string): Promise<void> {
    try {

      const transporter = createNodemailerTransporter(this.configService);

      const mailOptions = {
        from: getMailSenderDetails(this.configService),
        to: email,
        subject: 'Verify Your Email - NexCorp Billing',
        html: `
  <div style="background-color: #f8fafc; padding: 20px 10px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #334155;">
    <div style="max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); border: 1px solid #e2e8f0;">
      
      <!-- Brand Header -->
      <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 24px 16px; text-align: center;">
        <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: 0.5px;">NexCorp Billing</h1>
        <p style="color: #94a3b8; margin: 4px 0 0 0; font-size: 13px;">Secure Enterprise Billing Solutions</p>
      </div>

      <!-- Main Body -->
      <div style="padding: 24px 20px;">
        <h2 style="color: #0f172a; font-size: 18px; margin-top: 0; margin-bottom: 12px; font-weight: 600;">Email Verification Code</h2>
        <p style="font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 24px;">
          Thank you for signing up with <strong>NexCorp Billing</strong>. Please use the One-Time Password (OTP) below to complete your account registration:
        </p>

        <!-- Single-Row Responsive OTP Display Box -->
        <div style="background-color: #eff6ff; border: 2px dashed #93c5fd; border-radius: 8px; padding: 16px 8px; text-align: center; margin-bottom: 24px; overflow-x: hidden;">
          <span style="font-size: 28px; font-weight: 800; color: #2563eb; letter-spacing: 6px; font-family: 'Courier New', Courier, monospace; white-space: nowrap; display: inline-block; word-break: keep-all;">${otp}</span>
        </div>

        <!-- Security Warning Box -->
        <div style="background-color: #fffbebf7; border-left: 4px solid #f59e0b; padding: 12px 14px; border-radius: 4px; margin-bottom: 24px;">
          <p style="margin: 0; font-size: 13px; color: #b45309; line-height: 1.5;">
            <strong>⚠️ Security Warning:</strong> This OTP is valid for <strong>10 minutes</strong>. Do not share this code with anyone. NexCorp employees will never ask for your OTP.
          </p>
        </div>

        <p style="font-size: 13px; color: #64748b; margin-bottom: 0;">
          If you did not initiate this request, you can safely ignore this email.
        </p>
      </div>

      <!-- Footer -->
      <div style="background-color: #f1f5f9; padding: 16px; text-align: center; border-top: 1px solid #e2e8f0;">
        <p style="font-size: 12px; color: #94a3b8; margin: 0 0 6px 0;">© 2026 NexCorp Technology Pvt. Ltd. All rights reserved.</p>
        <p style="font-size: 12px; color: #94a3b8; margin: 0;">Need help? Contact <a href="mailto:support@nexcorp.com" style="color: #2563eb; text-decoration: none; font-weight: 500;">support@nexcorp.com</a></p>
      </div>

    </div>
  </div>
`,
      };

      await transporter.sendMail(mailOptions);
    } catch (err) {
      winstonLogger.error("Regsiter Otp Email Send Error", err)
      throw new InternalServerErrorException('Email sending failed');
    }
  }

  async successFullUserRegister(email: string, name: string): Promise<void> {
    try {
      const transporter = createNodemailerTransporter(this.configService);

      const mailOptions = {
        from: getMailSenderDetails(this.configService),
        to: email,
        subject: `Welcome Aboard, ${name}! Your NexCorp Billing Account is Ready`,
        html: `
 <div style="background-color: #f8fafc; padding: 20px 10px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #334155;">
  <div style="max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); border: 1px solid #e2e8f0;">
    
    <!-- Brand Header -->
    <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 28px 16px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700; letter-spacing: 0.5px;">NexCorp Billing</h1>
      <p style="color: #94a3b8; margin: 6px 0 0 0; font-size: 13px;">Secure Enterprise Billing Solutions</p>
    </div>

    <!-- Main Body -->
    <div style="padding: 28px 24px;">
      <h2 style="color: #0f172a; font-size: 20px; margin-top: 0; margin-bottom: 12px; font-weight: 700;">Welcome Aboard, ${name}! 🎉</h2>
      
      <p style="font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 20px;">
        Thank you for choosing <strong>NexCorp Billing</strong>. Your account has been successfully verified and activated. You now have complete access to our enterprise-grade billing suite.
      </p>

      <!-- Key Features / Benefits Box -->
      <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 18px; margin-bottom: 24px;">
        <h3 style="color: #0f172a; font-size: 14px; margin-top: 0; margin-bottom: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">Here's what you can do next:</h3>
        
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="font-size: 13px; color: #334155;">
          <tr>
            <td style="padding-bottom: 10px; vertical-align: top; width: 24px;">⚡</td>
            <td style="padding-bottom: 10px; line-height: 1.5;"><strong>Multi-Branch Management:</strong> Switch seamlessly between your business branches in real-time.</td>
          </tr>
          <tr>
            <td style="padding-bottom: 10px; vertical-align: top;">🔒</td>
            <td style="padding-bottom: 10px; line-height: 1.5;"><strong>Role-Based Access (RBAC):</strong> Invite staff, accountants, and admins with precise permission controls.</td>
          </tr>
          <tr>
            <td style="padding-bottom: 10px; vertical-align: top;">📊</td>
            <td style="padding-bottom: 10px; line-height: 1.5;"><strong>Instant Audit Logs:</strong> Track active sessions, security updates, and invoice transactions smoothly.</td>
          </tr>
          <tr>
            <td style="vertical-align: top;">📄</td>
            <td style="line-height: 1.5;"><strong>Smart Invoicing:</strong> Generate compliant, branded GST invoices in seconds.</td>
          </tr>
        </table>
      </div>

      <!-- Call To Action Button -->
      <div style="text-align: center; margin-bottom: 24px;">
        <a href="https://billing.nexcorp.com/login" style="background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 8px; font-weight: 600; font-size: 14px; display: inline-block; box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.2);">Go to Dashboard</a>
      </div>

      <p style="font-size: 13px; color: #64748b; margin-bottom: 0; line-height: 1.5;">
        If you have any questions or need assistance setting up your workspace, our support team is always here to help.
      </p>
    </div>

    <!-- Footer -->
    <div style="background-color: #f1f5f9; padding: 18px; text-align: center; border-top: 1px solid #e2e8f0;">
      <p style="font-size: 12px; color: #94a3b8; margin: 0 0 6px 0;">© 2026 NexCorp Technology Pvt. Ltd. All rights reserved.</p>
      <p style="font-size: 12px; color: #94a3b8; margin: 0;">Need help? Contact <a href="mailto:support@nexcorp.com" style="color: #2563eb; text-decoration: none; font-weight: 500;">support@nexcorp.com</a></p>
    </div>

  </div>
</div>
`,
      };

      await transporter.sendMail(mailOptions);
    } catch (err) {
      winstonLogger.error("Regsiter Successfully Email Send Error", err)
      throw new InternalServerErrorException('Email sending failed');
    }
  }

  async sendForgotPasswordOtpEmail(email: string, otp: string): Promise<void> {
    try {
      const transporter = createNodemailerTransporter(this.configService);

      const mailOptions = {
        from: getMailSenderDetails(this.configService),
        to: email,
        subject: 'Reset Your Password - NexCorp Billing OTP',
        html: `
<div style="background-color: #f8fafc; padding: 20px 10px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #334155;">
  <div style="max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); border: 1px solid #e2e8f0;">
    
    <!-- Brand Header -->
    <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 24px 16px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: 0.5px;">NexCorp Billing</h1>
      <p style="color: #94a3b8; margin: 4px 0 0 0; font-size: 13px;">Secure Enterprise Billing Solutions</p>
    </div>

    <!-- Main Body -->
    <div style="padding: 24px 20px;">
      <h2 style="color: #0f172a; font-size: 18px; margin-top: 0; margin-bottom: 12px; font-weight: 600;">Password Reset Request</h2>
      <p style="font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 24px;">
        We received a request to reset the password for your <strong>NexCorp Billing</strong> account. Please use the One-Time Password (OTP) below to proceed:
      </p>

      <!-- Single-Row Responsive OTP Display Box -->
      <div style="background-color: #f0fdf4; border: 2px dashed #86efac; border-radius: 8px; padding: 16px 8px; text-align: center; margin-bottom: 24px; overflow-x: hidden;">
        <span style="font-size: 30px; font-weight: 800; color: #15803d; letter-spacing: 6px; font-family: 'Courier New', Courier, monospace; white-space: nowrap; display: inline-block; word-break: keep-all;">${otp}</span>
      </div>

      <!-- Security Warning Box -->
      <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 12px 14px; border-radius: 4px; margin-bottom: 24px;">
        <p style="margin: 0; font-size: 13px; color: #991b1b; line-height: 1.5;">
          <strong>🔒 Security Alert:</strong> This OTP is valid for <strong>10 minutes</strong> with only <strong>3 attempts</strong>. If you did not initiate this request, someone else might be trying to access your account.
        </p>
      </div>

      <p style="font-size: 13px; color: #64748b; margin-bottom: 0;">
        If this wasn't you, please ignore this email or contact support immediately if you suspect unauthorized activity.
      </p>
    </div>

    <!-- Footer -->
    <div style="background-color: #f1f5f9; padding: 16px; text-align: center; border-top: 1px solid #e2e8f0;">
      <p style="font-size: 12px; color: #94a3b8; margin: 0 0 6px 0;">© 2026 NexCorp Technology Pvt. Ltd. All rights reserved.</p>
      <p style="font-size: 12px; color: #94a3b8; margin: 0;">Need urgent assistance? Contact <a href="mailto:support@nexcorp.com" style="color: #2563eb; text-decoration: none; font-weight: 500;">support@nexcorp.com</a></p>
    </div>

  </div>
</div>
`,
      };

      await transporter.sendMail(mailOptions);
    } catch (err) {
      winstonLogger.error('Forgot Password Otp Email Send Error', err);
      throw new InternalServerErrorException('Email sending failed');
    }
  }

  async sendPasswordResetSuccessEmail(email: string): Promise<void> {
    try {
      const transporter = createNodemailerTransporter(this.configService);

      const mailOptions = {
        from: getMailSenderDetails(this.configService),
        to: email,
        subject: 'Password Changed Successfully - NexCorp Billing Security Alert',
        html: `
<div style="background-color: #f8fafc; padding: 20px 10px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #334155;">
  <div style="max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); border: 1px solid #e2e8f0;">
    
    <!-- Brand Header -->
    <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); padding: 24px 16px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: 0.5px;">NexCorp Billing</h1>
      <p style="color: #94a3b8; margin: 4px 0 0 0; font-size: 13px;">Secure Enterprise Billing Solutions</p>
    </div>

    <!-- Main Body -->
    <div style="padding: 24px 20px;">
      <h2 style="color: #0f172a; font-size: 18px; margin-top: 0; margin-bottom: 12px; font-weight: 600;">Password Updated Successfully</h2>
      <p style="font-size: 14px; line-height: 1.6; color: #475569; margin-bottom: 24px;">
        The password for your <strong>NexCorp Billing</strong> account (<strong>${email}</strong>) has been changed successfully.
      </p>

      <!-- Status Notification Box -->
      <div style="background-color: #f0fdf4; border: 2px dashed #86efac; border-radius: 8px; padding: 16px; text-align: center; margin-bottom: 24px;">
        <span style="font-size: 16px; font-weight: 700; color: #15803d;">
          ✔ All previous active sessions have been invalidated
        </span>
      </div>

      <!-- Security Warning Box -->
      <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 12px 14px; border-radius: 4px; margin-bottom: 24px;">
        <p style="margin: 0; font-size: 13px; color: #991b1b; line-height: 1.5;">
          <strong>🔒 Security Alert:</strong> If you did not perform this password change, your account might be compromised. Please contact support immediately to freeze your account.
        </p>
      </div>

      <p style="font-size: 13px; color: #64748b; margin-bottom: 0;">
        You can now log in to your account with your newly set password.
      </p>
    </div>

    <!-- Footer -->
    <div style="background-color: #f1f5f9; padding: 16px; text-align: center; border-top: 1px solid #e2e8f0;">
      <p style="font-size: 12px; color: #94a3b8; margin: 0 0 6px 0;">© 2026 NexCorp Technology Pvt. Ltd. All rights reserved.</p>
      <p style="font-size: 12px; color: #94a3b8; margin: 0;">Need urgent assistance? Contact <a href="mailto:support@nexcorp.com" style="color: #2563eb; text-decoration: none; font-weight: 500;">support@nexcorp.com</a></p>
    </div>

  </div>
</div>
`,
      };

      await transporter.sendMail(mailOptions);
    } catch (err) {
      winstonLogger.error('Password Reset Success Email Send Error', err);
      throw new InternalServerErrorException('Email sending failed');
    }
  }
}