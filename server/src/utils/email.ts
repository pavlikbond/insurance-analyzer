import { Resend } from "resend";
import type { FastifyRequest } from "fastify";
import { appConfig } from "../config/index.js";

// Initialize Resend client
const resend = new Resend(appConfig.resend.apiKey);

// Get frontend origin from environment or default to Vite's default port
const frontendOrigin = process.env.FRONTEND_ORIGIN || "http://localhost:5173";

// Email color constants - matching the app's design system
// These match the CSS variables from src/index.css
const EMAIL_COLORS = {
  primary: "#ef443b", // AnyDesk red - primary color
  primaryForeground: "#ffffff", // white text on primary
  background: "#ffffff", // white - clean main background
  foreground: "#1a1a1a", // dark gray - text
  card: "#f8f9fa", // very light gray - cards
  muted: "#f3f4f6", // muted backgrounds
  mutedForeground: "#6b7280", // medium gray for readable muted text
  border: "#e5e7eb", // light gray - borders
} as const;

/**
 * Generate HTML email template for analysis completion notification
 */
function generateAnalysisCompleteEmailHtml(
  displayName: string,
  policyFileName: string,
  reportUrl: string,
  policyUrl: string
): string {
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Analysis Complete</title>
      </head>
      <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; line-height: 1.6; color: ${EMAIL_COLORS.foreground}; max-width: 600px; margin: 0 auto; padding: 20px; background-color: ${EMAIL_COLORS.background};">
        <div style="background: ${EMAIL_COLORS.primary}; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="color: ${EMAIL_COLORS.primaryForeground}; margin: 0; font-size: 24px; font-weight: 600;">Your Analysis is Ready!</h1>
        </div>
        
        <div style="background: ${EMAIL_COLORS.card}; padding: 30px; border-radius: 0 0 8px 8px; border: 1px solid ${EMAIL_COLORS.border}; border-top: none;">
          <p style="font-size: 16px; margin-top: 0; color: ${EMAIL_COLORS.foreground}; line-height: 1.6;">Hi ${displayName},</p>
          
          <p style="font-size: 16px; color: ${EMAIL_COLORS.foreground}; line-height: 1.6;">
            Great news! Your AI-powered analysis for <strong>${policyFileName}</strong> has been completed successfully.
          </p>
          
          <p style="font-size: 16px; color: ${EMAIL_COLORS.foreground}; line-height: 1.6;">
            The analysis includes a comprehensive breakdown of:
          </p>
          
          <ul style="font-size: 16px; padding-left: 20px; color: ${EMAIL_COLORS.foreground}; line-height: 1.8;">
            <li>Executive Summary</li>
            <li>Key Terms & Conditions</li>
            <li>Coverage Details</li>
            <li>Exclusions</li>
            <li>Premiums & Payment Information</li>
            <li>Potential Issues & Concerns</li>
            <li>Recommendations</li>
          </ul>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${reportUrl}" 
               style="display: inline-block; background: ${EMAIL_COLORS.primary}; color: ${EMAIL_COLORS.primaryForeground}; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: 600; font-size: 16px;">
              View Full Report
            </a>
          </div>
          
          <p style="font-size: 14px; color: ${EMAIL_COLORS.mutedForeground}; margin-top: 30px; padding-top: 20px; border-top: 1px solid ${EMAIL_COLORS.border}; line-height: 1.6;">
            You can also view the policy details <a href="${policyUrl}" style="color: ${EMAIL_COLORS.primary}; text-decoration: none; font-weight: 500;">here</a>.
          </p>
          
          <p style="font-size: 14px; color: ${EMAIL_COLORS.mutedForeground}; margin-top: 20px; line-height: 1.6;">
            If you have any questions, feel free to reach out to our support team.
          </p>
          
          <p style="font-size: 14px; color: ${EMAIL_COLORS.mutedForeground}; margin-top: 20px; margin-bottom: 0; line-height: 1.6;">
            Best regards,<br>
            The Insurance Analyzer Team
          </p>
        </div>
      </body>
    </html>
  `;
}

/**
 * Send email notification when analysis is complete
 */
export async function sendAnalysisCompleteEmail(
  userEmail: string,
  userName: string | undefined,
  policyFileName: string,
  analysisId: string,
  policyId: string,
  log: FastifyRequest["log"]
): Promise<void> {
  try {
    const reportUrl = `${frontendOrigin}/reports/${analysisId}`;
    const policyUrl = `${frontendOrigin}/policies/${policyId}`;
    const displayName = userName || "there";

    const html = generateAnalysisCompleteEmailHtml(displayName, policyFileName, reportUrl, policyUrl);

    const { data, error } = await resend.emails.send({
      from: "Insurance Analyzer <onboarding@resend.dev>", // TODO: Update with your verified domain
      to: [userEmail],
      subject: `Your insurance policy analysis is ready: ${policyFileName}`,
      html,
    });

    if (error) {
      log.error(error, "Failed to send analysis complete email");
      throw error;
    }

    log.info(`Analysis complete email sent successfully to ${userEmail}, Resend ID: ${data?.id}`);
  } catch (error) {
    log.error(error, "Error sending analysis complete email");
    // Don't throw - we don't want email failures to break the analysis flow
  }
}
