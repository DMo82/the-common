import { getSql } from "./db";

export const ROLES = ["super_admin", "admin", "moderator", "safeguarding_lead", "finance", "support", "council_partner", "journalist"] as const;
export type Role = typeof ROLES[number];

export const PERMISSIONS = {
  super_admin: ["*"],
  admin: ["approve", "decline", "view_audit", "view_users", "manage_businesses"],
  moderator: ["claim", "decide", "escalate"],
  safeguarding_lead: ["claim", "decide", "escalate", "view_safeguarding"],
  finance: ["view_revenue", "view_subscriptions"],
  support: ["view_tickets", "reply"],
  council_partner: ["view_council"],
  journalist: ["create_news", "edit_own"],
} as const;

export async function hasPermission(userId: string, action: string): Promise<boolean> {
  const sql = await getSql();
  const rows = await sql`SELECT role FROM user_roles WHERE user_id = ${userId}`;
  for (const row of rows) {
    const perms = PERMISSIONS[row.role as Role] || [];
    if (perms.includes("*") || perms.includes(action as never)) return true;
  }
  return false;
}
