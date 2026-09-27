import { NextRequest, NextResponse } from "next/server";

// ─── Types ────────────────────────────────────────────────────────────────────
export interface NotifyPayload {
  bookingId: string;
  userName: string;
  lawyerName: string;
  specialization: string;
  date: string;
  time: string;
  mode: "Online" | "Offline";
  address: string;
  meetingLink?: string;
  email: string;
  phone: string; // 10-digit Indian number, no country code
}

// ─── Email HTML template ──────────────────────────────────────────────────────
function buildEmailHtml(p: NotifyPayload): string {
  const locationLine =
    p.mode === "Online"
      ? `<b>Meeting Link:</b> <a href="${p.meetingLink}" style="color:#3b82f6">${p.meetingLink}</a>`
      : `<b>Office Address:</b> ${p.address}`;

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>LEGALBOT Demo Booking</title></head>
<body style="margin:0;padding:0;background:#0f172a;font-family:Arial,sans-serif;color:#e2e8f0">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:40px 20px">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#1e293b;border-radius:16px;overflow:hidden;border:1px solid #334155">

        <!-- Header -->
        <tr><td style="background:linear-gradient(135deg,#2563eb,#7c3aed);padding:32px;text-align:center">
          <h1 style="margin:0;color:#fff;font-size:28px;letter-spacing:2px">⚖️ LEGALBOT</h1>
          <p style="margin:8px 0 0;color:#bfdbfe;font-size:14px">AI-Powered Legal Assistance</p>
        </td></tr>

        <!-- Demo banner -->
        <tr><td style="background:#854d0e;padding:12px 32px;text-align:center">
          <p style="margin:0;color:#fef08a;font-size:13px;font-weight:bold">
            ⚠️ FOR DEMONSTRATION PURPOSES ONLY — No real appointment is scheduled
          </p>
        </td></tr>

        <!-- Body -->
        <tr><td style="padding:32px">
          <p style="font-size:16px;color:#94a3b8;margin:0 0 8px">Dear <b style="color:#e2e8f0">${p.userName}</b>,</p>
          <p style="font-size:15px;color:#94a3b8;margin:0 0 24px">
            Your demo consultation has been confirmed. Here are your appointment details:
          </p>

          <!-- Details card -->
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;border-radius:12px;border:1px solid #334155;margin-bottom:24px">
            <tr><td style="padding:20px">
              <table width="100%" cellpadding="6" cellspacing="0">
                <tr>
                  <td style="color:#64748b;font-size:13px;width:140px">Booking ID</td>
                  <td style="color:#e2e8f0;font-size:13px;font-family:monospace;font-weight:bold">${p.bookingId}</td>
                </tr>
                <tr>
                  <td style="color:#64748b;font-size:13px">Lawyer</td>
                  <td style="color:#e2e8f0;font-size:13px;font-weight:bold">${p.lawyerName}</td>
                </tr>
                <tr>
                  <td style="color:#64748b;font-size:13px">Specialization</td>
                  <td style="color:#e2e8f0;font-size:13px">${p.specialization}</td>
                </tr>
                <tr>
                  <td style="color:#64748b;font-size:13px">Date &amp; Time</td>
                  <td style="color:#e2e8f0;font-size:13px"><b>${p.date}</b> at <b>${p.time}</b></td>
                </tr>
                <tr>
                  <td style="color:#64748b;font-size:13px">Mode</td>
                  <td style="color:${p.mode === "Online" ? "#22d3ee" : "#fb923c"};font-size:13px;font-weight:bold">${p.mode}</td>
                </tr>
                <tr>
                  <td style="color:#64748b;font-size:13px">${p.mode === "Online" ? "Meeting Link" : "Address"}</td>
                  <td style="color:#e2e8f0;font-size:13px">${p.mode === "Online" ? `<a href="${p.meetingLink}" style="color:#3b82f6">${p.meetingLink}</a>` : p.address}</td>
                </tr>
              </table>
            </td></tr>
          </table>

          <!-- Reminders note -->
          <div style="background:#1e3a5f;border:1px solid #1d4ed8;border-radius:10px;padding:16px;margin-bottom:24px">
            <p style="margin:0;color:#93c5fd;font-size:13px">
              🔔 <b>Demo Reminders Scheduled:</b><br>
              • 24 hours before your appointment<br>
              • 1 hour before your appointment
            </p>
          </div>

          <p style="color:#64748b;font-size:12px;margin:0">
            This is a simulated appointment for demonstration purposes only.
            No real lawyer has been contacted and no actual meeting will take place.
          </p>
        </td></tr>

        <!-- Footer -->
        <tr><td style="background:#0f172a;padding:20px 32px;text-align:center;border-top:1px solid #334155">
          <p style="margin:0;color:#475569;font-size:12px">
            © 2024 LEGALBOT — AI-Powered Legal Assistance for Every Indian<br>
            This email was sent as part of a demo. No real services are provided.
          </p>
        </td></tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function buildEmailText(p: NotifyPayload): string {
  return `
LEGALBOT — Demo Appointment Confirmation
⚠️ FOR DEMONSTRATION PURPOSES ONLY

Dear ${p.userName},

Your demo consultation has been confirmed.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
APPOINTMENT DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Booking ID    : ${p.bookingId}
Lawyer        : ${p.lawyerName}
Specialization: ${p.specialization}
Date & Time   : ${p.date} at ${p.time}
Mode          : ${p.mode}
${p.mode === "Online" ? `Meeting Link  : ${p.meetingLink}` : `Address       : ${p.address}`}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Demo reminders will be sent:
• 24 hours before your appointment
• 1 hour before your appointment

This is a simulated appointment for demonstration purposes only.
No real lawyer has been contacted.

— LEGALBOT Team
`.trim();
}

function buildSmsText(p: NotifyPayload): string {
  const location =
    p.mode === "Online" ? `Link: ${p.meetingLink}` : `Address: ${p.address}`;
  return `LEGALBOT DEMO: Hi ${p.userName}, your demo consultation with ${p.lawyerName} (${p.specialization}) is on ${p.date} at ${p.time}. Mode: ${p.mode}. ${location}. Booking ID: ${p.bookingId}. FOR DEMO PURPOSES ONLY.`;
}

// ─── Send Email via Nodemailer ────────────────────────────────────────────────
async function sendEmail(p: NotifyPayload): Promise<{ success: boolean; error?: string }> {
  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (!emailUser || !emailPass || emailUser.includes("your_email")) {
    return { success: false, error: "Email credentials not configured in .env.local" };
  }

  try {
    // Dynamic import so build doesn't fail if nodemailer isn't installed yet
    const nodemailer = await import("nodemailer");
    const transporter = nodemailer.default.createTransport({
      service: "gmail",
      auth: { user: emailUser, pass: emailPass },
    });

    await transporter.sendMail({
      from: `"LEGALBOT" <${emailUser}>`,
      to: p.email,
      subject: `[DEMO] Booking Confirmed — ${p.lawyerName} | ${p.date} at ${p.time}`,
      text: buildEmailText(p),
      html: buildEmailHtml(p),
    });

    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, error: msg };
  }
}

