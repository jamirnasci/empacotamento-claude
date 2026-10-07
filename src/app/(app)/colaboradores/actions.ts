"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { query } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { bool, dbError, str, type FormState } from "@/lib/utils";

export async function criarColaborador(_: FormState, fd: FormData): Promise<FormState> {
  const user = await requireUser();
  const nome = str(fd, "nome");
  if (!nome || nome.length > 100) return { error: "Nome obrigatório (máx. 100 caracteres)." };
  try {
    await query("INSERT INTO colaboradores (nome, ativo, createdBy) VALUES (@nome, @ativo, @by)", {
      nome,
      ativo: bool(fd, "ativo"),
      by: user.id,
    });
  } catch (e) {
    return { error: dbError(e) };
  }
  revalidatePath("/colaboradores");
  redirect("/colaboradores");
}

export async function atualizarColaborador(id: number, _: FormState, fd: FormData): Promise<FormState> {
  await requireUser();
  const nome = str(fd, "nome");
  if (!nome || nome.length > 100) return { error: "Nome obrigatório (máx. 100 caracteres)." };
  try {
    await query(
      "UPDATE colaboradores SET nome = @nome, ativo = @ativo, updatedAt = SYSDATETIME() WHERE colaboradorId = @id",
      { id, nome, ativo: bool(fd, "ativo") },
    );
  } catch (e) {
    return { error: dbError(e) };
  }
  revalidatePath("/colaboradores");
  redirect("/colaboradores");
}

export async function excluirColaborador(id: number) {
  await requireUser();
  try {
    await query("DELETE FROM colaboradores WHERE colaboradorId = @id", { id });
  } catch (e) {
    redirect(
      "/colaboradores?erro=" +
        encodeURIComponent(dbError(e, "Não é possível excluir: há empacotamentos deste colaborador. Inative-o em vez disso.")),
    );
  }
  revalidatePath("/colaboradores");
  redirect("/colaboradores");
}
