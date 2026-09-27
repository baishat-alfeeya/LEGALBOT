"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Scale, Menu, X, Globe, MessageSquare, Users, FileText,
  AlertTriangle, BookOpen, Shield, MapPin, FileCheck,
  TrendingUp, CalendarCheck, Check, Bell, Sun, Moon,
  User, LogOut, LayoutDashboard, ChevronDown, History, Heart
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { languages, Language } from "@/lib/translations";

const navLinks = [
  { href: "/chat",      icon: MessageSquare,  key: "chat"      },
  { href: "/lawyers",   icon: Users,          key: "lawyers"   },
  { href: "/bookings",  icon: CalendarCheck,  key: "bookings"  },
  { href: "/documents", icon: FileText,       key: "documents" },
  { href: "/emergency", icon: AlertTriangle,  key: "emergency" },
  { href: "/rights",    icon: BookOpen,       key: "rights"    },
  { href: "/tourist",   icon: Shield,         key: "tourist"   },
  { href: "/templates", icon: FileCheck,      key: "templates" },
  { href: "/location",  icon: MapPin,         key: "location"  },
  { href: "/risk",      icon: TrendingUp,     key: "risk"      },
];

const languageLabels: Record<Language, { native: string; english: string }> = {
  en: { native: "English", english: "English" },
  hi: { native: "हिंदी",   english: "Hindi"   },
  ta: { native: "தமிழ்",   english: "Tamil"   },
  te: { native: "తెలుగు",  english: "Telugu"  },
  kn: { native: "ಕನ್ನಡ",   english: "Kannada" },
  mr: { native: "मराठी",   english: "Marathi" },
  ur: { native: "اردو",    english: "Urdu"    },
};

const notifTypeColors: Record<string, string> = {
  booking: "text-blue-400",
  reminder: "text-yellow-400",
  legal: "text-purple-400",
  system: "text-green-400",
};

