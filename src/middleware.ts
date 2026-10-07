import { NextResponse, type NextRequest } from "next/server";
import { COOKIE, verifySession } from "@/lib/session";

const ADMIN_ONLY = ["/produtos", "/usuarios"];

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname.startsWith("/login")) return NextResponse.next();

  const session = await verifySession(req.cookies.get(COOKIE)?.value);
  if (!session) return NextResponse.redirect(new URL("/login", req.url));

  if (ADMIN_ONLY.some((p) => pathname === p || pathname.startsWith(p + "/")) && session.role !== "admin") {
    return NextResponse.redirect(new URL("/?erro=acesso", req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
