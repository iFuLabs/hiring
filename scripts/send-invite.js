
const path = require("path");

// Resolve node_modules from the server directory
module.paths.unshift(path.join(__dirname, "../server/node_modules"));

require("dotenv").config({ path: path.join(__dirname, "../server/.env") });

const { Resend } = require("resend");

const PORTAL_URL = process.env.PORTAL_URL || "https://hiring-three-phi.vercel.app";
const FROM_EMAIL = process.env.REPLY_TO_EMAIL || "hiring@ifulabs.com";
const API_KEY = process.env.RESEND_API_KEY;

if (!API_KEY) {
  console.error("❌ RESEND_API_KEY not set in server/.env");
  process.exit(1);
}

const resend = new Resend(API_KEY);

function buildInviteHtml(name) {
  const LOGO_URL = `${PORTAL_URL}/logo-white.png`;

  return `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa; padding: 20px;">
      <div style="background-color: #1a1a2e; color: #ffffff; padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
        <img src="${LOGO_URL}" alt="iFu Labs" height="40" style="height: 40px; width: auto; margin-bottom: 8px;" />
        <p style="margin: 0; color: #cccccc; font-size: 14px;">Cloud Engineering Team</p>
      </div>
      
      <div style="background-color: #ffffff; padding: 30px; border-radius: 0 0 12px 12px;">
        <p style="font-size: 16px; color: #1a1a2e; margin: 0 0 16px;">Hi <strong>${name}</strong>,</p>
        
        <p style="color: #4a4a4a; line-height: 1.7; margin: 0 0 16px;">
          Thank you for your interest in the <strong>Junior Cloud Engineer</strong> position at iFu Labs. 
          As part of our hiring process, we'd like you to complete a short technical assessment.
        </p>

        <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin: 24px 0;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 6px 0; color: #6c757d;">Assessment:</td><td style="padding: 6px 0; font-weight: 600; color: #1a1a2e;">AWS Cloud Practitioner Level</td></tr>
            <tr><td style="padding: 6px 0; color: #6c757d;">Questions:</td><td style="padding: 6px 0; font-weight: 600; color: #1a1a2e;">20 (MCQ + Scenario-based)</td></tr>
            <tr><td style="padding: 6px 0; color: #6c757d;">Duration:</td><td style="padding: 6px 0; font-weight: 600; color: #1a1a2e;">30 minutes</td></tr>
            <tr><td style="padding: 6px 0; color: #6c757d;">Camera:</td><td style="padding: 6px 0; font-weight: 600; color: #1a1a2e;">Required (webcam monitoring)</td></tr>
          </table>
        </div>

        <div style="text-align: center; margin: 28px 0;">
          <table cellpadding="0" cellspacing="0" border="0" style="margin: 0 auto;">
            <tr>
              <td align="center" bgcolor="#1a1a2e" style="border-radius: 8px;">
                <a href="${PORTAL_URL}" target="_blank" style="display: inline-block; padding: 14px 40px; color: #ffffff; text-decoration: none; font-weight: 600; font-size: 16px; font-family: 'Segoe UI', Arial, sans-serif;">Start Assessment &#8594;</a>
              </td>
            </tr>
          </table>
        </div>

        <div style="background-color: #fff8e1; border-left: 4px solid #f39c12; padding: 14px 18px; margin: 24px 0;">
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
          <p style="margin: 0;">iFu Labs &bull; Cloud Engineering Team</p>
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
  PORTAL_URL  — Assessment portal URL (default: https://hiring-three-phi.vercel.app)
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
