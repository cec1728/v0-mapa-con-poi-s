import type { POI } from "@/types/oficina"

export function getIconForPOI(poi: POI) {
  // Verificar si estamos en el navegador y si google maps está disponible
  if (typeof window === "undefined" || !window.google || !window.google.maps) {
    // Devolver un objeto con URL por defecto si no estamos en el navegador
    return {
      url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
    }
  }

  // Definir iconos para cada tipo de POI
  switch (poi.tipo) {
    case "PR":
      return {
        url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
      }
    case "PN":
      return {
        url: "https://maps.google.com/mapfiles/ms/icons/yellow-dot.png",
      }
    case "PA":
      if (poi.subtipo === "inundacion") {
        return {
          url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
        }
      } else if (poi.subtipo === "deslizamiento") {
        return {
          url: "https://maps.google.com/mapfiles/ms/icons/orange-dot.png",
        }
      } else {
        return {
          url: "https://maps.google.com/mapfiles/ms/icons/green-dot.png",
        }
      }
    case "Va":
      return {
        url: "https://maps.google.com/mapfiles/ms/icons/purple-dot.png",
      }
    case "Ve":
      return {
        url: "https://maps.google.com/mapfiles/ms/icons/ltblue-dot.png",
      }
    default:
      return {
        url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
      }
  }
}
