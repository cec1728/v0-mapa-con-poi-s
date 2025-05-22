import { InformeSeguridad } from "@/components/informe-seguridad"

export default function InformePage({ params }: { params: { id: string } }) {
  return (
    <main className="min-h-screen">
      <InformeSeguridad id={params.id} />
    </main>
  )
}
