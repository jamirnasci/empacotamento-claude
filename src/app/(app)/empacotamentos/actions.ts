"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { query, sql } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { N_CAIXAS } from "@/lib/empacotamentos";
import { dbError, dec, int, str, type FormState } from "@/lib/utils";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^\d{2}:\d{2}$/;

function parse(fd: FormData) {
  const data = str(fd, "data");
  const produtoCod = str(fd, "produtoCod");
  const colaboradorId = int(fd, "colaboradorId");
  if (!DATE_RE.test(data)) return { error: "Informe uma data válida." };
  if (!produtoCod) return { error: "Selecione o produto." };
  if (colaboradorId == null || Number.isNaN(colaboradorId)) return { error: "Selecione o colaborador." };

  const params: Record<string, unknown> = {
    data: [sql.VarChar(10), data],
    produtoCod: [sql.VarChar(20), produtoCod],
    colaboradorId: [sql.Int, colaboradorId],
  };

  for (let i = 1; i <= N_CAIXAS; i++) {
    const qtd = int(fd, `cx${i}`) ?? 0;
    const tipo = str(fd, `cx${i}Tipo`);
    if (Number.isNaN(qtd) || qtd < 0) return { error: `Quantidade inválida na caixa ${i}.` };
    if (tipo.length > 50) return { error: `Tipo da caixa ${i} muito longo (máx. 50).` };
    if (qtd > 0 && !tipo) return { error: `Informe o tipo da caixa ${i}.` };
    params[`cx${i}`] = [sql.Int, qtd];
    params[`cx${i}Tipo`] = [sql.VarChar(50), tipo];
  }

  const uni = int(fd, "uni") ?? 0;
  if (Number.isNaN(uni) || uni < 0) return { error: "Unidades inválidas." };
  const totalKg = dec(fd, "totalKg");
  const meta = dec(fd, "meta");
  if ((totalKg != null && (Number.isNaN(totalKg) || totalKg < 0)) || (meta != null && (Number.isNaN(meta) || meta < 0))) {
    return { error: "Total (kg) e meta devem ser números positivos." };
  }
  const horaInicio = str(fd, "horaInicio");
  const horaFim = str(fd, "horaFim");
  if ((horaInicio && !TIME_RE.test(horaInicio)) || (horaFim && !TIME_RE.test(horaFim))) {
    return { error: "Horário inválido." };
  }

  params.uni = [sql.Int, uni];
  params.totalKg = [sql.Decimal(10, 2), totalKg];
  params.meta = [sql.Decimal(10, 2), meta];
  params.horaInicio = [sql.VarChar(5), horaInicio || null];
  params.horaFim = [sql.VarChar(5), horaFim || null];
  params.observacao = [sql.VarChar(sql.MAX), str(fd, "observacao") || null];
  return { params };
}

// Colunas (na ordem) e a expressão SQL de cada uma
const CAST: Record<string, string> = {
  data: "CAST(@data AS DATE)",
  horaInicio: "CAST(@horaInicio AS TIME)",
  horaFim: "CAST(@horaFim AS TIME)",
};
const expr = (c: string) => CAST[c] ?? `@${c}`;

export async function criarEmpacotamento(_: FormState, fd: FormData): Promise<FormState> {
  const user = await requireUser();
  const r = parse(fd);
  if ("error" in r) return { error: r.error };

  const cols = Object.keys(r.params);
  try {
    await query(
      `INSERT INTO empacotamentos (${cols.join(", ")}, createdBy)
       VALUES (${cols.map(expr).join(", ")}, @createdBy)`,
      { ...r.params, createdBy: user.id },
    );
  } catch (e) {
    return { error: dbError(e, "Produto ou colaborador inválido.") };
  }
  revalidatePath("/empacotamentos");
  revalidatePath("/relatorio");
  redirect("/empacotamentos");
}

export async function atualizarEmpacotamento(id: number, _: FormState, fd: FormData): Promise<FormState> {
  await requireUser();
  const r = parse(fd);
  if ("error" in r) return { error: r.error };

  const sets = Object.keys(r.params).map((c) => `${c} = ${expr(c)}`);
  try {
    await query(
      `UPDATE empacotamentos SET ${sets.join(", ")}, updatedAt = SYSDATETIME() WHERE empacotamentoId = @id`,
      { ...r.params, id },
    );
  } catch (e) {
    return { error: dbError(e, "Produto ou colaborador inválido.") };
  }
  revalidatePath("/empacotamentos");
  revalidatePath("/relatorio");
  redirect("/empacotamentos");
}

export async function excluirEmpacotamento(id: number) {
  await requireUser();
  try {
    await query("DELETE FROM empacotamentos WHERE empacotamentoId = @id", { id });
  } catch (e) {
    redirect("/empacotamentos?erro=" + encodeURIComponent(dbError(e)));
  }
  revalidatePath("/empacotamentos");
  revalidatePath("/relatorio");
  redirect("/empacotamentos");
}
