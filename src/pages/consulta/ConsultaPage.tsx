import { useState } from "react"
import { ArrowLeft, ClipboardList, Image, HeartHandshake, Palette, ScanEye } from "lucide-react"
import type { TipoProcedimento } from "@/pages/menu/MenuPrincipal"
import Checklist from "./Checklist"
import Portfolio from "./Portfolio"
import CuidadosPos from "./CuidadosPos"
import FlutuacoesCor from "./FlutuacoesCor"
import Estudo from "./Estudo"

type TabId = "checklist" | "portfolio" | "cuidados" | "flutuacoes" | "estudo"

const tabs: { id: TabId; label: string; icon: typeof ClipboardList }[] = [
  { id: "checklist", label: "Checklist", icon: ClipboardList },
  { id: "portfolio", label: "Portfólio", icon: Image },
  { id: "cuidados", label: "Cuidados", icon: HeartHandshake },
  { id: "flutuacoes", label: "Flutuações", icon: Palette },
  { id: "estudo", label: "Estudo", icon: ScanEye },
]

interface ConsultaPageProps {
  tipo: TipoProcedimento
  onVoltar: () => void
}

export default function ConsultaPage({ tipo, onVoltar }: ConsultaPageProps) {
  const [tabAtiva, setTabAtiva] = useState<TabId>("checklist")
  const [clienteIdSessao, setClienteIdSessao] = useState<string | null>(null)

  const tipoLabel =
    tipo === "labios"
      ? "Micropigmentação de Lábios"
      : tipo === "nanoblading"
        ? "Nanoblading"
        : "Pixelbrows"

  return (
    <div className="min-h-screen bg-background page-scrollable">
      {/* Header */}
      <header className="bg-header border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            onClick={onVoltar}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
            <span className="text-[10px] font-body font-semibold tracking-[0.15em] uppercase">
              Menu
            </span>
          </button>
          <p className="text-[10px] font-body font-semibold tracking-[0.2em] uppercase text-accent">
            {tipoLabel}
          </p>
        </div>
      </header>
      <div className="h-[1px] bg-gradient-to-r from-transparent via-accent to-transparent opacity-30" />

      {/* Tab navigation */}
      <nav className="bg-header border-b border-border">
        <div className="max-w-7xl mx-auto px-6 flex items-center gap-8 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = tabAtiva === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setTabAtiva(tab.id)}
                className={`tab-nav-item flex items-center gap-1.5 py-4 ${isActive ? "active" : ""}`}
              >
                <Icon className="h-3.5 w-3.5" strokeWidth={1.5} />
                {tab.label}
              </button>
            )
          })}
        </div>
      </nav>

      {/* Conteúdo */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {tabAtiva === "checklist" && <Checklist tipo={tipo} onClienteGuardada={(id) => setClienteIdSessao(id)} />}
        {tabAtiva === "portfolio" && <Portfolio tipo={tipo} />}
        {tabAtiva === "cuidados" && <CuidadosPos tipo={tipo} />}
        {tabAtiva === "flutuacoes" && <FlutuacoesCor tipo={tipo} />}
        {tabAtiva === "estudo" && <Estudo tipo={tipo} clienteId={clienteIdSessao ?? undefined} />}
      </main>

      {/* Footer */}
      <div className="hr-diamond max-w-xs mx-auto mt-12 mb-8">
        <div className="diamond" />
      </div>
    </div>
  )
}
