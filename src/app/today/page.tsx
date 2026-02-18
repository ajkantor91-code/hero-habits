"use client";

import { useEffect, useMemo, useState } from "react";
import { AuthGate } from "@/components/AuthGate";
import { TopNav } from "@/components/TopNav";
import { ensureProfile } from "@/lib/ensureProfile";
import { supabase } from "@/lib/supabaseClient";
import { xpForDifficulty } from "@/lib/game";

type TaskType = "daily" | "todo" | "habit";
type Difficulty = "easy" | "medium" | "hard";

type TaskRow = {
  id: string;
  title: string;
  type: TaskType;
  difficulty: Difficulty;
  active: boolean;
};

type CompletionRow = {
  task_id: string;
  completed_at: string;
};

function startOfTodayIso(): string {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

export default function TodayPage() {
  const [tasks, setTasks] = useState<TaskRow[]>([]);
  const [completedToday, setCompletedToday] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const daily = useMemo(() => tasks.filter((t) => t.active && t.type === "daily"), [tasks]);
  const todo = useMemo(() => tasks.filter((t) => t.active && t.type === "todo"), [tasks]);

  async function refresh() {
    setLoading(true);
    await ensureProfile();

    const { data: auth } = await supabase.auth.getUser();
    const uid = auth.user?.id;
    if (!uid) return;

    const { data: tData, error: tErr } = await supabase
      .from("tasks")
      .select("id,title,type,difficulty,active")
      .eq("active", true)
      .in("type", ["daily", "todo", "habit"])
      .order("created_at", { ascending: false });

    if (tErr) alert(tErr.message);
    setTasks((tData as any) ?? []);

    const since = startOfTodayIso();
    const { data: cData, error: cErr } = await supabase
      .from("task_completions")
      .select("task_id,completed_at")
      .gte("completed_at", since);

    if (cErr) alert(cErr.message);
    const set = new Set<string>();
    for (const r of (cData as CompletionRow[]) ?? []) set.add(r.task_id);
    setCompletedToday(set);

    setLoading(false);
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function completeTask(t: TaskRow) {
    try {
      setBusy(t.id);
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth.user?.id;
      if (!uid) return;

      // Prevent double-completing dailies within a day
      if (t.type === "daily" && completedToday.has(t.id)) return;

      const xp = xpForDifficulty(t.difficulty);
      const { error: insErr } = await supabase.from("task_completions").insert({
        user_id: uid,
        task_id: t.id,
        xp_awarded: xp,
      });
      if (insErr) throw insErr;

      // For to-dos, auto-archive when completed once
      if (t.type === "todo") {
        const { error: updErr } = await supabase.from("tasks").update({ active: false }).eq("id", t.id);
        if (updErr) throw updErr;
      }

      await refresh();
    } catch (e: any) {
      alert(e?.message ?? "Something went wrong");
    } finally {
      setBusy(null);
    }
  }

  const taskCard = (t: TaskRow) => {
    const done = t.type === "daily" && completedToday.has(t.id);
    const xp = xpForDifficulty(t.difficulty);

    return (
      <div key={t.id} className="rounded-2xl border border-black/20 bg-white/70 shadow-sm p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className={`font-medium ${done ? "line-through opacity-60" : ""}`}>{t.title}</div>
            <div className="text-xs opacity-70 mt-1">
              {t.type.toUpperCase()} • {t.difficulty.toUpperCase()} • +{xp} XP
            </div>
          </div>
          <button
            className={`px-4 py-2 rounded-xl border border-black/15 ${done ? "bg-black/10 opacity-60" : "bg-black text-white"}`}
            disabled={done || busy === t.id}
            onClick={() => completeTask(t)}
          >
            {done ? "Done" : busy === t.id ? "…" : "Complete"}
          </button>
        </div>
      </div>
    );
  };

  return (
    <AuthGate>
      <TopNav />
      <div className="max-w-xl mx-auto p-5">
        <div className="rounded-2xl border border-black/20 bg-white/70 shadow-sm p-5">
          <div className="text-xl font-semibold">Today</div>
          <div className="text-sm opacity-75 mt-1">Only positive rewards. Daily tasks can be completed once per day.</div>
        </div>

        {loading ? (
          <div className="p-5 text-sm opacity-70">Loading…</div>
        ) : (
          <>
            <div className="mt-5">
              <div className="text-sm font-semibold opacity-80">Dailies</div>
              <div className="mt-2 flex flex-col gap-2">
                {daily.length === 0 ? (
                  <div className="text-sm opacity-60">No dailies. Add some in Tasks.</div>
                ) : (
                  daily.map(taskCard)
                )}
              </div>
            </div>

            <div className="mt-5">
              <div className="text-sm font-semibold opacity-80">To-dos</div>
              <div className="mt-2 flex flex-col gap-2">
                {todo.length === 0 ? (
                  <div className="text-sm opacity-60">No to-dos. Add some in Tasks.</div>
                ) : (
                  todo.map(taskCard)
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </AuthGate>
  );
}
