export type FormState = { error?: string } | undefined;

export function str(fd: FormData, name: string) {
  return String(fd.get(name) ?? "").trim();
}

export function int(fd: FormData, name: string): number | null {
  const v = str(fd, name);
  if (v === "") return null;
  const n = Number(v);
  return Number.isInteger(n) ? n : NaN;
}

/** Aceita "12,5" ou "12.5". Retorna null se vazio, NaN se inválido. */
export function dec(fd: FormData, name: string): number | null {
  const v = str(fd, name).replace(/\./g, (m, i, s) => (s.includes(",") ? "" : m)).replace(",", ".");
  if (v === "") return null;
  return Number(v);
}

export function bool(fd: FormData, name: string) {
  return fd.get(name) === "on" || fd.get(name) === "true";
}

/** Traduz erros comuns do SQL Server. */
export function dbError(e: unknown, fkMessage = "Registro vinculado a outros dados."): string {
  const err = e as { number?: number; originalError?: { number?: number }; message?: string };
  const n = err?.number ?? err?.originalError?.number;
  if (n === 547) return fkMessage;
  if (n === 2627 || n === 2601) return "Já existe um registro com esse valor único.";
  console.error(e);
  return "Erro ao acessar o banco de dados: " + (err?.message ?? "desconhecido");
}

export const fmtNum = (n: number | null | undefined, digits = 0) =>
  n == null ? "—" : n.toLocaleString("pt-BR", { minimumFractionDigits: digits, maximumFractionDigits: digits });

export const fmtDate = (iso: string | null | undefined) => {
  if (!iso) return "—";
  const [y, m, d] = iso.slice(0, 10).split("-");
  return `${d}/${m}/${y}`;
};

export function hojeISO() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function inicioMesISO() {
  return hojeISO().slice(0, 8) + "01";
}
