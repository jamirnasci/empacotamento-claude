import { requireAdmin } from "@/lib/auth";
import { PageHeader } from "@/components/ui";
import UsuarioForm from "../UsuarioForm";
import { criarUsuario } from "../actions";

export default async function NovoUsuarioPage() {
  await requireAdmin();
  return (
    <>
      <PageHeader title="Novo usuário" />
      <UsuarioForm action={criarUsuario} />
    </>
  );
}
