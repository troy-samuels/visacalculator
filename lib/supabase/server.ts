import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    "https://ydskboviymdwvynheef.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlkc2tib3ZpeW1oZHd2eW5oZWVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3MTU1MzcsImV4cCI6MjA2NzI5MTUzN30.AmAhnKnZvDTNTuJ53ctZwyrjYCIjmAgkB8ibV352tmk",
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    },
  )
}
