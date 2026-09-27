"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { useParams, useRouter } from "next/navigation";
import { Star, MapPin, Phone, Mail, Wifi, Building2, ArrowLeft, Calendar, Award, Languages, CheckCircle } from "lucide-react";
import { lawyers, getFeeRange } from "@/lib/lawyers";
import BookingModal from "@/components/BookingModal";

export default function LawyerDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const lawyer = lawyers.find((l) => l.id === Number(id));
  const [booking, setBooking] = useState(false);
  const [confirmed, setConfirmed] = useState<string | null>(null);

  if (!lawyer) return (
    <div className="min-h-screen pt-20 flex items-center justify-center text-gray-400">
      Lawyer not found.{" "}
      <button onClick={() => router.back()} className="ml-2 text-blue-400 underline">Go back</button>
    </div>
  );

  const [feeMin, feeMax] = getFeeRange(lawyer.specialization, lawyer.city);

  return (
    <div className="min-h-screen pt-20 pb-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Lawyers
      </button>

      {confirmed && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-green-400" />
          <div>
            <p className="font-semibold text-green-400">Demo Booking Confirmed!</p>
            <p className="text-sm text-gray-400">Booking ID: <span className="font-mono text-white">{confirmed}</span> — This is a demo booking only.</p>
          </div>
        </motion.div>
      )}

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl border border-white/10 p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-6">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-3xl flex-shrink-0">
            {lawyer.name.split(" ")[1]?.[0] || "A"}
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold text-white">{lawyer.name}</h1>
                <p className="text-blue-400 font-medium">{lawyer.specialization} Law</p>
                <p className="text-xs text-gray-500 mt-1">Bar Council: {lawyer.barCouncil}</p>
              </div>
              <span className={`text-sm px-3 py-1 rounded-full ${lawyer.available ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"}`}>
                {lawyer.available ? "● Available" : "● Busy"}
              </span>
            </div>
            <p className="text-gray-300 text-sm mt-3 leading-relaxed">{lawyer.bio}</p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        {[
          { icon: Star, label: "Rating", value: `${lawyer.rating} (${lawyer.reviewCount} reviews)`, color: "text-yellow-400" },
          { icon: Award, label: "Experience", value: `${lawyer.experience} years`, color: "text-blue-400" },
          { icon: MapPin, label: "Location", value: `${lawyer.city} • ${lawyer.distance}`, color: "text-purple-400" },
          { icon: lawyer.mode === "Online" ? Wifi : Building2, label: "Mode", value: lawyer.mode, color: "text-cyan-400" },
          { icon: Phone, label: "Phone", value: lawyer.phone, color: "text-green-400" },
          { icon: Mail, label: "Email", value: lawyer.email, color: "text-orange-400" },
          { icon: Languages, label: "Languages", value: lawyer.languages.join(", "), color: "text-pink-400" },
        ].map(({ icon: Icon, label, value, color }, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="glass rounded-xl border border-white/10 p-4 flex items-center gap-3">
            <Icon className={`w-5 h-5 ${color} flex-shrink-0`} />
            <div>
              <p className="text-xs text-gray-500">{label}</p>
              <p className="text-sm text-white font-medium">{value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}
        className="glass rounded-2xl border border-yellow-500/20 p-5 mb-6">
        <p className="text-xs text-gray-500 mb-1">Estimated Consultation Fee</p>
        <p className="text-3xl font-bold text-white">₹{feeMin.toLocaleString()} – ₹{feeMax.toLocaleString()}</p>
        <p className="text-xs text-yellow-400 mt-1">⚠️ Estimated fees only. Actual fees may vary. For Demonstration Purposes Only.</p>
      </motion.div>

      <button onClick={() => setBooking(true)} disabled={!lawyer.available}
        className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl font-bold text-lg disabled:opacity-40 hover:from-blue-500 hover:to-purple-500 transition-all flex items-center justify-center gap-3">
        <Calendar className="w-5 h-5" /> Book Consultation
      </button>

      {booking && (
        <BookingModal lawyer={lawyer} onClose={() => setBooking(false)}
          onConfirm={(id) => { setConfirmed(id); setBooking(false); }} />
      )}
    </div>
  );
}
