import sql from "mssql";

const config: sql.config = {
  server: process.env.DB_SERVER ?? "localhost",
  port: Number(process.env.DB_PORT ?? 1433),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  options: {
    encrypt: process.env.DB_ENCRYPT === "true",
    trustServerCertificate: process.env.DB_TRUST_CERT !== "false",
  },
  pool: { max: 10, min: 0, idleTimeoutMillis: 30000 },
};

// Reaproveita o pool entre hot-reloads do dev server
const g = globalThis as unknown as { __pool?: Promise<sql.ConnectionPool> };

export function getPool() {
  if (!g.__pool) {
    g.__pool = new sql.ConnectionPool(config).connect().catch((err) => {
      g.__pool = undefined; // permite nova tentativa na próxima requisição
      throw err;
    });
  }
  return g.__pool;
}

/** Valor simples (tipo inferido) ou [tipo, valor] para tipagem explícita. */
export type Input = unknown | [sql.ISqlTypeFactory | sql.ISqlType, unknown];

export async function query<T = Record<string, unknown>>(
  text: string,
  inputs: Record<string, Input> = {},
): Promise<T[]> {
  const pool = await getPool();
  const req = pool.request();
  for (const [name, v] of Object.entries(inputs)) {
    if (Array.isArray(v) && v.length === 2) req.input(name, v[0] as sql.ISqlType, v[1]);
    else req.input(name, v);
  }
  const result = await req.query(text);
  return (result.recordset ?? []) as T[];
}

export { sql };
