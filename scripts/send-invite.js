#!/usr/bin/env node

/**
 * Send assessment invitation emails to candidates.
 *
 * Usage:
 *   node scripts/send-invite.js "Candidate Name" candidate@email.com
 *   node scripts/send-invite.js --file candidates.csv
 *
 * CSV format (no header):
 *   Candidate Name,candidate@email.com
 *
 * Environment variables (from server/.env):
 *   RESEND_API_KEY, REPLY_TO_EMAIL
 */

require("dotenv").config({ path: require("path").join(__dirname, "../server/.env") });

const { Resend } = require("resend");

const PORTAL_URL = process.env.PORTAL_URL || "https://hiring.ifulabs.com";
const FROM_EMAIL = process.env.REPLY_TO_EMAIL || "hiring@ifulabs.com";
const API_KEY = process.env.RESEND_API_KEY;

if (!API_KEY) {
  console.error("❌ RESEND_API_KEY not set in server/.env");
  process.exit(1);
}

const resend = new Resend(API_KEY);

function buildInviteHtml(name) {
  return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa; padding: 20px;">
      <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 482.41 109.93" style="height: 40px; width: auto; margin-bottom: 8px;">
          <g>
            <rect x="44.8" y="44.8" width="20.32" height="20.32" rx="10.16" ry="10.16" transform="translate(109.93 109.93) rotate(180)" fill="#fff"/>
            <rect x="44.8" y="0" width="20.32" height="20.32" rx="1.35" ry="1.35" fill="#fff"/>
            <rect x="76.88" y="13.01" width="20.32" height="20.32" rx="1.35" ry="1.35" fill="#fff"/>
            <rect x="12.73" y="13.01" width="20.32" height="20.32" rx="1.35" ry="1.35" fill="#fff"/>
            <rect x="76.88" y="76.6" width="20.32" height="20.32" rx="1.35" ry="1.35" fill="#fff"/>
            <rect x="44.8" y="89.61" width="20.32" height="20.32" rx="1.35" ry="1.35" fill="#fff"/>
            <rect x="12.73" y="76.6" width="20.32" height="20.32" rx="1.35" ry="1.35" fill="#fff"/>
            <rect x="89.61" y="44.8" width="20.32" height="20.32" rx="1.35" ry="1.35" transform="translate(154.73 -44.8) rotate(90)" fill="#fff"/>
            <rect x="0" y="44.8" width="20.32" height="20.32" rx="1.35" ry="1.35" transform="translate(65.13 44.8) rotate(90)" fill="#fff"/>
          </g>
          <g>
            <path d="M181.88,79.75v6h-31.3v-6h12.33v-28.82h-12.33v-6h18.89v34.83h12.41ZM161.22,32.76c0-2.8,2.24-4.96,5.04-4.96s4.96,2.16,4.96,4.96c0,2.96-2.16,5.04-4.96,5.04s-5.04-2.08-5.04-5.04Z" fill="#fff"/>
            <path d="M191.08,85.76V29.72h34.42v6.4h-27.46v18.73h23.22v6.4h-23.22v24.5h-6.96Z" fill="#fff"/>
            <path d="M233.67,64.06V29.72h6.97v34.26c0,10.65,4.72,15.85,13.29,15.85s13.45-5.12,13.45-15.85V29.72h6.97v34.34c0,14.65-7.29,22.18-20.41,22.18s-20.25-7.53-20.25-22.18Z" fill="#fff"/>
            <path d="M313.73,85.76V29.72h6.96v49.64h25.14v6.4h-32.1Z" fill="#fff"/>
            <path d="M391.3,79.75v6h-3.6c-5.44,0-7.29-2.32-7.37-6.32-2.56,3.68-6.64,6.8-13.69,6.8-8.97,0-15.05-4.48-15.05-11.93,0-8.17,5.68-12.73,16.41-12.73h12.01v-2.8c0-5.28-3.76-8.49-10.17-8.49-5.76,0-9.61,2.72-10.41,6.89h-6.56c.96-8.01,7.45-12.73,17.29-12.73,10.41,0,16.41,5.2,16.41,14.73v17.85c0,2.16.8,2.72,2.64,2.72h2.08ZM380.02,67.1h-12.65c-5.84,0-9.13,2.16-9.13,6.8,0,4,3.44,6.72,8.89,6.72,8.17,0,12.89-4.72,12.89-11.53v-2Z" fill="#fff"/>
            <path d="M440.38,65.34c0,12.49-8.33,20.9-19.61,20.9-6.88,0-11.53-2.8-14.01-6.72l-.88,6.24h-5.68V29.72h6.56v21.78c2.72-3.76,7.13-7.05,14.01-7.05,11.29,0,19.61,7.61,19.61,20.9ZM433.65,65.34c0-8.89-5.44-15.05-13.53-15.05s-13.45,6.16-13.45,14.89,5.44,15.21,13.45,15.21,13.53-6.16,13.53-15.05Z" fill="#fff"/>
            <path d="M448.06,72.31h6.72c.24,4.8,4.48,8.33,11.29,8.33,5.76,0,9.85-2.48,9.85-6.24,0-5.12-4.48-5.52-10.57-6.24-9.13-1.12-16.41-2.96-16.41-11.45,0-7.45,6.8-12.25,16.01-12.25s16.01,4.4,16.65,12.89h-6.72c-.48-4.16-4.32-7.29-9.93-7.29s-9.53,2.4-9.53,6.16c0,4.48,4.32,5.04,10.25,5.76,9.29,1.12,16.73,2.88,16.73,11.93,0,7.61-7.29,12.33-16.33,12.33-10.57,0-17.85-4.96-18.01-13.93Z" fill="#fff"/>
          </g>
        </svg>
        <p style="margin: 0; opacity: 0.85; font-size: 14px;">Cloud Engineering Team</p>
      </div>
      
      <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <p style="font-size: 16px; margin: 0 0 16px;">Hi <strong>${name}</strong>,</p>
        
        <p style="color: #4a4a4a; line-height: 1.7; margin: 0 0 16px;">
          Thank you for your interest in the <strong>Junior Cloud Engineer</strong> position at iFu Labs. 
          As part of our hiring process, we'd like you to complete a short technical assessment.
        </p>

        <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; margin: 24px 0;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 6px 0; color: #6c757d;">Assessment:</td><td style="padding: 6px 0; font-weight: 600;">AWS Cloud Practitioner Level</td></tr>
            <tr><td style="padding: 6px 0; color: #6c757d;">Questions:</td><td style="padding: 6px 0; font-weight: 600;">20 (MCQ + Scenario-based)</td></tr>
            <tr><td style="padding: 6px 0; color: #6c757d;">Duration:</td><td style="padding: 6px 0; font-weight: 600;">30 minutes</td></tr>
            <tr><td style="padding: 6px 0; color: #6c757d;">Camera:</td><td style="padding: 6px 0; font-weight: 600;">Required (webcam monitoring)</td></tr>
          </table>
        </div>

        <div style="text-align: center; margin: 28px 0;">
          <a href="${PORTAL_URL}" 
             style="display: inline-block; padding: 14px 40px; background: linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%); color: white; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">
            Start Assessment →
          </a>
        </div>

        <div style="background: #fff8e1; border-left: 4px solid #f39c12; padding: 14px 18px; border-radius: 0 8px 8px 0; margin: 24px 0;">
          <p style="margin: 0; font-weight: 600; color: #1a1a2e; font-size: 14px;">Before you begin:</p>
          <ul style="margin: 8px 0 0; padding-left: 18px; color: #4a4a4a; line-height: 1.7; font-size: 14px;">
            <li>Use a desktop/laptop with a working webcam</li>
            <li>Ensure a stable internet connection</li>
            <li>Find a quiet environment — tab switching is monitored</li>
            <li>Complete the test in one sitting (timer cannot be paused)</li>
          </ul>
        </div>

        <p style="color: #6c757d; font-size: 14px; line-height: 1.6; margin: 16px 0 0;">
          If you have any questions, reply to this email and we'll get back to you.
        </p>

        <div style="text-align: center; padding-top: 24px; margin-top: 24px; border-top: 1px solid #e9ecef; color: #adb5bd; font-size: 12px;">
          <p style="margin: 0;">iFu Labs • Cloud Engineering Team</p>
          <p style="margin: 4px 0 0;">${FROM_EMAIL}</p>
        </div>
      </div>
    </div>
  `;
}

async function sendInvite(name, email) {
  try {
    const { data, error } = await resend.emails.send({
      from: `iFu Labs Hiring <${FROM_EMAIL}>`,
      to: [email],
      replyTo: FROM_EMAIL,
      subject: `iFu Labs — Complete Your Cloud Engineer Assessment`,
      html: buildInviteHtml(name)
    });

    if (error) {
      console.error(`❌ Failed to send to ${email}:`, error.message);
      return false;
    }

    console.log(`✅ Invite sent to ${name} <${email}> (id: ${data.id})`);
    return true;
  } catch (err) {
    console.error(`❌ Failed to send to ${email}:`, err.message);
    return false;
  }
}

async function main() {
  const args = process.argv.slice(2);

  if (args.length === 0) {
    console.log(`
iFu Labs — Assessment Invite Sender

Usage:
  node scripts/send-invite.js "Candidate Name" candidate@email.com
  node scripts/send-invite.js --file candidates.csv

CSV format (no header row):
  Candidate Name,candidate@email.com

Environment:
  PORTAL_URL  — Assessment portal URL (default: https://hiring.ifulabs.com)
`);
    process.exit(0);
  }

  // CSV file mode
  if (args[0] === "--file") {
    const fs = require("fs");
    const filePath = args[1];
    if (!filePath) {
      console.error("❌ Please provide a CSV file path");
      process.exit(1);
    }

    const content = fs.readFileSync(filePath, "utf-8").trim();
    const lines = content.split("\n").filter(l => l.trim());
    
    console.log(`\n📧 Sending ${lines.length} invite(s)...\n`);
    
    let sent = 0;
    let failed = 0;

    for (const line of lines) {
      const [name, email] = line.split(",").map(s => s.trim().replace(/^"|"$/g, ""));
      if (!name || !email) {
        console.error(`⚠️  Skipping invalid line: ${line}`);
        failed++;
        continue;
      }
      const ok = await sendInvite(name, email);
      if (ok) sent++;
      else failed++;

      // Small delay to avoid rate limits
      await new Promise(r => setTimeout(r, 300));
    }

    console.log(`\n📊 Done: ${sent} sent, ${failed} failed\n`);
    return;
  }

  // Single candidate mode
  const [name, email] = args;
  if (!name || !email) {
    console.error("❌ Please provide both name and email");
    console.error('   node scripts/send-invite.js "John Doe" john@example.com');
    process.exit(1);
  }

  console.log(`\n📧 Sending invite to ${name} <${email}>...\n`);
  await sendInvite(name, email);
}

main().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
