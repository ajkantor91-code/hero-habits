"use client";

import { useEffect, useMemo, useState } from "react";
import { AuthGate } from "@/components/AuthGate";
import { TopNav } from "@/components/TopNav";
import { AvatarPreview } from "@/components/AvatarPreview";
import { AVATAR_PARTS, type Avatar, type AvatarPartKey } from "@/lib/avatarParts";
import { ensureProfile } from "@/lib/ensureProfile";
import { supabase } from "@/lib/supabaseClient";

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [avatar, setAvatar] = useState<Avatar>({});

  const keys = useMemo(() => Object.keys(AVATAR_PARTS) as AvatarPartKey[], []);

  async function load() {
    setLoading(true);
    await ensureProfile();

    const { data: auth } = await supabase.auth.getUser();
    const uid = auth.user?.id;
    if (!uid) return;

    const { data, error } = await supabase
      .from("profiles")
      .select("display_name,avatar_json")
      .eq("id", uid)
      .single();

    if (error) alert(error.message);
    setDisplayName(data?.display_name ?? "");
    setAvatar((data?.avatar_json as any) ?? {});
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function pick(part: AvatarPartKey, value: string) {
    setAvatar((a) => ({ ...a, [part]: value }));
  }

  async function save() {
    const name = displayName.trim();
    if (name.length < 2 || name.length > 24) {
      alert("Display name must be 2–24 characters.");
      return;
    }

    setSaving(true);
    try {
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth.user?.id;
      if (!uid) return;

      const { error } = await supabase
        .from("profiles")
        .update({ display_name: name, avatar_json: avatar })
        .eq("id", uid);

      if (error) throw error;
      alert("Saved!");
    } catch (e: any) {
      alert(e?.message ?? "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  const partLabel: Record<AvatarPartKey, string> = {
    base: "Base",
    hair: "Hair / Hat",
    tunic: "Tunic",
    shield: "Shield",
    sword: "Sword",
    companion: "Companion",
    frame: "Frame",
  };

  return (
    <AuthGate>
      <TopNav />
      <div className="max-w-xl mx-auto p-5">
        <div className="rounded-2xl border border-black/20 bg-white/70 shadow-sm p-5">
          <div className="text-xl font-semibold">Profile</div>
          <div className="text-sm opacity-75 mt-1">Your tasks are private, but your name + avatar appear on leaderboards.</div>

          {loading ? (
            <div className="mt-4 text-sm opacity-70">Loading…</div>
          ) : (
            <>
              <div className="mt-4">
                <div className="text-sm font-semibold opacity-80">Display name</div>
                <input
                  className="mt-2 w-full rounded-xl border border-black/20 bg-white p-3"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  maxLength={24}
                />
              </div>

              <div className="mt-5">
                <div className="text-sm font-semibold opacity-80">Avatar</div>
                <div className="mt-2">
                  <AvatarPreview avatar={avatar} />
                </div>

                <div className="mt-4 grid gap-4">
                  {keys.map((k) => (
                    <div key={k}>
                      <div className="text-sm font-semibold opacity-80">{partLabel[k]}</div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {AVATAR_PARTS[k].map((opt) => {
                          const active = avatar[k] === opt;
                          return (
                            <button
                              key={opt}
                              onClick={() => pick(k, opt)}
                              className={`px-3 py-2 rounded-xl border border-black/15 ${
                                active ? "bg-black text-white" : "bg-white/70"
                              }`}
                            >
                              {opt}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <button
                className="mt-6 w-full rounded-xl bg-black text-white p-3"
                onClick={save}
                disabled={saving}
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </>
          )}
        </div>
      </div>
    </AuthGate>
  );
}
