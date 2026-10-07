import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Controle de Empacotamento",
  description: "Registro e acompanhamento de empacotamentos",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
