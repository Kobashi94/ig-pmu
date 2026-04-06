import { useState, useRef, useCallback, useEffect } from "react"
import { Camera, Save, Undo2, Trash2, X, Download, Minimize2, RotateCw, UserCheck } from "lucide-react"
import type { TipoProcedimento } from "@/pages/menu/MenuPrincipal"
import { supabase } from "@/lib/supabase"

interface EstudoProps {
  tipo: TipoProcedimento
  clienteId?: string
  onFechar?: () => void
}

type Ferramenta = "lapis" | "borracha"

interface Ponto {
  x: number
  y: number
}

interface Traço {
  pontos: Ponto[]
  cor: string
  espessura: number
  ferramenta: Ferramenta
}

const CORES = [
  { nome: "Branco", valor: "#FFFFFF" },
  { nome: "Dourado", valor: "#BF9B3E" },
  { nome: "Vermelho", valor: "#C44B4B" },
  { nome: "Preto", valor: "#262626" },
  { nome: "Azul", valor: "#4B7CC4" },
]

const ESPESSURAS = [1, 2, 4, 6]

interface Transformacao {
  rotacao: number
  escala: number
  offsetX: number
  offsetY: number
}

export default function Estudo({ tipo, clienteId, onFechar }: EstudoProps) {
  const [foto, setFoto] = useState<string | null>(null)
  const [fullscreen, setFullscreen] = useState(false)
  const [tracos, setTracos] = useState<Traço[]>([])
  const [tracoAtual, setTracoAtual] = useState<Traço | null>(null)
  const [ferramenta, setFerramenta] = useState<Ferramenta>("lapis")
  const [corAtiva, setCorAtiva] = useState(CORES[0].valor) // Branco por defeito
  const [espessura, setEspessura] = useState(6) // Mais grosso por defeito
  const [streamAtivo, setStreamAtivo] = useState(false)
  const [guardadoMsg, setGuardadoMsg] = useState("")
  const [transformacao, setTransformacao] = useState<Transformacao>({ rotacao: 0, escala: 1, offsetX: 0, offsetY: 0 })

  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const inputCameraRef = useRef<HTMLInputElement>(null)
  const inputGaleriaRef = useRef<HTMLInputElement>(null)
  const ajusteAreaRef = useRef<HTMLDivElement>(null)

  // Refs para o state actual (acessível nos event listeners nativos)
  const tracosRef = useRef(tracos)
  tracosRef.current = tracos
  const ferramentaRef = useRef(ferramenta)
  ferramentaRef.current = ferramenta
  const corAtivaRef = useRef(corAtiva)
  corAtivaRef.current = corAtiva
  const espessuraRef = useRef(espessura)
  espessuraRef.current = espessura

  const tipoLabel = tipo === "labios" ? "Lábios" : "Sobrancelhas"

  // --- Câmara ---
  const iniciarCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1920 }, height: { ideal: 1080 } },
      })
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setStreamAtivo(true)
      }
    } catch {
      inputCameraRef.current?.click()
    }
  }, [])

  const pararCamera = useCallback(() => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream
      stream.getTracks().forEach((t) => t.stop())
      videoRef.current.srcObject = null
      setStreamAtivo(false)
    }
  }, [])

  const capturarFoto = useCallback(() => {
    if (!videoRef.current) return
    const c = document.createElement("canvas")
    c.width = videoRef.current.videoWidth
    c.height = videoRef.current.videoHeight
    c.getContext("2d")?.drawImage(videoRef.current, 0, 0)
    setFoto(c.toDataURL("image/jpeg", 0.9))
    pararCamera()
    setTransformacao({ rotacao: 0, escala: 1, offsetX: 0, offsetY: 0 })
    setFullscreen(true)
  }, [pararCamera])

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      setFoto(reader.result as string)
      setTransformacao({ rotacao: 0, escala: 1, offsetX: 0, offsetY: 0 })
      setFullscreen(true)
    }
    reader.readAsDataURL(file)
  }

  useEffect(() => { return () => pararCamera() }, [pararCamera])

  // --- Guardar na galeria ---
  const guardarNaGaleria = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.toBlob((blob) => {
      if (!blob) return
      if (navigator.share && navigator.canShare) {
        const file = new File([blob], `estudo-${Date.now()}.jpg`, { type: "image/jpeg" })
        if (navigator.canShare({ files: [file] })) {
          navigator.share({ files: [file] }).catch(() => downloadBlob(blob))
          return
        }
      }
      downloadBlob(blob)
    }, "image/jpeg", 0.95)
  }, [])

  // Guardar foto no perfil da cliente (Supabase Storage + tabela fotos)
  const guardarNoPerfil = useCallback(async () => {
    const canvas = canvasRef.current
    if (!canvas || !clienteId) return

    canvas.toBlob(async (blob) => {
      if (!blob) return

      const path = `clientes/${clienteId}/estudo_${Date.now()}.jpg`
      const { error: uploadError } = await supabase.storage.from("fotos").upload(path, blob)
      if (uploadError) {
        setGuardadoMsg("Erro ao guardar")
        setTimeout(() => setGuardadoMsg(""), 2000)
        return
      }

      const { data: urlData } = supabase.storage.from("fotos").getPublicUrl(path)

      await supabase.from("fotos").insert({
        cliente_id: clienteId,
        url: urlData.publicUrl,
        tipo: "estudo",
      })

      setGuardadoMsg("Guardado no perfil!")
      setTimeout(() => setGuardadoMsg(""), 2000)
    }, "image/jpeg", 0.95)
  }, [clienteId])

  const downloadBlob = (blob: Blob) => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `estudo-${Date.now()}.jpg`
    a.click()
    URL.revokeObjectURL(url)
    setGuardadoMsg("Foto guardada!")
    setTimeout(() => setGuardadoMsg(""), 2000)
  }

  // --- Rodar 90° com botão ---
  const rodar90 = () => {
    setTransformacao((prev) => {
      const snap = Math.round(prev.rotacao / 90) * 90
      return { ...prev, rotacao: snap + 90 }
    })
  }

  const resetTransformacao = () => {
    setTransformacao({ rotacao: 0, escala: 1, offsetX: 0, offsetY: 0 })
  }

  // Ref para transformação actual (acessível nos event listeners sem re-montar)
  const transformRef = useRef(transformacao)
  transformRef.current = transformacao

  // Converter coordenadas do ecrã para canvas (usa refs, calcula a partir do container)
  const screenToCanvasRef = useCallback((screenX: number, screenY: number): Ponto | null => {
    const canvas = canvasRef.current
    const container = ajusteAreaRef.current
    if (!canvas || !container) return null

    const t = transformRef.current
    const cr = container.getBoundingClientRect()

    // Tamanho natural do canvas no ecrã (max-w-full max-h-full = object-fit contain)
    const canvasAspect = canvas.width / canvas.height
    const containerAspect = cr.width / cr.height
    let displayW: number, displayH: number
    if (canvasAspect > containerAspect) {
      displayW = cr.width
      displayH = cr.width / canvasAspect
    } else {
      displayH = cr.height
      displayW = cr.height * canvasAspect
    }

    // Centro do canvas no ecrã (antes de qualquer transform)
    const cx = cr.left + cr.width / 2
    const cy = cr.top + cr.height / 2

    // CSS transform: translate(offset) rotate(rot) scale(esc)
    // Inversa: un-translate → un-rotate → un-scale
    let dx = screenX - cx - t.offsetX
    let dy = screenY - cy - t.offsetY

    // Inversa da rotação
    const rad = -(t.rotacao * Math.PI) / 180
    const rx = dx * Math.cos(rad) - dy * Math.sin(rad)
    const ry = dx * Math.sin(rad) + dy * Math.cos(rad)

    // Inversa da escala
    const ux = rx / t.escala
    const uy = ry / t.escala

    // Converter de display pixels para canvas pixels
    return {
      x: (ux / displayW) * canvas.width + canvas.width / 2,
      y: (uy / displayH) * canvas.height + canvas.height / 2,
    }
  }, [])

  // --- Refs para o estado dos gestos (persistem entre re-renders) ---
  const gestoRef = useRef({
    modo: "nenhum" as "nenhum" | "desenhar" | "transformar",
    lastDist: 0,
    lastAngle: 0,
    lastX: 0,
    lastY: 0,
    tracoTemp: null as Traço | null,
    mouseAtivo: false,
    mouseTraco: null as Traço | null,
  })

  // --- Gestos unificados (montados UMA vez quando entra em fullscreen) ---
  useEffect(() => {
    const el = ajusteAreaRef.current
    if (!el || !fullscreen || !foto) return

    const g = gestoRef.current

    const getAngle = (t1: Touch, t2: Touch) =>
      Math.atan2(t2.clientY - t1.clientY, t2.clientX - t1.clientX) * (180 / Math.PI)

    const getDist = (t1: Touch, t2: Touch) =>
      Math.sqrt((t1.clientX - t2.clientX) ** 2 + (t1.clientY - t2.clientY) ** 2)

    const onTouchStart = (e: TouchEvent) => {
      e.preventDefault()
      e.stopPropagation()

      if (e.touches.length >= 2) {
        if (g.modo === "desenhar") {
          g.tracoTemp = null
          setTracoAtual(null)
        }
        g.modo = "transformar"
        g.lastDist = getDist(e.touches[0], e.touches[1])
        g.lastAngle = getAngle(e.touches[0], e.touches[1])
        return
      }

      g.modo = "desenhar"
      const pos = screenToCanvasRef(e.touches[0].clientX, e.touches[0].clientY)
      if (!pos) return
      const fer = ferramentaRef.current
      g.tracoTemp = {
        pontos: [pos],
        cor: fer === "borracha" ? "eraser" : corAtivaRef.current,
        espessura: fer === "borracha" ? espessuraRef.current * 4 : espessuraRef.current,
        ferramenta: fer,
      }
      setTracoAtual({ ...g.tracoTemp })
    }

    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault()
      e.stopPropagation()

      if (e.touches.length >= 2 && g.modo === "transformar") {
        const dist = getDist(e.touches[0], e.touches[1])
        const angle = getAngle(e.touches[0], e.touches[1])
        const scaleDelta = (dist - g.lastDist) * 0.005
        const angleDelta = angle - g.lastAngle
        g.lastDist = dist
        g.lastAngle = angle

        setTransformacao((prev) => ({
          ...prev,
          escala: Math.max(0.3, Math.min(5, prev.escala + scaleDelta)),
          rotacao: prev.rotacao + angleDelta,
        }))
        return
      }

      if (e.touches.length === 1 && g.modo === "transformar") {
        const dx = e.touches[0].clientX - g.lastX
        const dy = e.touches[0].clientY - g.lastY
        g.lastX = e.touches[0].clientX
        g.lastY = e.touches[0].clientY
        setTransformacao((prev) => ({
          ...prev,
          offsetX: prev.offsetX + dx,
          offsetY: prev.offsetY + dy,
        }))
        return
      }

      if (g.modo === "desenhar" && g.tracoTemp) {
        const raw = screenToCanvasRef(e.touches[0].clientX, e.touches[0].clientY)
        if (!raw) return
        const pts = g.tracoTemp.pontos
        const ultimo = pts[pts.length - 1]
        if (Math.sqrt((raw.x - ultimo.x) ** 2 + (raw.y - ultimo.y) ** 2) < 3) return

        // Suavizar: média ponderada entre o ponto raw e o último (amortecimento)
        const smooth = 0.35
        const pos = {
          x: ultimo.x + (raw.x - ultimo.x) * smooth,
          y: ultimo.y + (raw.y - ultimo.y) * smooth,
        }
        pts.push(pos)
        setTracoAtual({ ...g.tracoTemp, pontos: [...pts] })
      }

      g.lastX = e.touches[0].clientX
      g.lastY = e.touches[0].clientY
    }

    const onTouchEnd = (e: TouchEvent) => {
      if (e.touches.length === 0) {
        if (g.modo === "desenhar" && g.tracoTemp && g.tracoTemp.pontos.length > 1) {
          const finalTraco = { ...g.tracoTemp, pontos: [...g.tracoTemp.pontos] }
          setTracos((prev) => [...prev, finalTraco])
        }
        if (g.modo === "transformar") {
          setTransformacao((prev) => {
            const snaps = [0, 90, 180, 270, 360, -90, -180, -270, -360]
            for (const s of snaps) {
              if (Math.abs(prev.rotacao - s) < 8) return { ...prev, rotacao: s }
            }
            return prev
          })
        }
        g.tracoTemp = null
        setTracoAtual(null)
        g.modo = "nenhum"
      } else if (e.touches.length === 1 && g.modo === "transformar") {
        g.lastX = e.touches[0].clientX
        g.lastY = e.touches[0].clientY
      }
    }

    // Mouse: desenhar (desktop)
    const onMouseDown = (e: MouseEvent) => {
      g.mouseAtivo = true
      const canvas = canvasRef.current
      if (!canvas) return
      const rect = canvas.getBoundingClientRect()
      const pos = { x: (e.clientX - rect.left) * (canvas.width / rect.width), y: (e.clientY - rect.top) * (canvas.height / rect.height) }
      const fer = ferramentaRef.current
      g.mouseTraco = {
        pontos: [pos],
        cor: fer === "borracha" ? "eraser" : corAtivaRef.current,
        espessura: fer === "borracha" ? espessuraRef.current * 4 : espessuraRef.current,
        ferramenta: fer,
      }
      setTracoAtual({ ...g.mouseTraco })
    }

    const onMouseMove = (e: MouseEvent) => {
      if (!g.mouseAtivo || !g.mouseTraco) return
      const canvas = canvasRef.current
      if (!canvas) return
      const rect = canvas.getBoundingClientRect()
      const raw = { x: (e.clientX - rect.left) * (canvas.width / rect.width), y: (e.clientY - rect.top) * (canvas.height / rect.height) }
      const pts = g.mouseTraco.pontos
      const ultimo = pts[pts.length - 1]
      if (Math.sqrt((raw.x - ultimo.x) ** 2 + (raw.y - ultimo.y) ** 2) < 3) return
      const smooth = 0.35
      const pos = { x: ultimo.x + (raw.x - ultimo.x) * smooth, y: ultimo.y + (raw.y - ultimo.y) * smooth }
      pts.push(pos)
      setTracoAtual({ ...g.mouseTraco, pontos: [...pts] })
    }

    const onMouseUp = () => {
      if (g.mouseTraco && g.mouseTraco.pontos.length > 1) {
        const finalTraco = { ...g.mouseTraco, pontos: [...g.mouseTraco.pontos] }
        setTracos((prev) => [...prev, finalTraco])
      }
      g.mouseTraco = null
      setTracoAtual(null)
      g.mouseAtivo = false
    }

    const onWheel = (e: WheelEvent) => {
      e.preventDefault()
      setTransformacao((prev) => ({
        ...prev,
        escala: Math.max(0.3, Math.min(5, prev.escala + (e.deltaY > 0 ? -0.1 : 0.1))),
      }))
    }

    const preventGesture = (e: Event) => { e.preventDefault() }

    el.addEventListener("touchstart", onTouchStart, { passive: false })
    el.addEventListener("touchmove", onTouchMove, { passive: false })
    el.addEventListener("touchend", onTouchEnd)
    el.addEventListener("touchcancel", onTouchEnd)
    el.addEventListener("mousedown", onMouseDown)
    el.addEventListener("mousemove", onMouseMove)
    el.addEventListener("mouseup", onMouseUp)
    el.addEventListener("mouseleave", onMouseUp)
    el.addEventListener("wheel", onWheel, { passive: false })
    document.addEventListener("gesturestart", preventGesture, { passive: false })
    document.addEventListener("gesturechange", preventGesture, { passive: false })
    document.addEventListener("gestureend", preventGesture, { passive: false })

    return () => {
      el.removeEventListener("touchstart", onTouchStart)
      el.removeEventListener("touchmove", onTouchMove)
      el.removeEventListener("touchend", onTouchEnd)
      el.removeEventListener("touchcancel", onTouchEnd)
      el.removeEventListener("mousedown", onMouseDown)
      el.removeEventListener("mousemove", onMouseMove)
      el.removeEventListener("mouseup", onMouseUp)
      el.removeEventListener("mouseleave", onMouseUp)
      el.removeEventListener("wheel", onWheel)
      document.removeEventListener("gesturestart", preventGesture)
      document.removeEventListener("gesturechange", preventGesture)
      document.removeEventListener("gestureend", preventGesture)
    }
  }, [fullscreen, foto, screenToCanvasRef])

  // --- Renderizar traços no canvas ---
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || !foto) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const img = new Image()
    img.onload = () => {
      canvas.width = img.width
      canvas.height = img.height
      ctx.drawImage(img, 0, 0)

      const todosTracos = tracoAtual ? [...tracos, tracoAtual] : tracos
      todosTracos.forEach((traco) => {
        if (traco.pontos.length < 4) return

        if (traco.ferramenta === "borracha") {
          ctx.globalCompositeOperation = "destination-out"
        } else {
          ctx.globalCompositeOperation = "source-over"
        }
        ctx.strokeStyle = traco.cor === "eraser" ? "rgba(0,0,0,1)" : traco.cor
        ctx.lineWidth = traco.espessura
        ctx.lineCap = "round"
        ctx.lineJoin = "round"

        const pts = traco.pontos
        ctx.beginPath()
        ctx.moveTo(pts[0].x, pts[0].y)

        if (pts.length === 2) {
          ctx.lineTo(pts[1].x, pts[1].y)
        } else {
          for (let i = 0; i < pts.length - 1; i++) {
            const p0 = pts[Math.max(0, i - 1)]
            const p1 = pts[i]
            const p2 = pts[Math.min(pts.length - 1, i + 1)]
            const p3 = pts[Math.min(pts.length - 1, i + 2)]
            const tension = 0.4
            ctx.bezierCurveTo(
              p1.x + (p2.x - p0.x) * tension, p1.y + (p2.y - p0.y) * tension,
              p2.x - (p3.x - p1.x) * tension, p2.y - (p3.y - p1.y) * tension,
              p2.x, p2.y
            )
          }
        }
        ctx.stroke()
      })
      ctx.globalCompositeOperation = "source-over"
    }
    img.src = foto
  }, [foto, tracos, tracoAtual])

  const desfazer = () => setTracos((prev) => prev.slice(0, -1))
  const limparTracos = () => setTracos([])

  // --- Estado vazio ---
  if (!foto && !streamAtivo) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="w-full max-w-sm space-y-10">
          <div className="text-center">
            <p className="text-[9px] font-body font-semibold tracking-[0.4em] uppercase text-accent mb-3">Estudo Visual</p>
            <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground tracking-tight">Fotografar {tipoLabel}</h2>
            <p className="text-[11px] font-body text-muted-foreground mt-3 max-w-md mx-auto">Tire uma foto para analisar e desenhar guias de simetria.</p>
          </div>
          <div className="hr-diamond w-48 mx-auto"><div className="diamond" /></div>
          <div className="flex flex-col items-center gap-4">
            <button onClick={iniciarCamera} className="w-full h-12 bg-accent text-accent-foreground text-[10px] font-body font-semibold tracking-[0.25em] uppercase rounded-md hover:bg-accent/90 transition-colors flex items-center justify-center gap-2">
              <Camera className="w-4 h-4" strokeWidth={1.5} />Tirar Foto
            </button>
            <button onClick={() => inputGaleriaRef.current?.click()} className="w-full py-3.5 rounded-md border border-accent/30 bg-card text-foreground font-body font-semibold text-[10px] tracking-[0.15em] uppercase hover:bg-accent/5 transition-colors flex items-center justify-center gap-2">
              Escolher da Galeria
            </button>
            {onFechar && (
              <button onClick={onFechar} className="w-full py-3 text-[10px] font-body font-medium tracking-[0.1em] uppercase text-muted-foreground hover:text-foreground transition-colors">
                Voltar ao Perfil
              </button>
            )}
          </div>
          <input ref={inputCameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleUpload} />
          <input ref={inputGaleriaRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
          <video ref={videoRef} autoPlay playsInline className="hidden" />
        </div>
      </div>
    )
  }

  // --- Câmara ativa ---
  if (streamAtivo && !foto) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex flex-col">
        <div className="flex-1 flex items-center justify-center">
          <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
        </div>
        <div className="absolute bottom-0 inset-x-0 pb-8 pt-4 bg-gradient-to-t from-black/80 to-transparent flex justify-center gap-4">
          <button onClick={pararCamera} className="w-14 h-14 rounded-full border-2 border-white/40 flex items-center justify-center text-white/80 hover:bg-white/10">
            <X className="w-6 h-6" strokeWidth={1.5} />
          </button>
          <button onClick={capturarFoto} className="w-18 h-18 rounded-full border-4 border-white bg-white/20 flex items-center justify-center">
            <div className="w-14 h-14 rounded-full bg-white" />
          </button>
        </div>
      </div>
    )
  }

  // --- Editor fullscreen (Procreate-style) ---
  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-50 bg-background flex flex-col">
        {/* Toolbar */}
        <div className="shrink-0 bg-header border-b border-border px-4 py-2 flex items-center justify-between gap-2">
          <button onClick={() => { setFullscreen(false) }} className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors">
            <Minimize2 className="w-4 h-4" strokeWidth={1.5} />
          </button>

          <div className="flex items-center gap-1.5 flex-wrap justify-center">
            {/* Cores */}
            <div className="flex gap-0.5">
              {CORES.map((c) => (
                <button key={c.valor} onClick={() => { setCorAtiva(c.valor); setFerramenta("lapis") }}
                  className={`w-6 h-6 rounded-full border-2 transition-transform ${corAtiva === c.valor && ferramenta === "lapis" ? "border-accent scale-110" : "border-border/60"}`}
                  style={{ backgroundColor: c.valor }} />
              ))}
            </div>
            <div className="w-px h-5 bg-border mx-1" />
            {/* Espessura */}
            <div className="flex gap-0.5">
              {ESPESSURAS.map((e) => (
                <button key={e} onClick={() => setEspessura(e)}
                  className={`w-6 h-6 rounded-md border flex items-center justify-center ${espessura === e ? "bg-accent/10 border-accent/30 text-accent" : "border-border/60 text-muted-foreground"}`}>
                  <div className="rounded-full bg-current" style={{ width: e + 1, height: e + 1 }} />
                </button>
              ))}
            </div>
            <div className="w-px h-5 bg-border mx-1" />
            {/* Borracha */}
            <button onClick={() => setFerramenta(ferramenta === "borracha" ? "lapis" : "borracha")}
              className={`px-2 py-1.5 rounded-md text-[9px] font-body font-semibold border ${ferramenta === "borracha" ? "bg-destructive/10 border-destructive/30 text-destructive" : "border-border/60 text-muted-foreground"}`}>
              Borracha
            </button>
            <div className="w-px h-5 bg-border mx-1" />
            {/* Rodar + Reset */}
            <button onClick={rodar90} className="p-1.5 rounded-md border border-border/60 text-muted-foreground hover:bg-secondary" title="Rodar 90°">
              <RotateCw className="w-3.5 h-3.5" strokeWidth={1.5} />
            </button>
            <button onClick={resetTransformacao} className="px-2 py-1.5 rounded-md text-[9px] font-body font-semibold border border-border/60 text-muted-foreground hover:bg-secondary">
              Reset
            </button>
            <div className="w-px h-5 bg-border mx-1" />
            {/* Desfazer + Limpar */}
            <button onClick={desfazer} className="p-1.5 rounded-md border border-border/60 text-muted-foreground hover:bg-secondary" title="Desfazer">
              <Undo2 className="w-3 h-3" strokeWidth={1.5} />
            </button>
            <button onClick={limparTracos} className="p-1.5 rounded-md border border-border/60 text-muted-foreground hover:bg-secondary" title="Limpar">
              <Trash2 className="w-3 h-3" strokeWidth={1.5} />
            </button>
          </div>

          <div className="flex items-center gap-1.5">
            <button onClick={guardarNaGaleria} className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors" title="Guardar na galeria">
              <Download className="w-4 h-4" strokeWidth={1.5} />
            </button>
            {clienteId ? (
              <button
                onClick={guardarNoPerfil}
                className="px-3 py-1.5 bg-accent text-accent-foreground text-[9px] font-body font-semibold tracking-[0.15em] uppercase rounded-md hover:bg-accent/90 transition-colors flex items-center gap-1"
              >
                <Save className="w-3 h-3" strokeWidth={1.5} />Guardar no Perfil
              </button>
            ) : (
              <button
                onClick={() => { setGuardadoMsg("Guarde a cliente na checklist primeiro"); setTimeout(() => setGuardadoMsg(""), 2500) }}
                className="px-3 py-1.5 bg-accent/30 text-accent-foreground/60 text-[9px] font-body font-semibold tracking-[0.15em] uppercase rounded-md flex items-center gap-1"
              >
                <UserCheck className="w-3 h-3" strokeWidth={1.5} />Sem cliente
              </button>
            )}
          </div>
        </div>

        {guardadoMsg && (
          <div className="absolute top-14 left-1/2 -translate-x-1/2 z-10 bg-success text-success-foreground px-4 py-2 rounded-md text-[10px] font-body font-semibold tracking-[0.1em] uppercase">
            {guardadoMsg}
          </div>
        )}

        {/* Canvas */}
        <div ref={ajusteAreaRef} className="flex-1 flex items-center justify-center bg-foreground/5 overflow-hidden" style={{ touchAction: "none" }}>
          <canvas ref={canvasRef} className="max-w-full max-h-full"
            style={{
              cursor: "crosshair",
              transform: `translate(${transformacao.offsetX}px, ${transformacao.offsetY}px) rotate(${transformacao.rotacao}deg) scale(${transformacao.escala})`,
              touchAction: "none",
            }} />
        </div>

        {/* Barra inferior */}
        <div className="shrink-0 bg-header border-t border-border px-4 py-3 flex justify-center gap-3">
          <button onClick={() => { setFoto(null); setTracos([]); setFullscreen(false); setTransformacao({ rotacao: 0, escala: 1, offsetX: 0, offsetY: 0 }) }}
            className="py-2.5 px-5 rounded-md border border-border text-foreground font-body font-semibold text-[10px] tracking-[0.15em] uppercase hover:bg-secondary transition-colors flex items-center gap-2">
            <Camera className="w-3.5 h-3.5" strokeWidth={1.5} />Nova Foto
          </button>
        </div>

        <input ref={inputCameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleUpload} />
        <input ref={inputGaleriaRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
        <video ref={videoRef} autoPlay playsInline className="hidden" />
      </div>
    )
  }

  // --- Vista não-fullscreen ---
  return (
    <div className="space-y-6">
      <div className="text-center">
        <p className="text-[9px] font-body font-semibold tracking-[0.4em] uppercase text-accent mb-3">Estudo Visual</p>
      </div>
      <div className="relative max-w-2xl mx-auto rounded-lg overflow-hidden border border-border card-elevated cursor-pointer" onClick={() => setFullscreen(true)}>
        <canvas ref={canvasRef} className="w-full" />
        <div className="absolute inset-0 bg-foreground/0 hover:bg-foreground/5 transition-colors flex items-center justify-center opacity-0 hover:opacity-100">
          <span className="bg-card/90 px-4 py-2 rounded-md text-[10px] font-body font-semibold tracking-[0.15em] uppercase text-foreground border border-border">Abrir Editor</span>
        </div>
      </div>
      <div className="flex justify-center gap-3">
        <button onClick={() => { setFoto(null); setTracos([]) }}
          className="py-3 px-6 rounded-md border border-border text-foreground font-body font-semibold text-[10px] tracking-[0.15em] uppercase hover:bg-secondary transition-colors flex items-center gap-2">
          <Camera className="w-3.5 h-3.5" strokeWidth={1.5} />Nova Foto
        </button>
        <button onClick={() => setFullscreen(true)}
          className="py-3 px-6 bg-accent text-accent-foreground text-[10px] font-body font-semibold tracking-[0.25em] uppercase rounded-md hover:bg-accent/90 transition-colors flex items-center gap-2">
          Editar
        </button>
        <button onClick={guardarNaGaleria}
          className="py-3 px-6 rounded-md border border-border text-foreground font-body font-semibold text-[10px] tracking-[0.15em] uppercase hover:bg-secondary transition-colors flex items-center gap-2">
          <Download className="w-3.5 h-3.5" strokeWidth={1.5} />Guardar Foto
        </button>
      </div>
      <input ref={inputCameraRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleUpload} />
      <input ref={inputGaleriaRef} type="file" accept="image/*" className="hidden" onChange={handleUpload} />
      <video ref={videoRef} autoPlay playsInline className="hidden" />
    </div>
  )
}
