"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, Mic, MicOff, Volume2, VolumeX, Scale,
  AlertTriangle, CheckCircle, Info, RefreshCw,
  ChevronRight, BookOpen, Users, FileText
} from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Message {
  id: string;
  role: "user" | "assistant" | "error";
  content: string;
  risk?: "low" | "medium" | "high";
  sections?: ResponseSection[];
  timestamp: Date;
}

interface ResponseSection {
  heading: string;
  points: string[];
}

interface LegalResponse {
  problem: string;
  explanation: string;
  sections: ResponseSection[];
  suggestion: string;
  risk: "low" | "medium" | "high";
  helpline?: string;
}

// ─── Expanded legal knowledge base ───────────────────────────────────────────
const legalKB: Record<string, LegalResponse> = {
  theft: {
    problem: "Theft / Robbery / Stolen Items",
    explanation: "Theft is a cognizable offence under Section 379 of the Indian Penal Code (IPC). You have the right to file an FIR and the police are legally bound to register it.",
    sections: [
      { heading: "Immediate Steps", points: [
        "Ensure your personal safety first — do not confront the thief",
        "Call Police immediately on 100 or National Emergency 112",
        "Do NOT disturb the crime scene if at home/office",
      ]},
      { heading: "Legal Actions", points: [
        "File an FIR at the nearest police station (Section 379 IPC)",
        "Demand a copy of the FIR — it is your legal right",
        "List all stolen items with estimated values for the FIR",
        "If documents were stolen, apply for duplicates with FIR copy",
      ]},
      { heading: "Financial Protection", points: [
        "Call your bank immediately to block stolen cards",
        "File insurance claim within 24–48 hours with FIR copy",
        "Report UPI/online fraud at cybercrime.gov.in or call 1930",
      ]},
    ],
    suggestion: "Consult a criminal lawyer if the police are not registering your FIR — you can approach the Superintendent of Police or file a complaint in court under Section 156(3) CrPC.",
    risk: "high",
    helpline: "Police: 100 | Cyber Crime: 1930",
  },
  harassment: {
    problem: "Harassment / Abuse / Domestic Violence",
    explanation: "Harassment is punishable under multiple sections of IPC (354, 509) and the Protection of Women from Domestic Violence Act 2005. You have strong legal protections.",
    sections: [
      { heading: "Immediate Safety", points: [
        "Move to a safe location — friend, relative, or shelter home",
        "Call Women's Helpline: 1091 or Police: 100",
        "Document all incidents with dates, times, and witnesses",
      ]},
      { heading: "Legal Remedies", points: [
        "File complaint at local police station or Women's Cell",
        "Apply for Protection Order under DV Act 2005",
        "Workplace harassment — report to Internal Complaints Committee (ICC)",
        "Cyber harassment — report at cybercrime.gov.in",
      ]},
      { heading: "Evidence Collection", points: [
        "Save all messages, emails, and call recordings",
        "Take photographs of injuries with date/time stamps",
        "Get written statements from witnesses if possible",
      ]},
    ],
    suggestion: "Contact a women's rights lawyer or approach your nearest District Legal Services Authority (DLSA) for free legal aid. Call NALSA at 15100.",
    risk: "high",
    helpline: "Women's Helpline: 1091 | NALSA: 15100",
  },
  rent: {
    problem: "Tenant / Landlord / Rental Dispute",
    explanation: "Tenant rights in India are protected under state Rent Control Acts and the Transfer of Property Act. Both landlords and tenants have defined legal obligations.",
    sections: [
      { heading: "Your Rights as Tenant", points: [
        "Right to a written rental agreement — always insist on one",
        "Security deposit cannot exceed 2–3 months rent (state-specific)",
        "Landlord must give 1–3 months notice before eviction",
        "Landlord is responsible for structural repairs and essential services",
      ]},
      { heading: "If Landlord Violates Rights", points: [
        "Send a legal notice via registered post first",
        "File complaint with Rent Controller / Rent Tribunal",
        "Approach Civil Court for injunction against illegal eviction",
        "File police complaint if landlord uses force or cuts utilities",
      ]},
      { heading: "Documentation", points: [
        "Keep all rent receipts — landlord must provide them",
        "Photograph the property condition at move-in and move-out",
        "Keep copies of all communications with landlord",
      ]},
    ],
    suggestion: "Consult a property lawyer for disputes. For security deposit recovery, approach the Rent Controller or file a case in Small Causes Court.",
    risk: "medium",
    helpline: "NALSA Legal Aid: 15100",
  },
  consumer: {
    problem: "Consumer Rights / Product Defect / Service Deficiency",
    explanation: "The Consumer Protection Act 2019 gives you strong rights against defective products and deficient services. You can claim refund, replacement, and compensation.",
    sections: [
      { heading: "Your Consumer Rights", points: [
        "Right to Safety — protection from hazardous goods",
        "Right to Information — accurate product details mandatory",
        "Right to Redressal — file complaint within 2 years of purchase",
        "E-commerce: 30-day return policy is mandatory by law",
      ]},
      { heading: "How to File a Complaint", points: [
        "First send written complaint to seller/company",
        "If unresolved, file at District Consumer Forum (disputes up to ₹1 crore)",
        "File online at consumerhelpline.gov.in",
        "Call National Consumer Helpline: 1800-11-4000 (toll-free)",
      ]},
      { heading: "What You Can Claim", points: [
        "Full refund or replacement of defective product",
        "Compensation for mental agony and financial loss",
        "Cost of litigation from the opposite party",
      ]},
    ],
    suggestion: "Keep all purchase receipts, warranty cards, and communication records. These are essential evidence for your consumer complaint.",
    risk: "low",
    helpline: "Consumer Helpline: 1800-11-4000",
  },
  cyber: {
    problem: "Cyber Crime / Online Fraud / Hacking",
    explanation: "Cyber crimes are governed by the IT Act 2000 and IPC. India has a dedicated Cyber Crime portal and helpline. Act quickly — evidence can be lost.",
    sections: [
      { heading: "Immediate Actions", points: [
        "Do NOT share any more OTPs, passwords, or personal data",
        "Call Cyber Crime Helpline: 1930 immediately",
        "Report online at cybercrime.gov.in",
        "Call your bank to freeze account if financial fraud occurred",
      ]},
      { heading: "Evidence Preservation", points: [
        "Take screenshots of all fraudulent messages/transactions",
        "Note transaction IDs, account numbers, and timestamps",
        "Do NOT delete any messages or emails — they are evidence",
        "Save the fraudster's phone number, email, and profile",
      ]},
      { heading: "Legal Steps", points: [
        "File FIR at local Cyber Crime Cell",
        "File complaint under IT Act Section 66C (identity theft) or 66D (cheating)",
        "Report to RBI Banking Ombudsman for bank fraud",
        "Contact CERT-In for serious cyber security incidents",
      ]},
    ],
    suggestion: "Change all passwords immediately after securing evidence. Enable two-factor authentication on all accounts. Consult a cyber law specialist for complex cases.",
    risk: "high",
    helpline: "Cyber Crime: 1930 | cybercrime.gov.in",
  },
  fir: {
    problem: "Filing an FIR (First Information Report)",
    explanation: "An FIR is a written document prepared by police when they receive information about a cognizable offence. Police CANNOT refuse to register an FIR — it is your legal right.",
    sections: [
      { heading: "How to File an FIR", points: [
        "Visit the nearest police station and narrate the incident",
        "Police will write it down — read it carefully before signing",
        "Demand a free copy of the FIR — it is your right under Section 154 CrPC",
        "You can also file a Zero FIR at any police station regardless of jurisdiction",
      ]},
      { heading: "If Police Refuse to Register FIR", points: [
        "Send complaint by registered post to Superintendent of Police",
        "File complaint before Magistrate under Section 156(3) CrPC",
        "Approach State Human Rights Commission",
        "File complaint with State Police Complaints Authority",
      ]},
      { heading: "Online FIR Options", points: [
        "Many states allow online FIR for minor offences",
        "Visit your state police website for e-FIR facility",
        "Cyber crimes: file at cybercrime.gov.in",
      ]},
    ],
    suggestion: "Always keep a copy of your FIR. It is required for insurance claims, embassy assistance, and follow-up legal action.",
    risk: "medium",
    helpline: "Police: 100 | NALSA: 15100",
  },
  divorce: {
    problem: "Divorce / Matrimonial Dispute / Separation",
    explanation: "Divorce in India is governed by personal laws (Hindu Marriage Act, Muslim Personal Law, Special Marriage Act, etc.). Both contested and mutual consent divorce are available.",
    sections: [
      { heading: "Types of Divorce", points: [
        "Mutual Consent Divorce — both parties agree, faster process (6 months minimum)",
        "Contested Divorce — one party files on grounds like cruelty, desertion, adultery",
        "Judicial Separation — legal separation without dissolving marriage",
      ]},
      { heading: "Rights During Divorce", points: [
        "Right to maintenance/alimony under Section 125 CrPC",
        "Right to share in matrimonial property",
        "Child custody rights — court decides based on child's best interest",
        "Right to residence in matrimonial home under DV Act",
      ]},
      { heading: "Steps to Take", points: [
        "Consult a family lawyer immediately",
        "Gather financial documents — bank statements, property papers",
        "Document any incidents of cruelty or abuse with evidence",
        "File for interim maintenance if financially dependent",
      ]},
    ],
    suggestion: "Family matters are sensitive — consider mediation before litigation. Contact your nearest Family Court or DLSA for free legal aid.",
    risk: "medium",
    helpline: "Women's Helpline: 1091 | NALSA: 15100",
  },
  property: {
    problem: "Property Dispute / Land Dispute / RERA",
    explanation: "Property disputes are among the most common legal issues in India. The Real Estate (Regulation and Development) Act 2016 (RERA) protects homebuyers.",
    sections: [
      { heading: "Common Property Issues", points: [
        "Builder delay — file complaint with state RERA authority",
        "Title dispute — approach Civil Court for declaration of title",
        "Encroachment — file complaint with local municipal authority",
        "Illegal construction — report to local planning authority",
      ]},
      { heading: "RERA Rights (Homebuyers)", points: [
        "Builder must register project with RERA before selling",
        "Right to refund with interest if builder delays possession",
        "Right to compensation for defects in construction",
        "File complaint at state RERA portal within 3 years",
      ]},
      { heading: "Documentation Needed", points: [
        "Sale deed / Agreement to Sale",
        "Property tax receipts",
        "Encumbrance certificate",
        "Mutation records from revenue office",
      ]},
    ],
    suggestion: "Property disputes require expert legal advice. Consult a property lawyer and verify all documents before any transaction.",
    risk: "medium",
    helpline: "RERA Helpline: varies by state | NALSA: 15100",
  },
  labor: {
    problem: "Labour / Employment / Workplace Rights",
    explanation: "Indian labour laws provide strong protections for employees. The Industrial Disputes Act, Minimum Wages Act, and EPF Act are key legislations.",
    sections: [
      { heading: "Your Employment Rights", points: [
        "Right to minimum wage as notified by state government",
        "Maximum 48 hours/week, 9 hours/day (Factories Act)",
        "Overtime at double the rate",
        "EPF contribution mandatory for establishments with 20+ employees",
        "Gratuity after 5 years of continuous service",
      ]},
      { heading: "If Rights Are Violated", points: [
        "Send written complaint to employer first",
        "File complaint with Labour Commissioner",
        "Approach Labour Court for wrongful termination",
        "File complaint with EPF office for PF violations",
      ]},
      { heading: "Wrongful Termination", points: [
        "Employer must give notice or pay in lieu of notice",
        "Retrenchment compensation mandatory under Industrial Disputes Act",
        "File complaint within 3 years of termination",
      ]},
    ],
    suggestion: "Contact your nearest Labour Commissioner office or approach DLSA for free legal aid. Call Labour Helpline: 1800-11-2222.",
    risk: "medium",
    helpline: "Labour Helpline: 1800-11-2222",
  },
};

