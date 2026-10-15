export const SUPER_EMAIL = "dvmorris.dm@gmail.com";

export const STAFF_DUTIES = ["admin", "business", "council"] as const;

export type StaffDuty = (typeof STAFF_DUTIES)[number];

export type StaffGrant = {
  email: string;
  duties: StaffDuty[];
};

export function dutiesFor(email: string | undefined, grants: StaffGrant[]): StaffDuty[] {
  if (!email) return [];
  const key = email.trim().toLowerCase();
  if (key === SUPER_EMAIL) return [...STAFF_DUTIES];
  return grants.find((row) => row.email === key)?.duties ?? [];
}

export function canAccess(email: string | undefined, kind: string | undefined, area: "admin" | "journalist" | "super") {
  const key = email?.trim().toLowerCase();
  if (area === "super") return key === SUPER_EMAIL;
  if (area === "admin") return key === SUPER_EMAIL || key === "admin@thecommon.community";
  return key === SUPER_EMAIL || kind === "journalist" || kind === "author";
}
