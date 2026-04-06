import type { TipoProcedimento } from "@/pages/menu/MenuPrincipal"

export interface FaseInfo {
  dia: string
  reacao: string
  /** Opacidade da cor na ilustração (0-100) */
  intensidade: number
  /** Cor predominante nesta fase */
  tom: "intenso" | "escuro" | "descamando" | "claro" | "voltando" | "final"
}

export interface FlutuacoesData {
  titulo: string
  fases: FaseInfo[]
}

export const flutuacoes: Record<TipoProcedimento, FlutuacoesData> = {
  labios: {
    titulo: "Fases da Micro Labial",
    fases: [
      { dia: "1º Dia", reacao: "Que linda a cor! Parece que tenho batom!", intensidade: 100, tom: "intenso" },
      { dia: "2º Dia", reacao: "Está tão escuro e a minha boca está muito seca!", intensidade: 90, tom: "escuro" },
      { dia: "4º Dia", reacao: "Está a escamar e a cor está a desaparecer!", intensidade: 55, tom: "descamando" },
      { dia: "6º Dia", reacao: "Ficou sem cor e a minha boca está muito seca!", intensidade: 25, tom: "claro" },
      { dia: "8º Dia", reacao: "A cor está a voltar!", intensidade: 55, tom: "voltando" },
      { dia: "15º–30º Dia", reacao: "Ficou incrível! Amei o resultado!", intensidade: 75, tom: "final" },
    ],
  },
  nanoblading: {
    titulo: "Fases da Nanoblading",
    fases: [
      { dia: "1º Dia", reacao: "Amei! Estou linda!", intensidade: 100, tom: "intenso" },
      { dia: "2º Dia", reacao: "Está mais escura e um pouco torta!", intensidade: 90, tom: "escuro" },
      { dia: "4º Dia", reacao: "Está horrível, não acredito!", intensidade: 60, tom: "descamando" },
      { dia: "8º Dia", reacao: "Saiu a cor toda!", intensidade: 20, tom: "claro" },
      { dia: "15º Dia", reacao: "A cor voltou mas parece estar debotada!", intensidade: 50, tom: "voltando" },
      { dia: "30º Dia", reacao: "As minhas sobrancelhas estão lindas!", intensidade: 75, tom: "final" },
    ],
  },
  pixelbrows: {
    titulo: "Fases da Pixelbrows",
    fases: [
      { dia: "1º Dia", reacao: "Amei! Estou linda!", intensidade: 100, tom: "intenso" },
      { dia: "2º Dia", reacao: "Está mais escura e um pouco torta!", intensidade: 90, tom: "escuro" },
      { dia: "4º Dia", reacao: "Está horrível, não acredito!", intensidade: 60, tom: "descamando" },
      { dia: "8º Dia", reacao: "Saiu a cor toda!", intensidade: 20, tom: "claro" },
      { dia: "15º Dia", reacao: "A cor voltou mas parece estar debotada!", intensidade: 50, tom: "voltando" },
      { dia: "30º Dia", reacao: "As minhas sobrancelhas estão lindas!", intensidade: 75, tom: "final" },
    ],
  },
}
