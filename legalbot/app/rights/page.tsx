"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookOpen, ChevronDown, ChevronUp, Scale, Users, Home, Briefcase, Wifi, FileText, Building, ShieldAlert, Lock, Search } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const rightsData = [
  {
    key: "fundamentalRights", icon: Scale, color: "from-blue-500 to-cyan-500",
    title: "Fundamental Rights",
    items: [
      { title: "Right to Equality (Art. 14-18)", desc: "Equal protection before law. No discrimination on grounds of religion, race, caste, sex or place of birth." },
      { title: "Right to Freedom (Art. 19-22)", desc: "Freedom of speech, expression, assembly, movement, residence, and profession. Protection against arbitrary arrest." },
      { title: "Right Against Exploitation (Art. 23-24)", desc: "Prohibition of human trafficking, forced labor, and child labor in hazardous industries." },
      { title: "Right to Freedom of Religion (Art. 25-28)", desc: "Freedom of conscience, right to profess, practice and propagate religion." },
      { title: "Cultural & Educational Rights (Art. 29-30)", desc: "Right of minorities to conserve their culture and establish educational institutions." },
      { title: "Right to Constitutional Remedies (Art. 32)", desc: "Right to move Supreme Court for enforcement of fundamental rights via writs: Habeas Corpus, Mandamus, Certiorari, etc." },
    ],
  },
  {
    key: "consumerRights", icon: Users, color: "from-green-500 to-emerald-500",
    title: "Consumer Rights",
    items: [
      { title: "Right to Safety", desc: "Protection against marketing of goods and services hazardous to life and property." },
      { title: "Right to Information", desc: "Right to be informed about quality, quantity, potency, purity, standard and price of goods." },
      { title: "Right to Choose", desc: "Access to variety of goods and services at competitive prices." },
      { title: "Right to Redressal", desc: "Right to seek redressal against unfair trade practices. File complaint at consumer forum within 2 years." },
      { title: "E-Commerce Rights", desc: "30-day return policy mandatory for e-commerce. Seller must disclose all charges before purchase." },
      { title: "National Consumer Helpline", desc: "Call 1800-11-4000 (toll-free) for consumer complaints and guidance." },
    ],
  },
  {
    key: "womensRights", icon: Users, color: "from-pink-500 to-rose-500",
    title: "Women's Rights",
    items: [
      { title: "Protection from Domestic Violence", desc: "DV Act 2005 — covers physical, emotional, sexual, economic abuse. File complaint with Protection Officer." },
      { title: "Sexual Harassment at Workplace", desc: "POSH Act 2013 — mandatory Internal Complaints Committee in organizations with 10+ employees." },
      { title: "Maternity Benefits", desc: "Maternity Benefit Act — 26 weeks paid maternity leave for first two children." },
      { title: "Equal Pay", desc: "Equal Remuneration Act — equal pay for equal work regardless of gender." },
      { title: "Dowry Prohibition", desc: "Dowry Prohibition Act 1961 — giving/taking dowry is a criminal offense punishable with imprisonment." },
      { title: "Women Helpline", desc: "Call 1091 for immediate assistance. One Stop Centres available in all districts." },
    ],
  },
  {
    key: "tenantRights", icon: Home, color: "from-yellow-500 to-amber-500",
    title: "Tenant Rights",
    items: [
      { title: "Written Rental Agreement", desc: "Always insist on a written agreement. Verbal agreements are difficult to enforce legally." },
      { title: "Security Deposit Limits", desc: "Most states cap security deposit at 2-3 months rent. Must be refunded within 30-45 days of vacating." },
      { title: "Notice Before Eviction", desc: "Landlord must give adequate notice (typically 1-3 months) before eviction. Forced eviction is illegal." },
      { title: "Rent Control Protection", desc: "State Rent Control Acts protect tenants from arbitrary rent increases and evictions." },
      { title: "Maintenance Rights", desc: "Landlord responsible for structural repairs and essential services (water, electricity)." },
      { title: "Receipt for Rent", desc: "Always demand rent receipts. Landlord legally obligated to provide receipts for rent paid." },
    ],
  },
  {
    key: "laborRights", icon: Briefcase, color: "from-purple-500 to-indigo-500",
    title: "Labor & Employment Laws",
    items: [
      { title: "Minimum Wage", desc: "Minimum Wages Act — entitled to minimum wage as notified by state government for your category of work." },
      { title: "Working Hours", desc: "Factories Act — maximum 48 hours/week, 9 hours/day. Overtime at double the rate." },
      { title: "Provident Fund", desc: "EPF Act — employer must contribute 12% of basic salary to PF for establishments with 20+ employees." },
      { title: "Gratuity", desc: "Payment of Gratuity Act — entitled to gratuity after 5 years of continuous service." },
      { title: "Protection from Wrongful Termination", desc: "Industrial Disputes Act — protection against arbitrary dismissal. Retrenchment compensation mandatory." },
      { title: "Labor Helpline", desc: "Call 1800-11-2222 for labor law complaints. File complaint with Labor Commissioner." },
    ],
  },
  {
    key: "firRights", icon: ShieldAlert, color: "from-red-500 to-orange-500",
    title: "FIR Filing Procedures",
    items: [
      { title: "What is an FIR?", desc: "First Information Report — a written document prepared by police when they receive information about a cognizable offense." },
      { title: "Who Can File an FIR?", desc: "Any person who has knowledge of a cognizable offense can file an FIR. Police cannot refuse to register an FIR." },
      { title: "How to File an FIR", desc: "Visit nearest police station, narrate the incident, police will write it down, read it to you, and you sign it. Get a free copy." },
      { title: "Zero FIR", desc: "You can file an FIR at any police station regardless of jurisdiction. It will be transferred to the appropriate station." },
      { title: "Online FIR", desc: "Many states allow online FIR filing for minor offenses at their state police portal." },
      { title: "Rights During FIR", desc: "You have the right to a free copy of the FIR. Police must register FIR within 24 hours of receiving complaint." },
    ],
  },
  {
    key: "arrestRights", icon: Scale, color: "from-orange-500 to-red-500",
    title: "Rights During Arrest",
    items: [
      { title: "Right to Know Grounds of Arrest", desc: "Police must inform you of the reason for your arrest at the time of arrest (Article 22)." },
      { title: "Right to Legal Representation", desc: "You have the right to consult and be defended by a lawyer of your choice. Legal aid is free if you cannot afford one." },
      { title: "Right to Remain Silent", desc: "You cannot be compelled to be a witness against yourself (Article 20). You may refuse to answer questions." },
      { title: "Right to be Produced Before Magistrate", desc: "Must be produced before a magistrate within 24 hours of arrest (excluding travel time)." },
      { title: "Right Against Torture", desc: "No person shall be subjected to torture or cruel, inhuman treatment. Any such act is punishable." },
      { title: "Bail Rights", desc: "For bailable offenses, bail is a right. For non-bailable offenses, you can apply for bail before a magistrate." },
    ],
  },
  {
    key: "cyberLaws", icon: Wifi, color: "from-cyan-500 to-blue-500",
    title: "Cyber Safety Laws",
    items: [
      { title: "IT Act 2000", desc: "Governs electronic commerce, digital signatures, and cyber crimes in India." },
      { title: "Data Privacy (DPDP Act 2023)", desc: "Digital Personal Data Protection Act — right to privacy of personal data. Companies must obtain consent." },
      { title: "Cyber Stalking (Sec 354D IPC)", desc: "Monitoring online activity, sending unwanted messages is a criminal offense punishable with imprisonment." },
      { title: "Online Fraud (Sec 66D IT Act)", desc: "Cheating by personation using computer resources — punishable with 3 years imprisonment and fine." },
      { title: "Right to be Forgotten", desc: "Right to request removal of personal information from online platforms under DPDP Act." },
      { title: "Cyber Crime Reporting", desc: "Report at cybercrime.gov.in or call 1930. Preserve all digital evidence before reporting." },
    ],
  },
  {
    key: "digitalPrivacy", icon: Lock, color: "from-indigo-500 to-violet-500",
    title: "Digital Privacy Rights",
    items: [
      { title: "Right to Privacy (Art. 21)", desc: "Supreme Court declared privacy a fundamental right in 2017 (Puttaswamy judgment). Applies to digital data too." },
      { title: "Consent for Data Collection", desc: "Organizations must obtain explicit consent before collecting your personal data under DPDP Act 2023." },
      { title: "Right to Data Correction", desc: "You can request correction or erasure of inaccurate personal data held by any organization." },
      { title: "Protection from Surveillance", desc: "Unauthorized surveillance, phone tapping, or monitoring of communications is illegal without court order." },
      { title: "Social Media Rights", desc: "Platforms must remove content within 36 hours of court/government order. Grievance officer must be appointed." },
      { title: "Aadhaar Data Protection", desc: "Aadhaar data cannot be shared without consent. Biometric data is protected under Aadhaar Act." },
    ],
  },
  {
    key: "rti", icon: FileText, color: "from-orange-500 to-red-500",
    title: "Right to Information (RTI)",
    items: [
      { title: "What is RTI?", desc: "RTI Act 2005 — citizens can request information from any public authority within India." },
      { title: "How to File RTI", desc: "Write application to Public Information Officer (PIO) of concerned department. Pay ₹10 fee (BPL citizens exempt)." },
      { title: "Response Timeline", desc: "PIO must respond within 30 days. For life/liberty matters, within 48 hours." },
      { title: "First Appeal", desc: "If unsatisfied, file first appeal with Appellate Authority within 30 days of response." },
      { title: "Second Appeal", desc: "File second appeal with Central/State Information Commission within 90 days." },
      { title: "Online RTI", desc: "File RTI online at rtionline.gov.in for central government departments." },
    ],
  },
  {
    key: "govSchemes", icon: Building, color: "from-teal-500 to-green-500",
    title: "Government Schemes & Legal Aid",
    items: [
      { title: "Legal Aid (NALSA)", desc: "Free legal services for SC/ST, women, children, disabled, victims of trafficking. Call 15100." },
      { title: "PM Awas Yojana", desc: "Housing scheme for economically weaker sections. Subsidy on home loans up to ₹2.67 lakh." },
      { title: "Ayushman Bharat", desc: "Health insurance of ₹5 lakh per family per year for BPL families. Cashless treatment at empanelled hospitals." },
      { title: "PM Kisan Samman Nidhi", desc: "₹6000 per year direct income support to farmer families in three installments." },
      { title: "Beti Bachao Beti Padhao", desc: "Scheme for welfare of girl child — education and protection initiatives across India." },
      { title: "Jan Dhan Yojana", desc: "Zero balance bank accounts with accident insurance of ₹2 lakh and overdraft facility." },
    ],
  },
];

