import { useState, useRef, useEffect, useCallback } from "react"
import { Plus, Image, User, X, Camera, Trash2 } from "lucide-react"
import type { TipoProcedimento } from "@/pages/menu/MenuPrincipal"
import { supabase } from "@/lib/supabase"

interface FotoPortfolio {
  id: string
  url: string
  tipo: "antes" | "depois" | "pos_imediato" | "cicatrizado"
  portfolio_id: string
}

interface ClientePortfolio {
  id: string
  nome: string
  tipo_procedimento: TipoProcedimento
  fotos: FotoPortfolio[]
}

interface PortfolioProps {
  tipo: TipoProcedimento
}

const TIPOS_FOTO = [
  { id: "antes" as const, label: "Antes" },
  { id: "pos_imediato" as const, label: "Pós-imediato" },
  { id: "cicatrizado" as const, label: "Cicatrizado" },
]

// Upload de ficheiro para Supabase Storage
async function uploadFoto(file: File, portfolioId: string): Promise<string | null> {
  const ext = file.name.split(".").pop() || "jpg"
  const path = `portfolio/${portfolioId}/${Date.now()}.${ext}`
  const { error } = await supabase.storage.from("Fotos").upload(path, file)
  if (error) return null
  const { data } = supabase.storage.from("Fotos").getPublicUrl(path)
  return data.publicUrl
}

