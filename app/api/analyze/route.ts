import { NextResponse } from "next/server"
import type { POI } from "@/types/oficina"

export async function POST(request: Request) {
  try {
    const { center, pois } = await request.json()

    if (!center || !pois) {
      return NextResponse.json({ error: "Se requieren center y pois" }, { status: 400 })
    }

    // Contar tipos de POIs
    const countPR = pois.filter((p: POI) => p.tipo === "PR").length
    const countPN = pois.filter((p: POI) => p.tipo === "PN").length
    const countPA = pois.filter((p: POI) => p.tipo === "PA").length

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

    // Simular tiempo de procesamiento
    await new Promise((resolve) => setTimeout(resolve, 1500))

    return NextResponse.json({
      riesgoTotal,
      riesgoResidual,
      riesgoGeografico,
      controlesExistentes,
    })
  } catch (error) {
    console.error("Error en el análisis:", error)
    return NextResponse.json({ error: "Error en el procesamiento" }, { status: 500 })
  }
}
