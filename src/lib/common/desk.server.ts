import { createHmac, scryptSync, timingSafeEqual } from "node:crypto";

export type DeskRole = "super" | "staff";
export type DeskDuty = "admin" | "business" | "council";
export type DeskSeat = { email: string; role: DeskRole; duties: DeskDuty[] };

const ALL: DeskDuty[] = ["admin", "business", "council"];

const SECRET = "545eb1ee9bb20f3884238535e142e607bde5112d539778da235c2c87fc8c32bb";

const SUPER = {
  email: "dvmorris.dm@gmail.com",
  salt: "b901b4aa008dee28e0c0c1a4b9dbc03f",
  hash: "20627000a5aa62cdcf1e91254900530c1c471c155a5b311278d188d54f413ed7",
  role: "super" as const,
  duties: ALL,
};

export function checkDeskPassword(email: string, password: string): DeskSeat | null {
  if (email.trim().toLowerCase() !== SUPER.email) return null;
  const got = scryptSync(password, SUPER.salt, 32);
  const want = Buffer.from(SUPER.hash, "hex");
  if (got.length !== want.length || !timingSafeEqual(got, want)) return null;
  return { email: SUPER.email, role: SUPER.role, duties: ALL };
}

export function signDeskToken(seat: DeskSeat) {
  const payload = Buffer.from(JSON.stringify({ email: seat.email, role: seat.role, exp: Date.now() + 12 * 60 * 60 * 1000 })).toString("base64url");
  const sig = createHmac("sha256", SECRET).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export function readDeskToken(token: string): DeskSeat | null {
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expected = createHmac("sha256", SECRET).update(payload).digest("base64url");
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    const body = JSON.parse(Buffer.from(payload, "base64url").toString()) as DeskSeat & { exp: number };
    if (body.role !== "super" || body.exp < Date.now() || body.email !== SUPER.email) return null;
    return { email: body.email, role: "super", duties: ALL };
  } catch {
    return null;
  }
}
