import { AppShell } from "@/components/layout/app-shell";
import { loadAppContext } from "@/services/server-loaders";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { profile } = await loadAppContext();

  return <AppShell profileName={profile.nome}>{children}</AppShell>;
}
