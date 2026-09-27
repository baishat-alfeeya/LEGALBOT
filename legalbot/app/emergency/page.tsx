"use client";
import { motion } from "framer-motion";
import { Phone, AlertTriangle, Shield, Heart, Wifi, ChevronRight } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const emergencyContacts = [
  { name: "Police", number: "100", icon: Shield, color: "from-blue-600 to-blue-800", desc: "For theft, assault, crime" },
  { name: "Women Helpline", number: "1091", icon: Heart, color: "from-pink-600 to-rose-800", desc: "Harassment, domestic violence" },
  { name: "Ambulance", number: "102", icon: Heart, color: "from-red-600 to-red-800", desc: "Medical emergencies" },
  { name: "Disaster Mgmt", number: "108", icon: AlertTriangle, color: "from-orange-600 to-orange-800", desc: "Natural disasters" },
  { name: "Cyber Crime", number: "1930", icon: Wifi, color: "from-purple-600 to-purple-800", desc: "Online fraud, cyber crime" },
  { name: "National Emergency", number: "112", icon: Phone, color: "from-green-600 to-green-800", desc: "All emergencies" },
];

const scenarios = [
  {
    title: "Theft / Stolen Items",
    icon: "🔓",
    color: "border-orange-500/30",
    steps: [
      "Stay calm and ensure your safety first",
      "Call Police immediately: 100",
      "Do NOT touch or disturb the crime scene",
      "List all stolen items with estimated values",
      "File an FIR at the nearest police station",
      "Get a copy of FIR for insurance claims",
      "Inform bank if cards/documents were stolen",
      "File insurance claim within 24-48 hours",
    ],
  },
  {
    title: "Harassment / Abuse",
    icon: "⚠️",
    color: "border-red-500/30",
    steps: [
      "Move to a safe location immediately",
      "Call Women Helpline: 1091 or Police: 100",
      "Document all incidents with dates and witnesses",
      "Preserve evidence (messages, photos, recordings)",
      "File complaint at local police station",
      "Contact Internal Complaints Committee (workplace)",
      "Seek legal protection under IPC Section 354/509",
      "Consider restraining order if needed",
    ],
  },
  {
    title: "Domestic Violence",
    icon: "🏠",
    color: "border-pink-500/30",
    steps: [
      "Leave the premises if safe to do so",
      "Call Women Helpline: 1091 immediately",
      "Seek shelter at a safe house or relative's home",
      "Document injuries with photographs",
      "File complaint under Protection of Women from DV Act 2005",
      "Apply for Protection Order from Magistrate",
      "Contact NGOs: iCall, Snehi, Vandrevala Foundation",
      "Seek legal aid from District Legal Services Authority",
    ],
  },
  {
    title: "Cyber Fraud",
    icon: "💻",
    color: "border-purple-500/30",
    steps: [
      "Do NOT share any more information",
      "Call Cyber Crime Helpline: 1930 immediately",
      "Report at cybercrime.gov.in",
      "Contact your bank to freeze account if needed",
      "Preserve all evidence (screenshots, emails, IDs)",
      "File FIR at local cyber crime cell",
      "Change all passwords immediately",
      "Monitor credit report for suspicious activity",
    ],
  },
  {
    title: "Assault / Threats",
    icon: "🚨",
    color: "border-red-500/30",
    steps: [
      "Call Police: 100 or National Emergency: 112",
      "Move to a public, safe location",
      "Seek medical attention if injured",
      "Document injuries and threats with evidence",
      "File FIR under IPC Section 351/352 (Assault)",
      "Get witness statements if available",
      "Apply for anticipatory bail if threatened with arrest",
      "Consult a criminal lawyer immediately",
    ],
  },
];

export default function EmergencyPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen pt-20 pb-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-400" />
          </div>
          <h1 className="text-4xl font-bold text-red-400">{t("emergency")}</h1>
        </div>
        <p className="text-gray-400">Immediate help and step-by-step legal guidance for emergencies</p>
      </motion.div>

      {/* Emergency Contacts */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 text-white">Emergency Contacts</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {emergencyContacts.map((contact, i) => (
            <motion.a key={i} href={`tel:${contact.number}`}
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
              whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
              className={`bg-gradient-to-br ${contact.color} rounded-2xl p-4 text-center cursor-pointer border border-white/10`}>
              <div className="text-2xl mb-2">{contact.number}</div>
              <div className="font-bold text-white text-sm mb-1">{contact.name}</div>
              <div className="text-xs text-white/70">{contact.desc}</div>
            </motion.a>
          ))}
        </div>
      </section>

      {/* Scenario Guides */}
      <section>
        <h2 className="text-xl font-semibold mb-4 text-white">Step-by-Step Legal Guidance</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {scenarios.map((scenario, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className={`glass rounded-2xl border ${scenario.color} p-6`}>
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">{scenario.icon}</span>
                <h3 className="text-lg font-bold text-white">{scenario.title}</h3>
              </div>
              <ol className="space-y-2">
                {scenario.steps.map((step, j) => (
                  <li key={j} className="flex items-start gap-3 text-sm text-gray-300">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white mt-0.5">{j + 1}</span>
                    {step}
                  </li>
                ))}
              </ol>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}
