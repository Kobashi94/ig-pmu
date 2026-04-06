import { useState, useEffect, useCallback } from "react"
import { ArrowLeft, Search, ChevronDown, User, Calendar, ClipboardList, Camera, Filter, ArrowUpDown, ScanEye, Trash2 } from "lucide-react"
import { supabase } from "@/lib/supabase"
import type { TipoProcedimento } from "@/pages/menu/MenuPrincipal"
import type { ChecklistGuardada } from "@/hooks/useClientes"
import Estudo from "@/pages/consulta/Estudo"

interface ClienteRow {
  id: string
  nome: string
  telefone: string | null
  email: string | null
  idade: string | null
  notas: string | null
  criado_em: string
}

type FiltroServico = "todos" | TipoProcedimento
type Ordenacao = "recente" | "antigo" | "nome"

interface BaseClientesProps {
  onVoltar: () => void
}

export default function BaseClientes({ onVoltar }: BaseClientesProps) {
  const [clientes, setClientes] = useState<ClienteRow[]>([])
  const [loading, setLoading] = useState(true)
  const [pesquisa, setPesquisa] = useState("")
  const [filtroServico, setFiltroServico] = useState<FiltroServico>("todos")
  const [ordenacao, setOrdenacao] = useState<Ordenacao>("recente")
  const [clienteAberto, setClienteAberto] = useState<string | null>(null)
  const [checklists, setChecklists] = useState<ChecklistGuardada[]>([])
  const [checklistAberta, setChecklistAberta] = useState<string | null>(null)
  const [mostrarFiltros, setMostrarFiltros] = useState(false)
  const [fotosEstudo, setFotosEstudo] = useState<{ id: string; url: string; criado_em: string }[]>([])
  const [modoEstudo, setModoEstudo] = useState(false)
  const [dataSessao, setDataSessao] = useState<string | null>(null)
  const [retoques, setRetoques] = useState<{ id: string; data: string }[]>([])
  const [procedimentoId, setProcedimentoId] = useState<string | null>(null)

  // Carregar clientes
  const carregar = useCallback(async () => {
    setLoading(true)
    let query = supabase.from("clientes").select("*")

    if (ordenacao === "recente") query = query.order("criado_em", { ascending: false })
    else if (ordenacao === "antigo") query = query.order("criado_em", { ascending: true })
    else query = query.order("nome", { ascending: true })

    const { data } = await query
    setClientes(data || [])
    setLoading(false)
  }, [ordenacao])

  useEffect(() => { carregar() }, [carregar])

  // Filtrar por pesquisa e serviço
  const [clientesComServico, setClientesComServico] = useState<Map<string, string[]>>(new Map())

  // Carregar tipos de procedimento por cliente (das checklists)
  useEffect(() => {
    async function carregarServicos() {
      const { data } = await supabase
        .from("checklists")
        .select("cliente_id, tipo_procedimento")
      if (!data) return
      const mapa = new Map<string, string[]>()
      data.forEach((c: { cliente_id: string; tipo_procedimento: string }) => {
        const tipos = mapa.get(c.cliente_id) || []
        if (!tipos.includes(c.tipo_procedimento)) tipos.push(c.tipo_procedimento)
        mapa.set(c.cliente_id, tipos)
      })
      setClientesComServico(mapa)
    }
    carregarServicos()
  }, [clientes])

  const clientesFiltrados = clientes.filter((c) => {
    // Pesquisa
    if (pesquisa) {
      const termo = pesquisa.toLowerCase()
      const match = c.nome.toLowerCase().includes(termo) ||
        c.telefone?.toLowerCase().includes(termo) ||
        c.email?.toLowerCase().includes(termo)
      if (!match) return false
    }
    // Filtro serviço
    if (filtroServico !== "todos") {
      const tipos = clientesComServico.get(c.id) || []
      if (!tipos.includes(filtroServico)) return false
    }
    return true
  })

  // Abrir perfil
  const abrirPerfil = async (id: string) => {
    setClienteAberto(id)
    setChecklistAberta(null)
    setModoEstudo(false)

    // Carregar checklists
    const { data: checkData } = await supabase
      .from("checklists")
      .select("*")
      .eq("cliente_id", id)
      .order("criado_em", { ascending: false })
    setChecklists((checkData || []) as ChecklistGuardada[])

    // Carregar fotos de estudo
    const { data: fotosData } = await supabase
      .from("fotos")
      .select("id, url, criado_em")
      .eq("cliente_id", id)
      .eq("tipo", "estudo")
      .order("criado_em", { ascending: false })
    setFotosEstudo(fotosData || [])

    // Carregar procedimentos (sessão + retoques)
    const { data: procData } = await supabase
      .from("procedimentos")
      .select("*")
      .eq("cliente_id", id)
      .order("data", { ascending: true })

    const sessao = procData?.find((p: Record<string, unknown>) => p.estado === "realizado")
    const retoquesData = procData?.filter((p: Record<string, unknown>) => p.estado === "retoque") || []

    setProcedimentoId(sessao?.id || null)
    setDataSessao(sessao?.data || null)
    setRetoques(retoquesData.map((r: Record<string, unknown>) => ({ id: r.id as string, data: r.data as string })))
  }

  // Guardar data da sessão
  const guardarDataSessao = async (data: string) => {
    if (!clienteAberto) return
    const tipos = clientesComServico.get(clienteAberto) || []
    const tipo = tipos[0] || "pixelbrows"

    if (procedimentoId) {
      await supabase.from("procedimentos").update({ data }).eq("id", procedimentoId)
    } else {
      const { data: proc } = await supabase
        .from("procedimentos")
        .insert({ cliente_id: clienteAberto, tipo, data, estado: "realizado" })
        .select()
        .single()
      if (proc) setProcedimentoId(proc.id)
    }
    setDataSessao(data)
  }

  // Editar data da sessão
  const editarDataSessao = async (data: string) => {
    if (!procedimentoId) return
    await supabase.from("procedimentos").update({ data }).eq("id", procedimentoId)
    setDataSessao(data)
  }

  // Remover sessão
  const removerSessao = async () => {
    if (!procedimentoId) return
    await supabase.from("procedimentos").delete().eq("id", procedimentoId)
    setProcedimentoId(null)
    setDataSessao(null)
  }

  // Editar data de retoque
  const editarRetoque = async (id: string, data: string) => {
    await supabase.from("procedimentos").update({ data }).eq("id", id)
    setRetoques((prev) => prev.map((r) => r.id === id ? { ...r, data } : r))
  }

  // Remover retoque
  const removerRetoque = async (id: string) => {
    await supabase.from("procedimentos").delete().eq("id", id)
    setRetoques((prev) => prev.filter((r) => r.id !== id))
  }

  // Adicionar retoque
  const adicionarRetoque = async (data: string) => {
    if (!clienteAberto) return
    const tipos = clientesComServico.get(clienteAberto) || []
    const tipo = tipos[0] || "pixelbrows"

    const { data: proc } = await supabase
      .from("procedimentos")
      .insert({ cliente_id: clienteAberto, tipo, data, estado: "retoque" })
      .select()
      .single()
    if (proc) {
      setRetoques((prev) => [...prev, { id: proc.id, data: proc.data }])
    }
  }

  // Remover foto de estudo
  const removerFotoEstudo = async (fotoId: string) => {
    await supabase.from("fotos").delete().eq("id", fotoId)
    setFotosEstudo((prev) => prev.filter((f) => f.id !== fotoId))
  }

  const clienteDetalhe = clienteAberto ? clientes.find((c) => c.id === clienteAberto) : null

  const formatarData = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleDateString("pt-PT", { day: "2-digit", month: "short", year: "numeric" })
  }

  const labelServico = (tipo: string) => {
    switch (tipo) {
      case "labios": return "Lábios"
      case "nanoblading": return "Nanoblading"
      case "pixelbrows": return "Pixelbrows"
      default: return tipo
    }
  }

  // Lista principal
  if (!clienteDetalhe) {
    return (
      <div className="min-h-screen bg-background page-scrollable">
        {/* Header */}
        <header className="bg-header border-b border-border">
          <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
            <button onClick={onVoltar} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
              <span className="text-[10px] font-body font-semibold tracking-[0.15em] uppercase">Menu</span>
            </button>
            <p className="text-[10px] font-body font-semibold tracking-[0.2em] uppercase text-accent">Base de Clientes</p>
          </div>
        </header>
        <div className="h-[1px] bg-gradient-to-r from-transparent via-accent to-transparent opacity-30" />

        <main className="max-w-4xl mx-auto px-6 py-8 space-y-6">
          {/* Pesquisa */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" strokeWidth={1.5} />
            <input
              type="text"
              value={pesquisa}
              onChange={(e) => setPesquisa(e.target.value)}
              placeholder="Pesquisar por nome, telefone ou email..."
              className="w-full bg-card border border-border rounded-lg pl-11 pr-4 py-3 text-sm font-body text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-accent/40"
            />
          </div>

          {/* Filtros */}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => setMostrarFiltros(!mostrarFiltros)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-[10px] font-body font-semibold tracking-[0.1em] uppercase border transition-colors ${
                mostrarFiltros || filtroServico !== "todos" ? "bg-accent/10 border-accent/30 text-accent" : "border-border text-muted-foreground hover:bg-secondary"
              }`}
            >
              <Filter className="w-3 h-3" strokeWidth={1.5} />
              Filtrar
            </button>

            {/* Ordenação */}
            <button
              onClick={() => setOrdenacao(ordenacao === "recente" ? "antigo" : ordenacao === "antigo" ? "nome" : "recente")}
              className="flex items-center gap-1.5 px-3 py-2 rounded-md text-[10px] font-body font-semibold tracking-[0.1em] uppercase border border-border text-muted-foreground hover:bg-secondary transition-colors"
            >
              <ArrowUpDown className="w-3 h-3" strokeWidth={1.5} />
              {ordenacao === "recente" ? "Mais recente" : ordenacao === "antigo" ? "Mais antigo" : "Nome A-Z"}
            </button>

            {/* Contagem */}
            <span className="text-[10px] font-body text-muted-foreground/60 ml-auto">
              {clientesFiltrados.length} {clientesFiltrados.length === 1 ? "cliente" : "clientes"}
            </span>
          </div>

          {/* Filtros expandidos */}
          {mostrarFiltros && (
            <div className="flex gap-2 flex-wrap">
              {(["todos", "pixelbrows", "nanoblading", "labios"] as FiltroServico[]).map((f) => (
                <button
                  key={f}
                  onClick={() => setFiltroServico(f)}
                  className={`px-3 py-1.5 rounded-md text-[10px] font-body font-semibold tracking-wide border transition-colors ${
                    filtroServico === f
                      ? "bg-accent/10 border-accent/30 text-accent"
                      : "bg-secondary/50 border-border text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  {filtroServico === f && "✓ "}{f === "todos" ? "Todos" : labelServico(f)}
                </button>
              ))}
            </div>
          )}

          {/* Lista */}
          {loading ? (
            <div className="text-center py-16">
              <p className="text-[11px] font-body text-muted-foreground animate-pulse">A carregar...</p>
            </div>
          ) : clientesFiltrados.length === 0 ? (
            <div className="bg-card rounded-lg border border-border p-12 card-elevated corner-ornament text-center">
              <div className="w-16 h-16 rounded-full bg-accent/8 border border-accent/15 flex items-center justify-center mx-auto mb-6">
                <User className="w-7 h-7 text-accent/60" strokeWidth={1.5} />
              </div>
              <p className="text-[10px] font-body font-semibold tracking-[0.2em] uppercase text-muted-foreground mb-2">
                {pesquisa || filtroServico !== "todos" ? "Sem resultados" : "Sem clientes"}
              </p>
              <p className="text-[11px] font-body text-muted-foreground/70 leading-relaxed">
                {pesquisa || filtroServico !== "todos"
                  ? "Tente outra pesquisa ou remova os filtros."
                  : "As clientes aparecem aqui após serem guardadas na checklist."}
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {clientesFiltrados.map((cliente) => {
                const tipos = clientesComServico.get(cliente.id) || []
                return (
                  <button
                    key={cliente.id}
                    onClick={() => abrirPerfil(cliente.id)}
                    className="w-full bg-card rounded-lg border border-border px-5 py-4 card-elevated flex items-center gap-4 text-left hover:border-accent/20 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-accent/8 border border-accent/15 flex items-center justify-center shrink-0">
                      <User className="w-4 h-4 text-accent" strokeWidth={1.5} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-body font-semibold text-foreground truncate">{cliente.nome}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        {tipos.map((t) => (
                          <span key={t} className="text-[8px] font-body font-bold tracking-[0.15em] uppercase px-2 py-0.5 rounded bg-accent/8 text-accent border border-accent/15">
                            {labelServico(t)}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-[10px] font-body text-muted-foreground">{formatarData(cliente.criado_em)}</p>
                      {cliente.telefone && (
                        <p className="text-[10px] font-body text-muted-foreground/60 mt-0.5">{cliente.telefone}</p>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </main>
      </div>
    )
  }

  // Perfil da cliente
  return (
    <div className="min-h-screen bg-background page-scrollable">
      {/* Header */}
      <header className="bg-header border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <button onClick={() => setClienteAberto(null)} className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" strokeWidth={1.5} />
            <span className="text-[10px] font-body font-semibold tracking-[0.15em] uppercase">Clientes</span>
          </button>
          <p className="text-[10px] font-body font-semibold tracking-[0.2em] uppercase text-accent">Perfil</p>
        </div>
      </header>
      <div className="h-[1px] bg-gradient-to-r from-transparent via-accent to-transparent opacity-30" />

      <main className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        {/* Dados pessoais */}
        <div className="bg-card rounded-lg border border-border p-6 md:p-8 card-elevated corner-ornament">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-14 h-14 rounded-full bg-accent/8 border border-accent/15 flex items-center justify-center">
              <User className="w-6 h-6 text-accent" strokeWidth={1.5} />
            </div>
            <div>
              <h2 className="text-xl font-display font-bold text-foreground tracking-tight">{clienteDetalhe.nome}</h2>
              <p className="text-[10px] font-body text-muted-foreground mt-0.5">
                Cliente desde {formatarData(clienteDetalhe.criado_em)}
              </p>
            </div>
          </div>

          <div className="hr-diamond w-32 mx-auto mb-6"><div className="diamond" /></div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {clienteDetalhe.telefone && (
              <div>
                <p className="text-[9px] font-body font-semibold tracking-[0.2em] uppercase text-muted-foreground mb-1">Contacto</p>
                <p className="text-sm font-body text-foreground">{clienteDetalhe.telefone}</p>
              </div>
            )}
            {clienteDetalhe.email && (
              <div>
                <p className="text-[9px] font-body font-semibold tracking-[0.2em] uppercase text-muted-foreground mb-1">Email</p>
                <p className="text-sm font-body text-foreground">{clienteDetalhe.email}</p>
              </div>
            )}
            {clienteDetalhe.idade && (
              <div>
                <p className="text-[9px] font-body font-semibold tracking-[0.2em] uppercase text-muted-foreground mb-1">Idade</p>
                <p className="text-sm font-body text-foreground">{clienteDetalhe.idade}</p>
              </div>
            )}
          </div>
        </div>

        {/* Timeline de datas */}
        <div className="bg-card rounded-lg border border-border p-6 md:p-8 card-elevated">
          <p className="text-[9px] font-body font-semibold tracking-[0.4em] uppercase text-accent mb-6 text-center">Cronologia</p>
          <div className="flex items-start gap-0 overflow-x-auto pb-2 pt-4">
            {/* Avaliação */}
            <div className="flex flex-col items-center min-w-[100px] flex-1">
              <div className="w-10 h-10 rounded-full bg-accent/8 border border-accent/15 flex items-center justify-center mb-3">
                <Calendar className="w-4 h-4 text-accent" strokeWidth={1.5} />
              </div>
              <p className="text-[9px] font-body font-semibold tracking-[0.15em] uppercase text-muted-foreground mb-1">Avaliação</p>
              <p className="text-[11px] font-body font-medium text-foreground">{formatarData(clienteDetalhe.criado_em)}</p>
            </div>

            {/* Linha */}
            <div className="flex-shrink-0 w-8 h-px bg-border mt-5" />

            {/* Sessão */}
            <div className="flex flex-col items-center min-w-[100px] flex-1 group">
              <div className="relative">
                <label className={`w-10 h-10 rounded-full border flex items-center justify-center cursor-pointer transition-colors ${dataSessao ? "bg-accent/8 border-accent/15" : "bg-secondary/50 border-border hover:border-accent/30"}`}>
                  <Calendar className={`w-4 h-4 ${dataSessao ? "text-accent" : "text-muted-foreground/40"}`} strokeWidth={1.5} />
                  <input type="date" className="sr-only" onChange={(e) => {
                    if (e.target.value) {
                      const iso = new Date(e.target.value).toISOString()
                      dataSessao ? editarDataSessao(iso) : guardarDataSessao(iso)
                    }
                  }} />
                </label>
                {dataSessao && (
                  <button onClick={removerSessao} className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-foreground/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-destructive transition-all text-[10px]">
                    ×
                  </button>
                )}
              </div>
              <div className="mt-3 text-center">
                <p className="text-[9px] font-body font-semibold tracking-[0.15em] uppercase text-muted-foreground mb-1">1ª Sessão</p>
                {dataSessao ? (
                  <p className="text-[11px] font-body font-medium text-foreground">{formatarData(dataSessao)}</p>
                ) : (
                  <p className="text-[10px] font-body text-muted-foreground/40 italic">Toque para adicionar</p>
                )}
              </div>
            </div>

            {/* Retoques existentes */}
            {retoques.map((ret, i) => (
              <div key={ret.id} className="flex items-start">
                <div className="flex-shrink-0 w-8 h-px bg-border mt-5" />
                <div className="flex flex-col items-center min-w-[100px] flex-1 group">
                  <div className="relative">
                    <label className="w-10 h-10 rounded-full bg-accent/8 border border-accent/15 flex items-center justify-center cursor-pointer">
                      <Calendar className="w-4 h-4 text-accent" strokeWidth={1.5} />
                      <input type="date" className="sr-only" onChange={(e) => { if (e.target.value) editarRetoque(ret.id, new Date(e.target.value).toISOString()) }} />
                    </label>
                    <button onClick={() => removerRetoque(ret.id)} className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-foreground/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-destructive transition-all text-[10px]">
                      ×
                    </button>
                  </div>
                  <div className="mt-3 text-center">
                    <p className="text-[9px] font-body font-semibold tracking-[0.15em] uppercase text-muted-foreground mb-1">
                      {i === 0 ? "Retoque" : `Retoque ${i + 1}`}
                    </p>
                    <p className="text-[11px] font-body font-medium text-foreground">{formatarData(ret.data)}</p>
                  </div>
                </div>
              </div>
            ))}

            {/* Adicionar retoque */}
            {dataSessao && (
              <div className="flex items-start">
                <div className="flex-shrink-0 w-8 h-px bg-border mt-5" />
                <div className="flex flex-col items-center min-w-[100px] flex-1">
                  <label className="w-10 h-10 rounded-full bg-secondary/50 border border-dashed border-border hover:border-accent/30 flex items-center justify-center mb-3 cursor-pointer transition-colors">
                    <span className="text-[14px] font-body text-muted-foreground/40">+</span>
                    <input type="date" className="sr-only" onChange={(e) => { if (e.target.value) adicionarRetoque(new Date(e.target.value).toISOString()) }} />
                  </label>
                  <p className="text-[9px] font-body font-semibold tracking-[0.15em] uppercase text-muted-foreground/40 mb-1">
                    {retoques.length === 0 ? "Retoque" : "Novo Retoque"}
                  </p>
                  <p className="text-[10px] font-body text-muted-foreground/40 italic">Toque para adicionar</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Checklists */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <ClipboardList className="w-4 h-4 text-accent" strokeWidth={1.5} />
            <p className="text-[10px] font-body font-semibold tracking-[0.2em] uppercase text-muted-foreground">
              Checklists ({checklists.length})
            </p>
          </div>

          {checklists.length === 0 ? (
            <div className="bg-card rounded-lg border border-border p-8 text-center">
              <p className="text-[11px] font-body text-muted-foreground/60">Sem checklists registadas.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {checklists.map((cl) => (
                <div key={cl.id} className="bg-card rounded-lg border border-border card-elevated overflow-hidden">
                  <button
                    onClick={() => setChecklistAberta(checklistAberta === cl.id ? null : cl.id)}
                    className="w-full flex items-center justify-between px-5 py-4 hover:bg-secondary/30 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-[8px] font-body font-bold tracking-[0.15em] uppercase px-2 py-0.5 rounded bg-accent/8 text-accent border border-accent/15">
                        {labelServico(cl.tipo_procedimento)}
                      </span>
                      <span className="text-[11px] font-body text-muted-foreground flex items-center gap-1">
                        <Calendar className="w-3 h-3" strokeWidth={1.5} />
                        {formatarData(cl.criado_em)}
                      </span>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${checklistAberta === cl.id ? "rotate-180" : ""}`} strokeWidth={1.5} />
                  </button>

                  {/* Dados da checklist expandidos */}
                  {checklistAberta === cl.id && (
                    <div className="px-5 pb-5 border-t border-border pt-4 space-y-3">
                      {Object.entries(cl.dados as Record<string, unknown>).map(([key, value]) => {
                        // Filtrar campos pessoais (já estão no card de cima)
                        if (["nome", "contacto", "data_nascimento", "idade", "data"].includes(key)) return null
                        if (!value || (Array.isArray(value) && value.length === 0)) return null
                        const label = key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
                        let displayValue: string
                        if (typeof value === "boolean") displayValue = value ? "Sim" : "Não"
                        else if (Array.isArray(value)) displayValue = value.join(", ")
                        else displayValue = String(value)

                        return (
                          <div key={key} className="flex justify-between items-baseline gap-3">
                            <span className="text-[10px] font-body text-muted-foreground shrink-0">{label}</span>
                            <span className="flex-1 border-b border-dotted border-border/60 mx-1 mb-0.5" />
                            <span className="text-[11px] font-body font-medium text-foreground text-right max-w-[60%]">{displayValue}</span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Fotos de estudo */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4 text-accent" strokeWidth={1.5} />
              <p className="text-[10px] font-body font-semibold tracking-[0.2em] uppercase text-muted-foreground">
                Fotos de Estudo ({fotosEstudo.length})
              </p>
            </div>
            <button
              onClick={() => setModoEstudo(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-accent/30 text-[10px] font-body font-semibold tracking-[0.1em] uppercase text-accent hover:bg-accent/5 transition-colors"
            >
              <ScanEye className="w-3 h-3" strokeWidth={1.5} />
              Novo Estudo
            </button>
          </div>

          {!modoEstudo && fotosEstudo.length === 0 && (
            <div className="bg-card rounded-lg border border-border p-8 text-center">
              <p className="text-[11px] font-body text-muted-foreground/60">
                Sem fotos de estudo. Carregue em "Novo Estudo" para começar.
              </p>
            </div>
          )}

          {!modoEstudo && fotosEstudo.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {fotosEstudo.map((foto) => (
                <div key={foto.id} className="relative rounded-lg overflow-hidden border border-border card-elevated group">
                  <img src={foto.url} alt="Estudo" className="w-full aspect-[4/3] object-cover" />
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-foreground/60 to-transparent px-3 py-2">
                    <p className="text-[9px] font-body text-white/80">{formatarData(foto.criado_em)}</p>
                  </div>
                  <button
                    onClick={() => removerFotoEstudo(foto.id)}
                    className="absolute top-2 right-2 w-6 h-6 rounded-full bg-foreground/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-destructive transition-all"
                  >
                    <Trash2 className="w-3 h-3" strokeWidth={2} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Editor fullscreen (portal) */}
          {modoEstudo && (
            <div className="fixed inset-0 z-50 bg-background">
              <Estudo tipo={((clientesComServico.get(clienteDetalhe.id) || [])[0] || "labios") as TipoProcedimento} clienteId={clienteDetalhe.id} onFechar={() => { setModoEstudo(false); abrirPerfil(clienteDetalhe.id) }} />
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <div className="hr-diamond max-w-xs mx-auto mt-8 mb-8"><div className="diamond" /></div>
    </div>
  )
}
