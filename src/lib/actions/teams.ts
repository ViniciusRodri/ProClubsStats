"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

async function uploadLogoIfProvided(formData: FormData, teamId: string) {
  const supabase = await createClient();
  const file = formData.get("logo") as File | null;
  if (!file || file.size === 0) return undefined;

  const ext = file.name.split(".").pop();
  const path = `${teamId}-${Date.now()}.${ext}`;

  const { error } = await supabase.storage.from("team-logos").upload(path, file, {
    upsert: true,
  });
  if (error) throw new Error(error.message);

  const { data } = supabase.storage.from("team-logos").getPublicUrl(path);
  return data.publicUrl;
}

export async function createTeam(formData: FormData) {
  const supabase = await createClient();
  const name = String(formData.get("name") ?? "").trim();
  const short_name = String(formData.get("short_name") ?? "").trim() || null;
  const group_name = String(formData.get("group_name") ?? "") || null;

  if (!name) throw new Error("Nome do time é obrigatório.");

  const { data: team, error } = await supabase
    .from("teams")
    .insert({ name, short_name, group_name })
    .select()
    .single();
  if (error) throw new Error(error.message);

  const logoUrl = await uploadLogoIfProvided(formData, team.id);
  if (logoUrl) {
    await supabase.from("teams").update({ logo_url: logoUrl }).eq("id", team.id);
  }

  revalidatePath("/admin/times");
  revalidatePath("/times");
  redirect("/admin/times");
}

export async function updateTeam(teamId: string, formData: FormData) {
  const supabase = await createClient();
  const name = String(formData.get("name") ?? "").trim();
  const short_name = String(formData.get("short_name") ?? "").trim() || null;
  const group_name = String(formData.get("group_name") ?? "") || null;

  const logoUrl = await uploadLogoIfProvided(formData, teamId);

  const { error } = await supabase
    .from("teams")
    .update({
      name,
      short_name,
      group_name,
      ...(logoUrl ? { logo_url: logoUrl } : {}),
    })
    .eq("id", teamId);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/times");
  revalidatePath(`/admin/times/${teamId}`);
  revalidatePath("/times");
  revalidatePath(`/times/${teamId}`);
  redirect("/admin/times");
}

export async function deleteTeam(teamId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("teams").delete().eq("id", teamId);
  if (error) throw new Error(error.message);

  revalidatePath("/admin/times");
  revalidatePath("/times");
}
