"use client";

import { useEffect, useMemo, useState } from "react";
import { AuthGate } from "@/components/AuthGate";
import { TopNav } from "@/components/TopNav";
import { AvatarPreview } from "@/components/AvatarPreview";
import type { Avatar } from "@/lib/avatarParts";
import { ensureProfile } from "@/lib/ensureProfile";
import { supabase } from "@/lib/supabaseClient";
import { levelFromTotalXp } from "@/lib/game";

type WeeklyRow = {
  user_id: string;
  display_name: string;
  avatar_json: Avatar;
  weekly_xp: number;
};

type AllTimeRow = {
  user_id: string;
  display_name: string;
  avatar_json: Avatar;
  total_xp: number;
};

export default function LeaderboardPage() {
  const [tab, setTab] = useState<"weekly" | "all">("weekly");
  const [weekly, setWeekly] = useState<WeeklyRow[]>([]);
  const [all, setAll] = useState<AllTimeRow[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    await ensureProfile();

    const w = await supabase.from("v_leaderboard_weekly").select("user_id,display_name,avatar_json,weekly_xp");
    const a = await supabase.from("v_leaderboard_all_time").select("user_id,display_name,avatar_json,total_xp");

    if (w.error) alert(w.error.message);
    if (a.error) alert(a.error.message);

    const wRows = ((w.data as any) ?? []) as WeeklyRow[];
    const aRows = ((a.data as any) ?? []) as AllTimeRow[];

    wRows.sort((x, y) => (y.weekly_xp ?? 0) - (x.weekly_xp ?? 0));
    aRows.sort((x, y) => (y.total_xp ?? 0) - (x.total_xp ?? 0));

    setWeekly(wRows);
    setAll(aRows);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const rows = useMemo(() => {
    if (tab === "weekly") {
      return weekly.map((r) => ({
        id: r.user_id,
        name: r.display_name,
        avatar: r.avatar_json,
        score: r.weekly_xp ?? 0,
        scoreLabel: "XP this week",
        level: null,
      }));
    }

    return all.map((r) => {
      const { level } = levelFromTotalXp(r.total_xp ?? 0);
      return {
        id: r.user_id,
        name: r.display_name,
        avatar: r.avatar_json,
        score: r.total_xp ?? 0,
        scoreLabel: "Total XP",
        level,
      };
    });
  }, [tab, weekly, all]);

  return (
    <AuthGate>
      <TopNav />
      <div className="max-w-xl mx-auto p-5">
        <div className="rounded-2xl border border-black/20 bg-white/70 shadow-sm p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-xl font-semibold">Leaderboard</div>
              <div className="text-sm opacity-75 mt-1">Shows name + avatar + XP (never tasks).</div>
            </div>
            <div className="flex gap-2">
              <button
                className={`px-3 py-2 rounded-xl border border-black/15 ${tab === "weekly" ? "bg-black text-white" : "bg-white/60"}`}
                onClick={() => setTab("weekly")}
              >
                Weekly
              </button>
              <button
                className={`px-3 py-2 rounded-xl border border-black/15 ${tab === "all" ? "bg-black text-white" : "bg-white/60"}`}
                onClick={() => setTab("all")}
              >
                All-time
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="p-5 text-sm opacity-70">Loading…</div>
        ) : (
          <div className="mt-4 flex flex-col gap-3">
            {rows.length === 0 ? (
              <div className="text-sm opacity-60">No players yet.</div>
            ) : (
              rows.map((r, idx) => (
                <div key={r.id} className="rounded-2xl border border-black/20 bg-white/70 shadow-sm p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="text-lg font-semibold w-6">{idx + 1}</div>
                      <div>
                        <div className="font-semibold">{r.name}</div>
                        <div className="text-xs opacity-70 mt-1">
                          {r.score} {r.scoreLabel}{r.level ? ` • Lv ${r.level}` : ""}
                        </div>
                      </div>
                    </div>
                    <div className="hidden sm:block">
                      <AvatarPreview avatar={r.avatar ?? {}} size={72} />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </AuthGate>
  );
}
