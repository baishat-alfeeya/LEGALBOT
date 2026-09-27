"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { User, Mail, Save, ArrowLeft, Loader2, CheckCircle } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function ProfilePage() {
  const router = useRouter();
  const { user, isLoading, updateProfile } = useAuth();
  const [name, setName]     = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);

  useEffect(() => {
    if (!isLoading && !user) router.push("/login");
    if (user) setName(user.name);
  }, [user, isLoading, router]);

  if (isLoading || !user) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    await new Promise(r => setTimeout(r, 600));
    updateProfile({ name: name.trim() });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="min-h-screen pt-20 pb-10 px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <Link href="/dashboard" className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-gradient">My Profile</h1>
        <p className="text-gray-400 mt-1">Manage your account information</p>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="glass rounded-2xl border border-white/10 p-8">

        {/* Avatar */}
        <div className="flex items-center gap-5 mb-8 pb-8 border-b border-white/10">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-3xl">
            {user.name[0].toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{user.name}</h2>
            <p className="text-gray-400 text-sm">{user.email}</p>
            <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full mt-1 inline-block capitalize">
              {user.provider} account
            </span>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label className="text-sm text-gray-400 mb-1.5 block">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input type="text" value={name} onChange={e => setName(e.target.value)}
                className="w-full pl-10 pr-4 py-3 glass rounded-xl border border-white/10 bg-transparent text-white outline-none focus:border-blue-500/50 transition-colors" />
            </div>
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-1.5 block">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input type="email" value={user.email} disabled
                className="w-full pl-10 pr-4 py-3 glass rounded-xl border border-white/5 bg-transparent text-gray-500 outline-none cursor-not-allowed" />
            </div>
            <p className="text-xs text-gray-600 mt-1">Email cannot be changed in demo mode</p>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="glass rounded-xl border border-white/10 p-4">
              <p className="text-gray-500 mb-1">Member Since</p>
              <p className="text-white font-medium">{new Date(user.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="glass rounded-xl border border-white/10 p-4">
              <p className="text-gray-500 mb-1">Account ID</p>
              <p className="text-white font-mono text-xs">{user.id.slice(0, 12)}...</p>
            </div>
          </div>
          <button type="submit" disabled={saving}
            className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-semibold text-white disabled:opacity-50 hover:from-blue-500 hover:to-purple-500 transition-all flex items-center justify-center gap-2">
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
              : saved ? <><CheckCircle className="w-4 h-4" /> Saved!</>
              : <><Save className="w-4 h-4" /> Save Changes</>}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
