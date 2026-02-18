"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs: Array<{ href: string; label: string }> = [
  { href: "/today", label: "Today" },
  { href: "/tasks", label: "Tasks" },
  { href: "/profile", label: "Profile" },
  { href: "/leaderboard", label: "Leaderboard" },
];

export function TopNav() {
  const path = usePathname();
  return (
    <div className="sticky top-0 z-10 backdrop-blur bg-amber-100/70 border-b border-black/10">
      <div className="max-w-xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-semibold">
          Hero Habits
        </Link>
        <div className="flex gap-1">
          {tabs.map((t) => {
            const active = path?.startsWith(t.href);
            return (
              <Link
                key={t.href}
                href={t.href}
                className={`text-sm px-3 py-1 rounded-xl border border-black/10 ${
                  active ? "bg-black text-white" : "bg-white/60"
                }`}
              >
                {t.label}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
