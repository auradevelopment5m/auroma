import { createServerSupabaseClient } from "@/lib/supabase/server"
import { createAdminSupabaseClient } from "@/lib/supabase/admin"

export async function requireUser() {
  const supabase = await createServerSupabaseClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    throw new Error("UNAUTHENTICATED")
  }

  return { user }
}

export async function requireAdmin() {
  const { user } = await requireUser()
  const admin = createAdminSupabaseClient()

  const { data: profile } = await admin.from("profiles").select("is_admin").eq("id", user.id).single()

  if (!profile?.is_admin) {
    throw new Error("FORBIDDEN")
  }

  return { user, admin }
}
