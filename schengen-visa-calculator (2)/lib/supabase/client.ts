import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  return createBrowserClient(
    "https://ydskboviymdwvynheef.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlkc2tib3ZpeW1oZHd2eW5oZWVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3MTU1MzcsImV4cCI6MjA2NzI5MTUzN30.AmAhnKnZvDTNTuJ53ctZwyrjYCIjmAgkB8ibV352tmk",
  )
}
