// Uso: npm run seed:admin -- "Nome" email@dominio.com senha
import sql from "mssql";
import bcrypt from "bcryptjs";

const [nome, email, senha] = process.argv.slice(2);
if (!nome || !email || !senha) {
  console.error('Uso: npm run seed:admin -- "Nome" email@dominio.com senha');
  process.exit(1);
}

const pool = await new sql.ConnectionPool({
  server: process.env.DB_SERVER,
  port: Number(process.env.DB_PORT || 1433),
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  options: {
    encrypt: process.env.DB_ENCRYPT === "true",
    trustServerCertificate: process.env.DB_TRUST_CERT !== "false",
  },
}).connect();

const hash = await bcrypt.hash(senha, 10);
await pool
  .request()
  .input("nome", sql.VarChar(100), nome)
  .input("email", sql.VarChar(255), email.toLowerCase())
  .input("hash", sql.VarChar(255), hash)
  .query(`
    IF EXISTS (SELECT 1 FROM usuarios WHERE email = @email)
      UPDATE usuarios SET nome=@nome, senhaHash=@hash, role='admin', ativo=1 WHERE email=@email
    ELSE
      INSERT INTO usuarios (nome, email, senhaHash, role, ativo) VALUES (@nome, @email, @hash, 'admin', 1)
  `);
console.log(`Admin "${email}" criado/atualizado.`);
await pool.close();
