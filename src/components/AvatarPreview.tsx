import type { Avatar } from "@/lib/avatarParts";

export function AvatarPreview({ avatar, size = 88 }: { avatar: Avatar; size?: number }) {
  // MVP rendering: clean “badge” style. Swap to layered SVG assets later.
  const row = (k: string, v?: string) => (
    <div className="flex items-center justify-between gap-3 text-[12px]">
      <span className="opacity-70">{k}</span>
      <span className="font-medium">{v ?? "—"}</span>
    </div>
  );

  return (
    <div
      className="rounded-2xl border border-black/20 bg-gradient-to-b from-amber-50 to-amber-100 shadow-sm p-3"
      style={{ width: size + 120 }}
      aria-label="Avatar preview"
    >
      <div className="text-sm font-semibold">Adventurer</div>
      <div className="mt-2 flex flex-col gap-1">
        {row("Base", avatar.base)}
        {row("Hair", avatar.hair)}
        {row("Tunic", avatar.tunic)}
        {row("Shield", avatar.shield)}
        {row("Sword", avatar.sword)}
        {row("Companion", avatar.companion)}
        {row("Frame", avatar.frame)}
      </div>
    </div>
  );
}
