import { MapaPerimetral } from "@/components/mapa-perimetral"

export default function MapaPage({ params }: { params: { id: string } }) {
  return (
    <main className="min-h-screen">
      <MapaPerimetral id={params.id} />
    </main>
  )
}
