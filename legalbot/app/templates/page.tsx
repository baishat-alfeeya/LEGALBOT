"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { FileCheck, Download, Eye, Search, FileText } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

const templates = [
  {
    id: 1, category: "Rental",
    title: "Residential Rental Agreement",
    desc: "Standard 11-month rental agreement for residential property with all essential clauses.",
    pages: 4, downloads: "12.5K",
    content: `RESIDENTIAL RENTAL AGREEMENT

This Rental Agreement is entered into on [DATE] between:

LANDLORD: [LANDLORD NAME], residing at [LANDLORD ADDRESS]
TENANT: [TENANT NAME], residing at [TENANT ADDRESS]

PROPERTY: [PROPERTY ADDRESS]

TERMS:
1. LEASE PERIOD: 11 months from [START DATE] to [END DATE]
2. MONTHLY RENT: ₹[AMOUNT] payable on or before [DATE] of each month
3. SECURITY DEPOSIT: ₹[AMOUNT] (refundable within 30 days of vacating)
4. MAINTENANCE: Tenant responsible for day-to-day maintenance
5. UTILITIES: Electricity, water charges to be borne by Tenant
6. NOTICE PERIOD: 30 days written notice required from either party
7. SUB-LETTING: Not permitted without written consent of Landlord

SIGNATURES:
Landlord: _________________ Date: _______
Tenant: __________________ Date: _______
Witness 1: _______________ Date: _______
Witness 2: _______________ Date: _______`,
  },
  {
    id: 2, category: "Affidavit",
    title: "General Affidavit",
    desc: "General purpose affidavit template for various legal declarations and sworn statements.",
    pages: 2, downloads: "8.2K",
    content: `AFFIDAVIT

I, [YOUR FULL NAME], son/daughter of [FATHER'S NAME], aged [AGE] years, residing at [ADDRESS], do hereby solemnly affirm and declare as under:

1. That I am the deponent herein and am competent to swear this affidavit.
2. That [STATE YOUR DECLARATION HERE]
3. That the facts stated above are true and correct to the best of my knowledge and belief.
4. That nothing material has been concealed therefrom.

DEPONENT

Verified at [CITY] on this [DATE] day of [MONTH], [YEAR] that the contents of the above affidavit are true and correct to the best of my knowledge and belief and nothing has been concealed therefrom.

DEPONENT

Before me:
Notary Public / Oath Commissioner`,
  },
  {
    id: 3, category: "Legal Notice",
    title: "Legal Notice Template",
    desc: "Formal legal notice for various disputes including property, money recovery, and breach of contract.",
    pages: 2, downloads: "15.1K",
    content: `LEGAL NOTICE

Date: [DATE]

To,
[RECIPIENT NAME]
[RECIPIENT ADDRESS]

Through: [YOUR LAWYER NAME]
[LAWYER ADDRESS]
[LAWYER PHONE/EMAIL]

SUBJECT: Legal Notice for [SUBJECT MATTER]

Dear Sir/Madam,

Under instructions from and on behalf of my client [YOUR NAME], I hereby serve upon you this legal notice as under:

1. That my client [DESCRIBE YOUR RELATIONSHIP/BACKGROUND]
2. That [DESCRIBE THE DISPUTE/ISSUE IN DETAIL]
3. That despite repeated requests, you have failed to [DESCRIBE WHAT THEY FAILED TO DO]
4. That my client has suffered damages of ₹[AMOUNT] due to your actions/inactions.

You are hereby called upon to [STATE YOUR DEMAND] within 15 days of receipt of this notice, failing which my client shall be constrained to initiate appropriate legal proceedings against you, at your risk, cost and consequences.

Yours faithfully,
[LAWYER NAME]
Advocate`,
  },
  {
    id: 4, category: "Employment",
    title: "Employment Contract",
    desc: "Comprehensive employment agreement covering salary, benefits, confidentiality, and termination clauses.",
    pages: 6, downloads: "9.8K",
    content: `EMPLOYMENT AGREEMENT

This Employment Agreement is made on [DATE] between:

EMPLOYER: [COMPANY NAME], a company incorporated under the Companies Act, having its registered office at [ADDRESS] (hereinafter "Company")

EMPLOYEE: [EMPLOYEE NAME], residing at [ADDRESS] (hereinafter "Employee")

1. POSITION: [JOB TITLE] in [DEPARTMENT]
2. START DATE: [DATE]
3. COMPENSATION: ₹[AMOUNT] per month (CTC: ₹[ANNUAL CTC])
4. WORKING HOURS: [HOURS] per week
5. PROBATION: [DURATION] months probation period
6. LEAVE: [NUMBER] days paid leave per year
7. CONFIDENTIALITY: Employee shall maintain strict confidentiality of company information
8. NON-COMPETE: [DURATION] months post-employment
9. TERMINATION: [NOTICE PERIOD] notice period required from either party
10. GOVERNING LAW: Laws of India

SIGNATURES:
For Company: _____________ Date: _______
Employee: _______________ Date: _______`,
  },
  {
    id: 5, category: "Power of Attorney",
    title: "General Power of Attorney",
    desc: "Authorize someone to act on your behalf for legal, financial, and property matters.",
    pages: 3, downloads: "6.4K",
    content: `GENERAL POWER OF ATTORNEY

I, [YOUR NAME], son/daughter of [FATHER'S NAME], aged [AGE] years, residing at [ADDRESS], do hereby appoint [ATTORNEY NAME], son/daughter of [FATHER'S NAME], aged [AGE] years, residing at [ADDRESS], as my true and lawful Attorney to act on my behalf.

MY ATTORNEY IS AUTHORIZED TO:
1. Manage, operate and deal with my bank accounts
2. Execute documents, agreements and contracts on my behalf
3. Appear before government authorities and courts
4. Collect rents, dues and payments owed to me
5. [ADD SPECIFIC POWERS AS NEEDED]

This Power of Attorney shall remain valid until revoked in writing.

PRINCIPAL: _________________ Date: _______
ATTORNEY: _________________ Date: _______

Witness 1: _________________ Date: _______
Witness 2: _________________ Date: _______

Notarized before me on [DATE]
Notary Public: _____________`,
  },
  {
    id: 6, category: "Consumer",
    title: "Consumer Complaint Letter",
    desc: "Template for filing consumer complaints against defective products or deficient services.",
    pages: 2, downloads: "11.3K",
    content: `CONSUMER COMPLAINT

Date: [DATE]

To,
The President/Secretary
District Consumer Disputes Redressal Forum
[DISTRICT], [STATE]

SUBJECT: Consumer Complaint against [COMPANY/SELLER NAME]

Respected Sir/Madam,

I, [YOUR NAME], residing at [ADDRESS], hereby file this complaint against [COMPANY NAME] for the following reasons:

FACTS:
1. On [DATE], I purchased [PRODUCT/SERVICE] from [COMPANY] for ₹[AMOUNT]
2. [DESCRIBE THE DEFECT/DEFICIENCY IN DETAIL]
3. I contacted the company on [DATE] but received no satisfactory response
4. I have suffered losses of ₹[AMOUNT] due to this deficiency

RELIEF SOUGHT:
1. Replacement/Refund of ₹[AMOUNT]
2. Compensation of ₹[AMOUNT] for mental agony
3. Cost of litigation

DOCUMENTS ENCLOSED:
- Purchase receipt/invoice
- Warranty card
- Correspondence with company
- [OTHER DOCUMENTS]

Yours faithfully,
[YOUR NAME]
[CONTACT DETAILS]`,
  },
];

