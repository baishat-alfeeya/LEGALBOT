"use client";
import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Search, MapPin, Star, Phone, Calendar, X, CheckCircle, ChevronRight, Wifi, Building2, Users, Scale, Home, Briefcase, ShoppingBag, Heart, Filter } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import { lawyers, cities, specializations, getFeeRange, type Specialization, type City } from "@/lib/lawyers";
import BookingModal from "@/components/BookingModal";
import { saveLawyer, unsaveLawyer, getSavedLawyers } from "@/lib/savedLawyers";

const specIcons: Record<string, React.ElementType> = {
  Criminal: Scale, Civil: Building2, Family: Heart, Corporate: Briefcase,
  Cyber: Wifi, Property: Home, Labor: Users, Consumer: ShoppingBag, "Women Rights": Heart,
};

const issueToSpec: Record<string, Specialization> = {
  "stolen phone": "Criminal", "theft": "Criminal", "robbery": "Criminal", "assault": "Criminal",
  "divorce": "Family", "custody": "Family", "marriage": "Family", "domestic": "Family",
  "property": "Property", "land": "Property", "rent": "Property", "landlord": "Property",
  "cyber": "Cyber", "fraud": "Cyber", "hacking": "Cyber", "online": "Cyber",
  "employment": "Labor", "salary": "Labor", "termination": "Labor", "workplace": "Labor",
  "consumer": "Consumer", "product": "Consumer", "refund": "Consumer", "defective": "Consumer",
  "company": "Corporate", "contract": "Corporate", "business": "Corporate", "startup": "Corporate",
  "harassment": "Women Rights", "women": "Women Rights", "dowry": "Women Rights",
};

function detectSpec(issue: string): Specialization | null {
  const lower = issue.toLowerCase();
  for (const [kw, spec] of Object.entries(issueToSpec)) {
    if (lower.includes(kw)) return spec;
  }
  return null;
}

type Step = "issue" | "city" | "budget" | "mode" | "results";

