"use client";
import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDropzone } from "react-dropzone";
import { FileText, Upload, Loader2, CheckCircle, AlertTriangle, Info, X, FileCheck, ShieldAlert, Globe } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { classifyDocument, docTypeLabels } from "@/lib/legalClassifier";

interface AnalysisResult {
  summary: string;
  docType: string;
  clauses: { title: string; content: string; risk: "low" | "medium" | "high" }[];
  terms: { term: string; explanation: string }[];
  riskScore: number;
  recommendations: string[];
  multilingualSummary: Record<string, string>;
}

const analysisByType: Record<string, AnalysisResult> = {
  rental_agreement: {
    summary: "This is a Residential Rental Agreement between a landlord and tenant for a residential property. The agreement covers an 11-month lease period with standard terms under Indian Tenancy Law.",
    docType: "Rental Agreement",
    clauses: [
      { title: "Security Deposit", content: "Tenant shall pay 3 months rent as security deposit, refundable upon vacating.", risk: "medium" },
      { title: "Rent Escalation", content: "Rent shall increase by 10% annually without prior notice.", risk: "high" },
      { title: "Maintenance", content: "Tenant responsible for all maintenance including structural repairs.", risk: "high" },
      { title: "Notice Period", content: "30 days notice required from either party to terminate agreement.", risk: "low" },
      { title: "Sub-letting", content: "Sub-letting strictly prohibited without written consent.", risk: "low" },
    ],
    terms: [
      { term: "Force Majeure", explanation: "Events beyond control of parties (natural disasters, pandemics) that excuse performance of contract obligations." },
      { term: "Indemnification", explanation: "One party agrees to compensate the other for losses or damages arising from specific events." },
      { term: "Arbitration Clause", explanation: "Disputes to be resolved through arbitration rather than court proceedings." },
      { term: "Liquidated Damages", explanation: "Pre-agreed amount payable as compensation for breach of contract." },
    ],
    riskScore: 65,
    recommendations: [
      "Negotiate the rent escalation clause — 10% annual increase without notice is above market standard",
      "Clarify maintenance responsibilities — structural repairs should be landlord's responsibility",
      "Request a longer notice period of 60 days for better security",
      "Ensure security deposit refund timeline is clearly specified (typically 30–45 days)",
      "Add a clause for dispute resolution mechanism",
    ],
    multilingualSummary: {
      en: "Residential rental agreement for 11 months. Review escalation and maintenance clauses carefully.",
      hi: "11 महीने का आवासीय किराया समझौता। वृद्धि और रखरखाव खंडों की सावधानीपूर्वक समीक्षा करें।",
      ta: "11 மாத குடியிருப்பு வாடகை ஒப்பந்தம். அதிகரிப்பு மற்றும் பராமரிப்பு விதிகளை கவனமாக மதிப்பாய்வு செய்யுங்கள்.",
    },
  },
  employment_contract: {
    summary: "This is an Employment Agreement between an employer and employee. It outlines job role, compensation, working hours, confidentiality obligations, and termination conditions.",
    docType: "Employment Contract",
    clauses: [
      { title: "Non-Compete Clause", content: "Employee shall not work for competitors for 12 months post-employment.", risk: "high" },
      { title: "Probation Period", content: "6-month probation with termination possible without notice.", risk: "medium" },
      { title: "Confidentiality", content: "All company information to remain confidential indefinitely.", risk: "medium" },
      { title: "Notice Period", content: "60 days notice required from either party.", risk: "low" },
      { title: "Intellectual Property", content: "All work created during employment belongs to the employer.", risk: "medium" },
    ],
    terms: [
      { term: "Non-Compete", explanation: "Restriction preventing employee from joining competitor companies for a specified period after leaving." },
      { term: "At-Will Employment", explanation: "Either party can terminate the employment relationship at any time with or without cause." },
      { term: "Severance Pay", explanation: "Compensation paid to employee upon termination beyond their notice period." },
      { term: "ESOP", explanation: "Employee Stock Option Plan — right to purchase company shares at a predetermined price." },
    ],
    riskScore: 55,
    recommendations: [
      "12-month non-compete is enforceable but may be challenged — negotiate to 6 months",
      "Ensure probation terms are clearly defined with performance metrics",
      "Request clarity on what constitutes 'confidential information'",
      "Verify that ESOP vesting schedule is clearly documented",
      "Ensure termination clauses comply with Industrial Disputes Act",
    ],
    multilingualSummary: {
      en: "Employment contract with non-compete and confidentiality clauses. Review carefully before signing.",
      hi: "गैर-प्रतिस्पर्धा और गोपनीयता खंडों के साथ रोजगार अनुबंध। हस्ताक्षर करने से पहले ध्यान से समीक्षा करें।",
      ta: "போட்டி-விலக்கு மற்றும் இரகசியத்தன்மை விதிகளுடன் வேலைவாய்ப்பு ஒப்பந்தம்.",
    },
  },
  affidavit: {
    summary: "This is a sworn Affidavit — a written statement of facts made under oath before a notary or magistrate. It is a legally binding document used in court proceedings and official matters.",
    docType: "Affidavit",
    clauses: [
      { title: "Deponent Declaration", content: "Deponent declares all facts stated are true to the best of their knowledge.", risk: "low" },
      { title: "Notarization", content: "Document must be notarized to be legally valid.", risk: "medium" },
      { title: "Perjury Warning", content: "False statements in an affidavit constitute perjury under IPC Section 191.", risk: "high" },
    ],
    terms: [
      { term: "Deponent", explanation: "The person making the sworn statement in the affidavit." },
      { term: "Notarization", explanation: "Official certification by a notary public that the document is authentic and the signature is genuine." },
      { term: "Perjury", explanation: "The criminal offense of making false statements under oath." },
    ],
    riskScore: 30,
    recommendations: [
      "Ensure all facts stated are accurate — false statements constitute perjury",
      "Get the affidavit notarized on proper stamp paper of appropriate value",
      "Keep a certified copy for your records",
    ],
    multilingualSummary: {
      en: "Sworn affidavit — ensure all facts are accurate. Notarization required for legal validity.",
      hi: "शपथ पत्र — सुनिश्चित करें कि सभी तथ्य सटीक हैं। कानूनी वैधता के लिए नोटरीकरण आवश्यक है।",
      ta: "சத்தியப் பிரமாண பத்திரம் — அனைத்து உண்மைகளும் துல்லியமாக இருப்பதை உறுதிப்படுத்துங்கள்.",
    },
  },
  default: {
    summary: "This appears to be a legal document. The AI has identified key legal clauses and terms for your review. Please consult a qualified lawyer for specific legal advice.",
    docType: "Legal Document",
    clauses: [
      { title: "Key Obligation", content: "Parties are bound by the terms and conditions stated herein.", risk: "medium" },
      { title: "Jurisdiction", content: "Disputes subject to jurisdiction of courts in the specified city.", risk: "low" },
      { title: "Termination", content: "Agreement may be terminated with written notice as specified.", risk: "medium" },
    ],
    terms: [
      { term: "Jurisdiction", explanation: "The legal authority of a court to hear and decide a case." },
      { term: "Consideration", explanation: "Something of value exchanged between parties to make a contract legally binding." },
      { term: "Breach", explanation: "Failure to fulfill the terms of a legal agreement." },
    ],
    riskScore: 45,
    recommendations: [
      "Review all clauses carefully before signing",
      "Consult a qualified lawyer for specific legal advice",
      "Ensure all parties have signed and dated the document",
      "Keep a certified copy for your records",
    ],
    multilingualSummary: {
      en: "Legal document identified. Review all clauses carefully and consult a lawyer before signing.",
      hi: "कानूनी दस्तावेज़ पहचाना गया। हस्ताक्षर करने से पहले सभी खंडों की सावधानीपूर्वक समीक्षा करें।",
      ta: "சட்ட ஆவணம் அடையாளம் காணப்பட்டது. கையொப்பமிடுவதற்கு முன் அனைத்து விதிகளையும் கவனமாக மதிப்பாய்வு செய்யுங்கள்.",
    },
  },
};

