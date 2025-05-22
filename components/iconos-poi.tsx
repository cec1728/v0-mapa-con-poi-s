"use client"

import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface IconosPOIProps {
  selectedTipo: string | undefined
  selectedSubtipo: string | undefined
  onSelectTipo: (tipo: string) => void
  onSelectSubtipo: (subtipo: string | undefined) => void
}

export function IconosPOI({ selectedTipo, selectedSubtipo, onSelectTipo, onSelectSubtipo }: IconosPOIProps) {
  return (
    <TooltipProvider>
      <div className="grid grid-cols-3 gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant={selectedTipo === "PR" ? "default" : "outline"}
              className={`p-2 h-auto ${selectedTipo === "PR" ? "bg-red-500 hover:bg-red-600" : ""}`}
              onClick={() => {
                onSelectTipo("PR")
                onSelectSubtipo(undefined)
              }}
            >
              <div className="w-6 h-6 bg-red-500 rounded-full mx-auto"></div>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>PR - Punto de Riesgo</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant={selectedTipo === "PN" ? "default" : "outline"}
              className={`p-2 h-auto ${selectedTipo === "PN" ? "bg-yellow-400 hover:bg-yellow-500" : ""}`}
              onClick={() => {
                onSelectTipo("PN")
                onSelectSubtipo(undefined)
              }}
            >
              <div className="w-6 h-6 bg-yellow-400 rounded-sm mx-auto"></div>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>PN - Punto Neutro</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant={selectedTipo === "PA" && !selectedSubtipo ? "default" : "outline"}
              className={`p-2 h-auto ${selectedTipo === "PA" && !selectedSubtipo ? "bg-green-500 hover:bg-green-600" : ""}`}
              onClick={() => {
                onSelectTipo("PA")
                onSelectSubtipo(undefined)
              }}
            >
              <div className="w-6 h-6 bg-green-500 rounded-full mx-auto"></div>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>PA - Punto de Apoyo</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant={selectedTipo === "PA" && selectedSubtipo === "inundacion" ? "default" : "outline"}
              className={`p-2 h-auto ${selectedTipo === "PA" && selectedSubtipo === "inundacion" ? "bg-blue-300 hover:bg-blue-400" : ""}`}
              onClick={() => {
                onSelectTipo("PA")
                onSelectSubtipo("inundacion")
              }}
            >
              <div className="w-6 h-6 bg-blue-300 rounded-sm mx-auto"></div>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Inundación</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant={selectedTipo === "PA" && selectedSubtipo === "deslizamiento" ? "default" : "outline"}
              className={`p-2 h-auto ${selectedTipo === "PA" && selectedSubtipo === "deslizamiento" ? "bg-amber-700 hover:bg-amber-800" : ""}`}
              onClick={() => {
                onSelectTipo("PA")
                onSelectSubtipo("deslizamiento")
              }}
            >
              <div className="w-6 h-6 bg-amber-700 rounded-sm mx-auto"></div>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Deslizamiento</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant={selectedTipo === "Va" ? "default" : "outline"}
              className={`p-2 h-auto ${selectedTipo === "Va" ? "bg-purple-500 hover:bg-purple-600" : ""}`}
              onClick={() => {
                onSelectTipo("Va")
                onSelectSubtipo(undefined)
              }}
            >
              <div className="w-6 h-6 bg-purple-500 rounded-sm mx-auto"></div>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Va - Aglomeración</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant={selectedTipo === "Ve" ? "default" : "outline"}
              className={`p-2 h-auto ${selectedTipo === "Ve" ? "bg-emerald-500 hover:bg-emerald-600" : ""}`}
              onClick={() => {
                onSelectTipo("Ve")
                onSelectSubtipo(undefined)
              }}
            >
              <div className="w-6 h-6 bg-emerald-500 rounded-sm mx-auto flex items-center justify-center">
                <span className="text-white text-xs">→</span>
              </div>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Ve - Vialidad de Egreso</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  )
}
