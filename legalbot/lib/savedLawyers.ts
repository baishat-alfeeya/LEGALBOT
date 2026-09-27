/**
 * Saved Lawyers utility — localStorage helpers
 * Kept in lib/ so any page can import without circular dependency issues.
 */

const SAVED_KEY = "legalbot_saved_lawyers";

export interface SavedLawyerItem {
  id: string;
  lawyerId: number;
  name: string;
  specialization: string;
  city: string;
  feeMin: number;
  feeMax: number;
  rating: number;
  mode: string;
  savedAt: string;
}

export function getSavedLawyers(userId: string): SavedLawyerItem[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(`${SAVED_KEY}_${userId}`) || "[]");
  } catch {
    return [];
  }
}

export function saveLawyer(
  userId: string,
  lawyer: Omit<SavedLawyerItem, "id" | "savedAt">
): boolean {
  const existing = getSavedLawyers(userId);
  if (existing.some((l) => l.lawyerId === lawyer.lawyerId)) return false;
  const newItem: SavedLawyerItem = {
    ...lawyer,
    id: "sl_" + Date.now().toString(36),
    savedAt: new Date().toISOString(),
  };
  try {
    localStorage.setItem(
      `${SAVED_KEY}_${userId}`,
      JSON.stringify([newItem, ...existing])
    );
  } catch {}
  return true;
}

export function unsaveLawyer(userId: string, lawyerId: number): void {
  const existing = getSavedLawyers(userId);
  try {
    localStorage.setItem(
      `${SAVED_KEY}_${userId}`,
      JSON.stringify(existing.filter((l) => l.lawyerId !== lawyerId))
    );
  } catch {}
}

export function isLawyerSaved(userId: string, lawyerId: number): boolean {
  return getSavedLawyers(userId).some((l) => l.lawyerId === lawyerId);
}