const riskColors = {
  low: "text-green-400 bg-green-500/10 border-green-500/30",
  medium: "text-yellow-400 bg-yellow-500/10 border-yellow-500/30",
  high: "text-red-400 bg-red-500/10 border-red-500/30",
};

const ACCEPTED_TYPES = {
  "application/pdf": [".pdf"],
  "application/msword": [".doc"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
  "text/plain": [".txt"],
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
};

export default function DocumentsPage() {
  const { t } = useLanguage();
  const [file, setFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [rejected, setRejected] = useState(false);
  const [activeTab, setActiveTab] = useState<"summary" | "clauses" | "terms" | "recommendations" | "multilingual">("summary");
  const [analysisSteps, setAnalysisSteps] = useState<string[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles[0]) { setFile(acceptedFiles[0]); setRejected(false); }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, accept: ACCEPTED_TYPES, maxFiles: 1,
  });

  const analyze = async () => {
    if (!file) return;
    setAnalyzing(true);
    setAnalysisSteps([]);
    const steps = [
      "Reading document content...",
      "Detecting document type...",
      "Checking legal validity...",
      "Extracting key clauses...",
      "Performing risk analysis...",
      "Generating multilingual summary...",
    ];
    for (let i = 0; i < steps.length; i++) {
      await new Promise((r) => setTimeout(r, 500));
      setAnalysisSteps((prev) => [...prev, steps[i]]);
    }
    // Classify using filename as the primary signal (demo mode — no real text extraction)
    // Pass only the filename as text so the classifier uses filename patterns correctly
    const classification = classifyDocument(file.name, file.name);

    if (!classification.isLegal) {
      setRejected(true);
      setAnalyzing(false);
      setAnalysisSteps([]);
      return;
    }
    const typeKey = classification.type in analysisByType ? classification.type : "default";
    setResult(analysisByType[typeKey as keyof typeof analysisByType] || analysisByType.default);
    setAnalyzing(false);
  };

  const riskLevel = result ? (result.riskScore >= 70 ? "high" : result.riskScore >= 40 ? "medium" : "low") : "low";

  return (
    <div className="min-h-screen pt-20 pb-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-4xl font-bold text-gradient mb-2">{t("documents")}</h1>
        <p className="text-gray-400">AI-powered legal document analysis — only legal documents accepted</p>
        <div className="mt-2 inline-flex items-center gap-2 px-3 py-1 bg-yellow-500/10 border border-yellow-500/30 rounded-full text-xs text-yellow-400">
          ⚠️ For Demonstration Purposes Only
        </div>
      </motion.div>

      {/* Accepted doc types info */}
      <div className="glass rounded-xl border border-blue-500/20 p-4 mb-6">
        <p className="text-sm font-medium text-blue-400 mb-2 flex items-center gap-2"><Info className="w-4 h-4" /> Accepted Legal Documents</p>
        <div className="flex flex-wrap gap-2">
          {["Rental Agreements","Affidavits","FIR Copies","Legal Notices","Property Documents","Employment Contracts","Wills & Deeds","Court Orders","Government Certificates"].map((d) => (
            <span key={d} className="text-xs px-2 py-1 bg-white/5 border border-white/10 rounded-full text-gray-400">{d}</span>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-2">Formats: PDF, DOCX, DOC, TXT, JPG, PNG</p>
      </div>

      {!result ? (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div {...getRootProps()}
            className={`border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all ${isDragActive ? "border-blue-500 bg-blue-500/10" : "border-white/20 hover:border-blue-500/50 hover:bg-white/5"}`}>
            <input {...getInputProps()} />
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-300 mb-2">{isDragActive ? "Drop your legal document here" : t("uploadDoc")}</p>
            <p className="text-sm text-gray-500">PDF, DOCX, DOC, TXT, JPG, PNG — Legal documents only</p>
          </div>

          <AnimatePresence>
            {rejected && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="p-5 bg-orange-500/10 border border-orange-500/30 rounded-2xl">
                <div className="flex items-start gap-3 mb-3">
                  <ShieldAlert className="w-6 h-6 text-orange-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold text-orange-400 text-lg mb-1">Non-Legal Document Detected</p>
                    <p className="text-sm text-gray-300 leading-relaxed">
                      This document appears to be <strong>non-legal in nature</strong>. LEGALBOT is designed to analyse legal documents only.
                      Please upload a legal document for analysis.
                    </p>
                  </div>
                </div>
                <div className="bg-white/5 rounded-xl p-4 mb-3">
                  <p className="text-xs font-semibold text-gray-400 mb-2">Examples of accepted legal documents:</p>
                  <div className="flex flex-wrap gap-2">
                    {["Rental Agreement","Affidavit","FIR Copy","Legal Notice","Employment Contract","Property Deed","Court Order","Will / Testament","NDA","Government Certificate"].map((d) => (
                      <span key={d} className="text-xs px-2 py-1 bg-green-500/10 border border-green-500/20 rounded-full text-green-400">{d}</span>
                    ))}
                  </div>
                </div>
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-3">
                  <p className="text-xs font-semibold text-gray-400 mb-1">Not accepted (non-legal content):</p>
                  <div className="flex flex-wrap gap-2">
                    {["Project Synopsis","Research Paper","Study Notes","Resume/CV","Assignment","Textbook","Recipe","Blog Post","News Article"].map((d) => (
                      <span key={d} className="text-xs px-2 py-1 bg-red-500/10 border border-red-500/20 rounded-full text-red-400">{d}</span>
                    ))}
                  </div>
                </div>
                <button onClick={() => { setRejected(false); setFile(null); }}
                  className="w-full py-2.5 bg-orange-500/20 border border-orange-500/30 rounded-xl text-orange-400 text-sm font-medium hover:bg-orange-500/30 transition-colors">
                  Upload a Different Document
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {file && !rejected && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="glass rounded-xl border border-white/10 p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8 text-blue-400" />
                <div>
                  <p className="font-medium text-white">{file.name}</p>
                  <p className="text-sm text-gray-400">{(file.size / 1024).toFixed(1)} KB • {file.type || "document"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => setFile(null)}><X className="w-4 h-4 text-gray-400 hover:text-white" /></button>
                <button onClick={analyze} disabled={analyzing}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl font-medium text-sm hover:from-blue-500 hover:to-purple-500 transition-all">
                  {analyzing ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing...</> : <><FileCheck className="w-4 h-4" /> {t("analyze")}</>}
                </button>
              </div>
            </motion.div>
          )}

          {analyzing && (
            <div className="glass rounded-xl border border-white/10 p-5 space-y-3">
              {analysisSteps.map((step, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-3 text-sm text-gray-300">
                  <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0" />
                  {step}
                </motion.div>
              ))}
              {analysisSteps.length < 6 && (
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <Loader2 className="w-4 h-4 animate-spin text-blue-400 flex-shrink-0" />
                  Processing...
                </div>
              )}
            </div>
          )}
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          {/* Header */}
          <div className="glass rounded-2xl border border-white/10 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold">Analysis Complete</h2>
                <p className="text-sm text-blue-400 mt-1">Document Type: {result.docType}</p>
              </div>
              <button onClick={() => { setResult(null); setFile(null); setRejected(false); }}
                className="text-sm text-gray-400 hover:text-white flex items-center gap-1">
                <X className="w-4 h-4" /> New Analysis
              </button>
            </div>
            <div className="flex items-center gap-6">
              <div className="relative w-24 h-24 flex-shrink-0">
                <svg className="w-24 h-24 -rotate-90" viewBox="0 0 36 36">
                  <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
                  <circle cx="18" cy="18" r="15.9" fill="none"
                    stroke={result.riskScore >= 70 ? "#ef4444" : result.riskScore >= 40 ? "#f59e0b" : "#22c55e"}
                    strokeWidth="3" strokeDasharray={`${result.riskScore} ${100 - result.riskScore}`} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                  <span className="text-xl font-bold">{result.riskScore}</span>
                  <span className="text-xs text-gray-500">/100</span>
                </div>
              </div>
              <div>
                <p className={`text-lg font-semibold ${riskLevel === "high" ? "text-red-400" : riskLevel === "medium" ? "text-yellow-400" : "text-green-400"}`}>
                  {riskLevel === "high" ? "High Risk" : riskLevel === "medium" ? "Medium Risk" : "Low Risk"}
                </p>
                <p className="text-sm text-gray-400 mt-1">Review highlighted clauses before signing</p>
                <p className="text-xs text-yellow-500 mt-1">⚠️ For Demonstration Purposes Only</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 flex-wrap">
            {(["summary","clauses","terms","recommendations","multilingual"] as const).map((tab) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-xl text-sm font-medium capitalize transition-all ${activeTab === tab ? "bg-blue-600 text-white" : "glass text-gray-300 hover:bg-white/10 border border-white/10"}`}>
                {tab === "multilingual" ? "🌐 Multilingual" : tab}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {activeTab === "summary" && (
                <div className="glass rounded-2xl border border-white/10 p-6">
                  <h3 className="font-semibold mb-3 flex items-center gap-2"><Info className="w-4 h-4 text-blue-400" /> Document Summary</h3>
                  <p className="text-gray-300 leading-relaxed">{result.summary}</p>
                </div>
              )}
              {activeTab === "clauses" && (
                <div className="space-y-3">
                  {result.clauses.map((clause, i) => (
                    <div key={i} className={`glass rounded-xl border p-4 ${riskColors[clause.risk]}`}>
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-semibold">{clause.title}</h4>
                        <span className={`text-xs px-2 py-1 rounded-full border ${riskColors[clause.risk]}`}>
                          {clause.risk === "high" ? "High Risk" : clause.risk === "medium" ? "Medium Risk" : "Low Risk"}
                        </span>
                      </div>
                      <p className="text-sm text-gray-300">{clause.content}</p>
                    </div>
                  ))}
                </div>
              )}
              {activeTab === "terms" && (
                <div className="space-y-3">
                  {result.terms.map((term, i) => (
                    <div key={i} className="glass rounded-xl border border-white/10 p-4">
                      <h4 className="font-semibold text-blue-400 mb-2">{term.term}</h4>
                      <p className="text-sm text-gray-300">{term.explanation}</p>
                    </div>
                  ))}
                </div>
              )}
              {activeTab === "recommendations" && (
                <div className="space-y-3">
                  {result.recommendations.map((rec, i) => (
                    <div key={i} className="glass rounded-xl border border-yellow-500/20 p-4 flex gap-3">
                      <AlertTriangle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-gray-300">{rec}</p>
                    </div>
                  ))}
                </div>
              )}
              {activeTab === "multilingual" && (
                <div className="space-y-3">
                  <div className="glass rounded-xl border border-white/10 p-4 mb-2">
                    <p className="text-sm text-gray-400 flex items-center gap-2"><Globe className="w-4 h-4 text-blue-400" /> AI-generated summaries in multiple Indian languages</p>
                  </div>
                  {Object.entries(result.multilingualSummary).map(([lang, summary]) => (
                    <div key={lang} className="glass rounded-xl border border-white/10 p-4">
                      <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full uppercase font-mono mb-3 inline-block">{lang}</span>
                      <p className="text-sm text-gray-300 mt-2 leading-relaxed">{summary}</p>
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
}
