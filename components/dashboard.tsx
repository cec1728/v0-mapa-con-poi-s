"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Building, MapPin, FileText, Plus, Trash2 } from "lucide-react"
import type { Oficina } from "@/types/oficina"

export function Dashboard() {
  const [oficinas, setOficinas] = useState<Oficina[]>([])
  const [nuevaOficina, setNuevaOficina] = useState<Partial<Oficina>>({
    nombre: "",
    direccion: "",
    departamento: "",
    ciudad: "",
    zona: "",
    aforo: 0,
    instalaciones: "",
    lat: 4.6097, // Coordenadas por defecto (Bogotá)
    lng: -74.0817,
  })
  const [dialogOpen, setDialogOpen] = useState(false)
  const router = useRouter()

  // Cargar oficinas desde localStorage al iniciar
  useEffect(() => {
    const storedOficinas = localStorage.getItem("oficinas")
    if (storedOficinas) {
      setOficinas(JSON.parse(storedOficinas))
    }
  }, [])

  // Guardar oficinas en localStorage cuando cambian
  useEffect(() => {
    localStorage.setItem("oficinas", JSON.stringify(oficinas))
  }, [oficinas])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNuevaOficina({
      ...nuevaOficina,
      [name]: name === "aforo" ? Number.parseInt(value) || 0 : value,
    })
  }

  const handleCrearOficina = () => {
    const id = Date.now().toString()
    const oficina: Oficina = {
      id,
      ...(nuevaOficina as Omit<Oficina, "id">),
      pois: [],
      riesgoTotal: "Sin evaluar",
      riesgoResidual: "Sin evaluar",
      riesgoGeografico: "Sin evaluar",
      controlesExistentes: [],
    }

    setOficinas([...oficinas, oficina])
    setNuevaOficina({
      nombre: "",
      direccion: "",
      departamento: "",
      ciudad: "",
      zona: "",
      aforo: 0,
      instalaciones: "",
      lat: 4.6097,
      lng: -74.0817,
    })
    setDialogOpen(false)
  }

  const handleEliminarOficina = (id: string) => {
    setOficinas(oficinas.filter((o) => o.id !== id))
  }

  const navigateToMapa = (id: string) => {
    router.push(`/mapa/${id}`)
  }

  const navigateToInforme = (id: string) => {
    router.push(`/informe/${id}`)
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Sistema de Seguridad Perimetral</h1>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nueva Oficina
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Crear Nueva Oficina</DialogTitle>
              <DialogDescription>
                Ingrese los datos básicos de la oficina. Podrá configurar la ubicación exacta en el mapa.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="nombre" className="text-right">
                  Nombre
                </Label>
                <Input
                  id="nombre"
                  name="nombre"
                  value={nuevaOficina.nombre}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="direccion" className="text-right">
                  Dirección
                </Label>
                <Input
                  id="direccion"
                  name="direccion"
                  value={nuevaOficina.direccion}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="departamento" className="text-right">
                  Departamento
                </Label>
                <Input
                  id="departamento"
                  name="departamento"
                  value={nuevaOficina.departamento}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="ciudad" className="text-right">
                  Ciudad
                </Label>
                <Input
                  id="ciudad"
                  name="ciudad"
                  value={nuevaOficina.ciudad}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="zona" className="text-right">
                  Zona
                </Label>
                <Input
                  id="zona"
                  name="zona"
                  value={nuevaOficina.zona}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="aforo" className="text-right">
                  Aforo
                </Label>
                <Input
                  id="aforo"
                  name="aforo"
                  type="number"
                  value={nuevaOficina.aforo || ""}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="instalaciones" className="text-right">
                  Instalaciones
                </Label>
                <Input
                  id="instalaciones"
                  name="instalaciones"
                  value={nuevaOficina.instalaciones}
                  onChange={handleInputChange}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleCrearOficina}>Crear Oficina</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="oficinas">
        <TabsList className="mb-4">
          <TabsTrigger value="oficinas">Oficinas</TabsTrigger>
          <TabsTrigger value="estadisticas">Estadísticas</TabsTrigger>
        </TabsList>
        <TabsContent value="oficinas">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {oficinas.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <p className="text-muted-foreground">
                  No hay oficinas registradas. Cree una nueva oficina para comenzar.
                </p>
              </div>
            ) : (
              oficinas.map((oficina) => (
                <Card key={oficina.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Building className="mr-2 h-5 w-5" />
                      {oficina.nombre}
                    </CardTitle>
                    <CardDescription>
                      {oficina.direccion}, {oficina.ciudad}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="font-medium">Departamento:</span> {oficina.departamento}
                      </div>
                      <div>
                        <span className="font-medium">Zona:</span> {oficina.zona}
                      </div>
                      <div>
                        <span className="font-medium">Aforo:</span> {oficina.aforo} personas
                      </div>
                      <div>
                        <span className="font-medium">Riesgo Total:</span>{" "}
                        <span
                          className={
                            oficina.riesgoTotal === "Alto"
                              ? "text-red-500 font-bold"
                              : oficina.riesgoTotal === "Medio"
                                ? "text-yellow-500 font-bold"
                                : oficina.riesgoTotal === "Bajo"
                                  ? "text-green-500 font-bold"
                                  : "text-gray-500"
                          }
                        >
                          {oficina.riesgoTotal}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={() => navigateToMapa(oficina.id)}>
                      <MapPin className="mr-2 h-4 w-4" />
                      Mapa
                    </Button>
                    <Button variant="outline" onClick={() => navigateToInforme(oficina.id)}>
                      <FileText className="mr-2 h-4 w-4" />
                      Informe
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleEliminarOficina(oficina.id)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </CardFooter>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
        <TabsContent value="estadisticas">
          <Card>
            <CardHeader>
              <CardTitle>Estadísticas de Seguridad</CardTitle>
              <CardDescription>Resumen de los indicadores de seguridad de todas las oficinas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-medium mb-2">Distribución de Riesgo</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-red-100 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-red-600">
                        {oficinas.filter((o) => o.riesgoTotal === "Alto").length}
                      </div>
                      <div className="text-sm text-gray-600">Alto Riesgo</div>
                    </div>
                    <div className="bg-yellow-100 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-yellow-600">
                        {oficinas.filter((o) => o.riesgoTotal === "Medio").length}
                      </div>
                      <div className="text-sm text-gray-600">Riesgo Medio</div>
                    </div>
                    <div className="bg-green-100 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {oficinas.filter((o) => o.riesgoTotal === "Bajo").length}
                      </div>
                      <div className="text-sm text-gray-600">Bajo Riesgo</div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Oficinas por Evaluar</h3>
                  <div className="bg-gray-100 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-gray-600">
                      {oficinas.filter((o) => o.riesgoTotal === "Sin evaluar").length}
                    </div>
                    <div className="text-sm text-gray-600">Pendientes de Evaluación</div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-medium mb-2">Total de POIs Identificados</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-red-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-red-500">
                        {oficinas.reduce((acc, o) => acc + (o.pois?.filter((p) => p.tipo === "PR").length || 0), 0)}
                      </div>
                      <div className="text-sm text-gray-600">Puntos de Riesgo</div>
                    </div>
                    <div className="bg-yellow-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-yellow-500">
                        {oficinas.reduce((acc, o) => acc + (o.pois?.filter((p) => p.tipo === "PN").length || 0), 0)}
                      </div>
                      <div className="text-sm text-gray-600">Puntos Neutros</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg text-center">
                      <div className="text-2xl font-bold text-green-500">
                        {oficinas.reduce((acc, o) => acc + (o.pois?.filter((p) => p.tipo === "PA").length || 0), 0)}
                      </div>
                      <div className="text-sm text-gray-600">Puntos de Apoyo</div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
