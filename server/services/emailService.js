const { Resend } = require("resend");

let resend = null;

function getClient() {
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

/**
 * Send assessment results email to admin (full details + candidate screenshot)
 */
async function sendAdminEmail(submission) {
  const adminEmail = process.env.ADMIN_EMAIL;

  if (!adminEmail) return { sent: false, reason: "ADMIN_EMAIL not set" };

  const { candidate, result, timing, monitoring } = submission;
  const timeTaken = formatTime(timing.timeTakenSeconds);
  const bandEmoji = getBandEmoji(result.band);

  const screenshotHtml = monitoring.screenshot
    ? `
        <h2 style="color: #1a1a2e; border-bottom: 2px solid #e9ecef; padding-bottom: 10px;">Candidate Photo</h2>
        <div style="text-align: center; margin-bottom: 20px;">
          <img src="cid:candidate-photo" alt="Candidate webcam capture" style="width: 320px; height: auto; border-radius: 8px; border: 2px solid #e9ecef;" />
          <p style="color: #adb5bd; font-size: 12px; margin-top: 8px;">Captured at time of submission</p>
        </div>`
    : `
        <div style="background-color: #fff3cd; padding: 12px 16px; border-radius: 8px; margin-bottom: 20px; font-size: 14px; color: #856404;">
          ⚠️ No webcam screenshot available
        </div>`;

  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa; padding: 20px;">
      <div style="background-color: #1a1a2e; color: #ffffff; padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="margin: 0; font-size: 24px; color: #ffffff;">iFu Labs Assessment Results</h1>
        <p style="margin: 8px 0 0; color: #cccccc; font-size: 14px;">Junior Cloud Engineer Position</p>
      </div>
      
      <div style="background-color: #ffffff; padding: 30px; border-radius: 0 0 12px 12px;">
        <h2 style="color: #1a1a2e; border-bottom: 2px solid #e9ecef; padding-bottom: 10px;">Candidate Information</h2>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr><td style="padding: 8px 0; color: #6c757d; width: 140px;">Name:</td><td style="padding: 8px 0; font-weight: 600; color: #1a1a2e;">${candidate.fullName}</td></tr>
          <tr><td style="padding: 8px 0; color: #6c757d;">Email:</td><td style="padding: 8px 0; color: #1a1a2e;">${candidate.email}</td></tr>
          ${candidate.phone ? `<tr><td style="padding: 8px 0; color: #6c757d;">Phone:</td><td style="padding: 8px 0; color: #1a1a2e;">${candidate.phone}</td></tr>` : ""}
        </table>

        ${screenshotHtml}

        <h2 style="color: #1a1a2e; border-bottom: 2px solid #e9ecef; padding-bottom: 10px;">Results</h2>
        <div style="text-align: center; padding: 20px; background-color: #f8f9fa; border-radius: 8px; margin-bottom: 20px;">
          <div style="font-size: 48px; font-weight: 700; color: #1a1a2e;">${result.score}/${result.totalQuestions}</div>
          <div style="font-size: 24px; color: #6c757d;">${result.percentage}%</div>
          <div style="font-size: 18px; margin-top: 8px;">${bandEmoji} ${result.band}</div>
        </div>

        <h2 style="color: #1a1a2e; border-bottom: 2px solid #e9ecef; padding-bottom: 10px;">Monitoring</h2>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr><td style="padding: 8px 0; color: #6c757d; width: 140px;">Time Taken:</td><td style="padding: 8px 0; color: #1a1a2e;">${timeTaken}</td></tr>
          <tr><td style="padding: 8px 0; color: #6c757d;">Camera Access:</td><td style="padding: 8px 0; color: #1a1a2e;">${monitoring.cameraAllowed ? "✅ Allowed" : "❌ Denied"}</td></tr>
          <tr><td style="padding: 8px 0; color: #6c757d;">Tab Switches:</td><td style="padding: 8px 0; color: #1a1a2e;">${monitoring.tabSwitchCount}${monitoring.tabSwitchCount > 3 ? " ⚠️" : ""}</td></tr>
        </table>

        <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e9ecef; color: #adb5bd; font-size: 12px;">
          <p style="margin: 0;">iFu Labs Assessment Portal &bull; ${new Date().toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  `;

  // Build attachments array if screenshot exists
  const attachments = [];
  if (monitoring.screenshot) {
    const base64Data = monitoring.screenshot.replace(/^data:image\/\w+;base64,/, "");
    attachments.push({
      filename: `${candidate.fullName.replace(/\s+/g, "-").toLowerCase()}-photo.jpg`,
      content: Buffer.from(base64Data, "base64"),
      content_id: "candidate-photo"
    });
  }

  return sendEmail({
    to: [adminEmail],
    replyTo: candidate.email,
    subject: `Assessment Result: ${candidate.fullName} — ${result.score}/${result.totalQuestions} (${result.band})`,
    html,
    attachments
  });
}

/**
 * Send confirmation email to the candidate — no scores, just acknowledgment
 */
async function sendCandidateEmail(submission) {
  const replyTo = process.env.REPLY_TO_EMAIL;
  const { candidate, timing } = submission;

  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa; padding: 20px;">
      <div style="background-color: #1a1a2e; color: #ffffff; padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="margin: 0; font-size: 24px; color: #ffffff;">iFu Labs</h1>
        <p style="margin: 8px 0 0; color: #cccccc; font-size: 14px;">Assessment Confirmation</p>
      </div>
      
      <div style="background-color: #ffffff; padding: 30px; border-radius: 0 0 12px 12px;">
        <p style="font-size: 16px; color: #1a1a2e; margin-bottom: 20px;">Hi <strong>${candidate.fullName}</strong>,</p>
        
        <p style="color: #4a4a4a; line-height: 1.6;">
          Thank you for completing the <strong>Junior Cloud Engineer Assessment</strong>. 
          Your responses have been successfully submitted and recorded.
        </p>

        <table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
          <tr><td style="padding: 8px 0; color: #6c757d; width: 140px;">Submitted:</td><td style="padding: 8px 0; font-weight: 500; color: #1a1a2e;">${new Date(timing.submittedAt).toLocaleString()}</td></tr>
          <tr><td style="padding: 8px 0; color: #6c757d;">Status:</td><td style="padding: 8px 0; font-weight: 500; color: #1a1a2e;">✅ Received</td></tr>
        </table>

        <div style="background-color: #eef2ff; border-left: 4px solid #1a1a2e; padding: 16px 20px; margin-bottom: 24px;">
          <p style="margin: 0; font-weight: 600; color: #1a1a2e;">What happens next?</p>
          <p style="margin: 8px 0 0; color: #4a4a4a; line-height: 1.6;">
            Our hiring team will review your assessment. If you are shortlisted for the next stage, 
            we will reach out to you within <strong>5 business days</strong> via email.
          </p>
        </div>

        <p style="color: #6c757d; font-size: 14px; line-height: 1.6;">
          If you have any questions, feel free to reply to this email.
        </p>

        <div style="text-align: center; padding-top: 24px; border-top: 1px solid #e9ecef; color: #adb5bd; font-size: 12px;">
          <p style="margin: 0;">iFu Labs &bull; Cloud Engineering Team</p>
          <p style="margin: 4px 0 0;">${replyTo || ""}</p>
        </div>
      </div>
    </div>
  `;

  return sendEmail({
    to: [candidate.email],
    replyTo: replyTo || undefined,
    subject: "iFu Labs — Assessment Received",
    html
  });
}

/**
 * Send both admin and candidate emails
 */
async function sendResultsEmail(submission) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not configured. Skipping email notifications.");
    return { admin: { sent: false }, candidate: { sent: false } };
  }

  const [admin, candidate] = await Promise.allSettled([
    sendAdminEmail(submission),
    sendCandidateEmail(submission)
  ]);

  return {
    admin: admin.status === "fulfilled" ? admin.value : { sent: false, reason: admin.reason?.message },
    candidate: candidate.status === "fulfilled" ? candidate.value : { sent: false, reason: candidate.reason?.message }
  };
}

// ─── Helpers ───

async function sendEmail({ to, replyTo, subject, html, attachments }) {
  const fromAddress = process.env.REPLY_TO_EMAIL || "onboarding@resend.dev";

  const payload = {
    from: `iFu Labs Hiring <${fromAddress}>`,
    to,
    replyTo: replyTo || undefined,
    subject,
    html
  };

  if (attachments && attachments.length > 0) {
    payload.attachments = attachments;
  }

  try {
    const { data, error } = await getClient().emails.send(payload);

    if (error) {
      console.error("Resend error:", error);
      return { sent: false, reason: error.message };
    }

    console.log(`Email sent to ${to.join(", ")} (id: ${data.id})`);
    return { sent: true, id: data.id };
  } catch (error) {
    console.error("Failed to send email:", error.message);
    return { sent: false, reason: error.message };
  }
}

function getBandEmoji(band) {
  if (band === "Strong") return "🟢";
  if (band.includes("Average") || band.includes("متوسط")) return "🟡";
  return "🔴";
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
}

module.exports = { sendResultsEmail };
