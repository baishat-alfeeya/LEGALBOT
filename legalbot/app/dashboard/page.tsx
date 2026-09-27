"use client";
import { useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  MessageSquare, Users, FileText, AlertTriangle, BookOpen,
  Shield, MapPin, FileCheck, TrendingUp, Calendar, Clock,
  Trash2, Bell, ArrowRight, Scale, User, LogOut, ChevronRight,
  History, Heart, Sparkles, Zap
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { getStoredBookings } from "@/lib/mockNotification";
import { getSavedLawyers } from "@/lib/savedLawyers";

const modules = [
  { href: "/chat",          icon: MessageSquare, label: "AI Legal Chat",    desc: "Ask any legal question",       color: "from-blue-500 to-cyan-500",    glow: "shadow-blue-500/20"   },
  { href: "/lawyers",       icon: Users,         label: "Find Lawyers",     desc: "65+ verified advocates",       color: "from-purple-500 to-violet-600", glow: "shadow-purple-500/20" },
  { href: "/documents",     icon: FileText,      label: "Document Analysis",desc: "AI-powered legal review",      color: "from-emerald-500 to-teal-500",  glow: "shadow-emerald-500/20"},
  { href: "/rights",        icon: BookOpen,      label: "Know Your Rights",  desc: "11 rights categories",         color: "from-amber-500 to-orange-500",  glow: "shadow-amber-500/20"  },
  { href: "/emergency",     icon: AlertTriangle, label: "Emergency Help",    desc: "Instant legal guidance",       color: "from-red-500 to-rose-600",      glow: "shadow-red-500/20"    },
  { href: "/tourist",       icon: Shield,        label: "Tourist Shield",    desc: "Safety & legal support",       color: "from-teal-500 to-cyan-600",     glow: "shadow-teal-500/20"   },
  { href: "/templates",     icon: FileCheck,     label: "Legal Templates",   desc: "Download ready-made docs",     color: "from-indigo-500 to-blue-600",   glow: "shadow-indigo-500/20" },
  { href: "/risk",          icon: TrendingUp,    label: "Risk Assessment",   desc: "Analyse your legal risk",      color: "from-orange-500 to-red-500",    glow: "shadow-orange-500/20" },
  { href: "/history",       icon: History,       label: "Chat History",      desc: "Your saved conversations",     color: "from-slate-500 to-gray-600",    glow: "shadow-slate-500/20"  },
  { href: "/saved-lawyers", icon: Heart,         label: "Saved Lawyers",     desc: "Your bookmarked advocates",    color: "from-rose-500 to-pink-600",     glow: "shadow-rose-500/20"   },
  { href: "/location",      icon: MapPin,        label: "Nearby Services",   desc: "Courts, police & legal aid",   color: "from-cyan-500 to-blue-500",     glow: "shadow-cyan-500/20"   },
  { href: "/bookings",      icon: Calendar,      label: "My Bookings",       desc: "Demo appointments",            color: "from-violet-500 to-purple-600", glow: "shadow-violet-500/20" },
];

const riskColors = {
  low:    { text: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20" },
  medium: { text: "text-amber-400",   bg: "bg-amber-500/10 border-amber-500/20"     },
  high:   { text: "text-red-400",     bg: "bg-red-500/10 border-red-500/20"         },
};

export default function DashboardPage() {
  const router = useRouter();
  const {
    user, isLoading, logout,
    chatHistory, deleteChatItem, clearChatHistory,
    notifications, markNotificationRead, unreadCount
  } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) router.push("/login");
  }, [user, isLoading, router]);

  if (isLoading || !user) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const bookings      = getStoredBookings().slice(-3).reverse();
  const recentHistory = chatHistory.slice(0, 4);
  const recentNotifs  = notifications.slice(0, 4);
  const savedLawyers  = getSavedLawyers(user.id);
  const handleLogout  = () => { logout(); router.push("/"); };

  return (
    <div className="min-h-screen pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">

      {/* ── Hero welcome banner ─────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: -24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden rounded-3xl mb-10 p-8 sm:p-10"
        style={{ background: "linear-gradient(135deg, rgba(37,99,235,0.15) 0%, rgba(124,58,237,0.15) 50%, rgba(16,185,129,0.08) 100%)" }}
      >
        {/* Decorative blobs */}
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute inset-0 border border-white/8 rounded-3xl pointer-events-none" />

        <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {/* Avatar */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-2xl sm:text-3xl shadow-lg shadow-blue-500/30 flex-shrink-0"
            >
              {user.name[0].toUpperCase()}
            </motion.div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-4 h-4 text-yellow-400" />
                <span className="text-xs text-yellow-400 font-medium uppercase tracking-widest">Legal Dashboard</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-bold text-white leading-tight">
                Welcome back, <span className="text-gradient">{user.name.split(" ")[0]}</span>
              </h1>
              <p className="text-gray-400 text-sm mt-1">{user.email}</p>
            </div>
          </div>

          {/* Stats row */}
          <div className="flex gap-4 sm:gap-6 flex-shrink-0">
            {[
              { value: chatHistory.length,          label: "Chats"    },
              { value: savedLawyers.length,          label: "Saved"    },
              { value: getStoredBookings().length,   label: "Bookings" },
            ].map(({ value, label }) => (
              <div key={label} className="text-center">
                <div className="text-2xl font-bold text-white">{value}</div>
                <div className="text-xs text-gray-500 mt-0.5">{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Action buttons */}
        <div className="relative flex flex-wrap gap-3 mt-7">
          <Link href="/chat"
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-sm font-semibold text-white hover:from-blue-500 hover:to-purple-500 transition-all shadow-lg shadow-blue-500/20">
            <Zap className="w-4 h-4" /> Ask AI Now
          </Link>
          <Link href="/lawyers"
            className="flex items-center gap-2 px-5 py-2.5 glass rounded-xl border border-white/15 text-sm font-medium text-gray-200 hover:bg-white/10 transition-all">
            <Users className="w-4 h-4" /> Find a Lawyer
          </Link>
          <Link href="/profile"
            className="flex items-center gap-2 px-5 py-2.5 glass rounded-xl border border-white/15 text-sm font-medium text-gray-200 hover:bg-white/10 transition-all">
            <User className="w-4 h-4" /> Profile
          </Link>
          <button onClick={handleLogout}
            className="flex items-center gap-2 px-5 py-2.5 glass rounded-xl border border-red-500/30 text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all ml-auto">
            <LogOut className="w-4 h-4" /> Logout
          </button>
        </div>
      </motion.div>

      {/* ── Modules grid ────────────────────────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.5 }}
        className="mb-10"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-white">All Features</h2>
          <span className="text-xs text-gray-500">{modules.length} modules</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {modules.map(({ href, icon: Icon, label, desc, color, glow }, i) => (
            <motion.div
              key={href}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i }}
              whileHover={{ y: -6, scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <Link href={href}
                className={`glass rounded-2xl border border-white/10 p-5 flex flex-col gap-3 hover:border-white/25 transition-all block group shadow-lg ${glow}`}>
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white leading-tight">{label}</p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{desc}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* ── Main content grid ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left — 2 cols */}
        <div className="lg:col-span-2 space-y-6">

          {/* Recent Chats */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="glass rounded-2xl border border-white/10 p-6"
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                  <MessageSquare className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-lg font-bold text-white">Recent Chats</h2>
              </div>
              <div className="flex items-center gap-3">
                {chatHistory.length > 0 && (
                  <button onClick={clearChatHistory}
                    className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors">
                    <Trash2 className="w-3 h-3" /> Clear
                  </button>
                )}
                <Link href="/history"
                  className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors">
                  View all <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            </div>

            {recentHistory.length === 0 ? (
              <div className="text-center py-10">
                <MessageSquare className="w-10 h-10 text-gray-700 mx-auto mb-3" />
                <p className="text-gray-500 text-sm mb-3">No conversations yet</p>
                <Link href="/chat"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600/20 border border-blue-500/30 rounded-xl text-sm text-blue-400 hover:bg-blue-600/30 transition-all">
                  Start a conversation →
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {recentHistory.map((item) => (
                  <motion.div key={item.id} whileHover={{ x: 3 }}
                    className="flex items-start justify-between gap-3 p-4 rounded-xl bg-white/3 border border-white/8 hover:border-white/15 transition-all">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        {item.risk && (
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${riskColors[item.risk].bg} ${riskColors[item.risk].text}`}>
                            {item.risk} risk
                          </span>
                        )}
                        <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-gray-400 border border-white/10">
                          {item.category}
                        </span>
                        <span className="text-xs text-gray-600 ml-auto">
                          {new Date(item.timestamp).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-200 truncate font-medium">{item.query}</p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Link href="/chat"
                        className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
                        <ChevronRight className="w-4 h-4 text-gray-500" />
                      </Link>
                      <button onClick={() => deleteChatItem(item.id)}
                        className="p-1.5 hover:bg-red-500/10 rounded-lg transition-colors">
                        <Trash2 className="w-3.5 h-3.5 text-gray-600 hover:text-red-400" />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.section>

          {/* Upcoming Appointments */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass rounded-2xl border border-white/10 p-6"
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
                  <Calendar className="w-4 h-4 text-white" />
                </div>
                <h2 className="text-lg font-bold text-white">Upcoming Appointments</h2>
              </div>
              <Link href="/bookings"
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {bookings.length === 0 ? (
              <div className="text-center py-10">
                <Calendar className="w-10 h-10 text-gray-700 mx-auto mb-3" />
                <p className="text-gray-500 text-sm mb-3">No appointments scheduled</p>
                <Link href="/lawyers"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600/20 border border-purple-500/30 rounded-xl text-sm text-purple-400 hover:bg-purple-600/30 transition-all">
                  Book a consultation →
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {bookings.map((b) => (
                  <motion.div key={b.bookingId} whileHover={{ x: 3 }}
                    className="flex items-center justify-between gap-4 p-4 rounded-xl bg-purple-500/5 border border-purple-500/15 hover:border-purple-500/30 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-base flex-shrink-0 shadow-md">
                        {b.lawyerName.split(" ")[1]?.[0] || "A"}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{b.lawyerName}</p>
                        <p className="text-xs text-purple-300">{b.specialization}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> {b.date}
                          </span>
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {b.time}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${b.mode === "Online" ? "bg-cyan-500/20 text-cyan-400" : "bg-orange-500/20 text-orange-400"}`}>
                        {b.mode}
                      </span>
                      <span className="text-xs text-yellow-400 flex items-center gap-1">
                        <Bell className="w-3 h-3" /> Reminder set
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.section>
        </div>

        {/* Right column */}
        <div className="space-y-6">

          {/* Notifications */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass rounded-2xl border border-white/10 p-6"
          >
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                    <Bell className="w-4 h-4 text-white" />
                  </div>
                  {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center font-bold">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </div>
                <h2 className="text-lg font-bold text-white">Notifications</h2>
              </div>
              <Link href="/notifications"
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {recentNotifs.length === 0 ? (
              <div className="text-center py-8">
                <Bell className="w-9 h-9 text-gray-700 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">No notifications yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {recentNotifs.map((n) => (
                  <div key={n.id} onClick={() => markNotificationRead(n.id)}
                    className={`p-3.5 rounded-xl cursor-pointer transition-all ${n.read ? "bg-white/2 border border-white/5 opacity-55" : "bg-blue-500/5 border border-blue-500/20 hover:border-blue-500/35"}`}>
                    <div className="flex items-start gap-2.5">
                      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.read ? "bg-gray-600" : "bg-blue-400 pulse-badge"}`} />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-white truncate">{n.title}</p>
                        <p className="text-xs text-gray-400 mt-0.5 leading-relaxed line-clamp-2">{n.message}</p>
                        <p className="text-xs text-gray-600 mt-1">{new Date(n.timestamp).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.section>

          {/* Profile summary */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="glass rounded-2xl border border-white/10 p-6"
          >
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-widest mb-5">Account</h2>

            <div className="flex items-center gap-4 mb-5 pb-5 border-b border-white/8">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/20">
                {user.name[0].toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-white text-base truncate">{user.name}</p>
                <p className="text-xs text-gray-400 truncate">{user.email}</p>
                <span className="text-xs px-2 py-0.5 bg-blue-500/15 text-blue-400 rounded-full border border-blue-500/20 mt-1 inline-block capitalize">
                  {user.provider}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-5">
              {[
                { label: "Chats",    value: chatHistory.length,        color: "text-blue-400"   },
                { label: "Saved",    value: savedLawyers.length,       color: "text-rose-400"   },
                { label: "Bookings", value: getStoredBookings().length, color: "text-purple-400" },
                { label: "Notifs",   value: notifications.length,      color: "text-amber-400"  },
              ].map(({ label, value, color }) => (
                <div key={label} className="bg-white/4 rounded-xl p-3 text-center border border-white/8">
                  <div className={`text-xl font-bold ${color}`}>{value}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{label}</div>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <Link href="/profile"
                className="w-full flex items-center justify-center gap-2 py-2.5 glass rounded-xl border border-white/10 text-sm text-gray-300 hover:bg-white/10 transition-all">
                <User className="w-4 h-4" /> Edit Profile
              </Link>
              <Link href="/notifications"
                className="w-full flex items-center justify-center gap-2 py-2.5 glass rounded-xl border border-white/10 text-sm text-gray-300 hover:bg-white/10 transition-all">
                <Bell className="w-4 h-4" /> All Notifications
              </Link>
            </div>
          </motion.section>
        </div>
      </div>
    </div>
  );
}
