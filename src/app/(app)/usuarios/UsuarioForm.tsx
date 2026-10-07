import ActionForm from "@/components/ActionForm";
import { Card } from "@/components/ui";
import type { FormState } from "@/lib/utils";

type Props = {
  action: (s: FormState, fd: FormData) => Promise<FormState>;
  usuario?: { nome: string; email: string; role: string; ativo: boolean };
};

export default function UsuarioForm({ action, usuario }: Props) {
  const editando = !!usuario;
  return (
    <Card className="max-w-xl p-6">
      <ActionForm action={action} cancelHref="/usuarios">
        <div>
          <label htmlFor="nome" className="label">Nome</label>
          <input id="nome" name="nome" required maxLength={100} defaultValue={usuario?.nome} className="input" />
        </div>
        <div>
          <label htmlFor="email" className="label">E-mail</label>
          <input id="email" name="email" type="email" required maxLength={255} defaultValue={usuario?.email} className="input" />
        </div>
        <div>
          <label htmlFor="senha" className="label">{editando ? "Nova senha" : "Senha"}</label>
          <input
            id="senha"
            name="senha"
            type="password"
            minLength={6}
            required={!editando}
            autoComplete="new-password"
            placeholder={editando ? "Deixe em branco para manter a atual" : ""}
            className="input"
          />
        </div>
        <div>
          <label htmlFor="role" className="label">Perfil</label>
          <select id="role" name="role" defaultValue={usuario?.role ?? "user"} className="input">
            <option value="user">Usuário</option>
            <option value="admin">Administrador</option>
          </select>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="ativo" defaultChecked={usuario?.ativo ?? true} className="size-4 rounded" />
          Ativo
        </label>
      </ActionForm>
    </Card>
  );
}