// ─── Send SMS via Twilio ──────────────────────────────────────────────────────
async function sendSms(p: NotifyPayload): Promise<{ success: boolean; error?: string }> {
  const sid   = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from  = process.env.TWILIO_PHONE_NUMBER;

  if (!sid || !token || !from || sid.includes("your_twilio")) {
    return { success: false, error: "Twilio credentials not configured in .env.local" };
  }

  try {
    const twilio = await import("twilio");
    const client = twilio.default(sid, token);
    await client.messages.create({
      body: buildSmsText(p),
      from,
      to: `+91${p.phone}`,
    });
    return { success: true };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    return { success: false, error: msg };
  }
}

// ─── POST /api/notify ─────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const payload: NotifyPayload = await req.json();

    // Basic server-side validation
    if (!payload.email || !payload.phone || !payload.bookingId) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
      return NextResponse.json(
        { success: false, error: "Invalid email address" },
        { status: 400 }
      );
    }
    if (!/^[6-9]\d{9}$/.test(payload.phone)) {
      return NextResponse.json(
        { success: false, error: "Invalid Indian mobile number" },
        { status: 400 }
      );
    }

    // Send both in parallel
    const [emailResult, smsResult] = await Promise.all([
      sendEmail(payload),
      sendSms(payload),
    ]);

    // Log results server-side (never expose credentials to client)
    console.log(`[LEGALBOT] Booking ${payload.bookingId} — Email: ${emailResult.success ? "✓ sent" : "✗ " + emailResult.error} | SMS: ${smsResult.success ? "✓ sent" : "✗ " + smsResult.error}`);

    return NextResponse.json({
      success: true,
      email: {
        sent: emailResult.success,
        // Only expose error message if credentials are simply not configured (not auth failures)
        note: emailResult.success
          ? `Confirmation sent to ${payload.email}`
          : emailResult.error?.includes("not configured")
            ? "Email not configured — add EMAIL_USER and EMAIL_PASS to .env.local"
            : "Email delivery failed — check server logs",
      },
      sms: {
        sent: smsResult.success,
        note: smsResult.success
          ? `SMS sent to +91${payload.phone}`
          : smsResult.error?.includes("not configured")
            ? "SMS not configured — add Twilio credentials to .env.local"
            : "SMS delivery failed — check server logs",
      },
      demo: true,
      disclaimer: "This is a demo booking. No real appointment is scheduled.",
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Internal server error";
    console.error("[LEGALBOT] /api/notify error:", msg);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
