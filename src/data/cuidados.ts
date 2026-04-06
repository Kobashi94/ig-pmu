import type { TipoProcedimento } from "@/pages/menu/MenuPrincipal"

export interface CuidadoItem {
  texto: string
  icone: "proibido" | "cuidado" | "recomendado"
}

export interface CuidadosData {
  titulo: string
  cuidados: CuidadoItem[]
}

export const cuidadosPos: Record<TipoProcedimento, CuidadosData> = {
  labios: {
    titulo: "Cuidados P\u00f3s-Procedimento \u2014 L\u00e1bios",
    cuidados: [
      { texto: "Utilizar desde o 1\u00ba dia Cicaplast regularmente", icone: "recomendado" },
      { texto: "Evitar atividade f\u00edsica nos dois primeiros dias ap\u00f3s o procedimento", icone: "proibido" },
      { texto: "Lavar os l\u00e1bios ap\u00f3s cada refei\u00e7\u00e3o com um gel de PH neutro", icone: "recomendado" },
      { texto: "Caso tenha erup\u00e7\u00e3o de herpes, aplicar pomada Zovirax Duo na ferida", icone: "cuidado" },
      { texto: "Para preservar a sua micro labial, mantenha sempre os l\u00e1bios hidratados. Recomendo o b\u00e1lsamo reparador da Uriage", icone: "recomendado" },
      { texto: "Evitar beijos durante 3 dias", icone: "proibido" },
      { texto: "Evitar Sauna, Piscina, Praia e exposi\u00e7\u00e3o Solar na \u00e1rea pigmentada", icone: "proibido" },
      { texto: "\u00c9 proibido fumar por no m\u00ednimo 10 dias", icone: "proibido" },
      { texto: "N\u00e3o consumir bebidas alco\u00f3licas durante 7 dias", icone: "proibido" },
      { texto: "N\u00e3o co\u00e7ar ou arrancar as peles, faz parte do processo de cicatriza\u00e7\u00e3o", icone: "cuidado" },
      { texto: "N\u00e3o usar batom por 10 dias", icone: "proibido" },
      { texto: "Beber caf\u00e9 com palhinha nos primeiros 3 dias", icone: "cuidado" },
      { texto: "Nos primeiros 5 dias evitar: comidas muito pigmentadas (caril, a\u00e7a\u00ed, vinho tinto), comidas muito quentes, comidas \u00e1cidas ou picantes", icone: "proibido" },
    ],
  },
  nanoblading: {
    titulo: "Cuidados P\u00f3s-Procedimento \u2014 Nanoblading",
    cuidados: [
      { texto: "Higienizar com sabonete neutro no dia", icone: "recomendado" },
      { texto: "Utilizar a pomada de cicatriza\u00e7\u00e3o somente \u00e0 noite", icone: "recomendado" },
      { texto: "Evitar atividade f\u00edsica nos pr\u00f3ximos 7 dias", icone: "proibido" },
      { texto: "Em caso de comich\u00e3o, utilizar um algod\u00e3o e \u00e1gua gelada levemente", icone: "cuidado" },
      { texto: "Respeitar o per\u00edodo de cicatriza\u00e7\u00e3o", icone: "cuidado" },
      { texto: "N\u00e3o usar esfoliante nem \u00e1cidos na regi\u00e3o", icone: "proibido" },
      { texto: "N\u00e3o arrancar crostas", icone: "proibido" },
      { texto: "N\u00e3o co\u00e7ar nem tocar na regi\u00e3o", icone: "proibido" },
      { texto: "N\u00e3o ingerir \u00e1lcool e drogas no per\u00edodo de cicatriza\u00e7\u00e3o", icone: "proibido" },
      { texto: "Evitar \u00e1gua da piscina, mar e Sol", icone: "proibido" },
      { texto: "N\u00e3o lavar o rosto com \u00e1gua quente e n\u00e3o se expor a altas temperaturas", icone: "proibido" },
      { texto: "N\u00e3o passar maquilhagem por cima nos pr\u00f3ximos 15 dias", icone: "proibido" },
      { texto: "Beber bastante \u00e1gua", icone: "recomendado" },
    ],
  },
  pixelbrows: {
    titulo: "Cuidados P\u00f3s-Procedimento \u2014 Pixelbrows",
    cuidados: [
      { texto: "N\u00e3o molhar nas pr\u00f3ximas 24h", icone: "proibido" },
      { texto: "Utilizar a pomada de cicatriza\u00e7\u00e3o somente \u00e0 noite", icone: "recomendado" },
      { texto: "Evitar atividade f\u00edsica nos pr\u00f3ximos 7 dias", icone: "proibido" },
      { texto: "Em caso de comich\u00e3o, utilizar um algod\u00e3o e \u00e1gua gelada levemente", icone: "cuidado" },
      { texto: "Respeitar o per\u00edodo de cicatriza\u00e7\u00e3o", icone: "cuidado" },
      { texto: "N\u00e3o usar esfoliante nem \u00e1cidos na regi\u00e3o", icone: "proibido" },
      { texto: "N\u00e3o arrancar crostas", icone: "proibido" },
      { texto: "N\u00e3o co\u00e7ar nem tocar na regi\u00e3o", icone: "proibido" },
      { texto: "N\u00e3o ingerir \u00e1lcool e drogas no per\u00edodo de cicatriza\u00e7\u00e3o", icone: "proibido" },
      { texto: "Evitar \u00e1gua da piscina, mar e Sol", icone: "proibido" },
      { texto: "N\u00e3o lavar o rosto com \u00e1gua quente e n\u00e3o se expor a altas temperaturas", icone: "proibido" },
      { texto: "N\u00e3o passar maquilhagem por cima nos pr\u00f3ximos 15 dias", icone: "proibido" },
      { texto: "Beber bastante \u00e1gua", icone: "recomendado" },
    ],
  },
}

export const cuidadosPre: Partial<Record<TipoProcedimento, CuidadosData>> = {
  labios: {
    titulo: "Cuidados Pr\u00e9-Procedimento \u2014 L\u00e1bios",
    cuidados: [
      { texto: "Hidratar bem com Cicaplast Balm v\u00e1rias vezes ao dia", icone: "recomendado" },
      { texto: "\u00c0 noite colocar Cicaplast em pomada", icone: "recomendado" },
      { texto: "Esfoliar 2 dias antes", icone: "recomendado" },
      { texto: "Evitar beber caf\u00e9 antes do procedimento", icone: "proibido" },
    ],
  },
  nanoblading: {
    titulo: "Cuidados Pr\u00e9-Procedimento \u2014 Nanoblading",
    cuidados: [
      { texto: "Evitar beber caf\u00e9 antes do procedimento", icone: "proibido" },
    ],
  },
  pixelbrows: {
    titulo: "Cuidados Pr\u00e9-Procedimento \u2014 Pixelbrows",
    cuidados: [
      { texto: "Evitar beber caf\u00e9 antes do procedimento", icone: "proibido" },
    ],
  },
}
