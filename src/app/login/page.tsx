import { PackageCheck } from "lucide-react";
import ActionForm from "@/components/ActionForm";
import { login } from "./actions";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-4">
      <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <span className="rounded-xl bg-indigo-600 p-3 text-white">
            <PackageCheck size={26} />
          </span>
          <h1 className="text-xl font-semibold text-slate-900">Controle de Empacotamento</h1>
          <p className="text-sm text-slate-500">Entre com sua conta para continuar</p>
        </div>
        <ActionForm action={login} submitLabel="Entrar">
          <div>
            <label htmlFor="email" className="label">E-mail</label>
            <input id="email" name="email" type="email" required autoFocus autoComplete="username" className="input" />
          </div>
          <div>
            <label htmlFor="senha" className="label">Senha</label>
            <input id="senha" name="senha" type="password" required autoComplete="current-password" className="input" />
          </div>
        </ActionForm>
      </div>
    </main>
  );
}
