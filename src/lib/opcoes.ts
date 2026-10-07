import { query } from "./db";

/** Opções para os selects. `incluir` mantém visível um item inativo já usado no registro editado. */
export async function opcoesProdutos(incluir?: string) {
  const rows = await query<{ codigo: string; descricao: string }>(
    "SELECT codigo, descricao FROM produtos WHERE ativo = 1 OR codigo = @incluir ORDER BY codigo",
    { incluir: incluir ?? null },
  );
  return rows.map((r) => ({ value: r.codigo, label: `${r.codigo} — ${r.descricao}` }));
}

export async function opcoesColaboradores(incluir?: number) {
  const rows = await query<{ colaboradorId: number; nome: string }>(
    "SELECT colaboradorId, nome FROM colaboradores WHERE ativo = 1 OR colaboradorId = @incluir ORDER BY nome",
    { incluir: incluir ?? null },
  );
  return rows.map((r) => ({ value: r.colaboradorId, label: r.nome }));
}
