import { useState } from "react"
import { ClipboardList, ChevronDown, Check, Save, UserCheck, UserPlus, Search, X } from "lucide-react"
import type { TipoProcedimento } from "@/pages/menu/MenuPrincipal"
import { checklists } from "@/data/checklists"
import type { Campo, CampoCheckbox, SecaoChecklist } from "@/data/checklists"
import { useClientesCtx } from "@/hooks/ClientesContext"
import type { Cliente } from "@/hooks/useClientes"

interface ChecklistProps {
  tipo: TipoProcedimento
  onClienteGuardada?: (clienteId: string) => void
}

/** Estado do formulário — armazena valores de todos os campos */
type FormState = Record<string, string | boolean | string[]>

function CampoInput({
  campo,
  valor,
  onChange,
}: {
  campo: Campo
  valor: string | boolean | string[] | undefined
  onChange: (id: string, val: string | boolean | string[]) => void
}) {
  switch (campo.tipo) {
    case "texto":
      return (
        <div>
          <label className="block text-[10px] font-body font-semibold tracking-[0.15em] uppercase text-muted-foreground mb-2">
            {campo.label}
          </label>
          <input
            type="text"
            value={(valor as string) || ""}
            onChange={(e) => onChange(campo.id, e.target.value)}
            placeholder={campo.placeholder}
            className="w-full bg-secondary/50 border border-border rounded-md px-4 py-2.5 text-sm font-body text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-accent/40"
          />
        </div>
      )

    case "textarea":
      return (
        <div>
          <label className="block text-[10px] font-body font-semibold tracking-[0.15em] uppercase text-muted-foreground mb-2">
            {campo.label}
          </label>
          <textarea
            value={(valor as string) || ""}
            onChange={(e) => onChange(campo.id, e.target.value)}
            placeholder={campo.placeholder}
            rows={3}
            className="w-full bg-secondary/50 border border-border rounded-md px-4 py-3 text-sm font-body text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-accent/40 resize-none"
          />
        </div>
      )

    case "data_nascimento": {
      const dataStr = (valor as string) || ""

      // Auto-formatar: adicionar "/" ao digitar
      const handleDataChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let v = e.target.value.replace(/\D/g, "")
        if (v.length > 8) v = v.slice(0, 8)
        if (v.length >= 5) v = v.slice(0, 2) + "/" + v.slice(2, 4) + "/" + v.slice(4)
        else if (v.length >= 3) v = v.slice(0, 2) + "/" + v.slice(2)
        onChange(campo.id, v)
      }

      // Calcular idade
      let idade = ""
      if (dataStr.length === 10) {
        const [dia, mes, ano] = dataStr.split("/").map(Number)
        const nasc = new Date(ano, mes - 1, dia)
        const hoje = new Date()
        let anos = hoje.getFullYear() - nasc.getFullYear()
        if (hoje.getMonth() < nasc.getMonth() || (hoje.getMonth() === nasc.getMonth() && hoje.getDate() < nasc.getDate())) anos--
        if (anos >= 0 && anos < 150) idade = `${anos} anos`
      }

      return (
        <div>
          <label className="block text-[10px] font-body font-semibold tracking-[0.15em] uppercase text-muted-foreground mb-2">
            {campo.label}
          </label>
          <div className="flex items-center gap-3">
            <input
              type="text"
              inputMode="numeric"
              value={dataStr}
              onChange={handleDataChange}
              placeholder="DD/MM/AAAA"
              maxLength={10}
              className="flex-1 bg-secondary/50 border border-border rounded-md px-4 py-2.5 text-sm font-body text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-accent/40"
            />
            {idade && (
              <span className="text-[11px] font-body font-semibold text-accent bg-accent/8 border border-accent/15 px-3 py-2 rounded-md shrink-0">
                {idade}
              </span>
            )}
          </div>
        </div>
      )
    }

    case "checkbox": {
      const checked = !!valor
      const campoCheckbox = campo as CampoCheckbox
      return (
        <div>
          <button
            type="button"
            onClick={() => onChange(campo.id, !checked)}
            className="flex items-center gap-3 group w-full text-left"
          >
            <div
              className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                checked
                  ? "bg-accent border-accent"
                  : "border-border group-hover:border-accent/40"
              }`}
            >
              {checked && <Check className="w-3 h-3 text-accent-foreground" strokeWidth={2.5} />}
            </div>
            <span className="text-[12px] font-body text-foreground/80">{campo.label}</span>
          </button>
          {/* Sub-campos condicionais */}
          {checked && campoCheckbox.subCampos && campoCheckbox.subCampos.length > 0 && (
            <div className="ml-8 mt-3 space-y-3 pl-3 border-l-2 border-accent/15">
              {campoCheckbox.subCampos.map((sub) => (
                <CampoInput
                  key={sub.id}
                  campo={sub as Campo}
                  valor={undefined}
                  onChange={onChange}
                />
              ))}
            </div>
          )}
        </div>
      )
    }

    case "sim_nao":
      return (
        <div>
          <label className="block text-[10px] font-body font-semibold tracking-[0.15em] uppercase text-muted-foreground mb-3">
            {campo.label}
          </label>
          <div className="flex gap-2">
            {["Sim", "Não"].map((opcao) => {
              const isSelected = valor === opcao
              return (
                <button
                  key={opcao}
                  type="button"
                  onClick={() => onChange(campo.id, opcao)}
                  className={`px-4 py-2 rounded-md text-[11px] font-body font-semibold tracking-wide border transition-colors ${
                    isSelected
                      ? "bg-accent/10 border-accent/30 text-accent"
                      : "bg-secondary/50 border-border text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  {isSelected && "✓ "}{opcao}
                </button>
              )
            })}
          </div>
        </div>
      )

    case "opcoes": {
      const selecionadas = (valor as string[]) || []
      return (
        <div>
          <label className="block text-[10px] font-body font-semibold tracking-[0.15em] uppercase text-muted-foreground mb-3">
            {campo.label}
          </label>
          <div className="flex flex-wrap gap-2">
            {campo.opcoes.map((opcao) => {
              const isSelected = campo.multiplo
                ? selecionadas.includes(opcao)
                : selecionadas[0] === opcao
              return (
                <button
                  key={opcao}
                  type="button"
                  onClick={() => {
                    if (campo.multiplo) {
                      const novas = isSelected
                        ? selecionadas.filter((s) => s !== opcao)
                        : [...selecionadas, opcao]
                      onChange(campo.id, novas)
                    } else {
                      onChange(campo.id, [opcao])
                    }
                  }}
                  className={`px-4 py-2 rounded-md text-[11px] font-body font-semibold tracking-wide border transition-colors ${
                    isSelected
                      ? "bg-accent/10 border-accent/30 text-accent"
                      : "bg-secondary/50 border-border text-muted-foreground hover:bg-secondary"
                  }`}
                >
                  {isSelected && "✓ "}{opcao}
                </button>
              )
            })}
          </div>
        </div>
      )
    }
  }
}

