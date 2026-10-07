import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { query } from "./db";
import { COOKIE, SESSION_HOURS, signSession, verifySession, type SessionUser } from "./session";

/** Usuário logado, revalidado no banco (pega desativação/mudança de role na hora). */
export const getUser = cache(async (): Promise<SessionUser | null> => {
  const token = (await cookies()).get(COOKIE)?.value;
  const s = await verifySession(token);
  if (!s) return null;

  const rows = await query<{ usuarioId: number; nome: string; email: string; role: string; ativo: boolean }>(
    "SELECT usuarioId, nome, email, role, ativo FROM usuarios WHERE usuarioId = @id",
    { id: s.id },
  );
  const u = rows[0];
  if (!u || !u.ativo) return null;
  return { id: u.usuarioId, nome: u.nome, email: u.email, role: u.role };
});

export async function requireUser() {
  const u = await getUser();
  if (!u) redirect("/login");
  return u;
}

export async function requireAdmin() {
  const u = await requireUser();
  if (u.role !== "admin") redirect("/?erro=acesso");
  return u;
}

export async function createSession(u: SessionUser) {
  const token = await signSession(u);
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production" && process.env.COOKIE_SECURE !== "false",
    path: "/",
    maxAge: SESSION_HOURS * 3600,
  });
}

export async function destroySession() {
  (await cookies()).delete(COOKIE);
}
