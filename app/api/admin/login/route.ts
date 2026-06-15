import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase";
import { ADMIN_COOKIE_NAME, createSessionToken } from "@/lib/session";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const pin = body?.pin;

  if (typeof pin !== "string" || !/^\d{4}$/.test(pin)) {
    return NextResponse.json({ error: "PINは4桁の数字で入力してください" }, { status: 400 });
  }

  const supabase = createSupabaseServerClient();
  const { data: admin } = await supabase
    .from("employees")
    .select("id")
    .eq("is_admin", true)
    .eq("is_active", true)
    .eq("admin_pin", pin)
    .maybeSingle();

  if (!admin) {
    return NextResponse.json({ error: "PINが正しくありません" }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE_NAME, await createSessionToken(admin.id), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  return response;
}
