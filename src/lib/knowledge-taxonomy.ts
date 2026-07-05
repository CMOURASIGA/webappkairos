export type TaxonomyScope = "instructions" | "memories" | "documents";

export type TaxonomyOption = {
  label: string;
  value: string;
};

export const INSTRUCTION_CATEGORIES: TaxonomyOption[] = [
  { label: "Perfil Profissional", value: "Perfil Profissional" },
  { label: "Projetos", value: "Projetos" },
  { label: "Tecnologia", value: "Tecnologia" },
  { label: "Comunicação", value: "Comunicação" },
  { label: "Decisão", value: "Decisão" },
  { label: "Gestão", value: "Gestão" },
  { label: "IA", value: "IA" },
  { label: "Pessoal", value: "Pessoal" },
  { label: "EAC", value: "EAC" },
];

export const MEMORY_TYPES: TaxonomyOption[] = [
  { label: "PERSONAL", value: "PERSONAL" },
  { label: "PROFESSIONAL", value: "PROFESSIONAL" },
  { label: "TECHNICAL", value: "TECHNICAL" },
  { label: "PROCESS", value: "PROCESS" },
  { label: "DECISION", value: "DECISION" },
  { label: "PREFERENCE", value: "PREFERENCE" },
  { label: "PROJECT", value: "PROJECT" },
  { label: "CLIENT", value: "CLIENT" },
  { label: "EAC", value: "EAC" },
];

export const DOCUMENT_CATEGORIES: TaxonomyOption[] = [
  { label: "Projetos", value: "Projetos" },
  { label: "Negocios", value: "Negocios" },
  { label: "IA", value: "IA" },
  { label: "Pessoal", value: "Pessoal" },
  { label: "EAC", value: "EAC" },
  { label: "Tecnologia", value: "Tecnologia" },
  { label: "Contratos", value: "Contratos" },
  { label: "Atas", value: "Atas" },
  { label: "Arquiteturas", value: "Arquiteturas" },
  { label: "Estudos", value: "Estudos" },
];

export const KNOWLEDGE_LEVELS = [
  {
    name: "Nível 1",
    memoryTarget: 50,
    instructionTarget: 20,
    documentTarget: 20,
    projectTarget: 0,
  },
  {
    name: "Nível 2",
    memoryTarget: 200,
    instructionTarget: 100,
    documentTarget: 100,
    projectTarget: 20,
  },
  {
    name: "Nível 3",
    memoryTarget: 500,
    instructionTarget: 200,
    documentTarget: 300,
    projectTarget: 50,
  },
  {
    name: "Nível 4",
    memoryTarget: 1000,
    instructionTarget: 300,
    documentTarget: 500,
    projectTarget: 100,
  },
] as const;

