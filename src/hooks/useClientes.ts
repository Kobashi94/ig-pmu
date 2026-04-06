import { useState, useCallback, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import type { TipoProcedimento } from "@/pages/menu/MenuPrincipal"

export interface Cliente {
  id: string
  nome: string
  telefone: string | null
  email: string | null
  idade: string | null
  notas: string | null
  criado_em: string
}

export interface ChecklistGuardada {
  id: string
  cliente_id: string
  tipo_procedimento: TipoProcedimento
  dados: Record<string, unknown>
  criado_em: string
}

export function useClientes() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)

  // Carregar clientes
  const carregar = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from("clientes")
      .select("*")
      .order("criado_em", { ascending: false })
    setClientes(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { carregar() }, [carregar])

  // Criar cliente + checklist
  const criarCliente = useCallback(
    async (
      nome: string,
      contacto: string,
      idade: string,
      tipoProcedimento: TipoProcedimento,
      checklistDados: Record<string, unknown>
    ): Promise<Cliente | null> => {
      const { data: cliente, error } = await supabase
        .from("clientes")
        .insert({ nome, telefone: contacto, idade })
        .select()
        .single()

      if (error || !cliente) return null

      // Guardar checklist associada
      await supabase.from("checklists").insert({
        cliente_id: cliente.id,
        tipo_procedimento: tipoProcedimento,
        dados: checklistDados,
      })

      setClientes((prev) => [cliente, ...prev])
      return cliente
    },
    []
  )

  // Adicionar checklist a cliente existente
  const adicionarChecklist = useCallback(
    async (
      clienteId: string,
      tipoProcedimento: TipoProcedimento,
      dados: Record<string, unknown>
    ) => {
      await supabase.from("checklists").insert({
        cliente_id: clienteId,
        tipo_procedimento: tipoProcedimento,
        dados,
      })
    },
    []
  )

  // Obter cliente por id
  const obterCliente = useCallback(
    (id: string) => clientes.find((c) => c.id === id),
    [clientes]
  )

  // Obter checklists de um cliente
  const obterChecklists = useCallback(async (clienteId: string) => {
    const { data } = await supabase
      .from("checklists")
      .select("*")
      .eq("cliente_id", clienteId)
      .order("criado_em", { ascending: false })
    return (data || []) as ChecklistGuardada[]
  }, [])

  // Eliminar cliente
  const eliminarCliente = useCallback(async (id: string) => {
    await supabase.from("clientes").delete().eq("id", id)
    setClientes((prev) => prev.filter((c) => c.id !== id))
  }, [])

  return { clientes, loading, criarCliente, adicionarChecklist, obterCliente, obterChecklists, eliminarCliente, recarregar: carregar }
}
