"use client";
import Link from "next/link";
import { useState, useTransition } from "react";
import type { ReactNode } from "react";
import { ArrowLeft, Bot, FileText, Plus, ShieldAlert, SquareCheckBig } from "lucide-react";
import { useRouter } from "next/navigation";
import { ChatWorkspace } from "@/components/chat/chat-workspace";
import { Button } from "@/components/ui/button";
import { HologramCard } from "@/components/ui/hologram-card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { AgentProfile, DocumentRecord, Project, ProjectDecision, ProjectRisk, ProjectTask } from "@/types/domain";

type Tab = "overview" | "kairos" | "knowledge" | "tasks" | "decisions" | "risks";
const tabNames: Record<Tab, string> = { overview: "Visão geral", kairos: "KAIROS", knowledge: "Conhecimento", tasks: "Atividades", decisions: "Decisões", risks: "Riscos" };
export function ProjectWorkspace({ project, tasks, decisions, risks, documents, agents, initialTab = "overview" }: { project: Project; tasks: ProjectTask[]; decisions: ProjectDecision[]; risks: ProjectRisk[]; documents: DocumentRecord[]; agents: AgentProfile[]; initialTab?: string }) {
 const router = useRouter(); const [tab, setTab] = useState<Tab>((Object.keys(tabNames).includes(initialTab) ? initialTab : "overview") as Tab); const [pending, start] = useTransition(); const [title, setTitle] = useState(""); const [details,setDetails] = useState("");
 const add = (type: "task"|"decision"|"risk") => start(async()=>{ const r=await fetch(`/api/projects/${project.id}/pmo`, {method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({type,titulo:title,descricao:details})}); if(r.ok){setTitle("");setDetails("");router.refresh();} });
 const items = tab === "tasks" ? tasks : tab === "decisions" ? decisions : risks;
 return <div className="space-y-6">
  <Link href="/projects" className="inline-flex items-center gap-2 text-sm text-cyan-200 hover:text-white"><ArrowLeft className="h-4 w-4"/>Voltar para projetos</Link>
  <div className="rounded-[28px] border border-cyan-300/20 bg-cyan-400/10 p-6"><p className="text-xs uppercase tracking-[.24em] text-cyan-200">Workspace do projeto</p><h1 className="mt-2 text-3xl font-semibold text-white">{project.nome}</h1><p className="mt-3 max-w-3xl text-slate-300">{project.objetivo || project.descricao || "Defina o objetivo e as orientações deste projeto para que o KAIROS trabalhe com contexto."}</p></div>
  <div className="flex gap-2 overflow-x-auto pb-2">{(Object.keys(tabNames) as Tab[]).map(key=><Button key={key} size="sm" variant={tab===key?"primary":"secondary"} onClick={()=>setTab(key)}>{tabNames[key]}</Button>)}</div>
  {tab === "overview" && <div className="grid gap-4 md:grid-cols-3"><Metric icon={<SquareCheckBig/>} label="Atividades abertas" value={tasks.filter(x=>x.status!=="DONE").length}/><Metric icon={<ShieldAlert/>} label="Riscos em aberto" value={risks.filter(x=>x.status==="OPEN").length}/><Metric icon={<FileText/>} label="Documentos" value={documents.length}/><HologramCard className="md:col-span-3"><h2 className="text-lg font-semibold text-white">Orientação do KAIROS</h2><p className="mt-2 text-sm leading-6 text-slate-300">{project.prompt_base || "Nenhuma orientação específica cadastrada. Edite o projeto na lista de Projetos para definir as regras de atuação."}</p></HologramCard></div>}
  {tab === "kairos" && <ChatWorkspace conversations={[]} initialMessages={[]} activeConversationId={undefined} projectId={project.id} agents={agents} memories={[]} initialContext={{instructions:[],memories:[],documents:documents.map(x=>x.nome_arquivo)}} />}
  {tab === "knowledge" && <HologramCard><div className="flex items-center justify-between"><div><h2 className="text-xl font-semibold text-white">Documentos do projeto</h2><p className="mt-2 text-sm text-slate-300">Arquivos e conteúdos que o KAIROS pode usar neste projeto.</p></div><Link href={`/documents?project=${project.id}`}><Button><Plus className="h-4 w-4"/>Adicionar documento</Button></Link></div><div className="mt-5 space-y-2">{documents.length?documents.map(x=><div key={x.id} className="rounded-xl border border-white/10 p-3 text-sm text-slate-200">{x.nome_arquivo}</div>):<p className="text-sm text-slate-400">Ainda não há documentos vinculados.</p>}</div></HologramCard>}
  {["tasks","decisions","risks"].includes(tab) && <div className="grid gap-6 lg:grid-cols-[.85fr_1.15fr]"><HologramCard className="space-y-3"><h2 className="text-xl font-semibold text-white">Novo registro</h2><Input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Título"/><Textarea value={details} onChange={e=>setDetails(e.target.value)} placeholder="Descrição, responsável, impacto ou encaminhamento"/><Button disabled={pending||title.length<3} onClick={()=>add(tab === "tasks"?"task":tab === "decisions"?"decision":"risk")}><Plus className="h-4 w-4"/>Adicionar</Button></HologramCard><div className="space-y-3">{items.length ? items.map((item)=><HologramCard key={item.id}><h3 className="font-semibold text-white">{item.titulo}</h3><p className="mt-2 text-sm text-slate-300">{item.descricao || "Sem detalhes cadastrados."}</p><p className="mt-3 text-xs uppercase tracking-[.18em] text-cyan-200">{item.status}</p></HologramCard>) : <HologramCard><p className="text-sm text-slate-400">Nenhum registro ainda.</p></HologramCard>}</div></div>}
 </div>;
}
function Metric({icon,label,value}:{icon:ReactNode;label:string;value:number}){return <HologramCard><div className="flex items-center gap-3 text-cyan-200">{icon}<span className="text-sm">{label}</span></div><p className="mt-5 text-3xl font-semibold text-white">{value}</p></HologramCard>}
