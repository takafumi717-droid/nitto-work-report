"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createSupabaseServerClient } from "@/lib/supabase";

export async function createEmployee(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return;

  const supabase = createSupabaseServerClient();

  const { data: maxRow } = await supabase
    .from("employees")
    .select("sort_order")
    .order("sort_order", { ascending: false })
    .limit(1)
    .single();

  const nextSortOrder = (maxRow?.sort_order ?? 0) + 1;

  await supabase.from("employees").insert({
    name,
    sort_order: nextSortOrder,
    is_admin: false,
    is_active: true,
  });

  revalidatePath("/admin/employees");
  redirect("/admin/employees");
}

export async function updateEmployee(id: string, formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const isAdmin = formData.get("is_admin") === "on";
  const adminPin = String(formData.get("admin_pin") ?? "").trim();

  if (!name) return;

  const supabase = createSupabaseServerClient();

  await supabase
    .from("employees")
    .update({
      name,
      is_admin: isAdmin,
      admin_pin: isAdmin ? (adminPin || null) : null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  revalidatePath("/admin/employees");
  redirect("/admin/employees");
}

export async function toggleActive(id: string, currentActive: boolean) {
  const supabase = createSupabaseServerClient();
  await supabase
    .from("employees")
    .update({ is_active: !currentActive, updated_at: new Date().toISOString() })
    .eq("id", id);

  revalidatePath("/admin/employees");
}

export async function moveOrder(id: string, direction: "up" | "down") {
  const supabase = createSupabaseServerClient();

  const { data: all } = await supabase
    .from("employees")
    .select("id, sort_order")
    .order("sort_order", { ascending: true });

  if (!all) return;

  const index = all.findIndex((e) => e.id === id);
  if (index === -1) return;

  const targetIndex = direction === "up" ? index - 1 : index + 1;
  if (targetIndex < 0 || targetIndex >= all.length) return;

  const current = all[index];
  const target = all[targetIndex];

  await supabase.from("employees").update({ sort_order: target.sort_order }).eq("id", current.id);
  await supabase.from("employees").update({ sort_order: current.sort_order }).eq("id", target.id);

  revalidatePath("/admin/employees");
}