// ─── Keyword matcher ──────────────────────────────────────────────────────────
const keywordMap: Record<string, string> = {
  theft: "theft", stolen: "theft", robbery: "theft", pickpocket: "theft", burglary: "theft",
  harass: "harassment", abuse: "harassment", violence: "harassment", assault: "harassment",
  domestic: "harassment", batter: "harassment", molest: "harassment",
  rent: "rent", tenant: "rent", landlord: "rent", evict: "rent", deposit: "rent", lease: "rent",
  consumer: "consumer", product: "consumer", refund: "consumer", defective: "consumer",
  ecommerce: "consumer", "online shopping": "consumer", warranty: "consumer",
  cyber: "cyber", fraud: "cyber", scam: "cyber", hack: "cyber", phish: "cyber",
  "online fraud": "cyber", upi: "cyber", otp: "cyber",
  fir: "fir", "first information": "fir", "police complaint": "fir", "file complaint": "fir",
  divorce: "divorce", matrimon: "divorce", separation: "divorce", custody: "divorce",
  alimony: "divorce", maintenance: "divorce",
  property: "property", land: "property", rera: "property", builder: "property",
  encroach: "property", "real estate": "property",
  labour: "labor", labor: "labor", employ: "labor", salary: "labor", wage: "labor",
  terminat: "labor", "wrongful dismissal": "labor", pf: "labor", epf: "labor",
};

