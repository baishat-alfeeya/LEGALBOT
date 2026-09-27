// ─────────────────────────────────────────────────────────────────────────────
// LEGALBOT — Notification Service
// Calls server-side API routes which use Twilio (SMS) + Nodemailer (Email)
// All bookings are FOR DEMONSTRATION PURPOSES ONLY
// ─────────────────────────────────────────────────────────────────────────────

export interface BookingDetails {
  bookingId: string;
  lawyerName: string;
  specialization: string;
  city: string;
  address: string;
  date: string;
  time: string;
  mode: "Online" | "Offline";
  meetingLink?: string;
  userName: string;
  email: string;
  phone: string;
}

export interface NotificationResult {
  success: boolean;
  email: { sent: boolean; note: string };
  sms:   { sent: boolean; note: string };
  demo:  boolean;
  disclaimer: string;
  simulatedEmailContent: string;
  simulatedSmsContent: string;
  error?: string;
}

// ─── Local storage helpers ────────────────────────────────────────────────────
export function storeBooking(booking: BookingDetails): void {
  if (typeof window === "undefined") return;
  try {
    const existing: BookingDetails[] = JSON.parse(
      localStorage.getItem("legalbot_bookings") || "[]"
    );
    existing.push(booking);
    localStorage.setItem("legalbot_bookings", JSON.stringify(existing));
  } catch { /* ignore */ }
}

export function getStoredBookings(): BookingDetails[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem("legalbot_bookings") || "[]");
  } catch {
    return [];
  }
}

// ─── ID & link generators ─────────────────────────────────────────────────────
export function generateBookingId(): string {
  return "LB" + Date.now().toString(36).toUpperCase() +
    Math.random().toString(36).substr(2, 4).toUpperCase();
}

export function generateMeetingLink(bookingId: string): string {
  return `https://meet.legalbot.demo/room/${bookingId.toLowerCase()}`;
}

// ─── Build simulated content (used for display in UI even without real sending) ─
function buildSimulatedEmail(booking: BookingDetails): string {
  return `[DEMO EMAIL — Not actually sent]
To: ${booking.email}
Subject: Booking Confirmed — ${booking.lawyerName} | ${booking.date} at ${booking.time}

Dear ${booking.userName},

Your demo consultation has been scheduled.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
APPOINTMENT DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Booking ID    : ${booking.bookingId}
Lawyer        : ${booking.lawyerName}
Specialization: ${booking.specialization}
Date & Time   : ${booking.date} at ${booking.time}
Mode          : ${booking.mode}
${booking.mode === "Online" ? `Meeting Link  : ${booking.meetingLink}` : `Address       : ${booking.address}`}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Reminders scheduled: 24h before & 1h before.

⚠️ FOR DEMONSTRATION PURPOSES ONLY
— LEGALBOT Team`.trim();
}

function buildSimulatedSms(booking: BookingDetails): string {
  return `[DEMO SMS] LEGALBOT: Hi ${booking.userName}, your demo consultation with ${booking.lawyerName} (${booking.specialization}) is on ${booking.date} at ${booking.time}. Mode: ${booking.mode}. Booking ID: ${booking.bookingId}. DEMO ONLY.`;
}

