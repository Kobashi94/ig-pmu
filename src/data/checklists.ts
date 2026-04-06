import type { TipoProcedimento } from "@/pages/menu/MenuPrincipal"

/** Tipos de campos possíveis na checklist */
export type CampoTipo = "texto" | "checkbox" | "opcoes" | "sim_nao" | "textarea" | "data_nascimento"

export interface CampoBase {
  id: string
  label: string
  tipo: CampoTipo
}

export interface CampoTexto extends CampoBase {
  tipo: "texto" | "textarea"
  placeholder?: string
}

export interface CampoCheckbox extends CampoBase {
  tipo: "checkbox"
  subCampos?: CampoBase[]
}

export interface CampoOpcoes extends CampoBase {
  tipo: "opcoes"
  opcoes: string[]
  multiplo?: boolean
}

export interface CampoSimNao extends CampoBase {
  tipo: "sim_nao"
}

export interface CampoDataNascimento extends CampoBase {
  tipo: "data_nascimento"
}

export type Campo = CampoTexto | CampoCheckbox | CampoOpcoes | CampoSimNao | CampoDataNascimento

export interface SecaoChecklist {
  numero: string
  titulo: string
  emoji: string
  campos: Campo[]
}

export interface ChecklistData {
  titulo: string
  seccoes: SecaoChecklist[]
}