export default function RightsPage() {
  const { t } = useLanguage();
  const [expanded, setExpanded] = useState<string | null>("fundamentalRights");
  const [search, setSearch] = useState("");

  const filtered = rightsData.filter((r) =>
    r.title.toLowerCase().includes(search.toLowerCase()) ||
    r.items.some((item) => item.title.toLowerCase().includes(search.toLowerCase()) || item.desc.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="min-h-screen pt-20 pb-10 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-4xl font-bold text-gradient mb-2">{t("rights")}</h1>
        <p className="text-gray-400">Comprehensive guide to your legal rights as an Indian citizen</p>
      </motion.div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search rights, laws, topics..."
          className="w-full pl-10 pr-4 py-3 glass rounded-xl border border-white/10 bg-transparent text-white placeholder-gray-500 outline-none focus:border-blue-500/50 transition-colors" />
      </div>

      {/* Quick topic pills */}
      <div className="flex flex-wrap gap-2 mb-6">
        {["FIR Filing","Arrest Rights","Women Safety","Cyber Crime","Tenant Rights","Consumer Rights"].map((topic) => (
          <button key={topic} onClick={() => setSearch(topic)}
            className="text-xs px-3 py-1.5 glass rounded-full text-gray-400 hover:text-white border border-white/10 hover:bg-white/10 transition-all">
            {topic}
          </button>
        ))}
        {search && <button onClick={() => setSearch("")} className="text-xs px-3 py-1.5 bg-red-500/20 text-red-400 rounded-full border border-red-500/30 hover:bg-red-500/30 transition-all">Clear ✕</button>}
      </div>

      <div className="space-y-4">
        {filtered.map(({ key, icon: Icon, color, title, items }, i) => (
          <motion.div key={key} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ delay: i * 0.04 }}
            className="glass rounded-2xl border border-white/10 overflow-hidden">
            <button onClick={() => setExpanded(expanded === key ? null : key)}
              className="w-full flex items-center justify-between p-5 hover:bg-white/5 transition-colors">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center flex-shrink-0`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <span className="font-semibold text-white text-left">{title}</span>
              </div>
              {expanded === key ? <ChevronUp className="w-5 h-5 text-gray-400 flex-shrink-0" /> : <ChevronDown className="w-5 h-5 text-gray-400 flex-shrink-0" />}
            </button>

            <AnimatePresence>
              {expanded === key && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }} className="overflow-hidden">
                  <div className="px-5 pb-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {items.map((item, j) => (
                      <motion.div key={j} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: j * 0.04 }}
                        className="bg-white/5 rounded-xl p-4 border border-white/5 hover:border-white/10 transition-colors">
                        <h4 className="font-medium text-white mb-1 text-sm">{item.title}</h4>
                        <p className="text-xs text-gray-400 leading-relaxed">{item.desc}</p>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-500">No results found for "{search}"</div>
        )}
      </div>
    </div>
  );
}
