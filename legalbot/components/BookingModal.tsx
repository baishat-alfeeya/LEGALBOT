"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X, Calendar, Clock, CheckCircle, Loader2, Mail, Phone, User,
  Wifi, Building2, MapPin, ExternalLink, Bell, Copy, Download,
  AlertTriangle, Info, Navigation, Video, CalendarPlus
} from "lucide-react";
import { generateSchedule } from "@/lib/timeSlots";
import {
  generateBookingId, generateMeetingLink, sendMockConfirmation,
  sendMockReminders, generateCalendarEvent, storeBooking,
  type BookingDetails, type NotificationResult
} from "@/lib/mockNotification";
import type { Lawyer } from "@/lib/lawyers";
import { useAuth } from "@/context/AuthContext";

interface Props {
  lawyer: Lawyer;
  onClose: () => void;
  onConfirm: (bookingId: string) => void;
}

type BookingStep = "schedule" | "details" | "confirming" | "confirmed";

export default function BookingModal({ lawyer, onClose, onConfirm }: Props) {
  const schedule = generateSchedule(lawyer.id);
  const { user, addNotification } = useAuth();
  const [step, setStep] = useState<BookingStep>("schedule");
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);
  const [selectedSlotTime, setSelectedSlotTime] = useState("");
  const [consultMode, setConsultMode] = useState<"Online" | "Offline">(
    lawyer.mode === "Offline" ? "Offline" : "Online"
  );
  const [form, setForm] = useState({ name: "", email: "", phone: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [booking, setBooking] = useState<BookingDetails | null>(null);
  const [notifResult, setNotifResult] = useState<NotificationResult | null>(null);
  const [reminders, setReminders] = useState<{ reminder24h: string; reminder1h: string } | null>(null);
  const [showNotifLog, setShowNotifLog] = useState(false);
  const [showMap, setShowMap] = useState(false);
  const [copied, setCopied] = useState(false);
  const [confirmingStep, setConfirmingStep] = useState(0);

  const selectedDayData = schedule.find((d) => d.date === selectedDay);

  const validateForm = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Full name is required";
    if (!form.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = "Valid email address required";
    if (!form.phone.match(/^[6-9]\d{9}$/)) e.phone = "Valid 10-digit Indian mobile number required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleConfirm = async () => {
    if (!validateForm()) return;
    setStep("confirming");
    setConfirmingStep(0);

    const id = generateBookingId();
    const meetingLink = generateMeetingLink(id);

    const bookingData: BookingDetails = {
      bookingId: id,
      lawyerName: lawyer.name,
      specialization: lawyer.specialization,
      city: lawyer.city,
      address: lawyer.address,
      date: selectedDayData?.label || "",
      time: selectedSlotTime,
      mode: consultMode,
      meetingLink: consultMode === "Online" ? meetingLink : undefined,
      userName: form.name,
      email: form.email,
      phone: form.phone,
    };

    setConfirmingStep(1);
    await new Promise((r) => setTimeout(r, 600));
    setConfirmingStep(2);

    const [notif, rem] = await Promise.all([
      sendMockConfirmation(bookingData),
      sendMockReminders(bookingData),
    ]);

    setConfirmingStep(3);
    await new Promise((r) => setTimeout(r, 400));

    storeBooking(bookingData);
    setBooking(bookingData);
    setNotifResult(notif);
    setReminders(rem);

    // ── Push in-app notification for logged-in users ──────────────────────
    if (addNotification) {
      addNotification({
        type: "booking",
        title: "Demo Booking Confirmed!",
        message: `Your consultation with ${bookingData.lawyerName} (${bookingData.specialization}) is scheduled for ${bookingData.date} at ${bookingData.time}. Booking ID: ${id}`,
        link: "/bookings",
      });
      // Schedule reminder notifications (shown immediately in demo)
      setTimeout(() => {
        addNotification({
          type: "reminder",
          title: "Upcoming Appointment Reminder",
          message: `Reminder: Your demo consultation with ${bookingData.lawyerName} is on ${bookingData.date} at ${bookingData.time}. ${bookingData.mode === "Online" ? "Join via meeting link." : `Location: ${bookingData.address}`}`,
          link: "/bookings",
        });
      }, 3000); // show reminder 3s after booking in demo
    }

    setStep("confirmed");
  };

  const handleAddToCalendar = () => {
    if (!booking) return;
    const ics = generateCalendarEvent(booking);
    const blob = new Blob([ics], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `LEGALBOT_${booking.bookingId}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyLink = () => {
    if (booking?.meetingLink) {
      navigator.clipboard.writeText(booking.meetingLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const openMap = () => {
    const query = encodeURIComponent(lawyer.address + ", " + lawyer.city + ", India");
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, "_blank");
  };

  const openDirections = () => {
    const dest = encodeURIComponent(lawyer.address + ", " + lawyer.city + ", India");
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${dest}`, "_blank");
  };

  const confirmingSteps = [
    "Validating booking details...",
    "Generating booking confirmation...",
    "Sending demo email & SMS notifications...",
    "Scheduling demo reminders...",
  ];

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
        className="glass-dark rounded-2xl border border-white/10 w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden">

        {/* Persistent demo banner */}
        <div className="bg-yellow-500/15 border-b border-yellow-500/30 px-4 py-2 flex items-center gap-2 flex-shrink-0">
          <AlertTriangle className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0" />
          <p className="text-xs text-yellow-400 font-medium">This is a demo booking. No real appointment is scheduled.</p>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 flex-shrink-0">
          <div>
            <h2 className="text-lg font-bold text-white">{lawyer.name}</h2>
            <p className="text-sm text-blue-400">{lawyer.specialization} • {lawyer.city}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-5">
          <AnimatePresence mode="wait">

            {/* ── STEP 1: Schedule ─────────────────────────────────────────── */}
            {step === "schedule" && (
              <motion.div key="schedule" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>

                {/* Mode selector */}
                {lawyer.mode === "Both" && (
                  <div className="mb-5">
                    <p className="text-sm text-gray-400 mb-2 font-medium">Consultation Mode</p>
                    <div className="flex gap-3">
                      {(["Online", "Offline"] as const).map((m) => (
                        <button key={m} onClick={() => setConsultMode(m)}
                          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm border transition-all ${consultMode === m ? "bg-blue-600/20 border-blue-500 text-white" : "glass border-white/10 text-gray-400 hover:bg-white/10"}`}>
                          {m === "Online" ? <Video className="w-4 h-4" /> : <Building2 className="w-4 h-4" />}
                          <span>{m === "Online" ? "Online (Video)" : "In-Person"}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Location preview for offline */}
                {consultMode === "Offline" && (
                  <div className="mb-5 p-3 bg-white/5 border border-white/10 rounded-xl">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs text-gray-500 mb-0.5">Office Address</p>
                          <p className="text-sm text-gray-300">{lawyer.address}</p>
                        </div>
                      </div>
                      <button onClick={openMap}
                        className="flex items-center gap-1 text-xs text-blue-400 hover:text-blue-300 whitespace-nowrap border border-blue-500/30 px-2 py-1 rounded-lg hover:bg-blue-500/10 transition-all">
                        <ExternalLink className="w-3 h-3" /> View Map
                      </button>
                    </div>
                  </div>
                )}

                {/* Online meeting link preview */}
                {consultMode === "Online" && (
                  <div className="mb-5 p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl flex items-center gap-2">
                    <Video className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-gray-500">Demo Meeting Link (generated after booking)</p>
                      <p className="text-xs text-cyan-400 font-mono">meet.legalbot.demo/room/[booking-id]</p>
                    </div>
                  </div>
                )}

                {/* Date picker */}
                <p className="text-sm text-gray-400 mb-2 flex items-center gap-2 font-medium">
                  <Calendar className="w-4 h-4" /> Select Date
                </p>
                <div className="grid grid-cols-4 gap-2 mb-5">
                  {schedule.map((day) => {
                    const hasSlots = day.slots.some((s) => s.available);
                    return (
                      <button key={day.date}
                        onClick={() => { if (hasSlots) { setSelectedDay(day.date); setSelectedSlot(null); } }}
                        disabled={!hasSlots}
                        className={`p-2 rounded-xl text-center text-xs transition-all border ${selectedDay === day.date ? "bg-blue-600 border-blue-500 text-white" : hasSlots ? "glass border-white/10 text-gray-300 hover:bg-white/10" : "glass border-white/5 text-gray-600 cursor-not-allowed opacity-40"}`}>
                        <div className="font-semibold">{day.label.split(",")[0]}</div>
                        <div className="text-gray-400 text-[10px]">{day.label.split(" ").slice(1).join(" ")}</div>
                      </button>
                    );
                  })}
                </div>

                {/* Time slots */}
                {selectedDayData && (
                  <div className="mb-5">
                    <p className="text-sm text-gray-400 mb-2 flex items-center gap-2 font-medium">
                      <Clock className="w-4 h-4" /> Select Time Slot
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      {selectedDayData.slots.map((slot) => (
                        <button key={slot.id}
                          onClick={() => { if (slot.available) { setSelectedSlot(slot.id); setSelectedSlotTime(slot.time); } }}
                          disabled={!slot.available}
                          className={`py-2.5 rounded-xl text-sm transition-all border ${selectedSlot === slot.id ? "bg-blue-600 border-blue-500 text-white" : slot.available ? "glass border-white/10 text-gray-300 hover:bg-white/10" : "glass border-white/5 text-gray-600 cursor-not-allowed opacity-40 line-through"}`}>
                          {slot.time}
                          {!slot.available && <span className="text-xs ml-1 text-gray-600">Booked</span>}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <button onClick={() => setStep("details")} disabled={!selectedDay || !selectedSlot}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-semibold disabled:opacity-40 hover:from-blue-500 hover:to-purple-500 transition-all flex items-center justify-center gap-2">
                  Continue to Your Details
                </button>
              </motion.div>
            )}

            {/* ── STEP 2: User Details ─────────────────────────────────────── */}
            {step === "details" && (
              <motion.div key="details" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>

                {/* Booking summary card */}
                <div className="mb-5 p-4 glass rounded-xl border border-blue-500/20">
                  <p className="text-xs text-gray-500 mb-3 font-semibold uppercase tracking-wide">Booking Summary</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2 text-gray-300">
                      <User className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />
                      <span className="text-gray-500">Lawyer:</span>
                      <span className="font-medium text-white">{lawyer.name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <Info className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                      <span className="text-gray-500">Specialization:</span>
                      <span>{lawyer.specialization}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      <Calendar className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                      <span className="text-gray-500">Date & Time:</span>
                      <span>{selectedDayData?.label} at {selectedSlotTime}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-300">
                      {consultMode === "Online" ? <Video className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" /> : <Building2 className="w-3.5 h-3.5 text-orange-400 flex-shrink-0" />}
                      <span className="text-gray-500">Mode:</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${consultMode === "Online" ? "bg-cyan-500/20 text-cyan-400" : "bg-orange-500/20 text-orange-400"}`}>{consultMode}</span>
                    </div>
                    {consultMode === "Offline" && (
                      <div className="flex items-start gap-2 text-gray-300">
                        <MapPin className="w-3.5 h-3.5 text-red-400 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-500 flex-shrink-0">Address:</span>
                        <span className="text-xs">{lawyer.address}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Contact form */}
                <p className="text-sm font-semibold text-gray-300 mb-3">Your Contact Details</p>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400 mb-1.5 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5" /> Full Name *
                    </label>
                    <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Enter your full name"
                      className={`w-full px-4 py-3 glass rounded-xl border bg-transparent text-white outline-none transition-colors placeholder-gray-600 ${errors.name ? "border-red-500/60" : "border-white/10 focus:border-blue-500/60"}`} />
                    {errors.name && <p className="text-xs text-red-400 mt-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />{errors.name}</p>}
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mb-1.5 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5" /> Email Address *
                    </label>
                    <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="your@email.com" type="email"
                      className={`w-full px-4 py-3 glass rounded-xl border bg-transparent text-white outline-none transition-colors placeholder-gray-600 ${errors.email ? "border-red-500/60" : "border-white/10 focus:border-blue-500/60"}`} />
                    {errors.email && <p className="text-xs text-red-400 mt-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />{errors.email}</p>}
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 mb-1.5 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5" /> Mobile Number *
                    </label>
                    <div className="flex gap-2">
                      <span className="px-3 py-3 glass rounded-xl border border-white/10 text-gray-400 text-sm">+91</span>
                      <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value.replace(/\D/g, "") })}
                        placeholder="10-digit mobile number" type="tel" maxLength={10}
                        className={`flex-1 px-4 py-3 glass rounded-xl border bg-transparent text-white outline-none transition-colors placeholder-gray-600 ${errors.phone ? "border-red-500/60" : "border-white/10 focus:border-blue-500/60"}`} />
                    </div>
                    {errors.phone && <p className="text-xs text-red-400 mt-1 flex items-center gap-1"><AlertTriangle className="w-3 h-3" />{errors.phone}</p>}
                  </div>
                </div>

                {/* Notification info */}
                <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                  <div className="flex items-start gap-2">
                    <Bell className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-blue-400 mb-1">Demo Notifications</p>
                      <p className="text-xs text-gray-400">A simulated confirmation will be sent to your email and mobile. Demo reminders will be scheduled 24 hours and 1 hour before the appointment.</p>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 mt-5">
                  <button onClick={() => setStep("schedule")} className="flex-1 py-3 glass rounded-xl text-gray-300 border border-white/10 hover:bg-white/10 transition-all">
                    Back
                  </button>
                  <button onClick={handleConfirm}
                    className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-semibold hover:from-blue-500 hover:to-purple-500 transition-all flex items-center justify-center gap-2">
                    <Calendar className="w-4 h-4" /> Book Demo Meeting
                  </button>
                </div>
              </motion.div>
            )}

            {/* ── STEP 3: Confirming ───────────────────────────────────────── */}
            {step === "confirming" && (
              <motion.div key="confirming" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="py-10">
                <div className="flex justify-center mb-6">
                  <div className="relative w-16 h-16">
                    <div className="w-16 h-16 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Calendar className="w-6 h-6 text-blue-400" />
                    </div>
                  </div>
                </div>
                <p className="text-center text-white font-semibold mb-6">Processing Demo Booking...</p>
                <div className="space-y-3">
                  {confirmingSteps.map((s, i) => (
                    <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: confirmingStep > i ? 1 : 0.3, x: 0 }}
                      transition={{ delay: i * 0.15 }}
                      className="flex items-center gap-3 text-sm">
                      {confirmingStep > i
                        ? <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                        : <Loader2 className="w-4 h-4 text-blue-400 animate-spin flex-shrink-0" />}
                      <span className={confirmingStep > i ? "text-gray-300" : "text-gray-500"}>{s}</span>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* ── STEP 4: Confirmed ────────────────────────────────────────── */}
            {step === "confirmed" && booking && (
              <motion.div key="confirmed" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>

                {/* Success icon */}
                <div className="text-center mb-5">
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", delay: 0.1 }}
                    className="w-16 h-16 bg-green-500/20 border-2 border-green-500/40 rounded-full flex items-center justify-center mx-auto mb-3">
                    <CheckCircle className="w-8 h-8 text-green-400" />
                  </motion.div>
                  <h3 className="text-xl font-bold text-white">Demo Booking Confirmed!</h3>
                  <p className="text-sm text-gray-400 mt-1">Booking ID: <span className="font-mono text-white font-bold">{booking.bookingId}</span></p>
                </div>

                {/* Full booking summary card */}
                <div className="glass rounded-2xl border border-white/10 p-4 mb-4">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Appointment Details</p>
                  <div className="space-y-2.5 text-sm">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-blue-400 flex-shrink-0" />
                      <span className="text-gray-400 w-24 flex-shrink-0">Lawyer</span>
                      <span className="text-white font-medium">{booking.lawyerName}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Info className="w-4 h-4 text-purple-400 flex-shrink-0" />
                      <span className="text-gray-400 w-24 flex-shrink-0">Specialization</span>
                      <span className="text-gray-300">{booking.specialization}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-green-400 flex-shrink-0" />
                      <span className="text-gray-400 w-24 flex-shrink-0">Date & Time</span>
                      <span className="text-gray-300">{booking.date} at {booking.time}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {booking.mode === "Online" ? <Video className="w-4 h-4 text-cyan-400 flex-shrink-0" /> : <Building2 className="w-4 h-4 text-orange-400 flex-shrink-0" />}
                      <span className="text-gray-400 w-24 flex-shrink-0">Mode</span>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${booking.mode === "Online" ? "bg-cyan-500/20 text-cyan-400" : "bg-orange-500/20 text-orange-400"}`}>{booking.mode}</span>
                    </div>
                    {booking.mode === "Online" && booking.meetingLink && (
                      <div className="flex items-center gap-2">
                        <Wifi className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                        <span className="text-gray-400 w-24 flex-shrink-0">Meeting Link</span>
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <span className="text-cyan-400 text-xs font-mono truncate">{booking.meetingLink}</span>
                          <button onClick={handleCopyLink} className="flex-shrink-0 p-1 hover:bg-white/10 rounded transition-colors">
                            {copied ? <CheckCircle className="w-3.5 h-3.5 text-green-400" /> : <Copy className="w-3.5 h-3.5 text-gray-400" />}
                          </button>
                        </div>
                      </div>
                    )}
                    {booking.mode === "Offline" && (
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                        <span className="text-gray-400 w-24 flex-shrink-0">Address</span>
                        <span className="text-gray-300 text-xs">{booking.address}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Notification status */}
                {notifResult && (
                  <div className="glass rounded-xl border border-green-500/20 p-3 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-xs font-semibold text-green-400 flex items-center gap-1.5">
                        <Bell className="w-3.5 h-3.5" /> Demo Notifications Sent
                      </p>
                      <button onClick={() => setShowNotifLog(!showNotifLog)} className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
                        {showNotifLog ? "Hide" : "View"} log
                      </button>
                    </div>
                    <div className="flex gap-4 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-green-400" /> Email: {booking.email}</span>
                      <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-green-400" /> SMS: +91{booking.phone}</span>
                    </div>
                    <AnimatePresence>
                      {showNotifLog && (
                        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden mt-3">
                          <pre className="text-xs text-gray-500 bg-black/30 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed">
                            {notifResult.simulatedEmailContent}
                          </pre>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}

                {/* Reminders */}
                {reminders && (
                  <div className="glass rounded-xl border border-blue-500/20 p-3 mb-4">
                    <p className="text-xs font-semibold text-blue-400 flex items-center gap-1.5 mb-2">
                      <Bell className="w-3.5 h-3.5" /> Demo Reminders Scheduled
                    </p>
                    <div className="space-y-1.5 text-xs text-gray-400">
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3 text-yellow-400" />
                        <span>24 hours before — demo reminder queued</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Clock className="w-3 h-3 text-orange-400" />
                        <span>1 hour before — demo reminder queued</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action buttons */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <button onClick={handleAddToCalendar}
                    className="flex items-center justify-center gap-2 py-2.5 glass rounded-xl border border-white/10 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-all">
                    <CalendarPlus className="w-4 h-4 text-blue-400" /> Add to Calendar
                  </button>
                  {booking.mode === "Offline" ? (
                    <button onClick={openDirections}
                      className="flex items-center justify-center gap-2 py-2.5 glass rounded-xl border border-white/10 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-all">
                      <Navigation className="w-4 h-4 text-green-400" /> Get Directions
                    </button>
                  ) : (
                    <button onClick={handleCopyLink}
                      className="flex items-center justify-center gap-2 py-2.5 glass rounded-xl border border-white/10 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-all">
                      {copied ? <CheckCircle className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-cyan-400" />}
                      {copied ? "Copied!" : "Copy Link"}
                    </button>
                  )}
                  {booking.mode === "Offline" && (
                    <button onClick={openMap}
                      className="flex items-center justify-center gap-2 py-2.5 glass rounded-xl border border-white/10 text-sm text-gray-300 hover:bg-white/10 hover:text-white transition-all col-span-2">
                      <MapPin className="w-4 h-4 text-red-400" /> View Location on Map
                    </button>
                  )}
                </div>

                {/* Demo disclaimer */}
                <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl mb-3">
                  <p className="text-xs text-yellow-400 text-center font-medium">
                    ⚠️ FOR DEMONSTRATION PURPOSES ONLY — No real appointment has been created
                  </p>
                </div>

                <button onClick={() => onConfirm(booking.bookingId)}
                  className="w-full py-3 bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl font-semibold hover:from-green-500 hover:to-emerald-500 transition-all">
                  Done
                </button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
