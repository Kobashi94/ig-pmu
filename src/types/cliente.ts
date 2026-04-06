import type { TipoProcedimento } from "@/pages/menu/MenuPrincipal"

export interface Cliente {
  id: string
  nome: string
  contacto: string
  idade: string
  dataCriacao: string
  tipoProcedimento: TipoProcedimento
  checklists: ChecklistGuardada[]
  fotos: FotoCliente[]
}

export interface ChecklistGuardada {
  id: string
  data: string
  tipoProcedimento: TipoProcedimento
  dados: Record<string, string | boolean | string[]>
}

export interface FotoCliente {
  id: string
  url: string
  tipo: "avaliacao" | "pos_imediato" | "cicatrizado" | "editada"
  dataCriacao: string
}
