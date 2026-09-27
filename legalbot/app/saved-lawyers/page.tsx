"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Users, Star, MapPin, ArrowLeft, Calendar,
  Scale, Wifi, Building2, Heart, Briefcase, Home, ShoppingBag
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import {
  getSavedLawyers, unsaveLawyer,
  type SavedLawyerItem
} from "@/lib/savedLawyers";

const specIcons: Record<string, React.ElementType> = {
  Criminal: Scale, Civil: Building2, Family: Heart, Corporate: Briefcase,
  Cyber: Wifi, Property: Home, Labor: Users, Consumer: ShoppingBag, "Women Rights": Heart,
};

export default function SavedLawyersPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();
  const [saved, setSaved] = useState<SavedLawyerItem[]>([]);

  useEffect(() => {
    if (!isLoading && !user) { router.push("/login"); return; }
    if (user) setSaved(getSavedLawyers(user.id));
  }, [user, isLoading, router]);

  const handleUnsave = (lawyerId: number) => {
    if (!user) return;
    unsaveLawyer(user.id, lawyerId);
    setSaved(prev => prev.filter(l => l.lawyerId !== lawyerId));
  };

  if (isLoading || !user) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen pt-20 pb-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <Link href="/dashboard" className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors text-sm">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </Link>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gradient">Saved Lawyers</h1>
            <p className="text-gray-400 mt-1">{saved.length} lawyer{saved.length !== 1 ? "s" : ""} saved</p>
          </div>
          <Link href="/lawyers"
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-sm font-medium text-white hover:from-blue-500 hover:to-purple-500 transition-all">
            <Users className="w-4 h-4" /> Find More Lawyers
          </Link>
        </div>
      </motion.div>

      {saved.length === 0 ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="glass rounded-2xl border border-white/10 p-12 text-center">
          <Heart className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-400 mb-2">No saved lawyers yet</h3>
          <p className="text-gray-500 text-sm mb-6">Save lawyers from the Find Lawyers section to access them quickly.</p>
          <Link href="/lawyers"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-white font-medium hover:from-blue-500 hover:to-purple-500 transition-all">
            Find Lawyers
          </Link>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <AnimatePresence>
            {saved.map((lawyer, i) => {
              const Icon = specIcons[lawyer.specialization] || Scale;
              return (
                <motion.div key={lawyer.id}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }} transition={{ delay: i * 0.05 }}
                  whileHover={{ y: -4 }}
                  className="glass rounded-2xl border border-white/10 p-5 flex flex-col">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg">
                      {lawyer.name.split(" ")[1]?.[0] || "A"}
                    </div>
                    <button onClick={() => handleUnsave(lawyer.lawyerId)}
                      className="p-2 hover:bg-red-500/10 rounded-lg transition-colors group">
                      <Heart className="w-4 h-4 text-red-400 fill-red-400 group-hover:fill-transparent transition-all" />
                    </button>
                  </div>
                  <h3 className="font-semibold text-white mb-1">{lawyer.name}</h3>
                  <div className="flex items-center gap-1.5 mb-3">
                    <Icon className="w-3.5 h-3.5 text-blue-400" />
                    <p className="text-sm text-blue-400">{lawyer.specialization}</p>
                  </div>
                  <div className="space-y-1.5 text-sm text-gray-400 flex-1">
                    <div className="flex items-center gap-2">
                      <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
                      {lawyer.rating}
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5 text-blue-400" />
                      {lawyer.city}
                    </div>
                    <div className="text-xs text-gray-500">
                      Saved {new Date(lawyer.savedAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="mt-3 p-2 bg-white/5 rounded-lg mb-3">
                    <p className="text-xs text-gray-500">Estimated Fee</p>
                    <p className="font-bold text-white text-sm">₹{lawyer.feeMin.toLocaleString()} – ₹{lawyer.feeMax.toLocaleString()}</p>
                  </div>
                  <div className="flex gap-2">
                    <Link href={`/lawyers/${lawyer.lawyerId}`}
                      className="flex-1 py-2 glass rounded-xl text-xs text-center text-gray-300 hover:text-white border border-white/10 hover:bg-white/10 transition-all">
                      View Profile
                    </Link>
                    <Link href="/lawyers"
                      className="flex-1 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-xs font-medium text-white text-center hover:from-blue-500 hover:to-purple-500 transition-all flex items-center justify-center gap-1">
                      <Calendar className="w-3 h-3" /> Book
                    </Link>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
