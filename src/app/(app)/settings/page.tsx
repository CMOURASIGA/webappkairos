import { PageIntro } from "@/components/common/page-intro";
import { SettingsForm } from "@/components/settings/settings-form";
import { loadSettingsPage } from "@/services/server-loaders";

export default async function SettingsPage() {
  const { settings, executions, agents } = await loadSettingsPage();

  return (
    <div className="space-y-6">
      <PageIntro
        eyebrow="Configuracoes"
        title="Controle de comportamento, retencao e logs"
        description="Ajuste o modelo, temperatura, memoria, especialistas ativos e acompanhe o historico operacional do motor do KAIROS."
        badge="Execution Logs"
      />

      <SettingsForm initialSettings={settings} executions={executions} agents={agents} />
    </div>
  );
}
