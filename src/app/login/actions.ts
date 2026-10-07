"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { query } from "@/lib/db";
import { createSession, destroySession } from "@/lib/auth";
import { dbError, str, type FormState } from "@/lib/utils";

export async function login(_: FormState, fd: FormData): Promise<FormState> {
  const email = str(fd, "email").toLowerCase();
  const senha = String(fd.get("senha") ?? "");
  if (!email || !senha) return { error: "Informe e-mail e senha." };

  try {
    const rows = await query<{ usuarioId: number; nome: string; email: string; senhaHash: string; role: string; ativo: boolean }>(
      "SELECT usuarioId, nome, email, senhaHash, role, ativo FROM usuarios WHERE email = @email",
      { email },
    );
    const u = rows[0];
    const ok = u && u.ativo && (await bcrypt.compare(senha, u.senhaHash));
    if (!u || !ok) return { error: "E-mail ou senha inválidos." };

    await createSession({ id: u.usuarioId, nome: u.nome, email: u.email, role: u.role });
  } catch (e) {
    return { error: dbError(e) };
  }
  redirect("/");
}

export async function logout() {
  await destroySession();
  redirect("/login");
}
