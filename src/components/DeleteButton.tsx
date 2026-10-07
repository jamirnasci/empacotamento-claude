"use client";

import { Trash2 } from "lucide-react";

export default function DeleteButton({
  action,
  message = "Tem certeza que deseja excluir este registro?",
}: {
  action: () => Promise<void>;
  message?: string;
}) {
  return (
    <form
      action={action}
      onSubmit={(e) => {
        if (!confirm(message)) e.preventDefault();
      }}
    >
      <button
        type="submit"
        title="Excluir"
        className="rounded-md p-1.5 text-slate-500 hover:bg-red-50 hover:text-red-600"
      >
        <Trash2 size={16} />
      </button>
    </form>
  );
}
