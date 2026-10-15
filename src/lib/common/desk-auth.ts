import { createServerFn } from "@tanstack/react-start";

export type DeskSeat = { email: string; role: "super" | "staff"; duties: Array<"admin" | "business" | "council"> };

export const deskSignIn = createServerFn({ method: "POST" })
  .validator((data: { email: string; password: string }) => ({
    email: data.email.trim().toLowerCase(),
    password: data.password,
  }))
  .handler(async ({ data }): Promise<{ ok: true; token: string } | { ok: false }> => {
    const { checkDeskPassword, signDeskToken } = await import("./desk.server");
    const seat = checkDeskPassword(data.email, data.password);
    if (!seat) return { ok: false };
    return { ok: true, token: signDeskToken(seat) };
  });

export const deskWho = createServerFn({ method: "POST" })
  .validator((data: { token: string }) => data)
  .handler(async ({ data }): Promise<DeskSeat | null> => {
    const { readDeskToken } = await import("./desk.server");
    return readDeskToken(data.token);
  });
