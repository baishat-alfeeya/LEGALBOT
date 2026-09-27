"use client";
import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Bell, CheckCircle, Trash2, ArrowLeft, Calendar,
  AlertTriangle, Info, BookOpen, Settings
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const typeConfig = {
  booking:  { icon: Calendar,      color: "text-blue-400",   bg: "bg-blue-500/10 border-blue-500/20",   label: "Booking"  },
  reminder: { icon: Bell,          color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20", label: "Reminder" },
  legal:    { icon: BookOpen,      color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20", label: "Legal"    },
  system:   { icon: Info,          color: "text-green-400",  bg: "bg-green-500/10 border-green-500/20",  label: "System"   },
};

export default function NotificationsPage() {
  const router = useRouter();
  const {
    user, isLoading,
    notifications, markNotificationRead, markAllRead,
    clearNotifications, unreadCount
  } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) router.push("/login?from=/notifications");
  }, [user, isLoading, router]);

  if (isLoading || !user) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const grouped = notifications.reduce<Record<string, typeof notifications>>((acc, n) => {
    const date = new Date(n.timestamp).toLocaleDateString("en-IN", {
      day: "numeric", month: "long", year: "numeric"
    });
    if (!acc[date]) acc[date] = [];
    acc[date].push(n);
    return acc;
  }, {});

  return (
    <div className="min-h-screen pt-20 pb-10 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <Link href="/dashboard"
          className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>

        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gradient flex items-center gap-3">
              <Bell className="w-8 h-8 text-blue-400" />
              Notifications
              {unreadCount > 0 && (
                <span className="text-sm px-2.5 py-1 bg-red-500 rounded-full text-white font-bold">
                  {unreadCount} new
                </span>
              )}
            </h1>
            <p className="text-gray-400 mt-1">{notifications.length} total notifications</p>
          </div>

          <div className="flex gap-2">
            {unreadCount > 0 && (
              <button onClick={markAllRead}
                className="flex items-center gap-2 px-4 py-2 glass rounded-xl border border-blue-500/30 text-sm text-blue-400 hover:bg-blue-500/10 transition-all">
                <CheckCircle className="w-4 h-4" /> Mark all read
              </button>
            )}
            {notifications.length > 0 && (
              <button onClick={clearNotifications}
                className="flex items-center gap-2 px-4 py-2 glass rounded-xl border border-red-500/30 text-sm text-red-400 hover:bg-red-500/10 transition-all">
                <Trash2 className="w-4 h-4" /> Clear all
              </button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {(["All", "Booking", "Reminder", "Legal", "System"] as const).map((tab) => {
          const count = tab === "All"
            ? notifications.length
            : notifications.filter(n => n.type === tab.toLowerCase()).length;
          return (
            <span key={tab}
              className="px-3 py-1.5 glass rounded-full text-xs border border-white/10 text-gray-400">
              {tab} {count > 0 && <span className="ml-1 text-white font-medium">{count}</span>}
            </span>
          );
        })}
      </div>

      {notifications.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="glass rounded-2xl border border-white/10 p-16 text-center">
          <Bell className="w-14 h-14 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-400 mb-2">No notifications yet</h3>
          <p className="text-gray-500 text-sm mb-6">
            Notifications will appear here when you book appointments or receive updates.
          </p>
          <Link href="/lawyers"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white font-medium hover:from-blue-500 hover:to-purple-500 transition-all">
            Book a Consultation
          </Link>
        </motion.div>
      ) : (
        <div className="space-y-6">
          <AnimatePresence>
            {Object.entries(grouped).map(([date, items]) => (
              <div key={date}>
                {/* Date header */}
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs text-gray-500 font-medium">{date}</span>
                  <div className="flex-1 h-px bg-white/5" />
                  <span className="text-xs text-gray-600">{items.length} notification{items.length > 1 ? "s" : ""}</span>
                </div>

                <div className="space-y-2">
                  {items.map((n, i) => {
                    const cfg = typeConfig[n.type] || typeConfig.system;
                    const Icon = cfg.icon;
                    return (
                      <motion.div
                        key={n.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        transition={{ delay: i * 0.03 }}
                        onClick={() => markNotificationRead(n.id)}
                        className={`glass rounded-xl border p-4 cursor-pointer transition-all ${
                          n.read
                            ? "border-white/5 opacity-60 hover:opacity-80"
                            : `${cfg.bg} hover:opacity-90`
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {/* Icon */}
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${n.read ? "bg-white/5" : cfg.bg}`}>
                            <Icon className={`w-4 h-4 ${n.read ? "text-gray-500" : cfg.color}`} />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className={`text-xs px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.color}`}>
                                {cfg.label}
                              </span>
                              {!n.read && (
                                <span className="w-2 h-2 bg-blue-400 rounded-full pulse-badge" />
                              )}
                              <span className="text-xs text-gray-600 ml-auto">
                                {new Date(n.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                              </span>
                            </div>
                            <p className="text-sm font-semibold text-white mb-1">{n.title}</p>
                            <p className="text-xs text-gray-400 leading-relaxed">{n.message}</p>
                            {n.link && (
                              <Link
                                href={n.link}
                                onClick={e => e.stopPropagation()}
                                className="text-xs text-blue-400 hover:text-blue-300 mt-2 inline-flex items-center gap-1 transition-colors"
                              >
                                View details →
                              </Link>
                            )}
                          </div>

                          {/* Read indicator */}
                          {n.read && (
                            <CheckCircle className="w-4 h-4 text-gray-600 flex-shrink-0 mt-0.5" />
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Info footer */}
      <div className="mt-8 p-4 glass rounded-xl border border-white/10 flex items-start gap-3">
        <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-gray-400">
          <strong className="text-yellow-400">Demo Mode:</strong> All notifications are simulated.
          Real email and SMS notifications require Twilio and Gmail credentials in <code className="text-blue-400">.env.local</code>.
          See the setup guide in the project README.
        </p>
      </div>
    </div>
  );
}
