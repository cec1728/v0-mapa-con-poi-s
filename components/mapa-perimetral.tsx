"use client"

import type React from "react"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { GoogleMap, useJsApiLoader, Marker, Circle, InfoWindow } from "@react-google-maps/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { Oficina, POI } from "@/types/oficina"
import { FileText, Loader2, MapPin, Plus, Save } from "lucide-react"
import { IconosPOI } from "@/components/iconos-poi"
import { getIconForPOI } from "@/lib/map-utils"
import type { google } from "google-maps"

const containerStyle = {
  width: "100%",
  height: "70vh",
}

const libraries: ("places" | "drawing" | "geometry" | "localContext" | "visualization")[] = [
  "places",
  "drawing",
  "geometry",
]

export function MapaPerimetral({ id }: { id: string }) {
  const { isLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries,
  })

  const [oficina, setOficina] = useState<Oficina | null>(null)
  const [center, setCenter] = useState<google.maps.LatLngLiteral>({ lat: 4.6097, lng: -74.0817 })
  const [markerPosition, setMarkerPosition] = useState<google.maps.LatLngLiteral | null>(null)
  const [pois, setPois] = useState<POI[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedPoi, setSelectedPoi] = useState<POI | null>(null)
  const [activeTab, setActiveTab] = useState("mapa")
  const [nuevoPoi, setNuevoPoi] = useState<Partial<POI>>({
    tipo: "PR",
    nombre: "",
    lat: 0,
    lng: 0,
  })
  const mapRef = useRef<google.maps.Map | null>(null)
  const router = useRouter()

  // Cargar datos de la oficina
  useEffect(() => {
    const storedOficinas = localStorage.getItem("oficinas")
    if (storedOficinas) {
      const oficinas: Oficina[] = JSON.parse(storedOficinas)
      const oficina = oficinas.find((o) => o.id === id)
      if (oficina) {
        setOficina(oficina)
        if (oficina.lat && oficina.lng) {
          const position = { lat: oficina.lat, lng: oficina.lng }
          setCenter(position)
          setMarkerPosition(position)
        }
        if (oficina.pois && oficina.pois.length > 0) {
          setPois(oficina.pois)
        }
      }
    }
  }, [id])

  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map
  }, [])

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (!e.latLng) return

    if (activeTab === "mapa") {
      // En la pestaña de mapa, establece la posición de la oficina
      const position = {
        lat: e.latLng.lat(),
        lng: e.latLng.lng(),
      }
      setMarkerPosition(position)
    } else if (activeTab === "pois") {
      // En la pestaña de POIs, establece la posición del nuevo POI
      const position = {
        lat: e.latLng.lat(),
        lng: e.latLng.lng(),
      }
      setNuevoPoi((prev) => ({
        ...prev,
        lat: position.lat,
        lng: position.lng,
      }))
    }
  }

  const handleMarkerDragEnd = (e: google.maps.MapMouseEvent) => {
    if (!e.latLng) return
    const position = {
      lat: e.latLng.lat(),
      lng: e.latLng.lng(),
    }
    setMarkerPosition(position)
  }

  const handleGuardarUbicacion = () => {
    if (!markerPosition || !oficina) return

    const storedOficinas = localStorage.getItem("oficinas")
    if (storedOficinas) {
      const oficinas: Oficina[] = JSON.parse(storedOficinas)
      const updatedOficinas = oficinas.map((o) => {
        if (o.id === id) {
          return {
            ...o,
            lat: markerPosition.lat,
            lng: markerPosition.lng,
          }
        }
        return o
      })
      localStorage.setItem("oficinas", JSON.stringify(updatedOficinas))
      setOficina({
        ...oficina,
        lat: markerPosition.lat,
        lng: markerPosition.lng,
      })
    }
  }

  const handleCargarPOIs = async () => {
    if (!markerPosition) return

    setIsLoading(true)
    try {
      // Crear POIs simulados basados en la posición del marcador
      const simulatedPOIs: POI[] = [
        { id: "1", tipo: "PR", nombre: "Gasolinera", lat: markerPosition.lat + 0.001, lng: markerPosition.lng + 0.001 },
        {
          id: "2",
          tipo: "PN",
          nombre: "Estación Policía",
          lat: markerPosition.lat - 0.001,
          lng: markerPosition.lng + 0.0008,
        },
        { id: "3", tipo: "PA", nombre: "Hospital", lat: markerPosition.lat + 0.0008, lng: markerPosition.lng - 0.001 },
        {
          id: "4",
          tipo: "PA",
          subtipo: "inundacion",
          nombre: "Zona Inundable",
          lat: markerPosition.lat - 0.0005,
          lng: markerPosition.lng - 0.0012,
        },
        {
          id: "5",
          tipo: "PA",
          subtipo: "deslizamiento",
          nombre: "Zona Deslizamiento",
          lat: markerPosition.lat + 0.0015,
          lng: markerPosition.lng - 0.0005,
        },
        {
          id: "6",
          tipo: "Va",
          nombre: "Aglomeración",
          lat: markerPosition.lat - 0.0012,
          lng: markerPosition.lng + 0.0015,
        },
      ]

      // Intentar llamar a la API real solo si la URL está configurada
      let poisToUse = simulatedPOIs

      if (process.env.NEXT_PUBLIC_API_BASE_URL) {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/places`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              center: markerPosition,
              radio: 200,
            }),
          })

          if (response.ok) {
            const data = await response.json()
            if (data?.POIs && Array.isArray(data.POIs)) {
              poisToUse = data.POIs
            }
          }
        } catch (apiError) {
          console.log("Usando datos simulados debido a error de API:", apiError)
          // Continuar con los datos simulados
        }
      }

      setPois(poisToUse)

      // Guardar POIs en la oficina
      const storedOficinas = localStorage.getItem("oficinas")
      if (storedOficinas && oficina) {
        const oficinas: Oficina[] = JSON.parse(storedOficinas)
        const updatedOficinas = oficinas.map((o) => {
          if (o.id === id) {
            return {
              ...o,
              pois: poisToUse,
            }
          }
          return o
        })
        localStorage.setItem("oficinas", JSON.stringify(updatedOficinas))
      }
    } catch (error) {
      console.error("Error general:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePoiClick = (poi: POI) => {
    setSelectedPoi(poi)
  }

  const handleCloseInfoWindow = () => {
    setSelectedPoi(null)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setNuevoPoi({
      ...nuevoPoi,
      [name]: value,
    })
  }

  const handleTipoChange = (tipo: string) => {
    setNuevoPoi({
      ...nuevoPoi,
      tipo,
    })
  }

  const handleSubtipoChange = (subtipo: string | undefined) => {
    setNuevoPoi({
      ...nuevoPoi,
      subtipo,
    })
  }

  const handleAgregarPoi = () => {
    if (!nuevoPoi.lat || !nuevoPoi.lng || !nuevoPoi.nombre || !nuevoPoi.tipo) return

    const newPoi: POI = {
      id: Date.now().toString(),
      tipo: nuevoPoi.tipo,
      subtipo: nuevoPoi.subtipo,
      nombre: nuevoPoi.nombre,
      lat: nuevoPoi.lat,
      lng: nuevoPoi.lng,
    }

    const updatedPois = [...pois, newPoi]
    setPois(updatedPois)

    // Guardar POIs en la oficina
    if (oficina) {
      const storedOficinas = localStorage.getItem("oficinas")
      if (storedOficinas) {
        const oficinas: Oficina[] = JSON.parse(storedOficinas)
        const updatedOficinas = oficinas.map((o) => {
          if (o.id === id) {
            return {
              ...o,
              pois: updatedPois,
            }
          }
          return o
        })
        localStorage.setItem("oficinas", JSON.stringify(updatedOficinas))
      }
    }

    // Resetear el formulario
    setNuevoPoi({
      tipo: "PR",
      nombre: "",
      lat: 0,
      lng: 0,
    })
  }

  const navigateToInforme = () => {
    router.push(`/informe/${id}`)
  }

  const calcularDistancia = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    if (!lat1 || !lng1 || !lat2 || !lng2) return 0

    const R = 6371e3 // Radio de la tierra en metros
    const φ1 = (lat1 * Math.PI) / 180
    const φ2 = (lat2 * Math.PI) / 180
    const Δφ = ((lat2 - lat1) * Math.PI) / 180
    const Δλ = ((lng2 - lng1) * Math.PI) / 180

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return R * c // Distancia en metros
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Cargando mapa...</span>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Mapa Perimetral: {oficina?.nombre || "Cargando..."}</h1>
        <div className="flex gap-2">
          <Button onClick={navigateToInforme} disabled={!markerPosition || pois.length === 0}>
            <FileText className="mr-2 h-4 w-4" />
            Ver Informe
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="mapa">Ubicación de Oficina</TabsTrigger>
          <TabsTrigger value="pois" disabled={!markerPosition}>
            Puntos de Interés
          </TabsTrigger>
        </TabsList>

        <TabsContent value="mapa">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Seleccione la ubicación de la oficina</CardTitle>
                </CardHeader>
                <CardContent>
                  <GoogleMap
                    mapContainerStyle={containerStyle}
                    center={center}
                    zoom={15}
                    onClick={handleMapClick}
                    onLoad={onMapLoad}
                  >
                    {markerPosition && (
                      <>
                        <Marker position={markerPosition} draggable={true} onDragEnd={handleMarkerDragEnd} />
                        <Circle
                          center={markerPosition}
                          radius={200}
                          options={{
                            fillColor: "rgba(66, 133, 244, 0.2)",
                            fillOpacity: 0.5,
                            strokeColor: "rgba(66, 133, 244, 0.8)",
                            strokeOpacity: 0.8,
                            strokeWeight: 2,
                          }}
                        />
                      </>
                    )}
                  </GoogleMap>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Información de Ubicación</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label>Coordenadas</Label>
                      <div className="text-sm mt-1">
                        {markerPosition ? (
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <span className="font-medium">Latitud:</span> {markerPosition.lat.toFixed(6)}
                            </div>
                            <div>
                              <span className="font-medium">Longitud:</span> {markerPosition.lng.toFixed(6)}
                            </div>
                          </div>
                        ) : (
                          <p className="text-muted-foreground">Haga clic en el mapa para seleccionar la ubicación</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <Label>Radio de Influencia</Label>
                      <div className="text-sm mt-1">
                        <span className="font-medium">200 metros</span> alrededor de la ubicación seleccionada
                      </div>
                    </div>

                    <div className="pt-4">
                      <Button onClick={handleGuardarUbicacion} disabled={!markerPosition} className="w-full">
                        <Save className="mr-2 h-4 w-4" />
                        Guardar Ubicación
                      </Button>
                    </div>

                    <div className="pt-2">
                      <Button
                        onClick={handleCargarPOIs}
                        disabled={!markerPosition}
                        className="w-full"
                        variant="outline"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Cargando...
                          </>
                        ) : (
                          <>
                            <MapPin className="mr-2 h-4 w-4" />
                            Cargar Puntos de Interés
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="pois">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Puntos de Interés (POIs)</CardTitle>
                </CardHeader>
                <CardContent>
                  <GoogleMap
                    mapContainerStyle={containerStyle}
                    center={markerPosition || center}
                    zoom={15}
                    onClick={handleMapClick}
                    onLoad={onMapLoad}
                  >
                    {markerPosition && (
                      <>
                        <Marker
                          position={markerPosition}
                          icon={{
                            url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
                          }}
                        />
                        <Circle
                          center={markerPosition}
                          radius={200}
                          options={{
                            fillColor: "rgba(66, 133, 244, 0.2)",
                            fillOpacity: 0.5,
                            strokeColor: "rgba(66, 133, 244, 0.8)",
                            strokeOpacity: 0.8,
                            strokeWeight: 2,
                          }}
                        />
                      </>
                    )}

                    {pois.map((poi) => (
                      <Marker
                        key={poi.id}
                        position={{ lat: poi.lat, lng: poi.lng }}
                        icon={getIconForPOI(poi)}
                        onClick={() => handlePoiClick(poi)}
                      />
                    ))}

                    {selectedPoi && (
                      <InfoWindow
                        position={{ lat: selectedPoi.lat, lng: selectedPoi.lng }}
                        onCloseClick={handleCloseInfoWindow}
                      >
                        <div className="p-2">
                          <h3 className="font-bold">{selectedPoi.nombre}</h3>
                          <p className="text-sm">
                            Tipo: {selectedPoi.tipo} {selectedPoi.subtipo ? `(${selectedPoi.subtipo})` : ""}
                          </p>
                          {markerPosition && (
                            <p className="text-sm">
                              Distancia:{" "}
                              {calcularDistancia(
                                markerPosition.lat,
                                markerPosition.lng,
                                selectedPoi.lat,
                                selectedPoi.lng,
                              ).toFixed(0)}{" "}
                              m
                            </p>
                          )}
                        </div>
                      </InfoWindow>
                    )}

                    {nuevoPoi.lat !== 0 && nuevoPoi.lng !== 0 && (
                      <Marker
                        position={{ lat: nuevoPoi.lat, lng: nuevoPoi.lng }}
                        icon={{
                          url: "https://maps.google.com/mapfiles/ms/icons/purple-dot.png",
                        }}
                      />
                    )}
                  </GoogleMap>
                </CardContent>
              </Card>
            </div>

            <div>
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Agregar Punto de Interés</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="nombre">Nombre del POI</Label>
                      <Input
                        id="nombre"
                        name="nombre"
                        value={nuevoPoi.nombre}
                        onChange={handleInputChange}
                        placeholder="Ej: Gasolinera, Hospital, etc."
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label>Tipo de POI</Label>
                      <div className="grid grid-cols-3 gap-2 mt-1">
                        <IconosPOI
                          selectedTipo={nuevoPoi.tipo}
                          selectedSubtipo={nuevoPoi.subtipo}
                          onSelectTipo={handleTipoChange}
                          onSelectSubtipo={handleSubtipoChange}
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Coordenadas</Label>
                      <div className="text-sm mt-1">
                        {nuevoPoi.lat !== 0 && nuevoPoi.lng !== 0 ? (
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <span className="font-medium">Latitud:</span> {nuevoPoi.lat.toFixed(6)}
                            </div>
                            <div>
                              <span className="font-medium">Longitud:</span> {nuevoPoi.lng.toFixed(6)}
                            </div>
                          </div>
                        ) : (
                          <p className="text-muted-foreground">Haga clic en el mapa para seleccionar la ubicación</p>
                        )}
                      </div>
                    </div>

                    <Button
                      onClick={handleAgregarPoi}
                      disabled={!nuevoPoi.nombre || nuevoPoi.lat === 0 || nuevoPoi.lng === 0}
                      className="w-full"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Agregar POI
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Leyenda</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center">
                      <div className="w-6 h-6 bg-red-500 rounded-full mr-2"></div>
                      <span>PR - Puntos de Riesgo</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-6 h-6 bg-yellow-400 rounded-sm mr-2"></div>
                      <span>PN - Puntos Neutros</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-6 h-6 bg-green-500 rounded-full mr-2"></div>
                      <span>PA - Puntos de Apoyo</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-6 h-6 bg-blue-300 rounded-sm mr-2"></div>
                      <span>Inundación</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-6 h-6 bg-amber-700 rounded-sm mr-2"></div>
                      <span>Deslizamiento</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-6 h-6 bg-purple-500 rounded-sm mr-2"></div>
                      <span>Aglomeración</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-6 h-6 bg-blue-500 rounded-full mr-2"></div>
                      <span>Oficina</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
