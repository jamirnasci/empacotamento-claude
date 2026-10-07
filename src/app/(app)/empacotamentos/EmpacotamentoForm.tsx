import ActionForm from "@/components/ActionForm";
import { Card } from "@/components/ui";
import { N_CAIXAS, type Empacotamento } from "@/lib/empacotamentos";
import { hojeISO, type FormState } from "@/lib/utils";

type Opcao = { value: string | number; label: string };

type Props = {
  action: (s: FormState, fd: FormData) => Promise<FormState>;
  produtos: Opcao[];
  colaboradores: Opcao[];
  tipos: string[];
  registro?: Empacotamento;
};

export default function EmpacotamentoForm({ action, produtos, colaboradores, tipos, registro: r }: Props) {
  const val = (k: string) => (r ? (r[k as keyof Empacotamento] as string | number | null) ?? "" : "");

  return (
    <Card className="max-w-4xl p-6">
      <ActionForm action={action} cancelHref="/empacotamentos">
        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="data" className="label">Data</label>
            <input id="data" name="data" type="date" required defaultValue={r?.data ?? hojeISO()} className="input" />
          </div>
          <div>
            <label htmlFor="produtoCod" className="label">Produto</label>
            <select id="produtoCod" name="produtoCod" required defaultValue={r?.produtoCod ?? ""} className="input">
              <option value="" disabled>Selecione...</option>
              {produtos.map((p) => (
                <option key={p.value} value={p.value}>{p.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="colaboradorId" className="label">Colaborador</label>
            <select id="colaboradorId" name="colaboradorId" required defaultValue={r?.colaboradorId ?? ""} className="input">
              <option value="" disabled>Selecione...</option>
              {colaboradores.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
        </div>

        <fieldset className="rounded-lg border border-slate-200 p-4">
          <legend className="px-2 text-sm font-medium text-slate-700">Caixas</legend>
          <datalist id="tipos-caixa">
            {tipos.map((t) => <option key={t} value={t} />)}
          </datalist>
          <div className="grid gap-3 sm:grid-cols-2">
            {Array.from({ length: N_CAIXAS }, (_, i) => i + 1).map((n) => (
              <div key={n} className="flex items-center gap-2">
                <span className="w-14 shrink-0 text-sm text-slate-500">Cx {n}</span>
                <input
                  name={`cx${n}`}
                  type="number"
                  min={0}
                  step={1}
                  placeholder="Qtd"
                  defaultValue={val(`cx${n}`) === "" ? 0 : val(`cx${n}`)}
                  className="input w-24 shrink-0"
                  aria-label={`Quantidade da caixa ${n}`}
                />
                <input
                  name={`cx${n}Tipo`}
                  list="tipos-caixa"
                  maxLength={50}
                  placeholder="Tipo"
                  defaultValue={val(`cx${n}Tipo`)}
                  className="input"
                  aria-label={`Tipo da caixa ${n}`}
                />
              </div>
            ))}
          </div>
        </fieldset>

        <div className="grid gap-4 sm:grid-cols-3">
          <div>
            <label htmlFor="uni" className="label">Unidades avulsas</label>
            <input id="uni" name="uni" type="number" min={0} step={1} defaultValue={val("uni") === "" ? 0 : val("uni")} className="input" />
          </div>
          <div>
            <label htmlFor="totalKg" className="label">Total (kg)</label>
            <input id="totalKg" name="totalKg" inputMode="decimal" defaultValue={val("totalKg")} className="input" />
          </div>
          <div>
            <label htmlFor="meta" className="label">Meta (kg)</label>
            <input id="meta" name="meta" inputMode="decimal" defaultValue={val("meta")} className="input" />
          </div>
          <div>
            <label htmlFor="horaInicio" className="label">Hora início</label>
            <input id="horaInicio" name="horaInicio" type="time" defaultValue={val("horaInicio")} className="input" />
          </div>
          <div>
            <label htmlFor="horaFim" className="label">Hora fim</label>
            <input id="horaFim" name="horaFim" type="time" defaultValue={val("horaFim")} className="input" />
          </div>
        </div>

        <div>
          <label htmlFor="observacao" className="label">Observação</label>
          <textarea id="observacao" name="observacao" rows={3} defaultValue={val("observacao")} className="input" />
        </div>
      </ActionForm>
    </Card>
  );
}
