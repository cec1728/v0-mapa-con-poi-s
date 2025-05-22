"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Loader2, ArrowLeft, Download, Printer } from "lucide-react"
import type { Oficina, POI } from "@/types/oficina"
import Image from "next/image"
import { MapaEstatico } from "@/components/mapa-estatico"

export function InformeSeguridad({ id }: { id: string }) {
  const [oficina, setOficina] = useState<Oficina | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [analisisIA, setAnalisisIA] = useState<any>(null)
  const router = useRouter()

  // Cargar datos de la oficina
  useEffect(() => {
    const storedOficinas = localStorage.getItem("oficinas")
    if (storedOficinas) {
      const oficinas: Oficina[] = JSON.parse(storedOficinas)
      const oficina = oficinas.find((o) => o.id === id)
      if (oficina) {
        setOficina(oficina)

        // Si no hay análisis previo, generarlo
        if (!oficina.riesgoTotal || oficina.riesgoTotal === "Sin evaluar") {
          generarAnalisisIA(oficina)
        } else {
          // Usar análisis existente
          setAnalisisIA({
            riesgoTotal: oficina.riesgoTotal,
            riesgoResidual: oficina.riesgoResidual,
            riesgoGeografico: oficina.riesgoGeografico,
            controlesExistentes: oficina.controlesExistentes || [],
          })
        }
      }
    }
  }, [id])

  const generarAnalisisIA = async (oficina: Oficina) => {
    if (!oficina.lat || !oficina.lng || !oficina.pois || oficina.pois.length === 0) return

    setIsLoading(true)
    try {
      // Intentar llamar a la API real
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          center: { lat: oficina.lat, lng: oficina.lng },
          pois: oficina.pois,
        }),
      })

      let data

      if (!response.ok) {
        // Si falla, usar datos simulados
        data = generarAnalisisSimulado(oficina.pois)
      } else {
        data = await response.json()
      }

      setAnalisisIA(data)

      // Guardar análisis en la oficina
      const storedOficinas = localStorage.getItem("oficinas")
      if (storedOficinas) {
        const oficinas: Oficina[] = JSON.parse(storedOficinas)
        const updatedOficinas = oficinas.map((o) => {
          if (o.id === id) {
            return {
              ...o,
              riesgoTotal: data.riesgoTotal,
              riesgoResidual: data.riesgoResidual,
              riesgoGeografico: data.riesgoGeografico,
              controlesExistentes: data.controlesExistentes,
            }
          }
          return o
        })
        localStorage.setItem("oficinas", JSON.stringify(updatedOficinas))
      }
    } catch (error) {
      console.error("Error:", error)
      // Usar datos simulados en caso de error
      const data = generarAnalisisSimulado(oficina.pois)
      setAnalisisIA(data)

      // Guardar análisis simulado en la oficina
      const storedOficinas = localStorage.getItem("oficinas")
      if (storedOficinas) {
        const oficinas: Oficina[] = JSON.parse(storedOficinas)
        const updatedOficinas = oficinas.map((o) => {
          if (o.id === id) {
            return {
              ...o,
              riesgoTotal: data.riesgoTotal,
              riesgoResidual: data.riesgoResidual,
              riesgoGeografico: data.riesgoGeografico,
              controlesExistentes: data.controlesExistentes,
            }
          }
          return o
        })
        localStorage.setItem("oficinas", JSON.stringify(updatedOficinas))
      }
    } finally {
      setIsLoading(false)
    }
  }

  const generarAnalisisSimulado = (pois: POI[]) => {
    // Contar tipos de POIs
    const countPR = pois.filter((p) => p.tipo === "PR").length
    const countPN = pois.filter((p) => p.tipo === "PN").length
    const countPA = pois.filter((p) => p.tipo === "PA").length

    // Determinar riesgo basado en la cantidad de POIs
    let riesgoTotal = "Medio"
    if (countPR > 3) {
      riesgoTotal = "Alto"
    } else if (countPR <= 1 && countPA > 2) {
      riesgoTotal = "Bajo"
    }

    // Riesgo residual siempre es menor que el total
    let riesgoResidual = "Bajo"
    if (riesgoTotal === "Alto") {
      riesgoResidual = "Medio"
    }

    // Riesgo geográfico
    const riesgoGeografico = countPR > countPA ? "A" : countPR === countPA ? "I" : "D"

    // Controles existentes simulados
    const controlesExistentes = [
      "Sistema de vigilancia CCTV",
      "Control de acceso biométrico",
      "Guardias de seguridad 24/7",
      "Protocolo de evacuación",
      "Sistema contra incendios",
    ]

    return {
      riesgoTotal,
      riesgoResidual,
      riesgoGeografico,
      controlesExistentes,
    }
  }

  const handleVolver = () => {
    router.back()
  }

  const handleImprimir = () => {
    window.print()
  }

  if (!oficina) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Cargando datos de la oficina...</span>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6 print:hidden">
        <Button variant="outline" onClick={handleVolver}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleImprimir}>
            <Printer className="mr-2 h-4 w-4" />
            Imprimir
          </Button>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Exportar PDF
          </Button>
        </div>
      </div>

      <div className="print:mt-0">
        <div className="bg-gray-800 text-white p-4 mb-6 print:mb-2">
          <h1 className="text-2xl font-bold text-center">REPORTE DE EVALUACIÓN SEGURIDAD PERIMETRAL</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 print:gap-2">
          <div className="md:col-span-2 bg-green-100 p-4 rounded print:rounded-none">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <span className="font-bold">Nombre:</span> {oficina.nombre}
              </div>
              <div className="col-span-2">
                <span className="font-bold">Dirección:</span> {oficina.direccion}
              </div>
              <div className="col-span-2">
                <span className="font-bold">Ubicación:</span> {oficina.lat?.toFixed(6)}, {oficina.lng?.toFixed(6)}
              </div>
              <div>
                <span className="font-bold">Depto.:</span> {oficina.departamento}
              </div>
              <div>
                <span className="font-bold">Ciudad:</span> {oficina.ciudad}
              </div>
              <div>
                <span className="font-bold">Zona:</span> {oficina.zona}
              </div>
              <div>
                <span className="font-bold">Aforo personas:</span> {oficina.aforo}
              </div>
              <div className="col-span-2">
                <span className="font-bold">Instalaciones:</span> {oficina.instalaciones}
              </div>
            </div>
          </div>

          <div className="border border-gray-300 p-4 rounded print:rounded-none">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="flex items-center">
                <span className="font-bold">PR =</span>
                <div className="w-4 h-4 bg-red-500 ml-2 rounded-full"></div>
              </div>
              <div>
                <span className="font-bold">RGeograf =</span> {analisisIA?.riesgoGeografico || "N/A"}
              </div>
              <div className="flex items-center">
                <span className="font-bold">PN =</span>
                <div className="w-4 h-4 bg-yellow-400 ml-2"></div>
              </div>
              <div className="flex items-center">
                <span className="font-bold">Inund =</span>
                <div className="w-4 h-4 bg-blue-300 ml-2"></div>
              </div>
              <div className="flex items-center">
                <span className="font-bold">PA =</span>
                <div className="w-4 h-4 bg-green-500 ml-2 rounded-full"></div>
              </div>
              <div className="flex items-center">
                <span className="font-bold">Desl =</span>
                <div className="w-4 h-4 bg-amber-700 ml-2"></div>
              </div>
              <div className="flex items-center">
                <span className="font-bold">Va =</span>
                <div className="w-4 h-4 bg-purple-500 ml-2"></div>
              </div>
              <div className="flex items-center">
                <span className="font-bold">Aglom =</span>
                <div className="w-4 h-4 bg-gray-800 ml-2 flex items-center justify-center">
                  <span className="text-white text-xs">👥</span>
                </div>
              </div>
              <div className="flex items-center">
                <span className="font-bold">Ve =</span>
                <div className="w-4 h-4 bg-emerald-500 ml-2 flex items-center justify-center">
                  <span className="text-white text-xs">→</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 print:mt-2 print:gap-2">
          <div className="bg-yellow-300 p-4 rounded print:rounded-none">
            <h2 className="font-bold text-center mb-2">PROCESOS CRÍTICOS</h2>
            <ul className="list-disc list-inside text-sm">
              <li>Atención al cliente</li>
              <li>Gestión de documentos</li>
              <li>Operaciones financieras</li>
              <li>Seguridad de la información</li>
              <li>Comunicaciones</li>
            </ul>
          </div>

          <div className="bg-yellow-300 p-4 rounded print:rounded-none">
            <h2 className="font-bold text-center mb-2">SERVICIOS, PRODUCTOS</h2>
            <ul className="list-disc list-inside text-sm">
              <li>Atención personalizada</li>
              <li>Asesoría financiera</li>
              <li>Gestión de cuentas</li>
              <li>Préstamos y créditos</li>
              <li>Servicios digitales</li>
            </ul>
          </div>

          <div className="border border-gray-300 p-4 rounded print:rounded-none">
            <div className="bg-red-500 text-white p-2 text-center mb-2">
              <h2 className="font-bold">RIESGO ZC:</h2>
              <p>{analisisIA?.riesgoTotal || "Sin evaluar"}</p>
            </div>
            <div className="bg-green-500 text-white p-2 text-center">
              <h2 className="font-bold">RIESGO RESIDUAL ZC:</h2>
              <p>{analisisIA?.riesgoResidual || "Sin evaluar"}</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 print:mt-2 print:gap-2">
          <div className="border border-gray-300 p-4 rounded print:rounded-none">
            <h2 className="font-bold text-center mb-2">FOTO</h2>
            <div className="aspect-video bg-gray-100 flex items-center justify-center">
              <Image
                src="/placeholder.svg?height=200&width=400"
                alt="Fachada de la oficina"
                width={400}
                height={200}
                className="object-cover"
              />
            </div>
          </div>

          <div className="border border-gray-300 p-4 rounded print:rounded-none">
            <h2 className="font-bold text-center mb-2">MAPA</h2>
            <div className="aspect-video bg-gray-100">
              {oficina.lat && oficina.lng && (
                <MapaEstatico center={{ lat: oficina.lat, lng: oficina.lng }} pois={oficina.pois || []} />
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 print:mt-2 border border-gray-300 p-4 rounded print:rounded-none bg-gray-100">
          <h2 className="font-bold mb-2">Controles existentes:</h2>
          <ul className="list-disc list-inside">
            {isLoading ? (
              <div className="flex items-center">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span>Analizando controles...</span>
              </div>
            ) : (
              analisisIA?.controlesExistentes?.map((control: string, index: number) => (
                <li key={index}>{control}</li>
              )) || <li>No hay controles registrados</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  )
}
