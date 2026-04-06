import { createContext, useContext, type ReactNode } from "react"
import { useClientes } from "./useClientes"

type ClientesContextType = ReturnType<typeof useClientes>

const ClientesContext = createContext<ClientesContextType | null>(null)

export function ClientesProvider({ children }: { children: ReactNode }) {
  const value = useClientes()
  return (
    <ClientesContext.Provider value={value}>
      {children}
    </ClientesContext.Provider>
  )
}

export function useClientesCtx() {
  const ctx = useContext(ClientesContext)
  if (!ctx) throw new Error("useClientesCtx deve ser usado dentro de ClientesProvider")
  return ctx
}
