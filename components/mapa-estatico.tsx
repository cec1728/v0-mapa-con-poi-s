"use client"

import { useEffect, useRef } from "react"
import type { POI } from "@/types/oficina"
import { getIconForPOI } from "@/lib/map-utils"

interface MapaEstaticoProps {
  center: { lat: number; lng: number }
  pois: POI[]
}

export function MapaEstatico({ center, pois }: MapaEstaticoProps) {
  const mapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Verificar si el elemento de referencia existe
    if (!mapRef.current) return

    // Función para inicializar el mapa
    const initMap = () => {
      try {
        // Verificar si Google Maps está cargado
        if (typeof window === "undefined" || !window.google || !window.google.maps) {
          // Si no está disponible, mostrar un mensaje o una imagen estática
          const element = mapRef.current
          if (element) {
            element.innerHTML =
              '<div class="flex items-center justify-center h-full bg-gray-100"><p>Mapa no disponible</p></div>'
          }
          return
        }

        const map = new window.google.maps.Map(mapRef.current, {
          center,
          zoom: 15,
          disableDefaultUI: true,
          zoomControl: false,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
        })

        // Agregar marcador de la oficina
        new window.google.maps.Marker({
          position: center,
          map,
          icon: {
            url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
          },
        })

        // Agregar círculo de 200m
        new window.google.maps.Circle({
          center,
          radius: 200,
          map,
          fillColor: "rgba(66, 133, 244, 0.2)",
          fillOpacity: 0.5,
          strokeColor: "rgba(66, 133, 244, 0.8)",
          strokeOpacity: 0.8,
          strokeWeight: 2,
        })

        // Agregar POIs
        pois.forEach((poi) => {
          new window.google.maps.Marker({
            position: { lat: poi.lat, lng: poi.lng },
            map,
            icon: getIconForPOI(poi),
          })
        })

        // Agregar etiqueta "ZC" en el centro
        new window.google.maps.Marker({
          position: center,
          map,
          label: {
            text: "ZC",
            color: "white",
            fontSize: "12px",
            fontWeight: "bold",
          },
          icon: {
            url: "https://maps.google.com/mapfiles/ms/icons/purple-dot.png",
            labelOrigin: new window.google.maps.Point(11, 11),
          },
        })
      } catch (error) {
        console.error("Error al inicializar el mapa:", error)
        // Mostrar un mensaje de error en el mapa
        const element = mapRef.current
        if (element) {
          element.innerHTML =
            '<div class="flex items-center justify-center h-full bg-gray-100"><p>Error al cargar el mapa</p></div>'
        }
      }
    }

    // Intentar inicializar el mapa
    initMap()

    // Limpieza
    return () => {
      // No es necesario limpiar nada específico aquí
    }
  }, [center, pois])

  return <div ref={mapRef} className="w-full h-full" />
}
