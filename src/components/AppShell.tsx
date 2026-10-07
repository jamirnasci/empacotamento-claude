"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Boxes,
  LayoutDashboard,
  LogOut,
  Menu,
  PackageCheck,
  ShieldCheck,
  Users,
} from "lucide-react";

const NAV = [
  { href: "/", label: "Painel", icon: LayoutDashboard },
  { href: "/relatorio", label: "Relatório", icon: BarChart3 },
  { href: "/empacotamentos", label: "Empacotamentos", icon: PackageCheck },
  { href: "/colaboradores", label: "Colaboradores", icon: Users },
  { href: "/produtos", label: "Produtos", icon: Boxes, admin: true },
  { href: "/usuarios", label: "Usuários", icon: ShieldCheck, admin: true },
];

export default function AppShell({
  user,
  logoutAction,
  children,
}: {
  user: { nome: string; role: string };
  logoutAction: () => Promise<void>;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);
  const pathname = usePathname();

  // Estado inicial: fechada no mobile; no desktop lembra a última escolha
  useEffect(() => {
    try {
      const mobile = window.matchMedia("(max-width: 767px)").matches;
      setOpen(mobile ? false : localStorage.getItem("sidebar") !== "closed");
    } catch {
      /* ignore */
    }
  }, []);

  function toggle() {
    setOpen((o) => {
      try {
        localStorage.setItem("sidebar", o ? "closed" : "open");
      } catch {
        /* ignore */
      }
      return !o;
    });
  }

  const isActive = (href: string) => (href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/"));
  const items = NAV.filter((i) => !i.admin || user.role === "admin");

  return (
    <div className="flex h-screen overflow-hidden">
      {/* backdrop (mobile) */}
      {open && <div className="fixed inset-0 z-20 bg-black/40 md:hidden" onClick={() => setOpen(false)} />}

      <aside
        className={`fixed inset-y-0 left-0 z-30 flex w-64 shrink-0 transform flex-col bg-slate-900 text-slate-200 transition-all duration-200 md:static ${
          open ? "translate-x-0" : "-translate-x-full md:-ml-64"
        }`}
      >
        <div className="flex h-16 items-center gap-2 border-b border-slate-800 px-5">
          <PackageCheck className="text-indigo-400" size={22} />
          <span className="font-semibold text-white">Empacotamento</span>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {items.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => window.matchMedia("(max-width: 767px)").matches && setOpen(false)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition ${
                isActive(href) ? "bg-indigo-600 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Icon size={18} /> {label}
            </Link>
          ))}
        </nav>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4">
          <button
            type="button"
            onClick={toggle}
            aria-label={open ? "Esconder menu lateral" : "Mostrar menu lateral"}
            title={open ? "Esconder menu" : "Mostrar menu"}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-3">
            <div className="text-right leading-tight">
              <p className="text-sm font-medium text-slate-900">{user.nome}</p>
              <p className="text-xs text-slate-500">{user.role === "admin" ? "Administrador" : "Usuário"}</p>
            </div>
            <form action={logoutAction}>
              <button type="submit" title="Sair" className="rounded-lg p-2 text-slate-600 hover:bg-slate-100">
                <LogOut size={18} />
              </button>
            </form>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <div className="mx-auto max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