export default function Portfolio({ tipo }: PortfolioProps) {
  const [clientes, setClientes] = useState<ClientePortfolio[]>([])
  const [loading, setLoading] = useState(true)
  const [modalAberto, setModalAberto] = useState(false)
  const [novoNome, setNovoNome] = useState("")
  const [novasFotosPreview, setNovasFotosPreview] = useState<{ file: File; preview: string; tipo: FotoPortfolio["tipo"] }[]>([])
  const [clienteAberto, setClienteAberto] = useState<string | null>(null)
  const [guardando, setGuardando] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const inputAdicionarRef = useRef<HTMLInputElement>(null)
  const [tipoFotoAtual, setTipoFotoAtual] = useState<FotoPortfolio["tipo"]>("antes")

  const tipoLabel = tipo === "labios" ? "Micropigmentação de Lábios" : tipo === "nanoblading" ? "Nanoblading" : "Pixelbrows"

  // Carregar portfólio do Supabase
  const carregar = useCallback(async () => {
    setLoading(true)
    const { data: portfolios } = await supabase
      .from("portfolio")
      .select("*, portfolio_fotos(*)")
      .eq("tipo_procedimento", tipo)
      .order("criado_em", { ascending: false })

    const result: ClientePortfolio[] = (portfolios || []).map((p: Record<string, unknown>) => ({
      id: p.id as string,
      nome: p.nome as string,
      tipo_procedimento: p.tipo_procedimento as TipoProcedimento,
      fotos: ((p.portfolio_fotos || []) as Record<string, unknown>[]).map((f) => ({
        id: f.id as string,
        url: f.url as string,
        tipo: f.tipo as FotoPortfolio["tipo"],
        portfolio_id: f.portfolio_id as string,
      })),
    }))
    setClientes(result)
    setLoading(false)
  }, [tipo])

  useEffect(() => { carregar() }, [carregar])

  // Preview de fotos selecionadas (antes de guardar)
  const handleFotoNova = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files) return
    Array.from(files).forEach((file) => {
      const preview = URL.createObjectURL(file)
      setNovasFotosPreview((prev) => [...prev, { file, preview, tipo: tipoFotoAtual }])
    })
    e.target.value = ""
  }

  // Guardar novo cliente + upload de fotos
  const handleGuardar = async () => {
    if (!novoNome.trim()) return
    setGuardando(true)

    // Criar registo no portfólio
    const { data: portfolio, error } = await supabase
      .from("portfolio")
      .insert({ nome: novoNome.trim(), tipo_procedimento: tipo })
      .select()
      .single()

    if (error || !portfolio) { setGuardando(false); return }

    // Upload e registo de cada foto
    for (const foto of novasFotosPreview) {
      const url = await uploadFoto(foto.file, portfolio.id)
      if (url) {
        await supabase.from("portfolio_fotos").insert({
          portfolio_id: portfolio.id,
          url,
          tipo: foto.tipo,
        })
      }
    }

    // Limpar previews
    novasFotosPreview.forEach((f) => URL.revokeObjectURL(f.preview))
    setNovasFotosPreview([])
    setNovoNome("")
    setModalAberto(false)
    setGuardando(false)
    carregar()
  }

  // Adicionar fotos a cliente existente
  const handleFotoExistente = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || !clienteAberto) return
    e.target.value = ""

    for (const file of Array.from(files)) {
      const url = await uploadFoto(file, clienteAberto)
      if (url) {
        await supabase.from("portfolio_fotos").insert({
          portfolio_id: clienteAberto,
          url,
          tipo: tipoFotoAtual,
        })
      }
    }
    carregar()
  }

  // Remover cliente
  const removerCliente = async (id: string) => {
    await supabase.from("portfolio").delete().eq("id", id)
    setClientes((prev) => prev.filter((c) => c.id !== id))
    if (clienteAberto === id) setClienteAberto(null)
  }

  // Remover foto
  const removerFoto = async (fotoId: string) => {
    await supabase.from("portfolio_fotos").delete().eq("id", fotoId)
    carregar()
  }

  const clienteDetalhe = clienteAberto ? clientes.find((c) => c.id === clienteAberto) : null

  return (
    <div className="space-y-10">
      {/* Título */}
      <div className="text-center">
        <p className="text-[9px] font-body font-semibold tracking-[0.4em] uppercase text-accent mb-3">
          Resultados
        </p>
        <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground tracking-tight">
          Portfólio — {tipoLabel}
        </h2>
        <p className="text-[11px] font-body text-muted-foreground mt-3 max-w-md mx-auto">
          Exemplos reais de resultados para mostrar à cliente.
        </p>
      </div>

      <div className="hr-diamond w-48 mx-auto"><div className="diamond" /></div>

      {/* Botão adicionar */}
      <div className="flex justify-center">
        <button
          onClick={() => setModalAberto(true)}
          className="flex items-center gap-2 px-6 py-3 rounded-md border border-accent/30 bg-card text-foreground font-body font-semibold text-sm tracking-[0.1em] uppercase hover:bg-accent/5 transition-colors card-elevated"
        >
          <Plus className="w-4 h-4 text-accent" strokeWidth={1.5} />
          <span className="text-[10px]">Adicionar Cliente</span>
        </button>
      </div>

      {/* Lista de clientes */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-[11px] font-body text-muted-foreground animate-pulse">A carregar...</p>
        </div>
      ) : clientes.length === 0 ? (
        <div className="bg-card rounded-lg border border-border p-12 card-elevated corner-ornament text-center max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-accent/8 border border-accent/15 flex items-center justify-center mx-auto mb-6">
            <Image className="w-7 h-7 text-accent/60" strokeWidth={1.5} />
          </div>
          <p className="text-[10px] font-body font-semibold tracking-[0.2em] uppercase text-muted-foreground mb-2">
            Sem resultados
          </p>
          <p className="text-[11px] font-body text-muted-foreground/70 leading-relaxed">
            Adicione clientes ao portfólio para mostrar resultados durante a consulta.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clientes.map((cliente) => (
            <div key={cliente.id} className="bg-card rounded-lg border border-border p-6 card-elevated corner-ornament group">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-accent/8 border border-accent/15 flex items-center justify-center">
                    <User className="w-4 h-4 text-accent" strokeWidth={1.5} />
                  </div>
                  <div>
                    <p className="text-sm font-body font-semibold text-foreground">{cliente.nome}</p>
                    <p className="text-[10px] font-body text-muted-foreground">
                      {cliente.fotos.length} {cliente.fotos.length === 1 ? "foto" : "fotos"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removerCliente(cliente.id)}
                  className="p-1.5 rounded-md text-muted-foreground/40 hover:text-destructive hover:bg-destructive/5 transition-colors opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-3.5 h-3.5" strokeWidth={1.5} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-4">
                {cliente.fotos.slice(0, 4).map((foto) => (
                  <div key={foto.id} className="relative aspect-square rounded-md overflow-hidden bg-secondary/50">
                    <img src={foto.url} alt={foto.tipo} className="w-full h-full object-cover" />
                    <span className="absolute bottom-1 left-1 bg-foreground/60 text-white text-[8px] font-body font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded">
                      {foto.tipo === "pos_imediato" ? "Pós-imed." : foto.tipo}
                    </span>
                  </div>
                ))}
                {cliente.fotos.length > 4 && (
                  <div className="aspect-square rounded-md bg-secondary/50 flex items-center justify-center">
                    <span className="text-[11px] font-body font-semibold text-muted-foreground">+{cliente.fotos.length - 4}</span>
                  </div>
                )}
              </div>

              <button
                onClick={() => setClienteAberto(cliente.id)}
                className="w-full py-2.5 rounded-md border border-border text-[10px] font-body font-semibold tracking-[0.1em] uppercase text-foreground hover:bg-secondary transition-colors"
              >
                Ver / Adicionar Fotos
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal — Novo Cliente */}
      {modalAberto && (
        <div className="fixed inset-0 z-50 bg-foreground/30 flex items-center justify-center p-4">
          <div className="bg-card rounded-lg border border-border p-6 md:p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto card-elevated" style={{ touchAction: "pan-y" }}>
            <div className="flex items-center justify-between mb-6">
              <p className="text-[10px] font-body font-semibold tracking-[0.2em] uppercase text-accent">Nova Cliente — Portfólio</p>
              <button onClick={() => { setModalAberto(false); setNovoNome(""); novasFotosPreview.forEach((f) => URL.revokeObjectURL(f.preview)); setNovasFotosPreview([]) }} className="p-1.5 rounded-md text-muted-foreground hover:bg-secondary">
                <X className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>

            <div className="mb-6">
              <label className="block text-[10px] font-body font-semibold tracking-[0.15em] uppercase text-muted-foreground mb-2">Nome</label>
              <input type="text" value={novoNome} onChange={(e) => setNovoNome(e.target.value)} placeholder="Nome"
                className="w-full bg-secondary/50 border border-border rounded-md px-4 py-2.5 text-sm font-body text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-accent/40" />
            </div>

            <div className="mb-4">
              <label className="block text-[10px] font-body font-semibold tracking-[0.15em] uppercase text-muted-foreground mb-3">Adicionar Fotos</label>
              <div className="flex flex-wrap gap-2 mb-3">
                {TIPOS_FOTO.map((t) => (
                  <button key={t.id} onClick={() => setTipoFotoAtual(t.id)}
                    className={`px-3 py-1.5 rounded-md text-[10px] font-body font-semibold tracking-wide border transition-colors ${tipoFotoAtual === t.id ? "bg-accent/10 border-accent/30 text-accent" : "bg-secondary/50 border-border text-muted-foreground hover:bg-secondary"}`}>
                    {tipoFotoAtual === t.id && "✓ "}{t.label}
                  </button>
                ))}
              </div>
              <button onClick={() => inputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2.5 rounded-md border border-border text-[10px] font-body font-semibold tracking-[0.1em] uppercase text-foreground hover:bg-secondary transition-colors">
                <Camera className="w-3.5 h-3.5 text-accent" strokeWidth={1.5} />
                Selecionar Fotos ({TIPOS_FOTO.find((t) => t.id === tipoFotoAtual)?.label})
              </button>
            </div>

            {novasFotosPreview.length > 0 && (
              <div className="grid grid-cols-3 gap-2 mb-6">
                {novasFotosPreview.map((foto, i) => (
                  <div key={i} className="relative aspect-square rounded-md overflow-hidden bg-secondary/50">
                    <img src={foto.preview} alt={foto.tipo} className="w-full h-full object-cover" />
                    <span className="absolute bottom-1 left-1 bg-foreground/60 text-white text-[8px] font-body font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded">
                      {foto.tipo === "pos_imediato" ? "Pós-imed." : foto.tipo}
                    </span>
                    <button onClick={() => { URL.revokeObjectURL(foto.preview); setNovasFotosPreview((prev) => prev.filter((_, j) => j !== i)) }}
                      className="absolute top-1 right-1 w-5 h-5 rounded-full bg-foreground/60 text-white flex items-center justify-center hover:bg-destructive">
                      <X className="w-3 h-3" strokeWidth={2} />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button onClick={handleGuardar} disabled={!novoNome.trim() || guardando}
              className="w-full h-11 bg-accent text-accent-foreground text-[10px] font-body font-semibold tracking-[0.25em] uppercase rounded-md hover:bg-accent/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed">
              {guardando ? "A guardar..." : "Guardar Cliente"}
            </button>
          </div>
          <input ref={inputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFotoNova} />
        </div>
      )}

      {/* Modal — Detalhe Cliente */}
      {clienteDetalhe && (
        <div className="fixed inset-0 z-50 bg-foreground/30 flex items-center justify-center p-4">
          <div className="bg-card rounded-lg border border-border p-6 md:p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto card-elevated" style={{ touchAction: "pan-y" }}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-accent/8 border border-accent/15 flex items-center justify-center">
                  <User className="w-4 h-4 text-accent" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-sm font-body font-semibold text-foreground">{clienteDetalhe.nome}</p>
                  <p className="text-[10px] font-body text-muted-foreground">{tipoLabel}</p>
                </div>
              </div>
              <button onClick={() => setClienteAberto(null)} className="p-1.5 rounded-md text-muted-foreground hover:bg-secondary">
                <X className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-2 mb-6">
              <div className="flex gap-1.5">
                {TIPOS_FOTO.map((t) => (
                  <button key={t.id} onClick={() => setTipoFotoAtual(t.id)}
                    className={`px-3 py-1.5 rounded-md text-[10px] font-body font-semibold tracking-wide border transition-colors ${tipoFotoAtual === t.id ? "bg-accent/10 border-accent/30 text-accent" : "bg-secondary/50 border-border text-muted-foreground hover:bg-secondary"}`}>
                    {tipoFotoAtual === t.id && "✓ "}{t.label}
                  </button>
                ))}
              </div>
              <button onClick={() => inputAdicionarRef.current?.click()}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-accent/30 text-[10px] font-body font-semibold tracking-[0.1em] uppercase text-accent hover:bg-accent/5 transition-colors">
                <Plus className="w-3 h-3" strokeWidth={2} />Adicionar
              </button>
            </div>

            {TIPOS_FOTO.map((t) => {
              const fotosDoTipo = clienteDetalhe.fotos.filter((f) => f.tipo === t.id)
              if (fotosDoTipo.length === 0) return null
              return (
                <div key={t.id} className="mb-6">
                  <p className="text-[9px] font-body font-semibold tracking-[0.2em] uppercase text-muted-foreground mb-3">{t.label}</p>
                  <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
                    {fotosDoTipo.map((foto) => (
                      <div key={foto.id} className="relative aspect-square rounded-md overflow-hidden bg-secondary/50 group">
                        <img src={foto.url} alt={foto.tipo} className="w-full h-full object-cover" />
                        <button onClick={() => removerFoto(foto.id)}
                          className="absolute top-1 right-1 w-6 h-6 rounded-full bg-foreground/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-destructive transition-all">
                          <X className="w-3 h-3" strokeWidth={2} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}

            {clienteDetalhe.fotos.length === 0 && (
              <div className="text-center py-8">
                <p className="text-[11px] font-body text-muted-foreground/60">Sem fotos. Adicione fotos selecionando o tipo e clicando em "Adicionar".</p>
              </div>
            )}
          </div>
          <input ref={inputAdicionarRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFotoExistente} />
        </div>
      )}
    </div>
  )
}
