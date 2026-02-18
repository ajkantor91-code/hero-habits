import { supabase } from "@/lib/supabaseClient";

export async function ensureProfile() {
  const { data: auth } = await supabase.auth.getUser();
  const user = auth.user;
  if (!user) return;

  const { data: existing, error: readErr } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (readErr) throw readErr;

  if (!existing) {
    const display = (user.email?.split("@")[0] || "Hero").slice(0, 24);
    const { error: insErr } = await supabase.from("profiles").insert({
      id: user.id,
      display_name: display,
      avatar_json: { base: "hylian_1", tunic: "green_1", companion: "fairy_1" },
    });
    if (insErr) throw insErr;
  }
}
