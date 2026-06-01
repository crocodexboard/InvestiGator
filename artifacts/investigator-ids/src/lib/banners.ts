export interface BannerPreset {
  id: string;
  label: string;
  gradient: string;
}

export const BANNER_PRESETS: BannerPreset[] = [
  {
    id: "none",
    label: "None",
    gradient: "",
  },
  {
    id: "crimson-void",
    label: "Crimson Void",
    gradient: "linear-gradient(135deg, #1a0000 0%, #8b0000 50%, #1a0000 100%)",
  },
  {
    id: "blood-moon",
    label: "Blood Moon",
    gradient: "linear-gradient(180deg, #0a0000 0%, #5a0000 40%, #8b0000 70%, #3a0000 100%)",
  },
  {
    id: "nightmare",
    label: "Nightmare",
    gradient: "linear-gradient(135deg, #050010 0%, #3d0066 50%, #050010 100%)",
  },
  {
    id: "abyss",
    label: "Abyss",
    gradient: "linear-gradient(180deg, #000000 0%, #0f0f0f 50%, #000000 100%)",
  },
  {
    id: "hellfire",
    label: "Hellfire",
    gradient: "linear-gradient(135deg, #1a0000 0%, #8b2000 40%, #d44000 70%, #8b2000 100%)",
  },
  {
    id: "phantom",
    label: "Phantom",
    gradient: "linear-gradient(135deg, #000510 0%, #001565 50%, #000510 100%)",
  },
  {
    id: "rot",
    label: "Rot",
    gradient: "linear-gradient(135deg, #0a0800 0%, #3a2800 50%, #0a0800 100%)",
  },
  {
    id: "witchcraft",
    label: "Witchcraft",
    gradient: "linear-gradient(135deg, #080008 0%, #600060 50%, #080008 100%)",
  },
  {
    id: "starless",
    label: "Starless Night",
    gradient: "linear-gradient(180deg, #000005 0%, #05001a 50%, #000005 100%)",
  },
  {
    id: "lake-of-fire",
    label: "Lake of Fire",
    gradient: "linear-gradient(180deg, #100200 0%, #8b3000 40%, #ff5500 60%, #8b3000 80%, #100200 100%)",
  },
  {
    id: "siren-deep",
    label: "Siren Deep",
    gradient: "linear-gradient(180deg, #000a10 0%, #003344 50%, #006688 70%, #000a10 100%)",
  },
];

export function getBannerStyle(banner: string | null | undefined): string {
  if (!banner || banner === "none") return "";
  const preset = BANNER_PRESETS.find(p => p.id === banner);
  if (preset) return preset.gradient;
  if (banner.startsWith("#") || banner.startsWith("rgb") || banner.startsWith("hsl")) {
    return banner;
  }
  return banner;
}

export function getBannerCss(banner: string | null | undefined): Record<string, string> {
  if (!banner || banner === "none" || banner.startsWith("custom:")) return {};
  if (banner.startsWith("#")) return { background: banner, backgroundColor: banner };
  const preset = BANNER_PRESETS.find(p => p.id === banner);
  if (preset?.gradient) return { background: preset.gradient };
  return {};
}
