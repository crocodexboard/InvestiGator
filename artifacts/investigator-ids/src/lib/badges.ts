export type BadgeRarity = "normal" | "rare" | "ciel" | "epic" | "angellic" | "mad-scientist";

export interface BadgeInfo {
  name: string;
  rarity: BadgeRarity;
}

export const ALL_BADGES: BadgeInfo[] = [
  // Normal
  { name: "Destiny Awaits Me", rarity: "normal" },
  { name: "Greatest Fool", rarity: "normal" },
  { name: "I am Doomed", rarity: "normal" },
  { name: "Survivor of Many", rarity: "normal" },
  // Rare
  { name: "Thank you, my friend", rarity: "rare" },
  { name: "Companionship is My Middle Name", rarity: "rare" },
  { name: "Survivor of Most", rarity: "rare" },
  { name: "I pray to...", rarity: "rare" },
  { name: "Bachelor of Demonology", rarity: "rare" },
  { name: "Great Explorer of Doors", rarity: "rare" },
  { name: "Shady, Not", rarity: "rare" },
  // Ciel
  { name: "Ciel Phantomhive", rarity: "ciel" },
  // Epic
  { name: "Professional InvestiGator", rarity: "epic" },
  { name: "Survivor of All", rarity: "epic" },
  { name: "Eternal Damnation", rarity: "epic" },
  { name: "Fear is Afraid of ME", rarity: "epic" },
  { name: "Not a Scaredy-Cat", rarity: "epic" },
  { name: "I've Met the Witch", rarity: "epic" },
  { name: "Hexxed", rarity: "epic" },
  { name: "Doomsday Survivor", rarity: "epic" },
  { name: "Repented", rarity: "epic" },
  { name: "Ghostly Daydreams", rarity: "epic" },
  { name: "Worthy of Companionship", rarity: "epic" },
  // Angellic
  { name: "Seraph of the Night", rarity: "angellic" },
  // Mad Scientist (event badge)
  { name: "Mad Scientist", rarity: "mad-scientist" },
];

export function getBadgeRarity(name: string): BadgeRarity {
  return ALL_BADGES.find(b => b.name === name)?.rarity ?? "normal";
}
