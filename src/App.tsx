import { useState } from "react"
import MenuPrincipal from "./pages/menu/MenuPrincipal"
import type { TipoProcedimento } from "./pages/menu/MenuPrincipal"
import ConsultaPage from "./pages/consulta/ConsultaPage"
import BaseClientes from "./pages/clientes/BaseClientes"

type Pagina = "menu" | "consulta" | "clientes"

function App() {
  const [pagina, setPagina] = useState<Pagina>("menu")
  const [procedimentoSelecionado, setProcedimentoSelecionado] =
    useState<TipoProcedimento | null>(null)

  const handleSelecionar = (tipo: TipoProcedimento) => {
    setProcedimentoSelecionado(tipo)
    setPagina("consulta")
  }

  if (pagina === "consulta" && procedimentoSelecionado) {
    return (
      <ConsultaPage
        tipo={procedimentoSelecionado}
        onVoltar={() => {
          setPagina("menu")
          setProcedimentoSelecionado(null)
        }}
      />
    )
  }

  if (pagina === "clientes") {
    return <BaseClientes onVoltar={() => setPagina("menu")} />
  }

  return (
    <MenuPrincipal
      onSelecionar={handleSelecionar}
      onBaseClientes={() => setPagina("clientes")}
    />
  )
}

export default App
