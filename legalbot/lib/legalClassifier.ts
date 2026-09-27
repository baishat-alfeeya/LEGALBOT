export type LegalDocumentType =
  | "rental_agreement" | "affidavit" | "fir" | "legal_notice"
  | "property_document" | "employment_contract" | "will" | "deed"
  | "government_certificate" | "court_order" | "power_of_attorney"
  | "nda" | "unknown";

// Strong legal-specific phrases (each worth 3 points)
const strongLegalPhrases = [
  "whereas","hereinafter","hereinafter referred to as","party of the first part",
  "party of the second part","in witness whereof","signed and sealed",
  "first information report","fir no","case no","court of","hon'ble",
  "plaintiff","defendant","petitioner","respondent","affidavit",
  "solemnly affirm","stamp duty paid","notary public","power of attorney",
  "rental agreement","lease agreement","tenancy agreement","employment agreement",
  "non-disclosure agreement","confidentiality agreement","memorandum of understanding",
  "terms and conditions","indemnify","indemnification","arbitration clause",
  "jurisdiction of courts","force majeure","liquidated damages","breach of contract",
  "legal notice","demand notice","without prejudice","sub judice",
  "bail application","anticipatory bail","writ petition","habeas corpus",
  "sale deed","gift deed","will and testament","last will","executor of",
  "registration act","stamp act","transfer of property","ipc section","crpc section",
];

// Moderate legal keywords (each worth 1 point)
const legalKeywords = [
  "agreement","contract","clause","section","act","deed","lease","rent",
  "tenant","landlord","mortgage","executor","witness","schedule","annexure",
  "consideration","termination","notice period","employment","salary",
  "compensation","damages","injunction","bail","surety","bond","judgment",
  "decree","petition","court","order","registration","jurisdiction","liability",
  "indemnity","arbitration","notary","certificate","government","property",
];

// Non-legal document indicators — strong signals (each worth 4 points)
const strongNonLegalPhrases = [
  "project synopsis","project report","abstract","introduction","literature review",
  "research methodology","chapter 1","chapter 2","chapter 3","chapter 4","chapter 5",
  "table of contents","list of figures","list of tables","bibliography","references",
  "acknowledgement","acknowledgments","submitted to","submitted by","guided by",
  "department of","college of","university of","institute of","school of",
  "bachelor of","master of","doctor of","b.tech","m.tech","b.e.","m.e.",
  "b.sc","m.sc","b.com","m.com","mba","bca","mca","phd","pg diploma",
  "semester","academic year","roll no","enrollment no","student id",
  "marks obtained","grade point","cgpa","sgpa","percentage of marks",
  "exam paper","question paper","answer key","model answer",
  "recipe","ingredients","method of preparation","serves","cooking time",
  "resume","curriculum vitae","objective statement","work experience","internship",
  "skills summary","hobbies and interests","personal profile",
  "news article","press release","blog post","social media","tweet",
  "movie review","book review","product review","rating out of",
];

// Moderate non-legal keywords (each worth 2 points)
const nonLegalKeywords = [
  "chapter","exercise","question","answer","textbook","syllabus","exam","marks",
  "grade","student","teacher","school","college","university","lecture","notes",
  "assignment","homework","biology","chemistry","physics","mathematics","history",
  "geography","recipe","ingredient","cook","bake","restaurant","menu","food",
  "nutrition","movie","song","music","album","artist","celebrity","entertainment",
  "sports","cricket","football","research","methodology","hypothesis","conclusion",
  "abstract","introduction","objective","scope","limitation","recommendation",
  "figure","table","appendix","bibliography","reference","citation","footnote",
  "synopsis","report","proposal","presentation","slide","powerpoint",
];

// Filename patterns that strongly indicate non-legal documents
const nonLegalFilenamePatterns = [
  /synopsis/i, /report/i, /project/i, /assignment/i, /homework/i,
  /notes/i, /lecture/i, /study/i, /exam/i, /question/i, /answer/i,
  /resume/i, /cv/i, /portfolio/i, /presentation/i, /slide/i,
  /recipe/i, /menu/i, /blog/i, /article/i, /essay/i, /thesis/i,
  /dissertation/i, /research/i, /paper/i, /abstract/i,
];

