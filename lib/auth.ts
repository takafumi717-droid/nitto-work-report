import { cookies } from "next/headers";
import { createSupabaseServerClient } from "@/lib/supabase";
import { ADMIN_COOKIE_NAME, verifySessionToken } from "@/lib/session";
import type { Employee } from "@/lib/types";

/**
 * Cookieのセッションから現在ログイン中の管理者情報を取得する。
 * 未ログインの場合はnullを返す。
 */
export async function getCurrentAdmin(): Promise<Employee | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_COOKIE_NAME)?.value;
  const employeeId = await verifySessionToken(token);
  if (!employeeId) return null;

  const supabase = createSupabaseServerClient();
  const { data } = await supabase
    .from("employees")
    .select("*")
    .eq("id", employeeId)
    .eq("is_admin", true)
    .single();

  return (data as Employee) ?? null;
}
