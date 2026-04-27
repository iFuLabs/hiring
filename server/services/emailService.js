const { Resend } = require("resend");

let resend = null;

function getClient() {
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

/**
 * Send assessment results email to admin (full details + monitoring info)
 */
async function sendAdminEmail(submission) {
  const adminEmail = process.env.ADMIN_EMAIL;
  const replyTo = process.env.REPLY_TO_EMAIL;

  if (!adminEmail) return { sent: false, reason: "ADMIN_EMAIL not set" };

  const { candidate, result, timing, monitoring } = submission;
  const timeTaken = formatTime(timing.timeTakenSeconds);
  const bandEmoji = getBandEmoji(result.band);

  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa; padding: 20px;">
      <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="margin: 0; font-size: 24px;">iFu Labs Assessment Results</h1>
        <p style="margin: 8px 0 0; opacity: 0.8;">Junior Cloud Engineer Position</p>
      </div>
      
      <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <h2 style="color: #1a1a2e; border-bottom: 2px solid #e9ecef; padding-bottom: 10px;">Candidate Information</h2>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr><td style="padding: 8px 0; color: #6c757d; width: 140px;">Name:</td><td style="padding: 8px 0; font-weight: 600;">${candidate.fullName}</td></tr>
          <tr><td style="padding: 8px 0; color: #6c757d;">Email:</td><td style="padding: 8px 0;">${candidate.email}</td></tr>
          ${candidate.phone ? `<tr><td style="padding: 8px 0; color: #6c757d;">Phone:</td><td style="padding: 8px 0;">${candidate.phone}</td></tr>` : ""}
        </table>

        <h2 style="color: #1a1a2e; border-bottom: 2px solid #e9ecef; padding-bottom: 10px;">Results</h2>
        <div style="text-align: center; padding: 20px; background: #f8f9fa; border-radius: 8px; margin-bottom: 20px;">
          <div style="font-size: 48px; font-weight: 700; color: #1a1a2e;">${result.score}/${result.totalQuestions}</div>
          <div style="font-size: 24px; color: #6c757d;">${result.percentage}%</div>
          <div style="font-size: 18px; margin-top: 8px;">${bandEmoji} ${result.band}</div>
        </div>

        <h2 style="color: #1a1a2e; border-bottom: 2px solid #e9ecef; padding-bottom: 10px;">Monitoring</h2>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr><td style="padding: 8px 0; color: #6c757d; width: 140px;">Time Taken:</td><td style="padding: 8px 0;">${timeTaken}</td></tr>
          <tr><td style="padding: 8px 0; color: #6c757d;">Camera Access:</td><td style="padding: 8px 0;">${monitoring.cameraAllowed ? "✅ Allowed" : "❌ Denied"}</td></tr>
          <tr><td style="padding: 8px 0; color: #6c757d;">Tab Switches:</td><td style="padding: 8px 0;">${monitoring.tabSwitchCount}${monitoring.tabSwitchCount > 3 ? " ⚠️" : ""}</td></tr>
        </table>

        <div style="text-align: center; padding-top: 20px; border-top: 1px solid #e9ecef; color: #adb5bd; font-size: 12px;">
          <p>iFu Labs Assessment Portal • ${new Date().toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  `;

  return sendEmail({
    to: [adminEmail],
    replyTo: candidate.email,
    subject: `Assessment Result: ${candidate.fullName} — ${result.score}/${result.totalQuestions} (${result.band})`,
    html
  });
}

/**
 * Send confirmation email to the candidate with their score and next steps
 */
async function sendCandidateEmail(submission) {
  const replyTo = process.env.REPLY_TO_EMAIL;
  const { candidate, result, timing } = submission;
  const timeTaken = formatTime(timing.timeTakenSeconds);
  const bandEmoji = getBandEmoji(result.band);

  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f8f9fa; padding: 20px;">
      <div style="background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); color: white; padding: 30px; border-radius: 12px 12px 0 0; text-align: center;">
        <h1 style="margin: 0; font-size: 24px;">iFu Labs</h1>
        <p style="margin: 8px 0 0; opacity: 0.8;">Assessment Confirmation</p>
      </div>
      
      <div style="background: white; padding: 30px; border-radius: 0 0 12px 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <p style="font-size: 16px; margin-bottom: 20px;">Hi <strong>${candidate.fullName}</strong>,</p>
        
        <p style="color: #4a4a4a; line-height: 1.6;">
          Thank you for completing the <strong>Junior Cloud Engineer Assessment</strong>. 
          Here is a summary of your results:
        </p>

        <div style="text-align: center; padding: 24px; background: #f8f9fa; border-radius: 8px; margin: 24px 0;">
          <div style="font-size: 48px; font-weight: 700; color: #1a1a2e;">${result.score}/${result.totalQuestions}</div>
          <div style="font-size: 22px; color: #6c757d; margin-top: 4px;">${result.percentage}%</div>
          <div style="font-size: 18px; margin-top: 8px;">${bandEmoji} ${result.band}</div>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 24px;">
          <tr><td style="padding: 8px 0; color: #6c757d; width: 140px;">Time Taken:</td><td style="padding: 8px 0; font-weight: 500;">${timeTaken}</td></tr>
          <tr><td style="padding: 8px 0; color: #6c757d;">Submitted:</td><td style="padding: 8px 0; font-weight: 500;">${new Date(timing.submittedAt).toLocaleString()}</td></tr>
        </table>

        <div style="background: #eef2ff; border-left: 4px solid #1a1a2e; padding: 16px 20px; border-radius: 0 8px 8px 0; margin-bottom: 24px;">
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
          <p style="margin: 0;">iFu Labs • Cloud Engineering Team</p>
          <p style="margin: 4px 0 0;">${replyTo || ""}</p>
        </div>
      </div>
    </div>
  `;

  return sendEmail({
    to: [candidate.email],
    replyTo: replyTo || undefined,
    subject: `Your iFu Labs Assessment Results — ${result.score}/${result.totalQuestions}`,
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

async function sendEmail({ to, replyTo, subject, html }) {
  const fromAddress = process.env.REPLY_TO_EMAIL || "onboarding@resend.dev";

  try {
    const { data, error } = await getClient().emails.send({
      from: `iFu Labs Hiring <${fromAddress}>`,
      to,
      replyTo: replyTo || undefined,
      subject,
      html
    });

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