// ─── Send confirmation (calls /api/notify) ────────────────────────────────────
export async function sendMockConfirmation(
  booking: BookingDetails
): Promise<NotificationResult> {
  const simulatedEmailContent = buildSimulatedEmail(booking);
  const simulatedSmsContent   = buildSimulatedSms(booking);

  try {
    const res = await fetch("/api/notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        bookingId:      booking.bookingId,
        userName:       booking.userName,
        lawyerName:     booking.lawyerName,
        specialization: booking.specialization,
        date:           booking.date,
        time:           booking.time,
        mode:           booking.mode,
        address:        booking.address,
        meetingLink:    booking.meetingLink,
        email:          booking.email,
        phone:          booking.phone,
      }),
    });

    const data = res.ok ? await res.json() : { success: false, error: "Request failed" };

    return {
      ...data,
      simulatedEmailContent,
      simulatedSmsContent,
      demo: true,
      disclaimer: "This is a demo booking. No real appointment is scheduled.",
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn("[LEGALBOT] /api/notify unreachable, console simulation:", msg);
    console.log("[LEGALBOT DEMO] Email preview:\n", simulatedEmailContent);
    console.log("[LEGALBOT DEMO] SMS preview:", simulatedSmsContent);
    return {
      success: true,
      email: { sent: false, note: "Simulated — API unreachable. Check console." },
      sms:   { sent: false, note: "Simulated — API unreachable. Check console." },
      demo: true,
      disclaimer: "This is a demo booking. No real appointment is scheduled.",
      simulatedEmailContent,
      simulatedSmsContent,
    };
  }
}

// ─── Send reminders (calls /api/remind) ──────────────────────────────────────
export async function sendMockReminders(
  booking: BookingDetails
): Promise<{ reminder24h: string; reminder1h: string }> {
  const base = {
    bookingId:   booking.bookingId,
    userName:    booking.userName,
    lawyerName:  booking.lawyerName,
    date:        booking.date,
    time:        booking.time,
    mode:        booking.mode,
    meetingLink: booking.meetingLink,
    address:     booking.address,
    email:       booking.email,
    phone:       booking.phone,
  };

  // Fire-and-forget — reminders are best-effort in demo mode
  const send = (type: "24h" | "1h") =>
    fetch("/api/remind", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...base, reminderType: type }),
    }).catch((e) => console.warn("[LEGALBOT] Reminder API error:", e));

  send("24h");
  send("1h");

  return {
    reminder24h: `Demo 24h reminder queued for ${booking.email} / +91${booking.phone}`,
    reminder1h:  `Demo 1h reminder queued for ${booking.email} / +91${booking.phone}`,
  };
}

// ─── Calendar ICS export ──────────────────────────────────────────────────────
export function generateCalendarEvent(booking: BookingDetails): string {
  const parseDate = (dateStr: string, timeStr: string): Date => {
    // dateStr: "Mon, 15 Jul" — timeStr: "10:00 AM"
    const months: Record<string, number> = {
      Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,
      Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11
    };
    const parts = dateStr.replace(/^[A-Za-z]+,\s*/, "").split(" ");
    const day   = parseInt(parts[0]);
    const month = months[parts[1]] ?? new Date().getMonth();
    const year  = new Date().getFullYear();
    const [timePart, ampm] = timeStr.split(" ");
    let [hours, minutes]   = timePart.split(":").map(Number);
    if (ampm === "PM" && hours !== 12) hours += 12;
    if (ampm === "AM" && hours === 12) hours = 0;
    return new Date(year, month, day, hours, minutes);
  };

  const pad = (n: number) => String(n).padStart(2, "0");
  const fmt = (d: Date) =>
    `${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;

  const start = parseDate(booking.date, booking.time);
  const end   = new Date(start.getTime() + 60 * 60 * 1000);

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//LEGALBOT//Demo//EN",
    "BEGIN:VEVENT",
    `UID:${booking.bookingId}@legalbot.demo`,
    `DTSTAMP:${fmt(new Date())}`,
    `DTSTART:${fmt(start)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:[DEMO] Consultation with ${booking.lawyerName}`,
    `DESCRIPTION:LEGALBOT Demo Booking\\nID: ${booking.bookingId}\\nSpecialization: ${booking.specialization}\\nMode: ${booking.mode}\\n\\nFOR DEMONSTRATION PURPOSES ONLY`,
    `LOCATION:${booking.mode === "Online" ? (booking.meetingLink || "Online") : booking.address}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

// Legacy compat shim
export function sendMockNotification(data: {
  email: string; phone: string; message: string; bookingId: string;
}): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log("[LEGALBOT DEMO] Notification:", data.bookingId, "→", data.email);
      resolve();
    }, 500);
  });
}
