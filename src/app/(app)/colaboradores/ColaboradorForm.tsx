import ActionForm from "@/components/ActionForm";
import { Card } from "@/components/ui";
import type { FormState } from "@/lib/utils";

type Props = {
  action: (s: FormState, fd: FormData) => Promise<FormState>;
  colaborador?: { nome: string; ativo: boolean };
};

export default function ColaboradorForm({ action, colaborador }: Props) {
  return (
    <Card className="max-w-xl p-6">
      <ActionForm action={action} cancelHref="/colaboradores">
        <div>
          <label htmlFor="nome" className="label">Nome</label>
          <input id="nome" name="nome" required maxLength={100} defaultValue={colaborador?.nome} className="input" />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="ativo" defaultChecked={colaborador?.ativo ?? true} className="size-4 rounded" />
          Ativo
        </label>
      </ActionForm>
    </Card>
  );
}