export default function Navbar() {
  const router = useRouter();
  const { t, language, setLanguage } = useLanguage();
  const { user, logout, notifications, markNotificationRead, markAllRead, clearNotifications, unreadCount, theme, toggleTheme } = useAuth();

  const [menuOpen,   setMenuOpen]   = useState(false);
  const [langOpen,   setLangOpen]   = useState(false);
  const [notifOpen,  setNotifOpen]  = useState(false);
  const [userOpen,   setUserOpen]   = useState(false);

  const langRef  = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const userRef  = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (langRef.current  && !langRef.current.contains(e.target as Node))  setLangOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (userRef.current  && !userRef.current.contains(e.target as Node))  setUserOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setLangOpen(false); setMenuOpen(false); setNotifOpen(false); setUserOpen(false); }
    };
    document.addEventListener("keydown", k);
    return () => document.removeEventListener("keydown", k);
  }, []);

  const handleLogout = () => { logout(); setUserOpen(false); router.push("/"); };
  const currentLabel = languageLabels[language] ?? languageLabels.en;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-dark border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 flex-shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center glow-blue">
              <Scale className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-gradient">LEGALBOT</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-0.5 overflow-x-auto">
            {navLinks.map(({ href, icon: Icon, key }) => (
              <Link key={href} href={href}
                className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs text-gray-300 hover:text-white hover:bg-white/10 transition-all whitespace-nowrap">
                <Icon className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{t(key)}</span>
              </Link>
            ))}
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-1.5 flex-shrink-0">

            {/* Theme toggle */}
            <button onClick={toggleTheme} title="Toggle theme"
              className="p-2 rounded-lg glass border border-white/10 hover:bg-white/10 transition-all">
              {theme === "dark"
                ? <Sun className="w-4 h-4 text-yellow-400" />
                : <Moon className="w-4 h-4 text-blue-400" />}
            </button>

            {/* Notification bell */}
            <div className="relative" ref={notifRef}>
              <button onClick={() => { setNotifOpen(v => !v); setLangOpen(false); setUserOpen(false); }}
                className="relative p-2 rounded-lg glass border border-white/10 hover:bg-white/10 transition-all">
                <Bell className="w-4 h-4 text-gray-300" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center font-bold">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
              <AnimatePresence>
                {notifOpen && (
                  <motion.div initial={{ opacity: 0, y: -8, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.97 }} transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-80 glass-dark rounded-xl border border-white/15 shadow-2xl z-[100] overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                      <p className="text-sm font-semibold text-white flex items-center gap-2">
                        <Bell className="w-4 h-4 text-blue-400" /> Notifications
                        {unreadCount > 0 && <span className="text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full">{unreadCount}</span>}
                      </p>
                      <div className="flex gap-2">
                        {unreadCount > 0 && (
                          <button onClick={markAllRead} className="text-xs text-blue-400 hover:text-blue-300">Mark all read</button>
                        )}
                        {notifications.length > 0 && (
                          <button onClick={clearNotifications} className="text-xs text-red-400 hover:text-red-300">Clear</button>
                        )}
                      </div>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length === 0 ? (
                        <div className="px-4 py-8 text-center text-gray-500 text-sm">No notifications</div>
                      ) : (
                        notifications.slice(0, 10).map(n => (
                          <div key={n.id} onClick={() => markNotificationRead(n.id)}
                            className={`px-4 py-3 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors ${n.read ? "opacity-50" : ""}`}>
                            <div className="flex items-start gap-2">
                              <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${n.read ? "bg-gray-600" : "bg-blue-400"}`} />
                              <div className="flex-1 min-w-0">
                                <p className={`text-xs font-semibold ${notifTypeColors[n.type] || "text-white"}`}>{n.title}</p>
                                <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{n.message}</p>
                                <p className="text-xs text-gray-600 mt-1">{new Date(n.timestamp).toLocaleString()}</p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    {!user && (
                      <div className="px-4 py-3 border-t border-white/10 text-center">
                        <Link href="/login" onClick={() => setNotifOpen(false)} className="text-xs text-blue-400 hover:text-blue-300">
                          Sign in to save notifications
                        </Link>
                      </div>
                    )}
                    {user && notifications.length > 0 && (
                      <div className="px-4 py-3 border-t border-white/10 text-center">
                        <Link href="/notifications" onClick={() => setNotifOpen(false)}
                          className="text-xs text-blue-400 hover:text-blue-300 transition-colors">
                          View all {notifications.length} notifications →
                        </Link>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Language selector */}
            <div className="relative" ref={langRef}>
              <button onClick={() => { setLangOpen(v => !v); setNotifOpen(false); setUserOpen(false); }}
                className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg glass border border-white/10 hover:bg-white/10 transition-all text-sm">
                <Globe className="w-4 h-4 text-blue-400 flex-shrink-0" />
                <span className="hidden sm:block text-white font-medium text-xs">{currentLabel.native}</span>
                <span className="hidden sm:block text-gray-500 text-xs">▾</span>
              </button>
              <AnimatePresence>
                {langOpen && (
                  <motion.div initial={{ opacity: 0, y: -8, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -8, scale: 0.97 }} transition={{ duration: 0.15 }}
                    className="absolute right-0 mt-2 w-48 glass-dark rounded-xl border border-white/15 shadow-2xl z-[100] overflow-hidden">
                    <div className="px-3 py-2 border-b border-white/10">
                      <p className="text-xs text-gray-500 font-medium flex items-center gap-1.5">
                        <Globe className="w-3 h-3" /> Select Language
                      </p>
                    </div>
                    {(Object.entries(languageLabels) as [Language, { native: string; english: string }][]).map(([code, label]) => (
                      <button key={code} onClick={() => { setLanguage(code); setLangOpen(false); }}
                        className={`w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors hover:bg-white/10 ${language === code ? "bg-blue-500/15 text-blue-400" : "text-gray-300"}`}>
                        <div className="flex items-center gap-2.5">
                          <span className="font-medium">{label.native}</span>
                          <span className="text-xs text-gray-500">{label.english}</span>
                        </div>
                        {language === code && <Check className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* User menu / Auth buttons */}
            {user ? (
              <div className="relative" ref={userRef}>
                <button onClick={() => { setUserOpen(v => !v); setLangOpen(false); setNotifOpen(false); }}
                  className="flex items-center gap-2 px-2.5 py-2 rounded-lg glass border border-white/10 hover:bg-white/10 transition-all">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                    {user.name[0].toUpperCase()}
                  </div>
                  <span className="hidden sm:block text-xs text-white font-medium max-w-[80px] truncate">{user.name.split(" ")[0]}</span>
                  <ChevronDown className="w-3 h-3 text-gray-400 hidden sm:block" />
                </button>
                <AnimatePresence>
                  {userOpen && (
                    <motion.div initial={{ opacity: 0, y: -8, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.97 }} transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-48 glass-dark rounded-xl border border-white/15 shadow-2xl z-[100] overflow-hidden">
                      <div className="px-4 py-3 border-b border-white/10">
                        <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                        <p className="text-xs text-gray-400 truncate">{user.email}</p>
                      </div>
                      <Link href="/dashboard" onClick={() => setUserOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/10 transition-colors">
                        <LayoutDashboard className="w-4 h-4 text-blue-400" /> Dashboard
                      </Link>
                      <Link href="/profile" onClick={() => setUserOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/10 transition-colors">
                        <User className="w-4 h-4 text-purple-400" /> Profile
                      </Link>
                      <Link href="/history" onClick={() => setUserOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/10 transition-colors">
                        <History className="w-4 h-4 text-green-400" /> Chat History
                      </Link>
                      <Link href="/saved-lawyers" onClick={() => setUserOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/10 transition-colors">
                        <Heart className="w-4 h-4 text-rose-400" /> Saved Lawyers
                      </Link>
                      <Link href="/notifications" onClick={() => setUserOpen(false)}
                        className="flex items-center justify-between gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/10 transition-colors">
                        <span className="flex items-center gap-3">
                          <Bell className="w-4 h-4 text-yellow-400" /> Notifications
                        </span>
                        {unreadCount > 0 && (
                          <span className="text-xs bg-red-500 text-white px-1.5 py-0.5 rounded-full font-bold">
                            {unreadCount}
                          </span>
                        )}
                      </Link>
                      <button onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/10 transition-colors border-t border-white/10">
                        <LogOut className="w-4 h-4" /> Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <Link href="/login"
                  className="px-3 py-1.5 text-xs text-gray-300 hover:text-white glass rounded-lg border border-white/10 hover:bg-white/10 transition-all">
                  Login
                </Link>
                <Link href="/signup"
                  className="px-3 py-1.5 text-xs text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-500 hover:to-purple-500 transition-all font-medium">
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile hamburger */}
            <button onClick={() => setMenuOpen(v => !v)} className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-colors" aria-label="Toggle menu">
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="lg:hidden glass-dark border-t border-white/10 overflow-hidden">
            <div className="px-4 py-3 grid grid-cols-2 gap-2">
              {navLinks.map(({ href, icon: Icon, key }) => (
                <Link key={href} href={href} onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-all">
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{t(key)}</span>
                </Link>
              ))}
            </div>
            {!user && (
              <div className="px-4 pb-3 flex gap-2">
                <Link href="/login" onClick={() => setMenuOpen(false)}
                  className="flex-1 py-2 text-center text-sm glass rounded-xl border border-white/10 text-gray-300">Login</Link>
                <Link href="/signup" onClick={() => setMenuOpen(false)}
                  className="flex-1 py-2 text-center text-sm bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white font-medium">Sign Up</Link>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
