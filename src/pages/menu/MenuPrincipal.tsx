import { Sparkles, Pen, Heart, Users } from "lucide-react"

// Tipos de procedimento disponíveis
const procedimentos = [
  {
    id: "pixelbrows",
    nome: "Pixelbrows",
    descricao: "Técnica de sobrancelhas com efeito natural pixel a pixel",
    icon: Sparkles,
  },
  {
    id: "nanoblading",
    nome: "Nanoblading",
    descricao: "Fios hiper-realistas com agulha nano para um resultado subtil",
    icon: Pen,
  },
  {
    id: "labios",
    nome: "Micropigmentação de Lábios",
    descricao: "Contorno e preenchimento labial com cor natural e duradoura",
    icon: Heart,
  },
] as const

export type TipoProcedimento = (typeof procedimentos)[number]["id"]

interface MenuPrincipalProps {
  onSelecionar: (tipo: TipoProcedimento) => void
  onBaseClientes: () => void
}

export default function MenuPrincipal({ onSelecionar, onBaseClientes }: MenuPrincipalProps) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="w-full max-w-3xl">
        {/* Logo / Título */}
        <div className="flex flex-col items-center mb-12">
          <h1 className="text-4xl md:text-5xl font-display font-bold text-foreground tracking-tight mb-3">
            Micropigmentação
          </h1>
          <p className="text-center text-xs font-body font-semibold tracking-[0.35em] uppercase text-accent mb-6">
            Consulta de Avaliação
          </p>
          <div className="hr-diamond w-32">
            <div className="diamond" />
          </div>
        </div>

        {/* Seleção de procedimento */}
        <p className="text-center text-[10px] font-body font-semibold tracking-[0.2em] uppercase text-muted-foreground mb-8">
          Selecione o tipo de procedimento
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {procedimentos.map((proc) => {
            const Icon = proc.icon
            return (
              <button
                key={proc.id}
                onClick={() => onSelecionar(proc.id)}
                className="bg-card rounded-lg border border-border p-8 md:p-10 card-elevated corner-ornament text-left group cursor-pointer transition-all duration-300 hover:border-accent/30"
              >
                <div className="flex flex-col items-center text-center gap-5">
                  <div className="w-14 h-14 rounded-full bg-accent/8 border border-accent/15 flex items-center justify-center group-hover:bg-accent/15 transition-colors">
                    <Icon className="w-6 h-6 text-accent" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h2 className="text-xl font-display font-bold text-foreground tracking-tight mb-2">
                      {proc.nome}
                    </h2>
                    <p className="text-[11px] font-body text-muted-foreground leading-relaxed">
                      {proc.descricao}
                    </p>
                  </div>
                </div>
              </button>
            )
          })}
        </div>

        {/* Acesso à base de clientes */}
        <div className="flex justify-center mt-12">
          <button
            onClick={onBaseClientes}
            className="flex items-center gap-2 text-muted-foreground/60 hover:text-accent transition-colors"
          >
            <Users className="w-3.5 h-3.5" strokeWidth={1.5} />
            <span className="text-[10px] font-body font-medium tracking-[0.15em] uppercase">
              Base de Clientes
            </span>
          </button>
        </div>

        {/* Footer */}
        <div className="hr-diamond max-w-xs mx-auto mt-8 mb-8">
          <div className="diamond" />
        </div>
      </div>
    </div>
  )
}
