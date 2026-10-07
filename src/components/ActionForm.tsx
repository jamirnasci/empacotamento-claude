"use client";

import Link from "next/link";
import { useActionState } from "react";
import type { FormState } from "@/lib/utils";

type Props = {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  children: React.ReactNode;
  submitLabel?: string;
  cancelHref?: string;
  className?: string;
};

export default function ActionForm({ action, children, submitLabel = "Salvar", cancelHref, className }: Props) {
  const [state, formAction, pending] = useActionState(action, undefined);
  return (
    <form action={formAction} className={className ?? "space-y-5"}>
      {state?.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{state.error}</div>
      )}
      {children}
      <div className="flex items-center gap-3 pt-2">
        <button type="submit" disabled={pending} className="btn-primary">
          {pending ? "Salvando..." : submitLabel}
        </button>
        {cancelHref && (
          <Link href={cancelHref} className="btn-secondary">
            Cancelar
          </Link>
        )}
      </div>
    </form>
  );
}
