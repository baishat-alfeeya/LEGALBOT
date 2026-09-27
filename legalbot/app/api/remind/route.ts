import { NextRequest, NextResponse } from "next/server";

// Reminder API — called with a delay offset (24h or 1h)
// In a real app this would use a job queue (BullMQ, Inngest, etc.)
// For demo: sends the reminder immediately when called

export interface ReminderPayload {
  bookingId: string;
  userName: string;
  lawyerName: string;
  date: string;
  time: string;
  mode: "Online" | "Offline";
  meetingLink?: string;
  address: string;
  email: string;
  phone: string;
  reminderType: "24h" | "1h";
}

function buildReminderEmailHtml(p: ReminderPayload): string {
  const timeLabel = p.reminderType === "24h" ? "tomorrow" : "in 1 hour";
  const locationLine =
    p.mode === "Online"
      ? `<a href="${p.meetingLink}" style="color:#3b82f6">${p.meetingLink}</a>`
      : p.address;

  return `
<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#0f172a;font-family:Arial,sans-serif;color:#e2e8f0">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr><td align="center" style="padding:40px 20px">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#1e293b;border-radius:16px;overflow:hidden;border:1px solid #334155">
        <tr><td style="background:linear-gradient(135deg,#d97706,#b45309);padding:24px 32px;text-align:center">
          <h2 style="margin:0;color:#fff;font-size:20px">🔔 Appointment Reminder</h2>
          <p style="margin:6px 0 0;color:#fef3c7;font-size:13px">Your demo consultation is ${timeLabel}</p>
        </td></tr>
        <tr><td style="background:#854d0e;padding:10px 32px;text-align:center">
          <p style="margin:0;color:#fef08a;font-size:12px;font-weight:bold">⚠️ FOR DEMONSTRATION PURPOSES ONLY</p>
        </td></tr>
        <tr><td style="padding:28px 32px">
          <p style="color:#94a3b8;font-size:15px;margin:0 0 20px">Hi <b style="color:#e2e8f0">${p.userName}</b>, this is your ${p.reminderType === "24h" ? "24-hour" : "1-hour"} reminder.</p>
          <table width="100%" cellpadding="6" cellspacing="0" style="background:#0f172a;border-radius:10px;border:1px solid #334155">
            <tr><td style="color:#64748b;font-size:13px;padding:8px 16px;width:120px">Lawyer</td><td style="color:#e2e8f0;font-size:13px;padding:8px 16px;font-weight:bold">${p.lawyerName}</td></tr>
            <tr><td style="color:#64748b;font-size:13px;padding:8px 16px">Date & Time</td><td style="color:#e2e8f0;font-size:13px;padding:8px 16px"><b>${p.date}</b> at <b>${p.time}</b></td></tr>
            <tr><td style="color:#64748b;font-size:13px;padding:8px 16px">Mode</td><td style="color:${p.mode === "Online" ? "#22d3ee" : "#fb923c"};font-size:13px;padding:8px 16px;font-weight:bold">${p.mode}</td></tr>
            <tr><td style="color:#64748b;font-size:13px;padding:8px 16px">${p.mode === "Online" ? "Link" : "Address"}</td><td style="color:#e2e8f0;font-size:13px;padding:8px 16px">${locationLine}</td></tr>
          </table>
          <p style="color:#64748b;font-size:12px;margin:20px 0 0">This is a demo reminder. No real appointment exists. — LEGALBOT</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function buildReminderSms(p: ReminderPayload): string {
  const timeLabel = p.reminderType === "24h" ? "tomorrow" : "in 1 hour";
  const loc = p.mode === "Online" ? p.meetingLink : p.address;
  return `LEGALBOT REMINDER: Hi ${p.userName}, your demo consultation with ${p.lawyerName} is ${timeLabel} — ${p.date} at ${p.time} (${p.mode}). ${loc}. ID: ${p.bookingId}. DEMO ONLY.`;
}

export async function POST(req: NextRequest) {
  try {
    const payload: ReminderPayload = await req.json();

    const emailUser = process.env.EMAIL_USER;
    const emailPass = process.env.EMAIL_PASS;
    const sid   = process.env.TWILIO_ACCOUNT_SID;
    const token = process.env.TWILIO_AUTH_TOKEN;
    const from  = process.env.TWILIO_PHONE_NUMBER;

    const results = { email: false, sms: false, emailNote: "", smsNote: "" };

    // Email reminder
    if (emailUser && emailPass && !emailUser.includes("your_email")) {
      try {
        const nodemailer = await import("nodemailer");
        const transporter = nodemailer.default.createTransport({
          service: "gmail",
          auth: { user: emailUser, pass: emailPass },
        });
        await transporter.sendMail({
          from: `"LEGALBOT" <${emailUser}>`,
          to: payload.email,
          subject: `[DEMO REMINDER] ${payload.reminderType === "24h" ? "Tomorrow" : "In 1 Hour"} — ${payload.lawyerName} at ${payload.time}`,
          html: buildReminderEmailHtml(payload),
        });
        results.email = true;
        results.emailNote = `Reminder sent to ${payload.email}`;
      } catch (e: unknown) {
        results.emailNote = e instanceof Error ? e.message : "Email failed";
      }
    } else {
      results.emailNote = "Email not configured";
    }

    // SMS reminder
    if (sid && token && from && !sid.includes("your_twilio")) {
      try {
        const twilio = await import("twilio");
        const client = twilio.default(sid, token);
        await client.messages.create({
          body: buildReminderSms(payload),
          from,
          to: `+91${payload.phone}`,
        });
        results.sms = true;
        results.smsNote = `SMS sent to +91${payload.phone}`;
      } catch (e: unknown) {
        results.smsNote = e instanceof Error ? e.message : "SMS failed";
      }
    } else {
      results.smsNote = "Twilio not configured";
    }

    console.log(`[LEGALBOT] ${payload.reminderType} reminder for ${payload.bookingId} — Email: ${results.email} | SMS: ${results.sms}`);

    return NextResponse.json({ success: true, ...results, demo: true });
  } catch (err: unknown) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}
