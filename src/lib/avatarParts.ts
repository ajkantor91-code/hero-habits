export type Avatar = {
  base?: string;
  hair?: string;
  tunic?: string;
  shield?: string;
  sword?: string;
  companion?: string;
  frame?: string;
};

export const AVATAR_PARTS = {
  base: ["hylian_1", "hylian_2"],
  hair: ["short_1", "long_1", "cap_1"],
  tunic: ["green_1", "blue_1", "red_1"],
  shield: ["wood_1", "iron_1"],
  sword: ["basic_1", "masterish_1"],
  companion: ["fairy_1", "none"],
  frame: ["none", "triforce_1"],
} as const;

export type AvatarPartKey = keyof typeof AVATAR_PARTS;
