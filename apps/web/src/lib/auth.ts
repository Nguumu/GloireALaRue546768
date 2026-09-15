import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";

/** Redirects to /login (preserving where the user was headed) when no session exists. */
export async function requireUser(nextPath: string) {
  const supabase = getSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(nextPath)}`);
  }

  return { supabase, user };
}
