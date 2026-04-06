import type { TipoProcedimento } from "@/pages/menu/MenuPrincipal"
import { flutuacoes } from "@/data/flutuacoes"
import IlustracaoLabios from "@/components/ui/IlustracaoLabios"
import IlustracaoSobrancelha from "@/components/ui/IlustracaoSobrancelha"

interface FlutuacoesCorProps {
  tipo: TipoProcedimento
}

export default function FlutuacoesCor({ tipo }: FlutuacoesCorProps) {
  const data = flutuacoes[tipo]
  const isLabios = tipo === "labios"

  return (
    <div className="space-y-10">
      {/* Título */}
      <div className="text-center">
        <p className="text-[9px] font-body font-semibold tracking-[0.4em] uppercase text-accent mb-3">
          Evolução da Cor
        </p>
        <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground tracking-tight">
          {data.titulo}
        </h2>
        <p className="text-[11px] font-body text-muted-foreground mt-3 max-w-md mx-auto">
          O processo de cicatrização é normal e esperado. A cor final estabiliza após o retoque.
        </p>
      </div>

      <div className="hr-diamond w-48 mx-auto"><div className="diamond" /></div>

      {/* Timeline de fases */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 md:gap-6">
        {data.fases.map((fase) => (
          <div
            key={fase.dia}
            className="bg-card rounded-lg border border-border p-5 card-elevated text-center"
          >
            {/* Dia */}
            <p className="text-[10px] font-body font-semibold tracking-[0.2em] uppercase text-accent mb-4">
              {fase.dia}
            </p>

            {/* Ilustração */}
            <div className="flex items-center justify-center h-16 mb-4">
              {isLabios ? (
                <IlustracaoLabios intensidade={fase.intensidade} className="w-20 h-16" />
              ) : (
                <IlustracaoSobrancelha intensidade={fase.intensidade} className="w-20 h-12" />
              )}
            </div>

            {/* Barra de intensidade */}
            <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden mb-4">
              <div
                className="h-full bg-accent rounded-full transition-all duration-500"
                style={{ width: `${fase.intensidade}%` }}
              />
            </div>

            {/* Reação */}
            <p className="text-[11px] font-body text-muted-foreground leading-relaxed italic">
              "{fase.reacao}"
            </p>
          </div>
        ))}
      </div>

      {/* Nota informativa */}
      <div className="bg-secondary/70 rounded-md p-5 border border-accent/8 max-w-2xl mx-auto">
        <p className="text-[9px] font-body font-semibold tracking-[0.2em] uppercase text-muted-foreground mb-3">
          Nota Importante
        </p>
        <p className="text-[12px] font-body text-muted-foreground leading-relaxed">
          Cada pele reage de forma diferente. As fases apresentadas são uma referência geral
          do processo de cicatrização. A cor definitiva só é visível após o retoque.
        </p>
      </div>
    </div>
  )
}
