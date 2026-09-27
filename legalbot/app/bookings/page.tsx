"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Calendar, Clock, MapPin, Video, Building2, Phone, Mail,
  Trash2, ExternalLink, Navigation, Copy, CheckCircle,
  AlertTriangle, Bell, CalendarPlus, User, Info
} from "lucide-react";
import { getStoredBookings, generateCalendarEvent, type BookingDetails } from "@/lib/mockNotification";
import { useAuth } from "@/context/AuthContext";

export default function BookingsPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [bookings, setBookings] = useState<BookingDetails[]>([]);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && !user) router.push("/login?from=/bookings");
  }, [user, isLoading, router]);

  useEffect(() => {
    setBookings(getStoredBookings().reverse());
  }, []);

  const clearBookings = () => {
    localStorage.removeItem("legalbot_bookings");
    setBookings([]);
  };

  const handleAddToCalendar = (b: BookingDetails) => {
    const ics = generateCalendarEvent(b);
    const blob = new Blob([ics], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `LEGALBOT_${b.bookingId}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const openMap = (b: BookingDetails) => {
    const q = encodeURIComponent(`${b.address}, ${b.city}, India`);
    window.open(`https://www.google.com/maps/search/?api=1&query=${q}`, "_blank");
  };

  const openDirections = (b: BookingDetails) => {
    const dest = encodeURIComponent(`${b.address}, ${b.city}, India`);
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${dest}`, "_blank");
  };

  return (
    <div className="min-h-screen pt-20 pb-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gradient mb-2">My Bookings</h1>
            <p className="text-gray-400">Your demo consultation history</p>
          </div>
          {bookings.length > 0 && (
            <button onClick={clearBookings}
              className="flex items-center gap-2 px-4 py-2 glass rounded-xl border border-red-500/30 text-red-400 text-sm hover:bg-red-500/10 transition-all">
              <Trash2 className="w-4 h-4" /> Clear All
            </button>
          )}
        </div>
      </motion.div>

      {/* Demo banner */}
      <div className="mb-6 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl flex items-center gap-3">
        <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0" />
        <p className="text-xs text-yellow-400">
          <strong>For Demonstration Purposes Only.</strong> These are simulated bookings. No real appointments have been created.
        </p>
      </div>

      {bookings.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="text-center py-20 glass rounded-2xl border border-white/10">
          <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <p className="text-gray-400 text-lg mb-2">No bookings yet</p>
          <p className="text-gray-500 text-sm">Book a demo consultation from the Lawyers section</p>
        </motion.div>
      ) : (
        <div className="space-y-4">
          {bookings.map((b, i) => (
            <motion.div key={b.bookingId} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass rounded-2xl border border-white/10 overflow-hidden">

              {/* Card header */}
              <button onClick={() => setExpanded(expanded === b.bookingId ? null : b.bookingId)}
                className="w-full p-5 flex items-start justify-between gap-4 hover:bg-white/5 transition-colors text-left">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                    {b.lawyerName.split(" ")[1]?.[0] || "A"}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{b.lawyerName}</h3>
                    <p className="text-sm text-blue-400">{b.specialization}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{b.date}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{b.time}</span>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 flex-shrink-0">
                  <span className={`text-xs px-2 py-1 rounded-full ${b.mode === "Online" ? "bg-cyan-500/20 text-cyan-400" : "bg-orange-500/20 text-orange-400"}`}>
                    {b.mode}
                  </span>
                  <span className="text-xs text-gray-600 font-mono">{b.bookingId}</span>
                </div>
              </button>

              {/* Expanded details */}
              <AnimatePresence>
                {expanded === b.bookingId && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden border-t border-white/10">
                    <div className="p-5 space-y-4">

                      {/* Full details */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                        <div className="flex items-center gap-2 text-gray-400">
                          <User className="w-3.5 h-3.5 text-blue-400" />
                          <span>Client: <span className="text-white">{b.userName}</span></span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400">
                          <Mail className="w-3.5 h-3.5 text-green-400" />
                          <span className="truncate">{b.email}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400">
                          <Phone className="w-3.5 h-3.5 text-green-400" />
                          <span>+91 {b.phone}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-400">
                          <MapPin className="w-3.5 h-3.5 text-red-400" />
                          <span>{b.city}</span>
                        </div>
                      </div>

                      {/* Meeting link or address */}
                      {b.mode === "Online" && b.meetingLink && (
                        <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl">
                          <p className="text-xs text-gray-500 mb-1">Demo Meeting Link</p>
                          <div className="flex items-center gap-2">
                            <span className="text-cyan-400 text-xs font-mono flex-1 truncate">{b.meetingLink}</span>
                            <button onClick={() => handleCopy(b.meetingLink!, b.bookingId + "-link")}
                              className="p-1.5 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0">
                              {copied === b.bookingId + "-link"
                                ? <CheckCircle className="w-3.5 h-3.5 text-green-400" />
                                : <Copy className="w-3.5 h-3.5 text-gray-400" />}
                            </button>
                          </div>
                        </div>
                      )}

                      {b.mode === "Offline" && (
                        <div className="p-3 bg-white/5 border border-white/10 rounded-xl">
                          <p className="text-xs text-gray-500 mb-1">Office Address</p>
                          <p className="text-sm text-gray-300">{b.address}</p>
                        </div>
                      )}

                      {/* Reminder info */}
                      <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                        <p className="text-xs font-semibold text-blue-400 flex items-center gap-1.5 mb-2">
                          <Bell className="w-3.5 h-3.5" /> Demo Reminders Scheduled
                        </p>
                        <div className="space-y-1 text-xs text-gray-400">
                          <div className="flex items-center gap-2"><Clock className="w-3 h-3 text-yellow-400" /> 24 hours before appointment</div>
                          <div className="flex items-center gap-2"><Clock className="w-3 h-3 text-orange-400" /> 1 hour before appointment</div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => handleAddToCalendar(b)}
                          className="flex items-center justify-center gap-2 py-2.5 glass rounded-xl border border-white/10 text-xs text-gray-300 hover:bg-white/10 transition-all">
                          <CalendarPlus className="w-3.5 h-3.5 text-blue-400" /> Add to Calendar
                        </button>
                        {b.mode === "Offline" ? (
                          <>
                            <button onClick={() => openDirections(b)}
                              className="flex items-center justify-center gap-2 py-2.5 glass rounded-xl border border-white/10 text-xs text-gray-300 hover:bg-white/10 transition-all">
                              <Navigation className="w-3.5 h-3.5 text-green-400" /> Get Directions
                            </button>
                            <button onClick={() => openMap(b)}
                              className="col-span-2 flex items-center justify-center gap-2 py-2.5 glass rounded-xl border border-white/10 text-xs text-gray-300 hover:bg-white/10 transition-all">
                              <MapPin className="w-3.5 h-3.5 text-red-400" /> View on Map
                            </button>
                          </>
                        ) : (
                          <button onClick={() => handleCopy(b.meetingLink || "", b.bookingId + "-btn")}
                            className="flex items-center justify-center gap-2 py-2.5 glass rounded-xl border border-white/10 text-xs text-gray-300 hover:bg-white/10 transition-all">
                            {copied === b.bookingId + "-btn"
                              ? <><CheckCircle className="w-3.5 h-3.5 text-green-400" /> Copied!</>
                              : <><Copy className="w-3.5 h-3.5 text-cyan-400" /> Copy Link</>}
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
