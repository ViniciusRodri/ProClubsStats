"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

function falhar(path: string, message: string): never {
  redirect(`${path}?erro=${encodeURIComponent(message)}`);
}

async function uploadPhotoIfProvided(formData: FormData, seed: string) {
  const supabase = await createClient();
  const file = formData.get("photo") as File | null;
  if (!file || file.size === 0) return undefined;

  const ext = file.name.split(".").pop();
  const path = `${seed}-${Date.now()}.${ext}`;

  const { error } = await supabase.storage.from("player-photos").upload(path, file, {
    upsert: true,
  });
  if (error) throw new Error(`Falha ao enviar a foto: ${error.message}`);

  const { data } = supabase.storage.from("player-photos").getPublicUrl(path);
  return data.publicUrl;
}

export async function createPlayer(teamId: string, formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const position = String(formData.get("position") ?? "").trim() || null;
  const shirtNumberRaw = String(formData.get("shirt_number") ?? "").trim();
  const shirt_number = shirtNumberRaw ? Number(shirtNumberRaw) : null;
  const is_goalkeeper = formData.get("is_goalkeeper") === "on";

  if (!name) falhar(`/admin/times/${teamId}`, "Nome do jogador é obrigatório.");

  try {
    const supabase = await createClient();
    const { data: player, error } = await supabase
      .from("players")
      .insert({ team_id: teamId, name, position, shirt_number, is_goalkeeper })
      .select()
      .single();
    if (error) throw new Error(error.message);

    const photoUrl = await uploadPhotoIfProvided(formData, player.id);
    if (photoUrl) {
      await supabase.from("players").update({ photo_url: photoUrl }).eq("id", player.id);
    }
  } catch (e) {
    falhar(
      `/admin/times/${teamId}`,
      e instanceof Error ? e.message : "Erro ao cadastrar o jogador."
    );
  }

  revalidatePath(`/admin/times/${teamId}`);
  revalidatePath(`/times/${teamId}`);
}

export async function updatePlayer(playerId: string, teamId: string, formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  const position = String(formData.get("position") ?? "").trim() || null;
  const shirtNumberRaw = String(formData.get("shirt_number") ?? "").trim();
  const shirt_number = shirtNumberRaw ? Number(shirtNumberRaw) : null;
  const is_goalkeeper = formData.get("is_goalkeeper") === "on";

  try {
    const supabase = await createClient();
    const photoUrl = await uploadPhotoIfProvided(formData, playerId);

    const { error } = await supabase
      .from("players")
      .update({
        name,
        position,
        shirt_number,
        is_goalkeeper,
        ...(photoUrl ? { photo_url: photoUrl } : {}),
      })
      .eq("id", playerId);
    if (error) throw new Error(error.message);
  } catch (e) {
    falhar(`/admin/times/${teamId}`, e instanceof Error ? e.message : "Erro ao salvar o jogador.");
  }

  revalidatePath(`/admin/times/${teamId}`);
  revalidatePath(`/times/${teamId}`);
}

export async function deletePlayer(playerId: string, teamId: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("players").delete().eq("id", playerId);
  if (error) falhar(`/admin/times/${teamId}`, error.message);

  revalidatePath(`/admin/times/${teamId}`);
  revalidatePath(`/times/${teamId}`);
}