function getResponse(query: string): LegalResponse | null {
  const q = query.toLowerCase();
  for (const [kw, key] of Object.entries(keywordMap)) {
    if (q.includes(kw)) return legalKB[key] || null;
  }
  return null;
}

// ─── Risk config ──────────────────────────────────────────────────────────────
const riskConfig = {
  low:    { color: "text-green-400",  bg: "bg-green-500/10 border-green-500/30",   icon: CheckCircle,    label: "Low Risk"    },
  medium: { color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/30", icon: Info,           label: "Medium Risk" },
  high:   { color: "text-red-400",    bg: "bg-red-500/10 border-red-500/30",       icon: AlertTriangle,  label: "High Risk"   },
};

// ─── Quick suggestions ────────────────────────────────────────────────────────
const suggestions = [
  "My phone was stolen",
  "How to file an FIR?",
  "Landlord not returning deposit",
  "Cyber fraud — what to do?",
  "Workplace harassment rights",
  "Consumer complaint process",
  "Divorce procedure in India",
  "Property dispute with builder",
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function ChatPage() {
  const { t } = useLanguage();
  const { user, addChatHistory } = useAuth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "",
      risk: "low",
      sections: [{
        heading: "How can I help you today?",
        points: [
          "Ask about your legal rights under Indian law",
          "Get step-by-step guidance for legal issues",
          "Learn how to file complaints and FIRs",
          "Find emergency helplines and contacts",
        ],
      }],
      timestamp: new Date(),
    },
  ]);
  const [input, setInput]           = useState("");
  const [isLoading, setIsLoading]   = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(false);
  const [error, setError]           = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const textareaRef    = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-resize textarea
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + "px";
  };

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();

    // Empty input guard
    if (!trimmed) {
      setError("Please type a question before sending.");
      setTimeout(() => setError(null), 3000);
      return;
    }

    // Too short guard
    if (trimmed.length < 3) {
      setError("Please describe your issue in more detail.");
      setTimeout(() => setError(null), 3000);
      return;
    }

    setError(null);
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: trimmed,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "auto";
    setIsLoading(true);

    try {
      // Simulate AI processing delay (realistic 800–1500ms)
      await new Promise((r) => setTimeout(r, 800 + Math.random() * 700));

      const legalResp = getResponse(trimmed);

      let assistantMsg: Message;

      if (legalResp) {
        assistantMsg = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: legalResp.problem,
          risk: legalResp.risk,
          sections: [
            { heading: "Understanding Your Issue", points: [legalResp.explanation] },
            ...legalResp.sections,
            { heading: "Our Recommendation", points: [legalResp.suggestion] },
            ...(legalResp.helpline ? [{ heading: "Emergency Contacts", points: [legalResp.helpline] }] : []),
          ],
          timestamp: new Date(),
        };
      } else {
        // Fallback for unrecognised queries
        assistantMsg = {
          id: (Date.now() + 1).toString(),
          role: "assistant",
          content: "General Legal Guidance",
          risk: "low",
          sections: [
            { heading: "I received your query", points: [`You asked: "${trimmed.slice(0, 100)}${trimmed.length > 100 ? "..." : ""}"`] },
            { heading: "General Advice", points: [
              "For specific legal matters, consulting a qualified lawyer is always recommended",
              "You can get free legal aid from NALSA — call 15100",
              "For emergencies, call Police: 100 or National Emergency: 112",
            ]},
            { heading: "Try asking about", points: [
              "Theft, robbery, or stolen items",
              "Harassment or domestic violence",
              "Tenant or landlord disputes",
              "Consumer complaints or refunds",
              "Cyber fraud or online scams",
              "FIR filing procedure",
              "Divorce or matrimonial issues",
              "Property or RERA disputes",
              "Labour and employment rights",
            ]},
          ],
          timestamp: new Date(),
        };
      }

      setMessages((prev) => [...prev, assistantMsg]);

      // Save to history if logged in
      if (user) {
        addChatHistory({
          query: trimmed,
          response: legalResp ? legalResp.problem : "General Legal Guidance",
          category: legalResp ? legalResp.problem.split("/")[0].trim() : "General",
          risk: legalResp?.risk,
        });
      }

      // TTS
      if (ttsEnabled && "speechSynthesis" in window) {
        const textToSpeak = legalResp
          ? `${legalResp.problem}. ${legalResp.explanation}. ${legalResp.suggestion}`
          : "I have received your query. Please consult a qualified lawyer for specific legal advice.";
        const utterance = new SpeechSynthesisUtterance(textToSpeak);
        window.speechSynthesis.speak(utterance);
      }
    } catch (err) {
      setMessages((prev) => [...prev, {
        id: (Date.now() + 2).toString(),
        role: "error",
        content: "Unable to fetch response. Please try again.",
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  }, [ttsEnabled]);

  const toggleListening = () => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      setError("Speech recognition is not supported in this browser. Try Chrome.");
      setTimeout(() => setError(null), 4000);
      return;
    }
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }
    const SR = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SR();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-IN";
    recognition.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
    };
    recognition.onerror = () => {
      setIsListening(false);
      setError("Voice recognition failed. Please try again.");
      setTimeout(() => setError(null), 3000);
    };
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  };

  const clearChat = () => {
    setMessages([{
      id: "welcome-" + Date.now(),
      role: "assistant",
      content: "",
      risk: "low",
      sections: [{ heading: "Chat cleared. How can I help you?", points: ["Ask me any legal question about Indian law."] }],
      timestamp: new Date(),
    }]);
  };

  // ─── Render a structured assistant message ──────────────────────────────────
  const renderAssistantContent = (msg: Message) => {
    if (!msg.sections || msg.sections.length === 0) {
      return <p className="text-sm text-gray-300 leading-relaxed">{msg.content}</p>;
    }
    return (
      <div className="space-y-3">
        {msg.content && (
          <p className="font-semibold text-white text-sm">{msg.content}</p>
        )}
        {msg.sections.map((sec, si) => (
          <div key={si}>
            <p className="text-xs font-semibold text-blue-400 uppercase tracking-wide mb-1.5">{sec.heading}</p>
            <ul className="space-y-1">
              {sec.points.map((pt, pi) => (
                <li key={pi} className="flex items-start gap-2 text-sm text-gray-300">
                  <span className="text-blue-400 mt-1 flex-shrink-0">›</span>
                  <span dangerouslySetInnerHTML={{ __html: pt.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") }} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen pt-16 flex flex-col bg-gray-950">
      <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-4 flex flex-col"
        style={{ height: "calc(100vh - 64px)" }}>

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-4 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Scale className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg text-white">LEGALBOT AI</h1>
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${isLoading ? "bg-yellow-400 animate-pulse" : "bg-green-400"}`} />
                <span className="text-xs text-gray-400">
                  {isLoading ? "Thinking..." : "Online • Indian Law Expert"}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setTtsEnabled(!ttsEnabled)} title="Toggle voice response"
              className={`p-2 rounded-lg transition-colors ${ttsEnabled ? "bg-blue-500/20 text-blue-400" : "glass text-gray-400 hover:text-white"}`}>
              {ttsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            <button onClick={clearChat} title="Clear chat"
              className="p-2 rounded-lg glass text-gray-400 hover:text-white transition-colors">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </motion.div>

        {/* Error banner */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className="mb-3 px-4 py-2.5 bg-red-500/10 border border-red-500/30 rounded-xl flex items-center gap-2 text-sm text-red-400 flex-shrink-0">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto space-y-4 mb-3 pr-1 min-h-0">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div key={msg.id}
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>

                {msg.role === "user" && (
                  <div className="max-w-[80%] bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl rounded-tr-sm px-4 py-3">
                    <p className="text-sm text-white leading-relaxed">{msg.content}</p>
                    <p className="text-xs text-blue-200/60 mt-1.5 text-right">{msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                  </div>
                )}

                {msg.role === "assistant" && (
                  <div className="max-w-[90%] glass rounded-2xl rounded-tl-sm border border-white/10 px-4 py-4">
                    {msg.risk && (
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold mb-3 ${riskConfig[msg.risk].bg} ${riskConfig[msg.risk].color}`}>
                        {(() => { const Icon = riskConfig[msg.risk].icon; return <Icon className="w-3.5 h-3.5" />; })()}
                        {riskConfig[msg.risk].label}
                      </div>
                    )}
                    {renderAssistantContent(msg)}
                    <p className="text-xs text-gray-600 mt-3">{msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>
                  </div>
                )}

                {msg.role === "error" && (
                  <div className="max-w-[80%] bg-red-500/10 border border-red-500/30 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-red-400">{msg.content}</p>
                      <button onClick={() => sendMessage(messages[messages.length - 2]?.content || "")}
                        className="text-xs text-red-300 underline mt-1 hover:text-red-200">
                        Retry
                      </button>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Thinking animation */}
          {isLoading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
              <div className="glass rounded-2xl rounded-tl-sm border border-white/10 px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1">
                    {[0, 1, 2].map((i) => (
                      <motion.span key={i} className="w-2 h-2 bg-blue-400 rounded-full"
                        animate={{ y: [0, -6, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }} />
                    ))}
                  </div>
                  <span className="text-sm text-gray-400">Thinking...</span>
                </div>
              </div>
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick suggestions */}
        <div className="flex gap-2 overflow-x-auto pb-2 mb-3 flex-shrink-0 scrollbar-hide">
          {suggestions.map((s) => (
            <button key={s} onClick={() => sendMessage(s)} disabled={isLoading}
              className="flex-shrink-0 px-3 py-1.5 glass rounded-full text-xs text-gray-300 hover:text-white hover:bg-white/10 border border-white/10 transition-all whitespace-nowrap disabled:opacity-40">
              {s}
            </button>
          ))}
        </div>

        {/* Input area */}
        <div className={`glass rounded-2xl border transition-colors flex-shrink-0 ${isListening ? "border-red-500/50" : "border-white/10 focus-within:border-blue-500/40"}`}>
          <div className="flex items-end gap-2 p-3">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessage(input);
                }
              }}
              placeholder={isListening ? "Listening... speak now" : t("askQuestion")}
              rows={1}
              disabled={isLoading}
              className="flex-1 bg-transparent resize-none outline-none text-sm text-white placeholder-gray-500 disabled:opacity-50"
              style={{ minHeight: "24px", maxHeight: "120px" }}
            />
            <div className="flex items-center gap-2 flex-shrink-0">
              <button onClick={toggleListening} disabled={isLoading}
                title={isListening ? "Stop listening" : "Voice input"}
                className={`p-2 rounded-xl transition-all disabled:opacity-40 ${isListening ? "bg-red-500 text-white" : "glass text-gray-400 hover:text-white hover:bg-white/10"}`}>
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </button>
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isLoading}
                className="p-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white disabled:opacity-40 hover:from-blue-500 hover:to-purple-500 transition-all">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
          {isListening && (
            <div className="px-4 pb-2 flex items-center gap-2">
              <span className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
              <span className="text-xs text-red-400">{t("listening")}</span>
            </div>
          )}
        </div>

        {/* Quick links */}
        <div className="flex gap-3 mt-3 flex-shrink-0">
          <Link href="/lawyers" className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-400 transition-colors">
            <Users className="w-3.5 h-3.5" /> Find a Lawyer
          </Link>
          <Link href="/rights" className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-400 transition-colors">
            <BookOpen className="w-3.5 h-3.5" /> Know Your Rights
          </Link>
          <Link href="/templates" className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-400 transition-colors">
            <FileText className="w-3.5 h-3.5" /> Legal Templates
          </Link>
        </div>
      </div>
    </div>
  );
}
