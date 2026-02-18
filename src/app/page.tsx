"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AuthGate } from "@/components/AuthGate";
import { supabase } from "@/lib/supabaseClient";
import { ensureProfile } from "@/lib/ensureProfile";
import { levelFromTotalXp } from "@/lib/game";

export default function HomePage() {
  const [name, setName] = useState("Hero");
  const [totalXp, setTotalXp] = useState(0);

  useEffect(() => {
    (async () => {
      await ensureProfile();

      const { data: auth } = await supabase.auth.getUser();
      const uid = auth.user?.id;
      if (!uid) return;

      const prof = await supabase.from("profiles").select("display_name").eq("id", uid).single();
      if (prof.data?.display_name) setName(prof.data.display_name);

      const xp = await supabase.from("task_completions").select("xp_awarded").eq("user_id", uid);
      const sum = (xp.data ?? []).reduce((a: number, r: any) => a + (r.xp_awarded ?? 0), 0);
      setTotalXp(sum);
    })();
  }, []);

  const { level, progress, next } = levelFromTotalXp(totalXp);

  return (
    <AuthGate>
      <div className="max-w-xl mx-auto p-5">
        <div className="rounded-2xl border border-black/20 bg-white/70 shadow-sm p-5">
          <div className="text-sm opacity-70">Welcome,</div>
          <div className="text-2xl font-semibold">{name}</div>

          <div className="mt-4">
            <div className="text-sm opacity-80">Level {level}</div>
            <div className="mt-2 h-3 rounded-full bg-black/10 overflow-hidden">
              <div className="h-full bg-black" style={{ width: `${Math.round((progress / next) * 100)}%` }} />
            </div>
            <div className="text-xs opacity-70 mt-1">
              {progress} / {next} XP to next level
            </div>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <Link className="rounded-xl border border-black/20 bg-amber-50 p-3 text-center" href="/today">
              Today
            </Link>
            <Link className="rounded-xl border border-black/20 bg-amber-50 p-3 text-center" href="/tasks">
              Tasks
            </Link>
            <Link className="rounded-xl border border-black/20 bg-amber-50 p-3 text-center" href="/profile">
              Profile + Avatar
            </Link>
            <Link className="rounded-xl border border-black/20 bg-amber-50 p-3 text-center" href="/leaderboard">
              Leaderboard
            </Link>
          </div>

          <button className="mt-5 w-full rounded-xl bg-black text-white p-3" onClick={() => supabase.auth.signOut()}>
            Sign out
          </button>

          <div className="text-xs opacity-60 mt-3">
            Tip: on iPhone Safari, tap Share → <span className="font-medium">Add to Home Screen</span>.
          </div>
        </div>
      </div>
    </AuthGate>
  );
}
