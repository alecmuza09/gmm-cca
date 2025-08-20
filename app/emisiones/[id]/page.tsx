"use client"

import { useParams } from "next/navigation"
import { EmissionDetail } from "@/components/emission-detail"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function EmissionPage() {
  const params = useParams()
  const emissionId = params.id as string

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6">
        <div className="mb-6">
          <Link href="/">
            <Button variant="outline" className="mb-4">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver al Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold">Detalles de Emisión</h1>
          <p className="text-muted-foreground">
            Revisa y edita los detalles de la emisión
          </p>
        </div>
        
        <EmissionDetail emissionId={emissionId} />
      </div>
    </div>
  )
}