function LawyersContent() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<Step>("issue");
  const [selectionMode, setSelectionMode] = useState<"recommended" | "self" | null>(null);
  const [selfSearch, setSelfSearch] = useState("");
  const [issue, setIssue] = useState("");
  const [detectedSpec, setDetectedSpec] = useState<Specialization | null>(null);
  const [selectedSpec, setSelectedSpec] = useState<Specialization | null>(null);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);
  const [budget, setBudget] = useState<"affordable" | "standard" | "premium" | "any">("any");
  const [mode, setMode] = useState<"Online" | "Offline" | "any">("any");
  const [search, setSearch] = useState("");
  const [bookingLawyer, setBookingLawyer] = useState<typeof lawyers[0] | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<string | null>(null);
  const [savedIds, setSavedIds] = useState<Set<number>>(new Set());

  // Load saved lawyer IDs on mount
  useEffect(() => {
    if (user) {
      const saved = getSavedLawyers(user.id);
      setSavedIds(new Set(saved.map(l => l.lawyerId)));
    }
  }, [user]);

  const toggleSave = (lawyer: typeof lawyers[0]) => {
    if (!user) return;
    if (savedIds.has(lawyer.id)) {
      unsaveLawyer(user.id, lawyer.id);
      setSavedIds(prev => { const s = new Set(prev); s.delete(lawyer.id); return s; });
    } else {
      saveLawyer(user.id, {
        lawyerId: lawyer.id, name: lawyer.name, specialization: lawyer.specialization,
        city: lawyer.city, feeMin: lawyer.feeMin, feeMax: lawyer.feeMax,
        rating: lawyer.rating, mode: lawyer.mode,
      });
      setSavedIds(prev => new Set(prev).add(lawyer.id));
    }
  };

  useEffect(() => {
    const spec = searchParams.get("specialization") as Specialization;
    const city = searchParams.get("location") as City;
    if (spec && specializations.includes(spec)) { setSelectedSpec(spec); setStep("city"); }
    if (city && cities.includes(city)) { setSelectedCity(city); if (spec) setStep("results"); }
  }, [searchParams]);

  const handleIssueSubmit = () => {
    const spec = detectSpec(issue);
    setDetectedSpec(spec);
    setSelectedSpec(spec);
    setStep("city");
  };

  // Primary filter — in self-select mode, skip spec/city/budget/mode filters unless user set them
  const filteredLawyers = lawyers.filter((l) => {
    if (selectionMode !== "self") {
      if (selectedSpec && l.specialization !== selectedSpec) return false;
      if (selectedCity && l.city !== selectedCity) return false;
      if (budget === "affordable" && l.feeMin > 2000) return false;
      if (budget === "standard" && (l.feeMin < 1000 || l.feeMin > 8000)) return false;
      if (budget === "premium" && l.feeMin < 5000) return false;
      if (mode !== "any" && l.mode !== "Both" && l.mode !== mode) return false;
    } else {
      // Self-select: only apply spec filter if user clicked a chip
      if (selectedSpec && l.specialization !== selectedSpec) return false;
    }
    if (search && !l.name.toLowerCase().includes(search.toLowerCase()) && !l.specialization.toLowerCase().includes(search.toLowerCase()) && !l.city.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // Fallback: relax city filter if no results
  const fallbackLawyers = filteredLawyers.length === 0 ? lawyers.filter((l) => {
    if (selectedSpec && l.specialization !== selectedSpec) return false;
    if (search && !l.name.toLowerCase().includes(search.toLowerCase()) && !l.specialization.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  }).slice(0, 6) : [];

  const isFallback = filteredLawyers.length === 0 && fallbackLawyers.length > 0;
  const displayedLawyers = isFallback ? fallbackLawyers : filteredLawyers;

  const resetFlow = () => { setStep("issue"); setIssue(""); setDetectedSpec(null); setSelectedSpec(null); setSelectedCity(null); setBudget("any"); setMode("any"); setSelectionMode(null); setSelfSearch(""); };

  return (
    <div className="min-h-screen pt-20 pb-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-4xl font-bold text-gradient mb-2">{t("lawyers")}</h1>
        <p className="text-gray-400">Guided lawyer recommendation with transparent, market-aligned fees</p>
        <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-yellow-500/10 border border-yellow-500/30 rounded-full text-xs text-yellow-400">
          ⚠️ For Demonstration Purposes Only — All fees are estimated
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {step !== "results" && (
          <motion.div key={step} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}
            className="glass rounded-2xl border border-white/10 p-8 mb-8 max-w-2xl mx-auto">

            {/* Step indicator */}
            <div className="flex items-center gap-2 mb-6">
              {(["issue","city","budget","mode"] as Step[]).map((s, i) => (
                <div key={s} className={`flex items-center gap-1 ${i > 0 ? "flex-1" : ""}`}>
                  {i > 0 && <div className={`flex-1 h-0.5 ${["city","budget","mode","results"].indexOf(step) > i - 1 ? "bg-blue-500" : "bg-white/10"}`} />}
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step === s ? "bg-blue-600 text-white" : ["city","budget","mode","results"].indexOf(step) > ["issue","city","budget","mode"].indexOf(s) ? "bg-green-500 text-white" : "bg-white/10 text-gray-400"}`}>
                    {["city","budget","mode","results"].indexOf(step) > ["issue","city","budget","mode"].indexOf(s) ? "✓" : i + 1}
                  </div>
                </div>
              ))}
            </div>

            {step === "issue" && (
              <div>
                {/* ── Mode selector: Recommended vs Self ─────────────────── */}
                {!selectionMode && (
                  <div>
                    <h2 className="text-xl font-bold mb-2">How would you like to find a lawyer?</h2>
                    <p className="text-gray-400 text-sm mb-6">Choose how you want to proceed.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <motion.button
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        onClick={() => setSelectionMode("recommended")}
                        className="glass rounded-2xl border border-blue-500/30 p-6 text-left hover:bg-blue-500/5 transition-all group">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                          <Users className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="font-bold text-white mb-1">Get Recommended Lawyer</h3>
                        <p className="text-xs text-gray-400 leading-relaxed">Answer a few questions and we'll suggest the best lawyers for your issue, city, and budget.</p>
                        <div className="mt-3 text-xs text-blue-400 flex items-center gap-1">Guided flow <ChevronRight className="w-3 h-3" /></div>
                      </motion.button>

                      <motion.button
                        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                        onClick={() => { setSelectionMode("self"); setStep("results"); }}
                        className="glass rounded-2xl border border-purple-500/30 p-6 text-left hover:bg-purple-500/5 transition-all group">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                          <Search className="w-6 h-6 text-white" />
                        </div>
                        <h3 className="font-bold text-white mb-1">Select Lawyer Yourself</h3>
                        <p className="text-xs text-gray-400 leading-relaxed">Browse all 65+ lawyers, search by name or specialization, and pick the one you prefer.</p>
                        <div className="mt-3 text-xs text-purple-400 flex items-center gap-1">Browse all <ChevronRight className="w-3 h-3" /></div>
                      </motion.button>
                    </div>
                  </div>
                )}

                {/* ── Recommended flow ────────────────────────────────────── */}
                {selectionMode === "recommended" && (
                  <div>
                    <button onClick={() => setSelectionMode(null)} className="flex items-center gap-1 text-xs text-gray-400 hover:text-white mb-4 transition-colors">
                      ← Back
                    </button>
                    <h2 className="text-xl font-bold mb-2">What is your legal issue?</h2>
                <p className="text-gray-400 text-sm mb-4">Describe your problem and I will recommend the right type of lawyer.</p>
                <textarea value={issue} onChange={(e) => setIssue(e.target.value)}
                  placeholder="e.g. My phone was stolen, I need help with divorce, landlord is not returning deposit..."
                  rows={3} className="w-full bg-transparent border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 outline-none focus:border-blue-500/50 resize-none mb-4" />
                <div className="flex flex-wrap gap-2 mb-4">
                  {["My phone was stolen","Divorce proceedings","Property dispute","Cyber fraud","Workplace harassment","Consumer complaint"].map((s) => (
                    <button key={s} onClick={() => setIssue(s)} className="text-xs px-3 py-1.5 glass rounded-full text-gray-400 hover:text-white border border-white/10 hover:bg-white/10 transition-all">{s}</button>
                  ))}
                </div>
                <div className="mb-4">
                  <p className="text-sm text-gray-400 mb-2">Or select specialization directly:</p>
                  <div className="grid grid-cols-3 gap-2">
                    {specializations.map((spec) => {
                      const Icon = specIcons[spec] || Scale;
                      return (
                        <button key={spec} onClick={() => { setSelectedSpec(spec); setStep("city"); }}
                          className={`flex items-center gap-2 p-2 rounded-xl text-xs transition-all glass border border-white/10 hover:bg-white/10 text-gray-300`}>
                          <Icon className="w-3.5 h-3.5 text-blue-400 flex-shrink-0" />{spec}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <button onClick={handleIssueSubmit} disabled={!issue.trim()}
                  className="w-full py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-semibold disabled:opacity-50 hover:from-blue-500 hover:to-purple-500 transition-all flex items-center justify-center gap-2">
                  Continue <ChevronRight className="w-4 h-4" />
                </button>
              </div>
                )} {/* end selectionMode === recommended */}
              </div>
            )}

            {step === "city" && (
              <div>
                {detectedSpec && (
                  <div className="mb-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-xl text-sm text-blue-300">
                    🎯 Based on your issue, I recommend a <strong>{detectedSpec}</strong> lawyer.
                  </div>
                )}
                <h2 className="text-xl font-bold mb-2">Which city are you in?</h2>
                <p className="text-gray-400 text-sm mb-4">Fees vary by city. Metro cities have higher rates.</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
                  {cities.map((city) => (
                    <button key={city} onClick={() => setSelectedCity(city)}
                      className={`p-3 rounded-xl text-sm font-medium transition-all border ${selectedCity === city ? "bg-blue-600 border-blue-500 text-white" : "glass border-white/10 text-gray-300 hover:bg-white/10"}`}>
                      {city}
                    </button>
                  ))}
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setStep("issue")} className="flex-1 py-3 glass rounded-xl text-gray-300 border border-white/10 hover:bg-white/10 transition-all">Back</button>
                  <button onClick={() => setStep("budget")} disabled={!selectedCity}
                    className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-semibold disabled:opacity-50 hover:from-blue-500 hover:to-purple-500 transition-all flex items-center justify-center gap-2">
                    Continue <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {step === "budget" && (
              <div>
                <h2 className="text-xl font-bold mb-2">What is your budget?</h2>
                <p className="text-gray-400 text-sm mb-4">Estimated consultation fees per session.</p>
                {selectedSpec && selectedCity && (
                  <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-xl text-sm text-green-300">
                    💰 Estimated fee for {selectedSpec} lawyer in {selectedCity}: ₹{getFeeRange(selectedSpec, selectedCity)[0].toLocaleString()} – ₹{getFeeRange(selectedSpec, selectedCity)[1].toLocaleString()}
                  </div>
                )}
                {[
                  { key: "affordable", label: "Affordable", range: "₹0 – ₹2,000", desc: "Legal aid, junior advocates" },
                  { key: "standard", label: "Standard", range: "₹2,000 – ₹8,000", desc: "Experienced advocates" },
                  { key: "premium", label: "Premium", range: "₹8,000+", desc: "Senior counsel, specialists" },
                  { key: "any", label: "No Preference", range: "All ranges", desc: "Show all lawyers" },
                ].map((b) => (
                  <button key={b.key} onClick={() => setBudget(b.key as typeof budget)}
                    className={`w-full flex items-center justify-between p-4 rounded-xl mb-2 border transition-all ${budget === b.key ? "bg-blue-600/20 border-blue-500 text-white" : "glass border-white/10 text-gray-300 hover:bg-white/10"}`}>
                    <div className="text-left">
                      <div className="font-medium">{b.label}</div>
                      <div className="text-xs text-gray-400">{b.desc}</div>
                    </div>
                    <span className="text-sm font-mono text-blue-400">{b.range}</span>
                  </button>
                ))}
                <div className="flex gap-3 mt-4">
                  <button onClick={() => setStep("city")} className="flex-1 py-3 glass rounded-xl text-gray-300 border border-white/10 hover:bg-white/10 transition-all">Back</button>
                  <button onClick={() => setStep("mode")}
                    className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-semibold hover:from-blue-500 hover:to-purple-500 transition-all flex items-center justify-center gap-2">
                    Continue <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {step === "mode" && (
              <div>
                <h2 className="text-xl font-bold mb-2">Consultation preference?</h2>
                <p className="text-gray-400 text-sm mb-4">How would you like to meet the lawyer?</p>
                {[
                  { key: "Online", label: "Online", icon: "💻", desc: "Video call, phone, or chat" },
                  { key: "Offline", label: "In-Person", icon: "🏛️", desc: "Visit lawyer's office or court" },
                  { key: "any", label: "No Preference", icon: "🔄", desc: "Both online and offline" },
                ].map((m) => (
                  <button key={m.key} onClick={() => setMode(m.key as typeof mode)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl mb-3 border transition-all ${mode === m.key ? "bg-blue-600/20 border-blue-500 text-white" : "glass border-white/10 text-gray-300 hover:bg-white/10"}`}>
                    <span className="text-2xl">{m.icon}</span>
                    <div className="text-left">
                      <div className="font-medium">{m.label}</div>
                      <div className="text-xs text-gray-400">{m.desc}</div>
                    </div>
                  </button>
                ))}
                <div className="flex gap-3 mt-4">
                  <button onClick={() => setStep("budget")} className="flex-1 py-3 glass rounded-xl text-gray-300 border border-white/10 hover:bg-white/10 transition-all">Back</button>
                  <button onClick={() => setStep("results")}
                    className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-semibold hover:from-blue-500 hover:to-purple-500 transition-all flex items-center justify-center gap-2">
                    Find Lawyers <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        )}

        {step === "results" && (
          <motion.div key="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {/* Summary bar */}
            <div className="glass rounded-xl border border-white/10 p-4 mb-6 flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap gap-2 text-sm">
                {selectedSpec && <span className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full border border-blue-500/30">{selectedSpec}</span>}
                {selectedCity && <span className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full border border-purple-500/30">{selectedCity}</span>}
                {budget !== "any" && <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full border border-green-500/30 capitalize">{budget}</span>}
                {mode !== "any" && <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full border border-yellow-500/30">{mode}</span>}
              </div>
              <button onClick={resetFlow} className="text-sm text-gray-400 hover:text-white flex items-center gap-1 transition-colors">
                <X className="w-4 h-4" /> Modify Search
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name or specialization..."
                  className="w-full pl-10 pr-4 py-3 glass rounded-xl border border-white/10 bg-transparent text-white placeholder-gray-500 outline-none focus:border-blue-500/50" />
              </div>
              <span className="text-sm text-gray-400 self-center">{displayedLawyers.length} lawyers found</span>
            </div>

            {/* Self-select mode: specialization filter chips */}
            {selectionMode === "self" && (
              <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
                className="mb-5 p-4 bg-purple-500/10 border border-purple-500/30 rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <Search className="w-4 h-4 text-purple-400" />
                  <p className="text-sm font-semibold text-purple-400">Browse All {lawyers.length} Lawyers</p>
                  <span className="text-xs text-gray-500 ml-auto">Filter by specialization:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button onClick={() => setSelectedSpec(null)}
                    className={`text-xs px-3 py-1.5 rounded-full border transition-all ${!selectedSpec ? "bg-purple-600 border-purple-500 text-white" : "glass border-white/10 text-gray-400 hover:bg-white/10"}`}>
                    All
                  </button>
                  {specializations.map(spec => (
                    <button key={spec} onClick={() => setSelectedSpec(selectedSpec === spec ? null : spec)}
                      className={`text-xs px-3 py-1.5 rounded-full border transition-all ${selectedSpec === spec ? "bg-purple-600 border-purple-500 text-white" : "glass border-white/10 text-gray-400 hover:bg-white/10"}`}>
                      {spec}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
            {isFallback && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="mb-5 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl flex items-start gap-3">
                <Filter className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-yellow-400">No exact match in {selectedCity}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Showing {selectedSpec} lawyers from other cities. You can also consult them online.</p>
                </div>
              </motion.div>
            )}

            {confirmedBooking && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 bg-green-500/10 border border-green-500/30 rounded-xl flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <div>
                    <p className="font-semibold text-green-400">Demo Booking Confirmed!</p>
                    <p className="text-sm text-gray-400">Booking ID: <span className="font-mono text-white">{confirmedBooking}</span> — This is a demo booking only.</p>
                  </div>
                </div>
                <button onClick={() => setConfirmedBooking(null)}><X className="w-4 h-4 text-gray-400" /></button>
              </motion.div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {displayedLawyers.map((lawyer, i) => {
                const Icon = specIcons[lawyer.specialization] || Scale;
                return (
                  <motion.div key={lawyer.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }} whileHover={{ y: -4 }}
                    className="glass rounded-2xl border border-white/10 p-5 flex flex-col">
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold text-lg">
                        {lawyer.name.split(" ")[1]?.[0] || "A"}
                      </div>
                      <span className={`text-xs px-2 py-1 rounded-full ${lawyer.available ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"}`}>
                        {lawyer.available ? "Available" : "Busy"}
                      </span>
                    </div>
                    <h3 className="font-semibold text-white mb-1">{lawyer.name}</h3>
                    <div className="flex items-center gap-1.5 mb-3">
                      <Icon className="w-3.5 h-3.5 text-blue-400" />
                      <p className="text-sm text-blue-400">{lawyer.specialization}</p>
                    </div>
                    <p className="text-xs text-gray-500 mb-3 line-clamp-2">{lawyer.bio}</p>
                    <div className="space-y-1.5 text-sm text-gray-400 flex-1">
                      <div className="flex items-center gap-2"><Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />{lawyer.rating} ({lawyer.reviewCount} reviews) • {lawyer.experience} yrs</div>
                      <div className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-blue-400" />{lawyer.distance} • {lawyer.city}</div>
                      <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-green-400" />{lawyer.phone}</div>
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-gray-500">Mode:</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs ${lawyer.mode === "Online" ? "bg-cyan-500/20 text-cyan-400" : lawyer.mode === "Offline" ? "bg-orange-500/20 text-orange-400" : "bg-purple-500/20 text-purple-400"}`}>{lawyer.mode}</span>
                      </div>
                    </div>
                    <div className="mt-3 p-2 bg-white/5 rounded-lg">
                      <p className="text-xs text-gray-500">Estimated Consultation Fee</p>
                      <p className="font-bold text-white">₹{lawyer.feeMin.toLocaleString()} – ₹{lawyer.feeMax.toLocaleString()}</p>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <a href={`/lawyers/${lawyer.id}`} className="flex-1 py-2 glass rounded-xl text-sm text-center text-gray-300 hover:text-white border border-white/10 hover:bg-white/10 transition-all">View Profile</a>
                      {user && (
                        <button
                          onClick={() => toggleSave(lawyer)}
                          className={`p-2 rounded-xl border transition-all ${savedIds.has(lawyer.id) ? "bg-rose-500/20 border-rose-500/30 text-rose-400" : "glass border-white/10 text-gray-400 hover:text-rose-400 hover:border-rose-500/30"}`}
                          title={savedIds.has(lawyer.id) ? "Unsave" : "Save lawyer"}>
                          <Heart className={`w-4 h-4 ${savedIds.has(lawyer.id) ? "fill-rose-400" : ""}`} />
                        </button>
                      )}
                      <button onClick={() => setBookingLawyer(lawyer)} disabled={!lawyer.available}
                        className="flex-1 py-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-sm font-medium disabled:opacity-40 hover:from-blue-500 hover:to-purple-500 transition-all flex items-center justify-center gap-1">
                        <Calendar className="w-3.5 h-3.5" /> Book
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
            {displayedLawyers.length === 0 && (
              <div className="text-center py-20">
                <p className="text-gray-400 text-lg mb-2">No lawyers found</p>
                <p className="text-gray-500 text-sm mb-4">Try adjusting your filters or selecting a different city.</p>
                <button onClick={resetFlow} className="px-6 py-2.5 bg-blue-600/20 border border-blue-500/30 rounded-xl text-blue-400 text-sm hover:bg-blue-600/30 transition-colors">
                  Start Over
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {bookingLawyer && (
        <BookingModal lawyer={bookingLawyer} onClose={() => setBookingLawyer(null)}
          onConfirm={(id) => { setConfirmedBooking(id); setBookingLawyer(null); }} />
      )}
    </div>
  );
}

export default function LawyersPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <LawyersContent />
    </Suspense>
  );
}