// Filename patterns that strongly indicate legal documents
const legalFilenamePatterns = [
  /agreement/i, /affidavit/i, /contract/i, /notice/i, /fir/i,
  /deed/i, /will/i, /order/i, /certificate/i, /petition/i,
  /nda/i, /mou/i, /lease/i, /rental/i, /employment/i, /legal/i,
  /court/i, /judgment/i, /decree/i, /bail/i, /power.of.attorney/i,
];

export function classifyDocument(
  text: string,
  filename: string = ""
): { isLegal: boolean; type: LegalDocumentType; confidence: number; reason: string } {
  const lower = text.toLowerCase();
  const lowerFilename = filename.toLowerCase();

  let legalScore = 0;
  let nonLegalScore = 0;

  // Check filename patterns first (highest priority)
  for (const pattern of nonLegalFilenamePatterns) {
    if (pattern.test(lowerFilename)) {
      nonLegalScore += 8; // Very strong signal from filename
    }
  }
  for (const pattern of legalFilenamePatterns) {
    if (pattern.test(lowerFilename)) {
      legalScore += 8;
    }
  }

  // Score strong legal phrases
  for (const phrase of strongLegalPhrases) {
    if (lower.includes(phrase)) legalScore += 3;
  }

  // Score moderate legal keywords
  for (const kw of legalKeywords) {
    if (lower.includes(kw)) legalScore += 1;
  }

  // Score strong non-legal phrases
  for (const phrase of strongNonLegalPhrases) {
    if (lower.includes(phrase)) nonLegalScore += 4;
  }

  // Score moderate non-legal keywords
  for (const kw of nonLegalKeywords) {
    if (lower.includes(kw)) nonLegalScore += 2;
  }

  // Decision: require legal score to clearly dominate
  // Non-legal wins if nonLegalScore >= legalScore OR legalScore < 6
  const isLegal = legalScore > nonLegalScore && legalScore >= 6;
  const total = legalScore + nonLegalScore || 1;
  const confidence = Math.round((legalScore / total) * 100);

  let reason = "";
  if (!isLegal) {
    if (nonLegalScore > legalScore) {
      reason = "Document contains academic, research, or non-legal content patterns.";
    } else {
      reason = "Insufficient legal content detected in this document.";
    }
  }

  // Determine document type
  let type: LegalDocumentType = "unknown";
  if (isLegal) {
    if (lower.includes("rent") || lower.includes("lease") || lower.includes("tenant") || lower.includes("tenancy")) type = "rental_agreement";
    else if (lower.includes("affidavit") || lower.includes("solemnly affirm") || lower.includes("deponent")) type = "affidavit";
    else if (lower.includes("fir") || lower.includes("first information report") || lower.includes("case no")) type = "fir";
    else if (lower.includes("legal notice") || lower.includes("demand notice") || lower.includes("without prejudice")) type = "legal_notice";
    else if (lower.includes("employment") || lower.includes("designation") || lower.includes("probation") || lower.includes("salary")) type = "employment_contract";
    else if (lower.includes("last will") || lower.includes("testament") || lower.includes("executor") || lower.includes("bequeath")) type = "will";
    else if (lower.includes("power of attorney") || lower.includes("attorney in fact")) type = "power_of_attorney";
    else if (lower.includes("court") || lower.includes("judgment") || lower.includes("decree") || lower.includes("order")) type = "court_order";
    else if (lower.includes("sale deed") || lower.includes("gift deed") || lower.includes("property") || lower.includes("survey no")) type = "property_document";
    else if (lower.includes("certificate") || lower.includes("government of india") || lower.includes("ministry")) type = "government_certificate";
    else if (lower.includes("non-disclosure") || lower.includes("nda") || lower.includes("confidentiality agreement")) type = "nda";
    else if (lower.includes("deed")) type = "deed";
    else type = "legal_notice"; // fallback for generic legal docs
  }

  return { isLegal, type, confidence, reason };
}

export const docTypeLabels: Record<LegalDocumentType, string> = {
  rental_agreement: "Rental Agreement",
  affidavit: "Affidavit",
  fir: "FIR Copy",
  legal_notice: "Legal Notice",
  property_document: "Property Document",
  employment_contract: "Employment Contract",
  will: "Will / Testament",
  deed: "Deed",
  government_certificate: "Government Certificate",
  court_order: "Court Order",
  power_of_attorney: "Power of Attorney",
  nda: "Non-Disclosure Agreement",
  unknown: "Unknown Document",
};
