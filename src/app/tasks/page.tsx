"use client";

import { useEffect, useMemo, useState } from "react";
import { AuthGate } from "@/components/AuthGate";
import { TopNav } from "@/components/TopNav";
import { ensureProfile } from "@/lib/ensureProfile";
import { supabase } from "@/lib/supabaseClient";

type TaskType = "daily" | "todo" | "habit";
type Difficulty = "easy" | "medium" | "hard";

type TaskRow = {
  id: string;
  title: string;
  type: TaskType;
  difficulty: Difficulty;
  active: boolean;
  created_at: string;
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<TaskRow[]>([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [type, setType] = useState<TaskType>("daily");
  const [difficulty, setDifficulty] = useState<Difficulty>("easy");

  const grouped = useMemo(() => {
    const by: Record<TaskType, TaskRow[]> = { daily: [], todo: [], habit: [] };
    for (const t of tasks) by[t.type].push(t);
    return by;
  }, [tasks]);

  async function refresh() {
    setLoading(true);
    await ensureProfile();

    const { data: auth } = await supabase.auth.getUser();
    const uid = auth.user?.id;
    if (!uid) return;

    const { data, error } = await supabase
      .from("tasks")
      .select("id,title,type,difficulty,active,created_at")
      .order("created_at", { ascending: false });

    if (error) alert(error.message);
    setTasks((data as any) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function addTask() {
    const trimmed = title.trim();
    if (!trimmed) return;

    const { data: auth } = await supabase.auth.getUser();
    const uid = auth.user?.id;
    if (!uid) return;

    const { error } = await supabase.from("tasks").insert({
      user_id: uid,
      title: trimmed,
      type,
      difficulty,
      active: true,
    });

    if (error) alert(error.message);
    setTitle("");
    await refresh();
  }

  async function toggleActive(task: TaskRow) {
    const { error } = await supabase.from("tasks").update({ active: !task.active }).eq("id", task.id);
    if (error) alert(error.message);
    await refresh();
  }

  async function deleteTask(task: TaskRow) {
    if (!confirm(`Delete “${task.title}”?`)) return;
    const { error } = await supabase.from("tasks").delete().eq("id", task.id);
    if (error) alert(error.message);
    await refresh();
  }

  const section = (label: string, list: TaskRow[]) => (
    <div className="mt-4">
      <div className="text-sm font-semibold opacity-80">{label}</div>
      <div className="mt-2 flex flex-col gap-2">
        {list.length === 0 ? (
          <div className="text-sm opacity-60">No tasks yet.</div>
        ) : (
          list.map((t) => (
            <div key={t.id} className="rounded-2xl border border-black/20 bg-white/70 shadow-sm p-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className={`font-medium ${t.active ? "" : "line-through opacity-60"}`}>{t.title}</div>
                  <div className="text-xs opacity-70 mt-1">
                    {t.type.toUpperCase()} • {t.difficulty.toUpperCase()}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    className="px-3 py-1 rounded-xl border border-black/15 bg-amber-50"
                    onClick={() => toggleActive(t)}
                  >
                    {t.active ? "Archive" : "Unarchive"}
                  </button>
                  <button className="px-3 py-1 rounded-xl border border-black/15 bg-white" onClick={() => deleteTask(t)}>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <AuthGate>
      <TopNav />
      <div className="max-w-xl mx-auto p-5">
        <div className="rounded-2xl border border-black/20 bg-white/70 shadow-sm p-5">
          <div className="text-xl font-semibold">Tasks</div>
          <div className="text-sm opacity-75 mt-1">Private to you. Completing tasks earns XP.</div>

          <div className="mt-4 grid gap-2">
            <input
              className="w-full rounded-xl border border-black/20 bg-white p-3"
              placeholder="Add a task…"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
            <div className="grid grid-cols-2 gap-2">
              <select
                className="rounded-xl border border-black/20 bg-white p-3"
                value={type}
                onChange={(e) => setType(e.target.value as TaskType)}
              >
                <option value="daily">Daily</option>
                <option value="todo">To-do</option>
                <option value="habit">Habit</option>
              </select>
              <select
                className="rounded-xl border border-black/20 bg-white p-3"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as Difficulty)}
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
            <button className="w-full rounded-xl bg-black text-white p-3" onClick={addTask}>
              Add task
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-5 text-sm opacity-70">Loading…</div>
        ) : (
          <>
            {section("Dailies", grouped.daily)}
            {section("To-dos", grouped.todo)}
            {section("Habits", grouped.habit)}
          </>
        )}
      </div>
    </AuthGate>
  );
}