export const checklists: Partial<Record<TipoProcedimento, ChecklistData>> = {
  labios: {
    titulo: "Checklist Profissional — Micro Labial",
    seccoes: [
      {
        numero: "1",
        titulo: "Identificação da Cliente",
        emoji: "",
        campos: [
          { id: "nome", label: "Nome", tipo: "texto", placeholder: "Nome completo" },
          { id: "data_nascimento", label: "Data de Nascimento", tipo: "data_nascimento" },
          { id: "contacto", label: "Contacto", tipo: "texto", placeholder: "Telefone ou email" },
          {
            id: "origem",
            label: "Como nos conheceu",
            tipo: "opcoes",
            opcoes: ["Instagram", "Google", "Recomendação", "Outro"],
            multiplo: false,
          },
          { id: "localidade", label: "Localidade", tipo: "texto", placeholder: "Cidade ou zona" },
        ],
      },
      {
        numero: "2",
        titulo: "Histórico Clínico",
        emoji: "",
        campos: [
          {
            id: "micro_anterior",
            label: "Já fez micropigmentação labial",
            tipo: "checkbox",
            subCampos: [
              { id: "micro_anterior_quando", label: "Quando", tipo: "texto", placeholder: "Data aproximada" },
              { id: "micro_anterior_cor", label: "Cor atual", tipo: "texto", placeholder: "Descrever a cor" },
              { id: "micro_anterior_satisfacao", label: "Satisfação", tipo: "texto", placeholder: "Nível de satisfação" },
            ],
          },
          {
            id: "preenchimento_ah",
            label: "Preenchimento com ácido hialurónico",
            tipo: "checkbox",
            subCampos: [
              { id: "preenchimento_ah_data", label: "Data da última aplicação", tipo: "texto", placeholder: "Data aproximada" },
            ],
          },
          { id: "herpes", label: "Histórico de herpes labial", tipo: "sim_nao" },
          {
            id: "alergias",
            label: "Alergias conhecidas",
            tipo: "checkbox",
            subCampos: [
              { id: "alergias_quais", label: "Quais", tipo: "texto", placeholder: "Descrever alergias" },
            ],
          },
          {
            id: "medicacao",
            label: "Medicação atual",
            tipo: "checkbox",
            subCampos: [
              { id: "medicacao_qual", label: "Qual", tipo: "texto", placeholder: "Descrever medicação" },
            ],
          },
          {
            id: "tendencia",
            label: "Tendência a",
            tipo: "opcoes",
            opcoes: ["Cicatrização lenta", "Hiperpigmentação"],
            multiplo: true,
          },
        ],
      },
      {
        numero: "3",
        titulo: "Expectativa da Cliente",
        emoji: "",
        campos: [
          {
            id: "objetivo",
            label: "Objetivo principal",
            tipo: "opcoes",
            opcoes: ["Natural", "Mais definido", "Mais vermelho", "Neutralização", "Correção de assimetria"],
            multiplo: false,
          },
          { id: "objetivo_notas", label: "Notas sobre o objetivo", tipo: "texto", placeholder: "Descrever o que a cliente pretende" },
          { id: "referencia_visual", label: "Referência visual", tipo: "sim_nao" },
          { id: "referencia_notas", label: "Notas sobre referência", tipo: "texto", placeholder: "Descrever referência" },
          { id: "expectativa_realista", label: "Expectativa realista", tipo: "sim_nao" },
        ],
      },
      {
        numero: "4",
        titulo: "Análise do Lábio — Leitura Técnica",
        emoji: "",
        campos: [
          {
            id: "cor_base",
            label: "Cor base",
            tipo: "opcoes",
            opcoes: ["Muito claro", "Rosa claro", "Rosa médio", "Escuro por melanina", "Arroxeado", "Manchado"],
            multiplo: false,
          },
          {
            id: "subtom",
            label: "Subtom",
            tipo: "opcoes",
            opcoes: ["Quente", "Neutro", "Frio"],
            multiplo: false,
          },
          {
            id: "uniformidade",
            label: "Uniformidade",
            tipo: "opcoes",
            opcoes: ["Uniforme", "Diferença sup vs inf", "Manchas localizadas", "Despigmentação"],
            multiplo: false,
          },
          {
            id: "vascularizacao",
            label: "Vascularização",
            tipo: "opcoes",
            opcoes: ["Boa", "Reduzida", "Excesso de rosa"],
            multiplo: false,
          },
          {
            id: "estrutura",
            label: "Estrutura",
            tipo: "opcoes",
            opcoes: ["Lábio fino", "Lábio médio", "Lábio volumoso", "Arco do cupido definido", "Assimetria"],
            multiplo: true,
          },
          {
            id: "condicao_pele",
            label: "Condição da pele",
            tipo: "opcoes",
            opcoes: ["Hidratado", "Seco", "Com fissuras", "Com cicatrizes", "Glândulas de Fordyce"],
            multiplo: true,
          },
        ],
      },
      {
        numero: "5",
        titulo: "Diagnóstico Técnico",
        emoji: "",
        campos: [
          {
            id: "abordagem",
            label: "Tipo de abordagem",
            tipo: "opcoes",
            opcoes: ["Natural / equalização", "Neutralização", "Correção de cor", "Rejuvenescimento"],
            multiplo: false,
          },
          {
            id: "dificuldade",
            label: "Nível de dificuldade",
            tipo: "opcoes",
            opcoes: ["Baixo", "Médio", "Alto"],
            multiplo: false,
          },
        ],
      },
      {
        numero: "6",
        titulo: "Escolha de Cor",
        emoji: "",
        campos: [
          { id: "base_cor", label: "Base escolhida", tipo: "texto", placeholder: "Nome da cor" },
          {
            id: "correcao_necessaria",
            label: "Correção necessária",
            tipo: "checkbox",
            subCampos: [
              { id: "correcao_qual", label: "Qual", tipo: "texto", placeholder: "Descrever correção" },
            ],
          },
          { id: "mistura", label: "Mistura definida", tipo: "texto", placeholder: "Descrever mistura" },
        ],
      },
      {
        numero: "7",
        titulo: "Anestesia",
        emoji: "",
        campos: [
          { id: "anestesia", label: "Anestesia", tipo: "sim_nao" },
          { id: "anestesia_tempo", label: "Tempo aplicado", tipo: "texto", placeholder: "Minutos" },
        ],
      },
      {
        numero: "8",
        titulo: "Configuração Técnica",
        emoji: "",
        campos: [
          { id: "agulha", label: "Agulha", tipo: "texto", placeholder: "Tipo e tamanho da agulha" },
          { id: "anotacoes", label: "Anotações importantes", tipo: "textarea", placeholder: "Observações técnicas relevantes" },
        ],
      },
      {
        numero: "9",
        titulo: "Protocolo de Sessões",
        emoji: "",
        campos: [
          { id: "num_sessoes", label: "Nº estimado de sessões", tipo: "texto", placeholder: "Ex: 2" },
          { id: "intervalo", label: "Intervalo recomendado", tipo: "texto", placeholder: "Ex: 30 dias" },
        ],
      },
      {
        numero: "10",
        titulo: "Informação à Cliente",
        emoji: "",
        campos: [
          { id: "info_escurecer", label: "Pode escurecer no pós imediato", tipo: "checkbox" },
          { id: "info_resultado", label: "Resultado não é final na 1ª sessão", tipo: "checkbox" },
          { id: "info_retoque", label: "Necessidade de retoque", tipo: "checkbox" },
          { id: "info_cuidados_pos", label: "Cuidados pós", tipo: "checkbox" },
          { id: "info_cuidados_pre", label: "Cuidados pré", tipo: "checkbox" },
        ],
      },
    ],
  },
  nanoblading: {
    titulo: "Checklist Profissional — Nanoblading",
    seccoes: [
      {
        numero: "1",
        titulo: "Identificação da Cliente",
        emoji: "",
        campos: [
          { id: "nome", label: "Nome", tipo: "texto", placeholder: "Nome completo" },
          { id: "data_nascimento", label: "Data de Nascimento", tipo: "data_nascimento" },
          { id: "contacto", label: "Contacto", tipo: "texto", placeholder: "Telefone ou email" },
          {
            id: "origem",
            label: "Como nos conheceu",
            tipo: "opcoes",
            opcoes: ["Instagram", "Google", "Recomendação", "Outro"],
            multiplo: false,
          },
          { id: "localidade", label: "Localidade", tipo: "texto", placeholder: "Cidade ou zona" },
        ],
      },
      {
        numero: "2",
        titulo: "Histórico Clínico",
        emoji: "",
        campos: [
          {
            id: "micro_anterior",
            label: "Já fez micropigmentação de sobrancelhas",
            tipo: "checkbox",
            subCampos: [
              { id: "micro_anterior_tecnica", label: "Técnica", tipo: "texto", placeholder: "Técnica utilizada" },
              { id: "micro_anterior_quando", label: "Quando", tipo: "texto", placeholder: "Data aproximada" },
              { id: "micro_anterior_cor", label: "Cor atual", tipo: "texto", placeholder: "Descrever a cor" },
            ],
          },
          { id: "remocao", label: "Já fez remoção (laser)", tipo: "checkbox" },
          {
            id: "preenchimentos_zona",
            label: "Preenchimentos na zona",
            tipo: "checkbox",
            subCampos: [
              { id: "preenchimentos_tempo", label: "Há quanto tempo", tipo: "texto", placeholder: "Ex: 6 meses" },
            ],
          },
          {
            id: "doencas_pele",
            label: "Doenças de pele (dermatite, psoríase, etc.)",
            tipo: "checkbox",
            subCampos: [
              { id: "doencas_pele_quais", label: "Quais", tipo: "texto", placeholder: "Descrever" },
            ],
          },
          {
            id: "alergias",
            label: "Alergias conhecidas",
            tipo: "checkbox",
            subCampos: [
              { id: "alergias_quais", label: "Quais", tipo: "texto", placeholder: "Descrever alergias" },
            ],
          },
          {
            id: "tendencia",
            label: "Tendência a",
            tipo: "opcoes",
            opcoes: ["Oleosidade", "Pele sensível", "Má cicatrização", "Hiperpigmentação"],
            multiplo: true,
          },
          {
            id: "medicacao",
            label: "Medicação atual",
            tipo: "checkbox",
            subCampos: [
              { id: "medicacao_qual", label: "Qual", tipo: "texto", placeholder: "Descrever medicação" },
            ],
          },
        ],
      },
      {
        numero: "3",
        titulo: "Expectativa da Cliente",
        emoji: "",
        campos: [
          {
            id: "objetivo",
            label: "Objetivo",
            tipo: "opcoes",
            opcoes: ["Natural (efeito pelo)", "Mais preenchida", "Correção de falhas", "Redesenho total"],
            multiplo: false,
          },
          { id: "referencias", label: "Referências", tipo: "sim_nao" },
          { id: "aceita_naturalidade", label: "Aceita naturalidade vs perfeição", tipo: "sim_nao" },
        ],
      },
      {
        numero: "4",
        titulo: "Análise da Pele",
        emoji: "",
        campos: [
          {
            id: "tipo_pele",
            label: "Tipo de pele",
            tipo: "opcoes",
            opcoes: ["Seca", "Normal", "Mista", "Oleosa"],
            multiplo: false,
          },
          {
            id: "textura",
            label: "Textura",
            tipo: "opcoes",
            opcoes: ["Fina", "Média", "Grossa"],
            multiplo: false,
          },
          {
            id: "condicao",
            label: "Condição",
            tipo: "opcoes",
            opcoes: ["Poros visíveis", "Cicatrizes", "Linhas de expressão", "Pele flácida"],
            multiplo: true,
          },
          {
            id: "elasticidade",
            label: "Elasticidade",
            tipo: "opcoes",
            opcoes: ["Boa", "Reduzida"],
            multiplo: false,
          },
        ],
      },
      {
        numero: "5",
        titulo: "Análise do Pelo Natural",
        emoji: "",
        campos: [
          {
            id: "densidade_pelo",
            label: "Densidade",
            tipo: "opcoes",
            opcoes: ["Baixa", "Média", "Alta"],
            multiplo: false,
          },
          {
            id: "direcao_pelo",
            label: "Direção do crescimento",
            tipo: "opcoes",
            opcoes: ["Uniforme", "Irregular", "Cruzada"],
            multiplo: false,
          },
          {
            id: "espessura_pelo",
            label: "Espessura",
            tipo: "opcoes",
            opcoes: ["Fina", "Média", "Grossa"],
            multiplo: false,
          },
          {
            id: "cor_pelo",
            label: "Cor natural",
            tipo: "opcoes",
            opcoes: ["Clara", "Média", "Escura"],
            multiplo: false,
          },
        ],
      },
      {
        numero: "6",
        titulo: "Design",
        emoji: "",
        campos: [
          { id: "design_completo", label: "Design desenhado completo", tipo: "checkbox" },
          { id: "cliente_validou", label: "Cliente validou sentada", tipo: "checkbox" },
          { id: "correcoes_feitas", label: "Correções feitas", tipo: "checkbox" },
        ],
      },
      {
        numero: "7",
        titulo: "Estratégia de Execução",
        emoji: "",
        campos: [
          {
            id: "tecnica",
            label: "Técnica",
            tipo: "opcoes",
            opcoes: ["Nanoblading clássico", "Nano híbrido", "Combo"],
            multiplo: false,
          },
          {
            id: "direcao_tracos",
            label: "Direção dos traços",
            tipo: "opcoes",
            opcoes: ["Segue pelo natural", "Corrige direção", "Cria estrutura nova"],
            multiplo: false,
          },
          {
            id: "pressao",
            label: "Pressão",
            tipo: "opcoes",
            opcoes: ["Muito leve", "Controlada"],
            multiplo: false,
          },
          {
            id: "profundidade",
            label: "Profundidade",
            tipo: "opcoes",
            opcoes: ["Superficial", "Ajustada ao tecido"],
            multiplo: false,
          },
        ],
      },
      {
        numero: "8",
        titulo: "Configuração Técnica",
        emoji: "",
        campos: [
          { id: "agulha", label: "Agulha", tipo: "texto", placeholder: "Tipo e tamanho da agulha" },
        ],
      },
      {
        numero: "9",
        titulo: "Cor",
        emoji: "",
        campos: [
          { id: "cor", label: "Cor", tipo: "texto", placeholder: "Descrever cor escolhida" },
        ],
      },
      {
        numero: "10",
        titulo: "Protocolo de Retoque",
        emoji: "",
        campos: [
          { id: "intervalo", label: "Intervalo", tipo: "texto", placeholder: "Ex: 30 dias" },
          { id: "necessidade", label: "Necessidade prevista", tipo: "texto", placeholder: "Descrever" },
        ],
      },
      {
        numero: "11",
        titulo: "Informação à Cliente",
        emoji: "",
        campos: [
          { id: "info_clarear", label: "Vai clarear", tipo: "checkbox" },
          { id: "info_perder_tracos", label: "Pode perder alguns traços", tipo: "checkbox" },
          { id: "info_retoque", label: "Retoque necessário", tipo: "checkbox" },
          { id: "info_cuidados_pos", label: "Cuidados pós", tipo: "checkbox" },
          { id: "info_cuidados_pre", label: "Cuidados pré", tipo: "checkbox" },
        ],
      },
    ],
  },
  pixelbrows: {
    titulo: "Checklist Profissional — Pixelbrows",
    seccoes: [
      {
        numero: "1",
        titulo: "Identificação",
        emoji: "",
        campos: [
          { id: "nome", label: "Nome", tipo: "texto", placeholder: "Nome completo" },
          { id: "data_nascimento", label: "Data de Nascimento", tipo: "data_nascimento" },
          { id: "contacto", label: "Contacto", tipo: "texto", placeholder: "Telefone ou email" },
          {
            id: "origem",
            label: "Como nos conheceu",
            tipo: "opcoes",
            opcoes: ["Instagram", "Google", "Recomendação", "Outro"],
            multiplo: false,
          },
          { id: "localidade", label: "Localidade", tipo: "texto", placeholder: "Cidade ou zona" },
        ],
      },
      {
        numero: "2",
        titulo: "Histórico Clínico",
        emoji: "",
        campos: [
          {
            id: "micro_anterior",
            label: "Já fez micropigmentação",
            tipo: "checkbox",
            subCampos: [
              { id: "micro_anterior_tecnica", label: "Técnica", tipo: "texto", placeholder: "Técnica utilizada" },
              { id: "micro_anterior_cor", label: "Cor atual", tipo: "texto", placeholder: "Descrever a cor" },
              { id: "micro_anterior_ano", label: "Ano", tipo: "texto", placeholder: "Ano" },
            ],
          },
          { id: "remocao", label: "Remoção anterior (laser)", tipo: "checkbox" },
          {
            id: "preenchimentos_zona",
            label: "Preenchimentos na zona",
            tipo: "checkbox",
            subCampos: [
              { id: "preenchimentos_tempo", label: "Há quanto tempo", tipo: "texto", placeholder: "Ex: 6 meses" },
            ],
          },
          {
            id: "doencas_pele",
            label: "Doenças de pele",
            tipo: "checkbox",
            subCampos: [
              { id: "doencas_pele_quais", label: "Quais", tipo: "texto", placeholder: "Descrever" },
            ],
          },
          {
            id: "alergias",
            label: "Alergias conhecidas",
            tipo: "checkbox",
            subCampos: [
              { id: "alergias_quais", label: "Quais", tipo: "texto", placeholder: "Descrever alergias" },
            ],
          },
          {
            id: "medicacao",
            label: "Medicação",
            tipo: "checkbox",
            subCampos: [
              { id: "medicacao_qual", label: "Qual", tipo: "texto", placeholder: "Descrever medicação" },
            ],
          },
          { id: "gravidez", label: "Gravidez / amamentação", tipo: "checkbox" },
          {
            id: "tendencia",
            label: "Tendência a",
            tipo: "opcoes",
            opcoes: ["Oleosidade", "Hiperpigmentação", "Má cicatrização"],
            multiplo: true,
          },
        ],
      },
      {
        numero: "3",
        titulo: "Expectativa",
        emoji: "",
        campos: [
          {
            id: "objetivo",
            label: "Objetivo",
            tipo: "opcoes",
            opcoes: ["Natural suave", "Maquilhado leve", "Maquilhado definido"],
            multiplo: false,
          },
          {
            id: "intensidade",
            label: "Intensidade desejada",
            tipo: "opcoes",
            opcoes: ["Muito suave", "Médio", "Marcado"],
            multiplo: false,
          },
          { id: "aceita_progressivo", label: "Aceita resultado progressivo", tipo: "sim_nao" },
        ],
      },
      {
        numero: "4",
        titulo: "Análise da Pele",
        emoji: "",
        campos: [
          {
            id: "tipo_pele",
            label: "Tipo de pele",
            tipo: "opcoes",
            opcoes: ["Seca", "Normal", "Mista", "Oleosa"],
            multiplo: false,
          },
          {
            id: "textura",
            label: "Textura",
            tipo: "opcoes",
            opcoes: ["Lisa", "Porosa", "Espessa", "Fina"],
            multiplo: false,
          },
          {
            id: "condicao",
            label: "Condição",
            tipo: "opcoes",
            opcoes: ["Sensível", "Vermelhidão", "Acne", "Cicatrizes"],
            multiplo: true,
          },
        ],
      },
      {
        numero: "5",
        titulo: "Análise do Pelo Natural",
        emoji: "",
        campos: [
          {
            id: "densidade_pelo",
            label: "Densidade",
            tipo: "opcoes",
            opcoes: ["Baixa", "Média", "Alta"],
            multiplo: false,
          },
          {
            id: "cor_pelo",
            label: "Cor",
            tipo: "opcoes",
            opcoes: ["Clara", "Média", "Escura"],
            multiplo: false,
          },
          {
            id: "direcao_pelo",
            label: "Direção",
            tipo: "opcoes",
            opcoes: ["Uniforme", "Irregular"],
            multiplo: false,
          },
        ],
      },
      {
        numero: "6",
        titulo: "Design",
        emoji: "",
        campos: [
          { id: "desenho_completo", label: "Desenho completo feito", tipo: "checkbox" },
          { id: "validado_sentada", label: "Validado sentada", tipo: "checkbox" },
          { id: "ajustes_realizados", label: "Ajustes realizados", tipo: "checkbox" },
        ],
      },
      {
        numero: "7",
        titulo: "Estratégia de Sombreado",
        emoji: "",
        campos: [
          {
            id: "efeito",
            label: "Efeito",
            tipo: "opcoes",
            opcoes: ["Translúcido (pixel leve)", "Médio", "Compacto"],
            multiplo: false,
          },
          {
            id: "gradiente",
            label: "Gradiente",
            tipo: "opcoes",
            opcoes: ["Início suave", "Corpo médio", "Cauda mais definida"],
            multiplo: true,
          },
        ],
      },
      {
        numero: "8",
        titulo: "Configuração Técnica",
        emoji: "",
        campos: [
          { id: "velocidade", label: "Velocidade da máquina", tipo: "texto", placeholder: "Velocidade" },
          {
            id: "agulha",
            label: "Agulha",
            tipo: "opcoes",
            opcoes: ["1RL", "3RL", "5RL"],
            multiplo: false,
          },
          { id: "agulha_tamanho", label: "Tamanho da agulha", tipo: "texto", placeholder: "Ex: 0.25mm" },
          {
            id: "profundidade",
            label: "Profundidade",
            tipo: "opcoes",
            opcoes: ["Superficial", "Controlada"],
            multiplo: false,
          },
        ],
      },
      {
        numero: "9",
        titulo: "Cor",
        emoji: "",
        campos: [
          { id: "cor", label: "Cor", tipo: "texto", placeholder: "Descrever cor escolhida" },
        ],
      },
      {
        numero: "10",
        titulo: "Protocolo de Retoque",
        emoji: "",
        campos: [
          { id: "intervalo", label: "Intervalo", tipo: "texto", placeholder: "Ex: 30 dias" },
          { id: "necessidade", label: "Necessidade", tipo: "texto", placeholder: "Descrever" },
        ],
      },
      {
        numero: "11",
        titulo: "Informação à Cliente",
        emoji: "",
        campos: [
          { id: "info_clarear", label: "Vai clarear 30–40%", tipo: "checkbox" },
          { id: "info_intensidade", label: "Pode perder intensidade", tipo: "checkbox" },
          { id: "info_retoque", label: "Retoque necessário", tipo: "checkbox" },
          { id: "info_cuidados_pos", label: "Cuidados pós", tipo: "checkbox" },
          { id: "info_cuidados_pre", label: "Cuidados pré", tipo: "checkbox" },
        ],
      },
    ],
  },
}
