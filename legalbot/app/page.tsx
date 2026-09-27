"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Scale, ArrowRight, MessageSquare, Users, FileText,
  Shield, BookOpen, AlertTriangle, Zap, Globe, Star
} from "lucide-react";

const features = [
  { icon: MessageSquare, label: "AI Legal Chat",    color: "from-blue-500 to-cyan-500"   },
  { icon: Users,         label: "Find Lawyers",     color: "from-purple-500 to-pink-500" },
  { icon: FileText,      label: "Document Analysis",color: "from-emerald-500 to-teal-500"},
  { icon: BookOpen,      label: "Know Your Rights", color: "from-amber-500 to-orange-500"},
  { icon: Shield,        label: "Tourist Shield",   color: "from-teal-500 to-cyan-500"   },
  { icon: AlertTriangle, label: "Emergency Help",   color: "from-red-500 to-rose-500"    },
];

export default function WelcomePage() {
  const router = useRouter();
  const { user, isLoading, loginWithGoogle } = useAuth();
  const [gLoading, setGLoading] = useState(false);

  // If already logged in, go straight to dashboard
  useEffect(() => {
    if (!isLoading && user) router.replace("/dashboard");
  }, [user, isLoading, router]);

  const handleGuest = () => {
    // Guest just goes to the home/chat without logging in
    router.push("/chat");
  };

  const handleGoogle = async () => {
    setGLoading(true);
    const result = await loginWithGoogle();
    setGLoading(false);
    if (result.success) router.replace("/dashboard");
  };

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center animated-bg">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full"
      />
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col animated-bg overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-blue-600/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-purple-600/8 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/4 rounded-full blur-3xl" />
        {/* Floating particles */}
        {[...Array(12)].map((_, i) => (
          <motion.div key={i}
            className="absolute w-1 h-1 bg-blue-400 rounded-full opacity-20"
            style={{ left: `${8 + i * 8}%`, top: `${10 + (i % 5) * 18}%` }}
            animate={{ y: [0, -20, 0], opacity: [0.2, 0.6, 0.2] }}
            transition={{ duration: 3 + i * 0.4, repeat: Infinity, delay: i * 0.3 }}
          />
        ))}
      </div>

      <div className="relative flex-1 flex flex-col items-center justify-center px-4 py-16 sm:py-20">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="w-full max-w-lg text-center"
        >
          {/* Logo */}
          <motion.div
            animate={{ rotate: [0, 4, -4, 0] }}
            transition={{ duration: 5, repeat: Infinity }}
            className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-blue-500/30 glow-blue"
          >
            <Scale className="w-10 h-10 text-white" />
          </motion.div>

          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass border border-blue-500/30 mb-5"
          >
            <Zap className="w-3.5 h-3.5 text-yellow-400" />
            <span className="text-xs text-gray-300 font-medium">AI-Powered Legal Platform for India</span>
          </motion.div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-4 leading-tight">
            <span className="text-gradient">Your AI Legal</span>
            <br />
            <span className="text-white">Assistant</span>
          </h1>
          <p className="text-gray-400 text-base sm:text-lg mb-10 max-w-md mx-auto leading-relaxed">
            Instant legal guidance in 7 Indian languages. Find lawyers, analyse documents, and know your rights — anytime.
          </p>

          {/* ── Auth buttons ─────────────────────────────────────────────── */}
          <div className="flex flex-col gap-3 mb-6">
            {/* Sign Up — primary CTA */}
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link href="/signup"
                className="flex items-center justify-center gap-2 w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl font-bold text-white text-base hover:from-blue-500 hover:to-purple-500 transition-all shadow-xl shadow-blue-500/25 glow-blue">
                Create Free Account <ArrowRight className="w-5 h-5" />
              </Link>
            </motion.div>

            {/* Login */}
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <Link href="/login"
                className="flex items-center justify-center gap-2 w-full py-4 glass rounded-2xl border border-white/15 font-semibold text-white text-base hover:bg-white/10 transition-all">
                Sign In to Your Account
              </Link>
            </motion.div>

            {/* Google */}
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <button onClick={handleGoogle} disabled={gLoading}
                className="flex items-center justify-center gap-3 w-full py-3.5 glass rounded-2xl border border-white/10 text-gray-300 hover:bg-white/8 transition-all font-medium disabled:opacity-50">
                {gLoading ? (
                  <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                )}
                Continue with Google
              </button>
            </motion.div>

            {/* Divider */}
            <div className="flex items-center gap-3 my-1">
              <div className="flex-1 h-px bg-white/8" />
              <span className="text-xs text-gray-600">or</span>
              <div className="flex-1 h-px bg-white/8" />
            </div>

            {/* Continue as Guest */}
            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
              <button onClick={handleGuest}
                className="flex items-center justify-center gap-2 w-full py-3 text-gray-500 hover:text-gray-300 text-sm transition-colors">
                Continue as Guest
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </motion.div>
          </div>

          {/* Trust note */}
          <p className="text-xs text-gray-600 mb-10">
            No credit card required · All data stored locally · Demo mode
          </p>
        </motion.div>

        {/* ── Feature pills ─────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="relative w-full max-w-2xl"
        >
          <p className="text-center text-xs text-gray-600 mb-4 uppercase tracking-widest">What's inside</p>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {features.map(({ icon: Icon, label, color }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 + i * 0.07 }}
                whileHover={{ y: -4 }}
                className="glass rounded-xl border border-white/8 p-3 text-center hover:border-white/20 transition-all"
              >
                <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${color} flex items-center justify-center mx-auto mb-2`}>
                  <Icon className="w-4 h-4 text-white" />
                </div>
                <p className="text-xs text-gray-400 leading-tight">{label}</p>
              </motion.div>
            ))}
          </div>

          {/* Language strip */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="flex items-center justify-center gap-2 mt-6 flex-wrap"
          >
            <Globe className="w-3.5 h-3.5 text-gray-600" />
            {["English", "हिंदी", "தமிழ்", "తెలుగు", "ಕನ್ನಡ", "मराठी", "اردو"].map(lang => (
              <span key={lang} className="text-xs text-gray-600 px-2 py-0.5 glass rounded-full border border-white/8">
                {lang}
              </span>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
