"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { query } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { bool, dbError, str, type FormState } from "@/lib/utils";

export async function criarProduto(_: FormState, fd: FormData): Promise<FormState> {
  const user = await requireAdmin();
  const codigo = str(fd, "codigo");
  const descricao = str(fd, "descricao");
  if (!codigo || codigo.length > 20) return { error: "Código obrigatório (máx. 20 caracteres)." };
  if (!descricao || descricao.length > 255) return { error: "Descrição obrigatória (máx. 255 caracteres)." };

  try {
    const existe = await query("SELECT 1 AS x FROM produtos WHERE codigo = @codigo", { codigo });
    if (existe.length) return { error: `Já existe um produto com o código "${codigo}".` };
    await query(
      "INSERT INTO produtos (codigo, descricao, ativo, createdBy) VALUES (@codigo, @descricao, @ativo, @by)",
      { codigo, descricao, ativo: bool(fd, "ativo"), by: user.id },
    );
  } catch (e) {
    return { error: dbError(e) };
  }
  revalidatePath("/produtos");
  redirect("/produtos");
}

export async function atualizarProduto(codigo: string, _: FormState, fd: FormData): Promise<FormState> {
  await requireAdmin();
  const descricao = str(fd, "descricao");
  if (!descricao || descricao.length > 255) return { error: "Descrição obrigatória (máx. 255 caracteres)." };

  try {
    await query(
      "UPDATE produtos SET descricao = @descricao, ativo = @ativo, updatedAt = SYSDATETIME() WHERE codigo = @codigo",
      { codigo, descricao, ativo: bool(fd, "ativo") },
    );
  } catch (e) {
    return { error: dbError(e) };
  }
  revalidatePath("/produtos");
  redirect("/produtos");
}

export async function excluirProduto(codigo: string) {
  await requireAdmin();
  try {
    await query("DELETE FROM produtos WHERE codigo = @codigo", { codigo });
  } catch (e) {
    redirect(
      "/produtos?erro=" +
        encodeURIComponent(dbError(e, "Não é possível excluir: há empacotamentos com este produto. Inative-o em vez disso.")),
    );
  }
  revalidatePath("/produtos");
  redirect("/produtos");
}
