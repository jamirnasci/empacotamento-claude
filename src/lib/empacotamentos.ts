import { query, sql } from "./db";

export const N_CAIXAS = 8;

export type Empacotamento = {
  empacotamentoId: number;
  data: string; // yyyy-mm-dd
  produtoCod: string;
  produtoDescricao: string;
  colaboradorId: number;
  colaboradorNome: string;
  cx1: number; cx1Tipo: string;
  cx2: number; cx2Tipo: string;
  cx3: number; cx3Tipo: string;
  cx4: number; cx4Tipo: string;
  cx5: number; cx5Tipo: string;
  cx6: number; cx6Tipo: string;
  cx7: number; cx7Tipo: string;
  cx8: number; cx8Tipo: string;
  uni: number;
  totalKg: number | null;
  meta: number | null;
  horaInicio: string | null; // HH:mm
  horaFim: string | null;
  observacao: string | null;
};

export type Filtros = {
  colaboradorId?: number | null;
  produtoCod?: string | null;
  dataIni?: string | null;
  dataFim?: string | null;
};

const CX_COLS = Array.from({ length: N_CAIXAS }, (_, i) => `e.cx${i + 1}, e.cx${i + 1}Tipo`).join(", ");

const SELECT = `
  SELECT TOP (@top)
    e.empacotamentoId,
    CONVERT(varchar(10), e.data, 23) AS data,
    e.produtoCod, p.descricao AS produtoDescricao,
    e.colaboradorId, c.nome AS colaboradorNome,
    ${CX_COLS},
    e.uni, e.totalKg, e.meta,
    CONVERT(varchar(5), e.horaInicio, 108) AS horaInicio,
    CONVERT(varchar(5), e.horaFim, 108) AS horaFim,
    e.observacao
  FROM empacotamentos e
  JOIN produtos p ON p.codigo = e.produtoCod
  JOIN colaboradores c ON c.colaboradorId = e.colaboradorId
`;

export function buscarEmpacotamentos(f: Filtros = {}, top = 2000) {
  return query<Empacotamento>(
    `${SELECT}
     WHERE (@colaboradorId IS NULL OR e.colaboradorId = @colaboradorId)
       AND (@produtoCod IS NULL OR e.produtoCod = @produtoCod)
       AND (@dataIni IS NULL OR e.data >= CAST(@dataIni AS DATE))
       AND (@dataFim IS NULL OR e.data <= CAST(@dataFim AS DATE))
     ORDER BY e.data DESC, e.empacotamentoId DESC`,
    {
      top,
      colaboradorId: [sql.Int, f.colaboradorId ?? null],
      produtoCod: [sql.VarChar(20), f.produtoCod || null],
      dataIni: [sql.VarChar(10), f.dataIni || null],
      dataFim: [sql.VarChar(10), f.dataFim || null],
    },
  );
}

export async function buscarEmpacotamento(id: number) {
  const rows = await query<Empacotamento>(`${SELECT} WHERE e.empacotamentoId = @id`, { top: 1, id });
  return rows[0] ?? null;
}

/** Lista de caixas preenchidas: [{ qtd: 10, tipo: "Caixa A" }, ...] */
export function caixas(e: Empacotamento) {
  const out: { n: number; qtd: number; tipo: string }[] = [];
  for (let i = 1; i <= N_CAIXAS; i++) {
    const qtd = e[`cx${i}` as keyof Empacotamento] as number;
    if (qtd > 0) out.push({ n: i, qtd, tipo: e[`cx${i}Tipo` as keyof Empacotamento] as string });
  }
  return out;
}

export const totalCaixas = (e: Empacotamento) => caixas(e).reduce((s, c) => s + c.qtd, 0);

export function resumir(rows: Empacotamento[]) {
  let caixasTotal = 0, uni = 0, kg = 0, meta = 0, kgComMeta = 0;
  for (const r of rows) {
    caixasTotal += totalCaixas(r);
    uni += r.uni;
    kg += r.totalKg ?? 0;
    if (r.meta != null) {
      meta += r.meta;
      kgComMeta += r.totalKg ?? 0;
    }
  }
  return {
    registros: rows.length,
    caixas: caixasTotal,
    uni,
    kg,
    meta,
    atingimento: meta > 0 ? (kgComMeta / meta) * 100 : null,
  };
}

export function agrupar(rows: Empacotamento[], chave: (r: Empacotamento) => string) {
  const map = new Map<string, Empacotamento[]>();
  for (const r of rows) {
    const k = chave(r);
    map.set(k, [...(map.get(k) ?? []), r]);
  }
  return [...map.entries()]
    .map(([nome, items]) => ({ nome, ...resumir(items) }))
    .sort((a, b) => b.kg - a.kg || b.caixas - a.caixas);
}

export async function tiposDeCaixa() {
  const unions = Array.from({ length: N_CAIXAS }, (_, i) => `SELECT cx${i + 1}Tipo AS t FROM empacotamentos`).join(" UNION ");
  const rows = await query<{ t: string }>(`SELECT DISTINCT t FROM (${unions}) x WHERE t <> '' ORDER BY t`);
  return rows.map((r) => r.t);
}
