import AppShell from "@/components/AppShell";
import { requireUser } from "@/lib/auth";
import { logout } from "../login/actions";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();
  return (
    <AppShell user={{ nome: user.nome, role: user.role }} logoutAction={logout}>
      {children}
    </AppShell>
  );
}
