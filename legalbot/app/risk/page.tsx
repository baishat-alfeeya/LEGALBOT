"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, CheckCircle, Info, TrendingUp, Shield } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const riskKeywords = {
  high: ["arrest", "jail", "prison", "criminal", "murder", "rape", "assault", "fraud", "cheating", "FIR", "police", "court", "sue", "lawsuit", "eviction", "domestic violence", "harassment"],
  medium: ["dispute", "contract", "breach", "notice", "complaint", "rent", "property", "divorce", "custody", "employment", "termination", "salary", "refund", "consumer"],
  low: ["rights", "information", "RTI", "scheme", "benefit", "registration", "license", "permit", "affidavit", "agreement", "will", "nominee"],
};

function assessRisk(query: string): { level: "low" | "medium" | "high"; score: number; reasons: string[] } {
  const q = query.toLowerCase();
  const reasons: string[] = [];
  let score = 10;

  riskKeywords.high.forEach((kw) => { if (q.includes(kw)) { score += 25; reasons.push(`Contains high-risk term: "${kw}"`); } });
  riskKeywords.medium.forEach((kw) => { if (q.includes(kw)) { score += 10; reasons.push(`Contains medium-risk term: "${kw}"`); } });
  riskKeywords.low.forEach((kw) => { if (q.includes(kw)) { score += 3; } });

  score = Math.min(score, 100);
  const level = score >= 60 ? "high" : score >= 30 ? "medium" : "low";
  return { level, score, reasons: reasons.slice(0, 3) };
}

const riskConfig = {
  low: { color: "text-green-400", bg: "bg-green-500/10 border-green-500/30", bar: "bg-green-500", icon: CheckCircle, label: "Low Risk", advice: "This appears to be a routine legal matter. Standard legal procedures apply." },
  medium: { color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/30", bar: "bg-yellow-500", icon: Info, label: "Medium Risk", advice: "This situation requires careful attention. Consider consulting a lawyer for proper guidance." },
  high: { color: "text-red-400", bg: "bg-red-500/10 border-red-500/30", bar: "bg-red-500", icon: AlertTriangle, label: "High Risk", advice: "This is a serious legal matter. Immediate legal consultation is strongly recommended." },
};

const examples = [
  "I received a legal notice for breach of contract",
  "My landlord is threatening to evict me without notice",
  "I was falsely accused of fraud and police filed FIR",
  "I want to file RTI for government information",
  "My employer terminated me without proper notice",
  "I need to register a rental agreement",
];

export default function RiskPage() {
  const { t } = useLanguage();
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<ReturnType<typeof assessRisk> | null>(null);
  const [history, setHistory] = useState<Array<{ query: string; result: ReturnType<typeof assessRisk> }>>([]);

  const analyze = () => {
    if (!query.trim()) return;
    const r = assessRisk(query);
    setResult(r);
    setHistory((prev) => [{ query, result: r }, ...prev.slice(0, 4)]);
  };

  return (
    <div className="min-h-screen pt-20 pb-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-orange-400" />
          </div>
          <h1 className="text-4xl font-bold text-gradient">Risk Detection Engine</h1>
        </div>
        <p className="text-gray-400">Analyze your legal situation and get an instant risk assessment</p>
      </motion.div>

      <div className="glass rounded-2xl border border-white/10 p-6 mb-6">
        <label className="text-sm text-gray-400 mb-2 block">Describe your legal situation</label>
        <textarea value={query} onChange={(e) => setQuery(e.target.value)}
          placeholder="e.g., My landlord is threatening to evict me without giving proper notice..."
          rows={4} className="w-full bg-transparent border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 outline-none focus:border-blue-500/50 resize-none mb-4" />
        <div className="flex flex-wrap gap-2 mb-4">
          {examples.map((ex) => (
            <button key={ex} onClick={() => setQuery(ex)}
              className="text-xs px-3 py-1.5 glass rounded-full text-gray-400 hover:text-white border border-white/10 hover:bg-white/10 transition-all">
              {ex.length > 40 ? ex.slice(0, 40) + "..." : ex}
            </button>
          ))}
        </div>
        <button onClick={analyze} disabled={!query.trim()}
          className="w-full py-3 bg-gradient-to-r from-orange-600 to-red-600 rounded-xl font-semibold hover:from-orange-500 hover:to-red-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
          <Shield className="w-5 h-5" /> Analyze Risk
        </button>
      </div>

      {result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 mb-8">
          <div className={`glass rounded-2xl border p-6 ${riskConfig[result.level].bg}`}>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {(() => { const Icon = riskConfig[result.level].icon; return <Icon className={`w-6 h-6 ${riskConfig[result.level].color}`} />; })()}
                <span className={`text-xl font-bold ${riskConfig[result.level].color}`}>{riskConfig[result.level].label}</span>
              </div>
              <span className={`text-3xl font-bold ${riskConfig[result.level].color}`}>{result.score}/100</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-3 mb-4">
              <motion.div initial={{ width: 0 }} animate={{ width: `${result.score}%` }} transition={{ duration: 1, ease: "easeOut" }}
                className={`h-3 rounded-full ${riskConfig[result.level].bar}`} />
            </div>
            <p className="text-gray-300 text-sm mb-4">{riskConfig[result.level].advice}</p>
            {result.reasons.length > 0 && (
              <div>
                <p className="text-xs text-gray-500 mb-2">Risk factors detected:</p>
                <div className="flex flex-wrap gap-2">
                  {result.reasons.map((r, i) => (
                    <span key={i} className="text-xs px-2 py-1 bg-white/10 rounded-full text-gray-300">{r}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}

      {history.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4 text-gray-300">Recent Assessments</h2>
          <div className="space-y-3">
            {history.map((h, i) => (
              <div key={i} className="glass rounded-xl border border-white/10 p-4 flex items-center justify-between gap-4">
                <p className="text-sm text-gray-400 flex-1 truncate">{h.query}</p>
                <span className={`text-xs px-3 py-1 rounded-full border flex-shrink-0 ${riskConfig[h.result.level].bg} ${riskConfig[h.result.level].color}`}>
                  {riskConfig[h.result.level].label} ({h.result.score})
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
