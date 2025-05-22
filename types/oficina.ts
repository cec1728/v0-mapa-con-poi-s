export interface Oficina {
  id: string
  nombre: string
  direccion: string
  departamento: string
  ciudad: string
  zona: string
  aforo: number
  instalaciones: string
  lat: number
  lng: number
  pois?: POI[]
  riesgoTotal?: string
  riesgoResidual?: string
  riesgoGeografico?: string
  controlesExistentes?: string[]
}

export interface POI {
  id: string
  tipo: string
  subtipo?: string
  nombre: string
  lat: number
  lng: number
}
