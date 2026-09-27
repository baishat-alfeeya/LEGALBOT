"use client";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, Phone, MapPin, Globe, AlertTriangle, CheckCircle,
  ChevronRight, ArrowLeft, Send, Loader2, MessageSquare, RefreshCw
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

// ─── Types ────────────────────────────────────────────────────────────────────
type Scenario = "lost_passport" | "medical" | "theft" | "safety" | "local_law" | null;

interface GuidanceResult {
  title: string;
  understanding: string;
  steps: string[];
  helplines: { name: string; number: string; color: string }[];
  tips: string[];
  legalNote?: string;
}

// ─── Scenario cards ───────────────────────────────────────────────────────────
const scenarios = [
  { key: "lost_passport", icon: "🛂", label: "Lost Passport / Documents", border: "border-blue-500/30",   bg: "hover:bg-blue-500/5"   },
  { key: "medical",       icon: "🏥", label: "Medical Emergency",          border: "border-red-500/30",    bg: "hover:bg-red-500/5"    },
  { key: "theft",         icon: "🔓", label: "Theft or Fraud",             border: "border-orange-500/30", bg: "hover:bg-orange-500/5" },
  { key: "safety",        icon: "⚠️", label: "Safety Concerns",            border: "border-yellow-500/30", bg: "hover:bg-yellow-500/5" },
  { key: "local_law",     icon: "⚖️", label: "Local Law Assistance",       border: "border-purple-500/30", bg: "hover:bg-purple-500/5" },
];

