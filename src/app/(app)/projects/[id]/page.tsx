import { notFound } from "next/navigation";
import { ProjectWorkspace } from "@/components/projects/project-workspace";
import { loadProjectWorkspace } from "@/services/server-loaders";
export default async function Page({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ tab?: string }> }) {
 const { id } = await params; const { tab } = await searchParams; const data = await loadProjectWorkspace(id); if (!data.project) notFound();
 return <ProjectWorkspace project={data.project} tasks={data.tasks} decisions={data.decisions} risks={data.risks} documents={data.documents} agents={data.agents} initialTab={tab} />;
}
