import { AuthGuard } from "@/components/auth-guard"
import { EmissionWizard } from "@/components/emission-wizard"

export default function NewEmissionPage() {
  return (
    <AuthGuard>
      <EmissionWizard />
    </AuthGuard>
  )
}