// ─── Static scenario data ─────────────────────────────────────────────────────
const scenarioData: Record<string, GuidanceResult> = {
  lost_passport: {
    title: "Lost Passport / Documents",
    understanding: "Losing your passport or travel documents in India is stressful but manageable. Indian authorities and your embassy have clear procedures to help you.",
    steps: [
      "Stay calm — report to the nearest police station immediately",
      "File an FIR (First Information Report) for the lost document",
      "Contact your country's embassy or consulate in India",
      "Apply for an Emergency Travel Document (ETD) at your embassy",
      "Carry the FIR copy as proof while your replacement is processed",
      "Inform your airline if you have upcoming travel",
    ],
    helplines: [
      { name: "Tourist Helpline", number: "1363",          color: "bg-blue-500/20 text-blue-400 border-blue-500/30"   },
      { name: "Police",           number: "100",           color: "bg-red-500/20 text-red-400 border-red-500/30"     },
      { name: "Foreign Nationals",number: "1800-11-1363",  color: "bg-green-500/20 text-green-400 border-green-500/30" },
    ],
    tips: ["Keep digital copies of all documents in your email", "Note your passport number before travelling", "Register with your embassy upon arrival in India"],
    legalNote: "Under Indian law, you have the right to file a Zero FIR at any police station regardless of jurisdiction.",
  },
  medical: {
    title: "Medical Emergency",
    understanding: "India has a national ambulance service and government hospitals are required to provide emergency treatment regardless of your nationality or ability to pay.",
    steps: [
      "Call 108 (National Ambulance Service) immediately",
      "If conscious, move to a safe location away from traffic",
      "Contact your travel insurance provider for cashless hospitalization",
      "Inform your hotel or accommodation about the emergency",
      "Contact your embassy for assistance with medical repatriation if needed",
      "Keep all medical bills and reports for insurance claims",
    ],
    helplines: [
      { name: "Ambulance",     number: "108",           color: "bg-red-500/20 text-red-400 border-red-500/30"     },
      { name: "Emergency",     number: "112",           color: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
      { name: "AIIMS Helpline",number: "011-26588500",  color: "bg-blue-500/20 text-blue-400 border-blue-500/30"   },
    ],
    tips: ["Carry your travel insurance card at all times", "Note blood group and allergies on a card in your wallet", "Most government hospitals provide free emergency treatment"],
    legalNote: "Under Article 21 of the Indian Constitution, every person has the right to emergency medical treatment regardless of nationality.",
  },
  theft: {
    title: "Theft or Fraud",
    understanding: "Theft is a cognizable offence under Section 379 IPC. Police are legally bound to register your FIR. Act quickly to preserve evidence and protect your finances.",
    steps: [
      "Do not confront the thief — your safety is the priority",
      "Call Police immediately: 100",
      "File an FIR at the nearest police station within 24 hours",
      "Block your credit/debit cards immediately by calling your bank",
      "Report cyber fraud at cybercrime.gov.in or call 1930",
      "Contact your embassy if travel documents were stolen",
      "Keep the FIR copy for insurance claims and embassy assistance",
    ],
    helplines: [
      { name: "Police",          number: "100",  color: "bg-blue-500/20 text-blue-400 border-blue-500/30"     },
      { name: "Cyber Crime",     number: "1930", color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
      { name: "Tourist Helpline",number: "1363", color: "bg-green-500/20 text-green-400 border-green-500/30"   },
    ],
    tips: ["Carry only necessary cash and cards", "Use hotel safe for valuables and extra documents", "Avoid displaying expensive items in crowded areas"],
    legalNote: "If police refuse to register your FIR, you can approach the Superintendent of Police or file a complaint before a Magistrate under Section 156(3) CrPC.",
  },
  safety: {
    title: "Safety Concerns",
    understanding: "Your safety is the top priority. India has multiple emergency services and legal protections for tourists facing safety threats.",
    steps: [
      "Move to a well-lit, populated public area immediately",
      "Call Police: 100 or National Emergency: 112",
      "Contact your hotel or a trusted local contact",
      "Share your live location with family or friends",
      "Avoid isolated areas, especially at night",
      "Contact your embassy if you feel your safety is at serious risk",
    ],
    helplines: [
      { name: "Police",            number: "100",  color: "bg-blue-500/20 text-blue-400 border-blue-500/30"   },
      { name: "National Emergency",number: "112",  color: "bg-red-500/20 text-red-400 border-red-500/30"     },
      { name: "Women Helpline",    number: "1091", color: "bg-pink-500/20 text-pink-400 border-pink-500/30"   },
    ],
    tips: ["Download offline maps before travelling to remote areas", "Register your travel plans with your embassy", "Use reputable transportation apps like Ola or Uber"],
    legalNote: "Harassment of tourists is a criminal offence in India. You have the right to file a complaint and receive police protection.",
  },
  local_law: {
    title: "Local Law Assistance",
    understanding: "As a foreign national in India, you have specific legal rights including the right to contact your embassy, right to an interpreter, and right to legal representation.",
    steps: [
      "If arrested, you have the right to remain silent",
      "Request to contact your embassy or consulate immediately",
      "You have the right to an interpreter during questioning",
      "Do not sign any documents without understanding them",
      "Request a lawyer before making any statements to police",
      "Contact NALSA for free legal aid: 15100",
    ],
    helplines: [
      { name: "NALSA Legal Aid",  number: "15100", color: "bg-green-500/20 text-green-400 border-green-500/30"   },
      { name: "Police",           number: "100",   color: "bg-blue-500/20 text-blue-400 border-blue-500/30"     },
      { name: "Tourist Helpline", number: "1363",  color: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
    ],
    tips: ["Carry a copy of your visa and passport at all times", "Respect local customs and dress codes at religious sites", "Photography restrictions apply at many government buildings"],
    legalNote: "Under the Vienna Convention, you have the right to contact your embassy immediately upon arrest. Police must inform you of this right.",
  },
};

// ─── Keyword-based dynamic guidance ──────────────────────────────────────────
const touristKeywords: Record<string, Scenario> = {
  passport: "lost_passport", visa: "lost_passport", document: "lost_passport",
  id: "lost_passport", "identity card": "lost_passport", lost: "lost_passport",
  medical: "medical", hospital: "medical", sick: "medical", injury: "medical",
  accident: "medical", ambulance: "medical", doctor: "medical", hurt: "medical",
  theft: "theft", stolen: "theft", robbed: "theft", pickpocket: "theft",
  fraud: "theft", scam: "theft", cheated: "theft", money: "theft",
  safety: "safety", unsafe: "safety", threat: "safety", harass: "safety",
  follow: "safety", stalk: "safety", danger: "safety", scared: "safety",
  law: "local_law", arrest: "local_law", police: "local_law", legal: "local_law",
  court: "local_law", fine: "local_law", detained: "local_law",
};

function detectScenario(text: string): Scenario {
  const lower = text.toLowerCase();
  for (const [kw, scenario] of Object.entries(touristKeywords)) {
    if (lower.includes(kw)) return scenario;
  }
  return null;
}

// ─── Embassy data ─────────────────────────────────────────────────────────────
const embassies = [
  { country: "USA",       phone: "+91-11-2419-8000", emergency: "+91-11-2419-8000" },
  { country: "UK",        phone: "+91-11-2419-2100", emergency: "+91-11-2419-2100" },
  { country: "Australia", phone: "+91-11-4139-9900", emergency: "+61-2-6261-3305"  },
  { country: "Canada",    phone: "+91-11-4178-2000", emergency: "+1-613-996-8885"  },
  { country: "Germany",   phone: "+91-11-4419-9199", emergency: "+91-11-4419-9199" },
  { country: "France",    phone: "+91-11-2419-6100", emergency: "+91-11-2419-6100" },
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function TouristPage() {
  const { t } = useLanguage();
  const [selected, setSelected]       = useState<Scenario>(null);
  const [queryInput, setQueryInput]   = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [queryResult, setQueryResult] = useState<GuidanceResult | null>(null);
  const [queryError, setQueryError]   = useState("");
  const [submittedQuery, setSubmittedQuery] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const data = selected ? scenarioData[selected] : null;

  const handleQuerySubmit = async () => {
    const trimmed = queryInput.trim();
    if (!trimmed) {
      setQueryError("Please describe your problem before submitting.");
      return;
    }
    if (trimmed.length < 5) {
      setQueryError("Please provide more detail about your situation.");
      return;
    }

    setQueryError("");
    setIsProcessing(true);
    setSubmittedQuery(trimmed);
    setQueryResult(null);

    // Simulate AI processing
    await new Promise((r) => setTimeout(r, 1000 + Math.random() * 600));

    const detected = detectScenario(trimmed);
    if (detected) {
      setQueryResult(scenarioData[detected]);
    } else {
      // Generic fallback guidance
      setQueryResult({
        title: "General Tourist Assistance",
        understanding: `I understand you're facing an issue: "${trimmed.slice(0, 80)}${trimmed.length > 80 ? "..." : ""}". Here is general guidance for tourists in India.`,
        steps: [
          "Contact the Tourist Helpline: 1363 for immediate assistance",
          "If in danger, call National Emergency: 112",
          "Contact your country's embassy for consular assistance",
          "Visit the nearest police station for any legal issues",
          "Keep all documents and receipts related to your issue",
        ],
        helplines: [
          { name: "Tourist Helpline",  number: "1363", color: "bg-blue-500/20 text-blue-400 border-blue-500/30"   },
          { name: "National Emergency",number: "112",  color: "bg-red-500/20 text-red-400 border-red-500/30"     },
          { name: "NALSA Legal Aid",   number: "15100",color: "bg-green-500/20 text-green-400 border-green-500/30" },
        ],
        tips: [
          "Always carry a copy of your passport and visa",
          "Save emergency numbers in your phone",
          "Register with your embassy upon arrival",
        ],
        legalNote: "As a tourist in India, you have the right to consular access, interpreter services, and free legal aid through NALSA.",
      });
    }

    setIsProcessing(false);
  };

  const resetQuery = () => {
    setQueryInput("");
    setQueryResult(null);
    setSubmittedQuery("");
    setQueryError("");
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  // ─── Guidance detail view (shared by card-select and query-submit) ──────────
  const GuidanceView = ({ guidance, onBack }: { guidance: GuidanceResult; onBack: () => void }) => (
    <motion.div key="detail" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
      <button onClick={onBack} className="flex items-center gap-2 text-gray-400 hover:text-white mb-6 transition-colors text-sm">
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {/* Title card */}
      <div className="glass rounded-2xl border border-white/10 p-5 mb-5">
        <h2 className="text-xl font-bold text-white mb-1">{guidance.title}</h2>
        <p className="text-sm text-gray-400 leading-relaxed">{guidance.understanding}</p>
      </div>

      {/* Helplines — always first */}
      <div className="mb-5">
        <h3 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
          <Phone className="w-4 h-4 text-red-400" /> Emergency Helplines
        </h3>
        <div className="flex flex-wrap gap-3">
          {guidance.helplines.map((h, i) => (
            <a key={i} href={`tel:${h.number}`}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${h.color} hover:opacity-80 transition-opacity`}>
              <Phone className="w-4 h-4" />
              <div>
                <div className="font-bold text-lg leading-none">{h.number}</div>
                <div className="text-xs opacity-80 mt-0.5">{h.name}</div>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Steps */}
      <div className="mb-5">
        <h3 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
          📋 What to Do — Step by Step
        </h3>
        <div className="glass rounded-2xl border border-white/10 p-5 space-y-3">
          {guidance.steps.map((step, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className="flex items-start gap-3">
              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-xs font-bold text-blue-400">
                {i + 1}
              </span>
              <p className="text-sm text-gray-300 leading-relaxed">{step}</p>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Legal note */}
      {guidance.legalNote && (
        <div className="mb-5 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-start gap-3">
          <span className="text-blue-400 text-lg flex-shrink-0">⚖️</span>
          <div>
            <p className="text-xs font-semibold text-blue-400 mb-1">Legal Note</p>
            <p className="text-sm text-gray-300">{guidance.legalNote}</p>
          </div>
        </div>
      )}

      {/* Tips */}
      <div>
        <h3 className="text-base font-semibold text-white mb-3 flex items-center gap-2">
          💡 Prevention Tips
        </h3>
        <div className="space-y-2">
          {guidance.tips.map((tip, i) => (
            <div key={i} className="flex items-start gap-3 glass rounded-xl border border-white/10 p-3">
              <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-gray-300">{tip}</p>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen pt-20 pb-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">

      {/* Page header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center">
            <Shield className="w-5 h-5 text-teal-400" />
          </div>
          <h1 className="text-4xl font-bold text-gradient">{t("tourist")}</h1>
        </div>
        <p className="text-gray-400">Describe your problem or select a scenario — get instant legal guidance</p>
      </motion.div>

      <AnimatePresence mode="wait">

        {/* ── Query result view ─────────────────────────────────────────────── */}
        {queryResult && (
          <GuidanceView guidance={queryResult} onBack={resetQuery} />
        )}

        {/* ── Scenario detail view ──────────────────────────────────────────── */}
        {!queryResult && selected && data && (
          <GuidanceView guidance={data} onBack={() => setSelected(null)} />
        )}

        {/* ── Main landing view ─────────────────────────────────────────────── */}
        {!queryResult && !selected && (
          <motion.div key="main" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>

            {/* Emergency strip */}
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-red-400">Life-threatening emergency?</p>
                  <p className="text-sm text-gray-400">Call National Emergency immediately</p>
                </div>
              </div>
              <div className="flex gap-2">
                <a href="tel:112" className="px-4 py-2 bg-red-500/20 border border-red-500/30 rounded-xl text-red-400 font-bold hover:bg-red-500/30 transition-colors">112</a>
                <a href="tel:100" className="px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-xl text-blue-400 font-bold hover:bg-blue-500/30 transition-colors">100</a>
              </div>
            </div>

            {/* ── Text input section ──────────────────────────────────────── */}
            <div className="glass rounded-2xl border border-white/10 p-5 mb-8">
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="w-5 h-5 text-teal-400" />
                <h2 className="text-lg font-semibold text-white">Describe Your Problem</h2>
              </div>
              <p className="text-sm text-gray-400 mb-4">
                Tell us what happened in your own words — we will identify the issue and provide relevant legal guidance instantly.
              </p>

              <textarea
                ref={inputRef}
                value={queryInput}
                onChange={(e) => { setQueryInput(e.target.value); setQueryError(""); }}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleQuerySubmit(); } }}
                placeholder="e.g. My wallet was stolen at the market, I lost my passport, I am being followed and feel unsafe, police stopped me and I don't understand the language..."
                rows={3}
                disabled={isProcessing}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 outline-none focus:border-teal-500/50 resize-none text-sm leading-relaxed transition-colors disabled:opacity-50"
              />

              {queryError && (
                <p className="text-xs text-red-400 mt-2 flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3" /> {queryError}
                </p>
              )}

              {/* Example prompts */}
              <div className="flex flex-wrap gap-2 mt-3 mb-4">
                {[
                  "My passport was stolen",
                  "I had an accident and need help",
                  "Someone is following me",
                  "I was cheated by a shopkeeper",
                  "Police stopped me and I don't understand",
                ].map((ex) => (
                  <button key={ex} onClick={() => setQueryInput(ex)} disabled={isProcessing}
                    className="text-xs px-3 py-1.5 glass rounded-full text-gray-400 hover:text-white border border-white/10 hover:bg-white/10 transition-all disabled:opacity-40">
                    {ex}
                  </button>
                ))}
              </div>

              <button
                onClick={handleQuerySubmit}
                disabled={isProcessing || !queryInput.trim()}
                className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-teal-600 to-blue-600 rounded-xl font-semibold text-white disabled:opacity-40 hover:from-teal-500 hover:to-blue-500 transition-all">
                {isProcessing ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Analysing your situation...</>
                ) : (
                  <><Send className="w-4 h-4" /> Get Guidance</>
                )}
              </button>
            </div>

            {/* ── Scenario cards ──────────────────────────────────────────── */}
            <h2 className="text-lg font-semibold text-white mb-4">Or select your situation:</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
              {scenarios.map((s, i) => (
                <motion.button key={s.key}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.07 }}
                  whileHover={{ y: -4, scale: 1.02 }} whileTap={{ scale: 0.98 }}
                  onClick={() => setSelected(s.key as Scenario)}
                  className={`glass rounded-2xl border ${s.border} ${s.bg} p-5 text-left transition-all`}>
                  <div className="text-3xl mb-3">{s.icon}</div>
                  <h3 className="font-semibold text-white mb-1 text-sm">{s.label}</h3>
                  <div className="flex items-center gap-1 text-xs text-gray-400 mt-2">
                    <span>Get step-by-step help</span>
                    <ChevronRight className="w-3 h-3" />
                  </div>
                </motion.button>
              ))}
            </div>

            {/* ── Embassy contacts ────────────────────────────────────────── */}
            <h2 className="text-lg font-semibold text-white mb-4">{t("nearbyEmbassy")}</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {embassies.map((emb, i) => (
                <motion.div key={i}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="glass rounded-xl border border-white/10 p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Globe className="w-4 h-4 text-blue-400" />
                    <h3 className="font-semibold text-white text-sm">{emb.country} Embassy</h3>
                  </div>
                  <div className="space-y-1 text-xs text-gray-400">
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3 h-3" />{emb.phone}
                    </div>
                    <a href={`tel:${emb.emergency}`} className="flex items-center gap-1.5 text-red-400 hover:text-red-300 transition-colors">
                      <AlertTriangle className="w-3 h-3" />Emergency: {emb.emergency}
                    </a>
                  </div>
                </motion.div>
              ))}
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
