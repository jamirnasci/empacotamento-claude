// Seguro para o Edge runtime (usado pelo middleware): só depende de `jose`.
import { SignJWT, jwtVerify } from "jose";

export const COOKIE = "session";
export const SESSION_HOURS = 8;

export type SessionUser = { id: number; nome: string; email: string; role: string };

function key() {
  const secret = process.env.SESSION_SECRET;
  if (!secret && process.env.NODE_ENV === "production") {
    throw new Error("SESSION_SECRET não definido");
  }
  return new TextEncoder().encode(secret ?? "dev-only-secret-change-me-dev-only-secret");
}

export function signSession(u: SessionUser) {
  return new SignJWT({ ...u })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_HOURS}h`)
    .sign(key());
}

export async function verifySession(token?: string): Promise<SessionUser | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key());
    return {
      id: Number(payload.id),
      nome: String(payload.nome),
      email: String(payload.email),
      role: String(payload.role),
    };
  } catch {
    return null;
  }
}
