"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createPlayer(teamId: string, formData: FormData) {
  const supabase = await createClient();
  const name = String(formData.get("name") ?? "").trim();
  const position = String(formData.get("position") ?? "").trim() || null;
  const shirtNumberRaw = String(formData.get("shirt_number") ?? "").trim();
  const shirt_number = shirtNumberRaw ? Number(shirtNumberRaw) : null;
  const is_goalkeeper = formData.get("is_goalkeeper") === "on";

  if (!name) throw new Error("Nome do jogador é obrigatório.");

  const { error } = await supabase
    .from("players")
    .insert({ team_id: teamId, name, position, shirt_number, is_goalkeeper });
  if (error) throw new Error(error.message);

  revalidatePath(`/admin/times/${teamId}`);
  revalidatePath(`/times/${teamId}`);
}

export async function updatePlayer(playerId: string, teamId: string, formData: FormData) {
  const supabase = await createClient();
  const name = String(formData.get("name") ?? "").trim();
  const position = String(formData.get("position") ?? "").trim() || null;
  const shirtNumberRaw = String(formData.get("shirt_number") ?? "").trim();
  const shirt_number = shirtNumberRaw ? Number(shirtNumberRaw) : null;
  const is_goalkeeper = formData.get("is_goalkeeper") === "on";

  const { error } = await supabase
    .from("players")
    .update({ name, position, shirt_number, is_goalkeeper })
    .eq("id", playerId);
  if (error) throw new Error(error.message);

  revalidatePath(`/admin/times/${teamId}`);
  revalidatePath(`/times/${teamId}`);
}

export async function deletePlayer(playerId: string, teamId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("players").delete().eq("id", playerId);
  if (error) throw new Error(error.message);

  revalidatePath(`/admin/times/${teamId}`);
  revalidatePath(`/times/${teamId}`);
}
