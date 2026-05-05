import { createSupabaseServerClient } from "@/lib/supabase/server";

export type AppRole = "ADMIN" | "CUSTOMER";

export async function getCurrentUser() {
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return null;
  const role = (data.user.app_metadata?.role as AppRole | undefined) ?? "CUSTOMER";
  return {
    id: data.user.id,
    email: data.user.email ?? null,
    name: (data.user.user_metadata?.name as string | undefined) ?? null,
    role,
  };
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "ADMIN") throw new Error("UNAUTHORIZED");
  return user;
}