function SecaoCard({
  seccao,
  formState,
  onChange,
}: {
  seccao: SecaoChecklist
  formState: FormState
  onChange: (id: string, val: string | boolean | string[]) => void
}) {
  const [aberta, setAberta] = useState(true)

  return (
    <div className="bg-card rounded-lg border border-border card-elevated overflow-hidden">
      {/* Header da secção */}
      <button
        type="button"
        onClick={() => setAberta(!aberta)}
        className="w-full flex items-center justify-between px-6 md:px-8 py-5 hover:bg-secondary/30 transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="w-6 h-6 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center text-[10px] font-body font-bold text-accent shrink-0">
            {seccao.numero}
          </span>
          <span className="text-[11px] font-body font-semibold tracking-[0.15em] uppercase text-foreground">
            {seccao.titulo}
          </span>
        </div>
        <ChevronDown
          className={`w-4 h-4 text-muted-foreground transition-transform ${aberta ? "rotate-180" : ""}`}
          strokeWidth={1.5}
        />
      </button>

      {/* Conteúdo */}
      {aberta && (
        <div className="px-6 md:px-8 pb-6 md:pb-8 space-y-5 border-t border-border pt-5">
          {seccao.campos.map((campo) => (
            <CampoInput
              key={campo.id}
              campo={campo}
              valor={formState[campo.id]}
              onChange={onChange}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default function Checklist({ tipo, onClienteGuardada }: ChecklistProps) {
  const [formState, setFormState] = useState<FormState>({})
  const [guardada, setGuardada] = useState(false)
  const [clienteAssociada, setClienteAssociada] = useState<Cliente | null>(null)
  const [mostrarPesquisa, setMostrarPesquisa] = useState(false)
  const [pesquisa, setPesquisa] = useState("")
  const { clientes, criarCliente, adicionarChecklist } = useClientesCtx()

  const data = checklists[tipo]

  const handleChange = (id: string, val: string | boolean | string[]) => {
    setFormState((prev) => ({ ...prev, [id]: val }))
  }

  // Associar a cliente existente — pré-preenche os campos
  const associarCliente = (cliente: Cliente) => {
    setClienteAssociada(cliente)
    setMostrarPesquisa(false)
    setPesquisa("")
    setFormState((prev) => ({
      ...prev,
      nome: cliente.nome,
      contacto: cliente.telefone || "",
    }))
  }

  // Desassociar
  const desassociarCliente = () => {
    setClienteAssociada(null)
    setFormState((prev) => ({ ...prev, nome: "", contacto: "" }))
  }

  // Filtrar clientes na pesquisa
  const clientesFiltrados = pesquisa.trim()
    ? clientes.filter((c) => c.nome.toLowerCase().includes(pesquisa.toLowerCase()))
    : clientes.slice(0, 10)

  const handleGuardar = async () => {
    if (clienteAssociada) {
      // Adicionar checklist à cliente existente
      await adicionarChecklist(clienteAssociada.id, tipo, formState)
      setGuardada(true)
      onClienteGuardada?.(clienteAssociada.id)
      return
    }

    // Criar nova cliente
    const nome = (formState["nome"] as string) || ""
    const contacto = (formState["contacto"] as string) || ""
    const dataNasc = (formState["data_nascimento"] as string) || ""

    let idade = ""
    if (dataNasc.length === 10) {
      const [dia, mes, ano] = dataNasc.split("/").map(Number)
      const nasc = new Date(ano, mes - 1, dia)
      const hoje = new Date()
      let anos = hoje.getFullYear() - nasc.getFullYear()
      if (hoje.getMonth() < nasc.getMonth() || (hoje.getMonth() === nasc.getMonth() && hoje.getDate() < nasc.getDate())) anos--
      idade = `${anos}`
    }

    if (!nome.trim()) return

    const cliente = await criarCliente(nome, contacto, idade, tipo, formState)
    if (cliente) {
      setGuardada(true)
      onClienteGuardada?.(cliente.id)
    }
  }

  // Placeholder se não houver checklist para este tipo
  if (!data) {
    const tipoLabel =
      tipo === "labios"
        ? "Micropigmentação de Lábios"
        : tipo === "nanoblading"
          ? "Nanoblading"
          : "Pixelbrows"

    return (
      <div className="space-y-10">
        <div className="text-center">
          <p className="text-[9px] font-body font-semibold tracking-[0.4em] uppercase text-accent mb-3">
            Pré-Procedimento
          </p>
          <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground tracking-tight">
            Checklist — {tipoLabel}
          </h2>
        </div>
        <div className="hr-diamond w-48 mx-auto"><div className="diamond" /></div>
        <div className="bg-card rounded-lg border border-border p-12 card-elevated corner-ornament text-center max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-accent/8 border border-accent/15 flex items-center justify-center mx-auto mb-6">
            <ClipboardList className="w-7 h-7 text-accent/60" strokeWidth={1.5} />
          </div>
          <p className="text-[10px] font-body font-semibold tracking-[0.2em] uppercase text-muted-foreground mb-2">
            Conteúdo Pendente
          </p>
          <p className="text-[11px] font-body text-muted-foreground/70 leading-relaxed">
            A checklist pré-procedimento será adicionada assim que o conteúdo for fornecido.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-10">
      {/* Título */}
      <div className="text-center">
        <p className="text-[9px] font-body font-semibold tracking-[0.4em] uppercase text-accent mb-3">
          Pré-Procedimento
        </p>
        <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground tracking-tight">
          {data.titulo}
        </h2>
        <p className="text-[11px] font-body text-muted-foreground mt-3 max-w-md mx-auto">
          Preencha durante a consulta de avaliação. Pode sofrer alterações.
        </p>
      </div>

      <div className="hr-diamond w-48 mx-auto"><div className="diamond" /></div>

      {/* Notas rápidas */}
      <div className="max-w-2xl mx-auto">
        <div className="bg-card rounded-lg border border-border p-5 card-elevated">
          <label className="block text-[10px] font-body font-semibold tracking-[0.15em] uppercase text-muted-foreground mb-2">
            Notas Rápidas
          </label>
          <textarea
            value={(formState["notas_rapidas"] as string) || ""}
            onChange={(e) => handleChange("notas_rapidas", e.target.value)}
            placeholder="Apontamentos rápidos sobre a consulta..."
            rows={3}
            className="w-full bg-secondary/50 border border-border rounded-md px-4 py-3 text-sm font-body text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-accent/40 resize-none"
          />
        </div>
      </div>

      {/* Associar a cliente existente */}
      <div className="max-w-2xl mx-auto">
        {!guardada && !clienteAssociada && (
          <button
            onClick={() => setMostrarPesquisa(true)}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-md border border-dashed border-accent/30 text-accent hover:bg-accent/5 transition-colors mb-4"
          >
            <UserPlus className="w-4 h-4" strokeWidth={1.5} />
            <span className="text-[10px] font-body font-semibold tracking-[0.15em] uppercase">
              Associar a cliente existente
            </span>
          </button>
        )}

        {clienteAssociada && !guardada && (
          <div className="flex items-center justify-between bg-accent/8 border border-accent/15 rounded-md px-4 py-3 mb-4">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-accent" strokeWidth={1.5} />
              <span className="text-[11px] font-body font-semibold text-foreground">
                {clienteAssociada.nome}
              </span>
              <span className="text-[9px] font-body text-muted-foreground">— cliente existente</span>
            </div>
            <button onClick={desassociarCliente} className="p-1 rounded text-muted-foreground hover:text-destructive">
              <X className="w-3.5 h-3.5" strokeWidth={1.5} />
            </button>
          </div>
        )}
      </div>

      {/* Modal pesquisa clientes */}
      {mostrarPesquisa && (
        <div className="fixed inset-0 z-50 bg-foreground/30 flex items-center justify-center p-4">
          <div className="bg-card rounded-lg border border-border p-6 w-full max-w-md max-h-[70vh] flex flex-col card-elevated" style={{ touchAction: "pan-y" }}>
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-body font-semibold tracking-[0.2em] uppercase text-accent">
                Selecionar Cliente
              </p>
              <button onClick={() => { setMostrarPesquisa(false); setPesquisa("") }} className="p-1.5 rounded-md text-muted-foreground hover:bg-secondary">
                <X className="w-4 h-4" strokeWidth={1.5} />
              </button>
            </div>

            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" strokeWidth={1.5} />
              <input
                type="text"
                value={pesquisa}
                onChange={(e) => setPesquisa(e.target.value)}
                placeholder="Pesquisar por nome..."
                autoFocus
                className="w-full bg-secondary/50 border border-border rounded-md pl-10 pr-4 py-2.5 text-sm font-body text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:ring-1 focus:ring-accent/40"
              />
            </div>

            <div className="flex-1 overflow-y-auto space-y-1">
              {clientesFiltrados.length === 0 ? (
                <p className="text-center text-[11px] font-body text-muted-foreground/60 py-8">Sem clientes encontradas.</p>
              ) : (
                clientesFiltrados.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => associarCliente(c)}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-md hover:bg-secondary/50 transition-colors text-left"
                  >
                    <div className="w-8 h-8 rounded-full bg-accent/8 border border-accent/15 flex items-center justify-center shrink-0">
                      <UserCheck className="w-3.5 h-3.5 text-accent" strokeWidth={1.5} />
                    </div>
                    <div>
                      <p className="text-sm font-body font-semibold text-foreground">{c.nome}</p>
                      {c.telefone && <p className="text-[10px] font-body text-muted-foreground">{c.telefone}</p>}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Secções */}
      <div className="max-w-2xl mx-auto space-y-4">
        {data.seccoes.map((seccao) => (
          <SecaoCard
            key={seccao.numero}
            seccao={seccao}
            formState={formState}
            onChange={handleChange}
          />
        ))}

        {/* Botão guardar cliente */}
        <div className="pt-6">
          {guardada ? (
            <div className="flex items-center justify-center gap-3 py-4 px-6 rounded-md bg-success border border-success-foreground/15">
              <UserCheck className="w-5 h-5 text-success-foreground" strokeWidth={1.5} />
              <span className="text-[11px] font-body font-semibold tracking-[0.15em] uppercase text-success-foreground">
                Cliente guardada com sucesso
              </span>
            </div>
          ) : (
            <button
              onClick={handleGuardar}
              disabled={!(formState["nome"] as string)?.trim()}
              className="w-full h-12 bg-accent text-accent-foreground text-[10px] font-body font-semibold tracking-[0.25em] uppercase rounded-md hover:bg-accent/90 transition-colors flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Save className="w-4 h-4" strokeWidth={1.5} />
              {clienteAssociada ? "Guardar Checklist" : "Guardar Cliente"}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