const categories = ["All", "Rental", "Affidavit", "Legal Notice", "Employment", "Power of Attorney", "Consumer"];

export default function TemplatesPage() {
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [preview, setPreview] = useState<typeof templates[0] | null>(null);

  const filtered = templates.filter((tmpl) => {
    const matchSearch = tmpl.title.toLowerCase().includes(search.toLowerCase()) || tmpl.desc.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "All" || tmpl.category === category;
    return matchSearch && matchCat;
  });

  const downloadTemplate = (tmpl: typeof templates[0]) => {
    const blob = new Blob([tmpl.content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${tmpl.title.replace(/\s+/g, "_")}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen pt-20 pb-10 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <h1 className="text-4xl font-bold text-gradient mb-2">{t("templates")}</h1>
        <p className="text-gray-400">Download and customize professional legal templates</p>
      </motion.div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search templates..."
            className="w-full pl-10 pr-4 py-3 glass rounded-xl border border-white/10 bg-transparent text-white placeholder-gray-500 outline-none focus:border-blue-500/50" />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <button key={cat} onClick={() => setCategory(cat)}
              className={`px-3 py-2 rounded-xl text-sm transition-all ${category === cat ? "bg-blue-600 text-white" : "glass text-gray-300 hover:bg-white/10 border border-white/10"}`}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((tmpl, i) => (
          <motion.div key={tmpl.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }} whileHover={{ y: -4 }}
            className="glass rounded-2xl border border-white/10 p-5 flex flex-col">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <span className="text-xs px-2 py-1 bg-blue-500/20 text-blue-400 rounded-full">{tmpl.category}</span>
            </div>
            <h3 className="font-semibold text-white mb-2">{tmpl.title}</h3>
            <p className="text-sm text-gray-400 flex-1 mb-4">{tmpl.desc}</p>
            <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
              <span>{tmpl.pages} pages</span>
              <span>{tmpl.downloads} downloads</span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setPreview(tmpl)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 glass rounded-xl text-sm text-gray-300 hover:text-white hover:bg-white/10 border border-white/10 transition-all">
                <Eye className="w-4 h-4" /> Preview
              </button>
              <button onClick={() => downloadTemplate(tmpl)}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl text-sm font-medium hover:from-blue-500 hover:to-purple-500 transition-all">
                <Download className="w-4 h-4" /> {t("downloadTemplate")}
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      {preview && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && setPreview(null)}>
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="glass-dark rounded-2xl border border-white/10 w-full max-w-2xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between p-5 border-b border-white/10">
              <h2 className="font-bold text-lg">{preview.title}</h2>
              <div className="flex gap-2">
                <button onClick={() => downloadTemplate(preview)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 rounded-xl text-sm hover:bg-blue-500 transition-colors">
                  <Download className="w-4 h-4" /> Download
                </button>
                <button onClick={() => setPreview(null)} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400">✕</button>
              </div>
            </div>
            <div className="overflow-y-auto p-5">
              <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono leading-relaxed">{preview.content}</pre>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
