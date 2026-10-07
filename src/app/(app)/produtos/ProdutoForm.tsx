import ActionForm from "@/components/ActionForm";
import { Card } from "@/components/ui";
import type { FormState } from "@/lib/utils";

type Props = {
  action: (s: FormState, fd: FormData) => Promise<FormState>;
  produto?: { codigo: string; descricao: string; ativo: boolean };
};

export default function ProdutoForm({ action, produto }: Props) {
  return (
    <Card className="max-w-xl p-6">
      <ActionForm action={action} cancelHref="/produtos">
        <div>
          <label htmlFor="codigo" className="label">Código</label>
          <input
            id="codigo"
            name="codigo"
            required
            maxLength={20}
            defaultValue={produto?.codigo}
            readOnly={!!produto}
            className="input"
          />
          {produto && <p className="mt-1 text-xs text-slate-500">O código não pode ser alterado.</p>}
        </div>
        <div>
          <label htmlFor="descricao" className="label">Descrição</label>
          <input id="descricao" name="descricao" required maxLength={255} defaultValue={produto?.descricao} className="input" />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="ativo" defaultChecked={produto?.ativo ?? true} className="size-4 rounded" />
          Ativo
        </label>
      </ActionForm>
    </Card>
  );
}
