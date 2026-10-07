"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { query } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { bool, dbError, str, type FormState } from "@/lib/utils";

const ROLES = ["user", "admin"];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validar(fd: FormData, senhaObrigatoria: boolean) {
  const nome = str(fd, "nome");
  const email = str(fd, "email").toLowerCase();
  const senha = String(fd.get("senha") ?? "");
  const role = str(fd, "role");
  if (!nome || nome.length > 100) return { error: "Nome obrigatório (máx. 100 caracteres)." };
  if (!EMAIL_RE.test(email) || email.length > 255) return { error: "E-mail inválido." };
  if (!ROLES.includes(role)) return { error: "Perfil inválido." };
  if (senhaObrigatoria && senha.length < 6) return { error: "A senha deve ter ao menos 6 caracteres." };
  if (!senhaObrigatoria && senha && senha.length < 6) return { error: "A nova senha deve ter ao menos 6 caracteres." };
  return { nome, email, senha, role, ativo: bool(fd, "ativo") };
}

export async function criarUsuario(_: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const v = validar(fd, true);
  if ("error" in v) return { error: v.error };

  try {
    const existe = await query("SELECT 1 AS x FROM usuarios WHERE email = @email", { email: v.email });
    if (existe.length) return { error: "Já existe um usuário com este e-mail." };
    await query(
      "INSERT INTO usuarios (nome, email, senhaHash, role, ativo) VALUES (@nome, @email, @hash, @role, @ativo)",
      { nome: v.nome, email: v.email, hash: await bcrypt.hash(v.senha, 10), role: v.role, ativo: v.ativo },
    );
  } catch (e) {
    return { error: dbError(e) };
  }
  revalidatePath("/usuarios");
  redirect("/usuarios");
}

export async function atualizarUsuario(id: number, _: FormState, fd: FormData): Promise<FormState> {
  const me = await requireAdmin();
  const v = validar(fd, false);
  if ("error" in v) return { error: v.error };
  if (id === me.id && (v.role !== "admin" || !v.ativo)) {
    return { error: "Você não pode remover seu próprio acesso de administrador nem se desativar." };
  }

  try {
    const dup = await query("SELECT 1 AS x FROM usuarios WHERE email = @email AND usuarioId <> @id", { email: v.email, id });
    if (dup.length) return { error: "Já existe outro usuário com este e-mail." };

    if (v.senha) {
      await query(
        "UPDATE usuarios SET nome=@nome, email=@email, role=@role, ativo=@ativo, senhaHash=@hash WHERE usuarioId=@id",
        { id, nome: v.nome, email: v.email, role: v.role, ativo: v.ativo, hash: await bcrypt.hash(v.senha, 10) },
      );
    } else {
      await query("UPDATE usuarios SET nome=@nome, email=@email, role=@role, ativo=@ativo WHERE usuarioId=@id", {
        id, nome: v.nome, email: v.email, role: v.role, ativo: v.ativo,
      });
    }
  } catch (e) {
    return { error: dbError(e) };
  }
  revalidatePath("/usuarios");
  redirect("/usuarios");
}

export async function excluirUsuario(id: number) {
  const me = await requireAdmin();
  if (id === me.id) redirect("/usuarios?erro=" + encodeURIComponent("Você não pode excluir o próprio usuário."));
  try {
    await query("DELETE FROM usuarios WHERE usuarioId = @id", { id });
  } catch (e) {
    redirect(
      "/usuarios?erro=" +
        encodeURIComponent(dbError(e, "Não é possível excluir: o usuário possui registros vinculados. Desative-o em vez disso.")),
    );
  }
  revalidatePath("/usuarios");
  redirect("/usuarios");
}
