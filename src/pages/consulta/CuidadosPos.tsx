import { Ban, AlertTriangle, Heart } from "lucide-react"
import type { TipoProcedimento } from "@/pages/menu/MenuPrincipal"
import { cuidadosPos, cuidadosPre } from "@/data/cuidados"
import type { CuidadoItem } from "@/data/cuidados"

interface CuidadosPosProps {
  tipo: TipoProcedimento
}

function CuidadoIcon({ icone }: { icone: CuidadoItem["icone"] }) {
  switch (icone) {
    case "proibido":
      return <Ban className="w-4 h-4 text-destructive/70 shrink-0" strokeWidth={1.5} />
    case "cuidado":
      return <AlertTriangle className="w-4 h-4 text-accent shrink-0" strokeWidth={1.5} />
    case "recomendado":
      return <Heart className="w-4 h-4 text-success-foreground shrink-0" strokeWidth={1.5} />
  }
}

function iconeLabel(icone: CuidadoItem["icone"]) {
  switch (icone) {
    case "proibido": return "Evitar"
    case "cuidado": return "Atenção"
    case "recomendado": return "Recomendado"
  }
}

export default function CuidadosPos({ tipo }: CuidadosPosProps) {
  const data = cuidadosPos[tipo]
  const dataPre = cuidadosPre[tipo]

  // Agrupar por tipo de ícone
  const recomendados = data.cuidados.filter((c) => c.icone === "recomendado")
  const cuidados = data.cuidados.filter((c) => c.icone === "cuidado")
  const proibidos = data.cuidados.filter((c) => c.icone === "proibido")

  const grupos = [
    { titulo: "Recomendações", itens: recomendados, icone: "recomendado" as const },
    { titulo: "Atenção", itens: cuidados, icone: "cuidado" as const },
    { titulo: "Evitar", itens: proibidos, icone: "proibido" as const },
  ].filter((g) => g.itens.length > 0)

  return (
    <div className="space-y-10">
      {/* Cuidados Pré */}
      {dataPre && (
        <>
          <div className="text-center">
            <p className="text-[9px] font-body font-semibold tracking-[0.4em] uppercase text-accent mb-3">
              Pré-Procedimento
            </p>
            <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground tracking-tight">
              {dataPre.titulo}
            </h2>
          </div>

          <div className="hr-diamond w-48 mx-auto"><div className="diamond" /></div>

          <div className="max-w-lg mx-auto">
            <div className="bg-card rounded-lg border border-border p-6 md:p-8 card-elevated corner-ornament">
              <div className="flex items-center gap-2 mb-6">
                <Heart className="w-4 h-4 text-success-foreground shrink-0" strokeWidth={1.5} />
                <p className="text-[10px] font-body font-semibold tracking-[0.2em] uppercase text-muted-foreground">
                  Recomendações
                </p>
              </div>
              <div className="space-y-4">
                {dataPre.cuidados.map((item, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-1 h-1 rounded-full bg-accent/40 mt-2 shrink-0" />
                    <p className="text-[12px] font-body text-foreground/80 leading-relaxed">
                      {item.texto}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="hr-diamond w-48 mx-auto"><div className="diamond" /></div>
        </>
      )}

      {/* Título Pós */}
      <div className="text-center">
        <p className="text-[9px] font-body font-semibold tracking-[0.4em] uppercase text-accent mb-3">
          Pós-Procedimento
        </p>
        <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground tracking-tight">
          {data.titulo}
        </h2>
        <p className="text-[11px] font-body text-muted-foreground mt-3 max-w-md mx-auto">
          Siga estas indicações para garantir os melhores resultados e cicatrização.
        </p>
      </div>

      <div className="hr-diamond w-48 mx-auto"><div className="diamond" /></div>

      {/* Grupos de cuidados */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {grupos.map((grupo) => (
          <div
            key={grupo.titulo}
            className="bg-card rounded-lg border border-border p-6 md:p-8 card-elevated corner-ornament"
          >
            <div className="flex items-center gap-2 mb-6">
              <CuidadoIcon icone={grupo.icone} />
              <p className="text-[10px] font-body font-semibold tracking-[0.2em] uppercase text-muted-foreground">
                {iconeLabel(grupo.icone)}
              </p>
            </div>

            <div className="space-y-4">
              {grupo.itens.map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-1 h-1 rounded-full bg-accent/40 mt-2 shrink-0" />
                  <p className="text-[12px] font-body text-foreground/80 leading-relaxed">
                    {item.texto}
                  </p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
