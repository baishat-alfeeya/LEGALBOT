"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Scale, Mail, AlertTriangle, Loader2, CheckCircle, ArrowLeft } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { forgotPassword, user, isLoading } = useAuth();
  const [email, setEmail]     = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");
  const [sent, setSent]       = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (!isLoading && user) router.replace("/dashboard");
  }, [user, isLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { setError("Please enter your email address."); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError("Please enter a valid email address."); return; }
    setError(""); setLoading(true);
    const result = await forgotPassword(email);
    setLoading(false);
    if (result.success) setSent(true);
    else setError(result.error || "Failed to send reset email.");
  };

  if (isLoading) return null;

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 animated-bg">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/3 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/3 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center glow-blue mx-auto mb-4">
            <Scale className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gradient mb-1">LEGALBOT</h1>
          <p className="text-gray-400 text-sm">AI-Powered Legal Assistance for India</p>
        </div>

        <div className="glass rounded-2xl border border-white/10 p-8">
          <AnimatePresence mode="wait">
            {sent ? (
              <motion.div
                key="sent"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-4"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.1 }}
                  className="w-16 h-16 bg-green-500/20 border border-green-500/30 rounded-full flex items-center justify-center mx-auto mb-4"
                >
                  <CheckCircle className="w-8 h-8 text-green-400" />
                </motion.div>
                <h3 className="text-xl font-bold text-white mb-2">Reset Link Sent!</h3>
                <p className="text-gray-400 text-sm mb-2">
                  A password reset link has been sent to{" "}
                  <strong className="text-white">{email}</strong>
                </p>
                <p className="text-xs text-yellow-400 mb-6">
                  ⚠️ Demo mode — no actual email is sent. Check browser console for details.
                </p>
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Back to Login
                </Link>
              </motion.div>
            ) : (
              <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-white mb-1">Reset Password</h2>
                  <p className="text-gray-400 text-sm">Enter your email to receive a reset link</p>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                    className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-2 text-sm text-red-400"
                  >
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {error}
                  </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400 mb-1.5 block">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                      <input
                        type="email" value={email} onChange={e => setEmail(e.target.value)}
                        placeholder="your@email.com" autoComplete="email"
                        className="w-full pl-10 pr-4 py-3 glass rounded-xl border border-white/10 bg-transparent text-white placeholder-gray-600 outline-none focus:border-blue-500/50 transition-colors"
                      />
                    </div>
                  </div>
                  <button type="submit" disabled={loading}
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-semibold text-white disabled:opacity-50 hover:from-blue-500 hover:to-purple-500 transition-all flex items-center justify-center gap-2">
                    {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Sending...</> : "Send Reset Link"}
                  </button>
                </form>

                <p className="text-center text-sm text-gray-500 mt-6">
                  <Link href="/login" className="text-blue-400 hover:text-blue-300 flex items-center justify-center gap-2 transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Login
                  </Link>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
