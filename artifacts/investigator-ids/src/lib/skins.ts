export function getSkinClass(skin: string): string {
  const map: Record<string, string> = {
    "Red": "skin-red",
    "Blue": "skin-blue",
    "Purple": "skin-purple",
    "Yellow": "skin-yellow",
    "Pink": "skin-pink",
    "Hoarder": "skin-hoarder",
    "Hexxed of Damned": "skin-hexxed-of-damned",
    "A Nightmare Unseen": "skin-a-nightmare-unseen",
    "Doomsday, Everyday": "skin-doomsday-everyday",
    "Vampire Atrociousity": "skin-vampire-atrociousity",
    "CRUCIFIX, SAVE ME!": "skin-crucifix-save-me",
    "I am Phantomhive": "skin-i-am-phantomhive",
    "I am Siren, Hear me Sing": "skin-i-am-siren-hear-me-sing",
    "Demon Slayer": "skin-demon-slayer",
    "Starlight, Upon Crisis": "skin-starlight-upon-crisis",
    "Baphomet's Follower": "skin-baphomets-follower",
    "Lake of Fire": "skin-lake-of-fire",
    "Sabrael, I am here": "skin-sabrael-i-am-here",
    "Secrets Untold": "skin-secrets-untold",
  };
  return map[skin] ?? "skin-red";
}

export const ALL_SKINS = {
  notSoDetailed: [
    "Red", "Blue", "Purple", "Yellow", "Pink", "Hoarder"
  ],
  detailed: [
    "Hexxed of Damned", "A Nightmare Unseen", "Doomsday, Everyday",
    "Vampire Atrociousity", "CRUCIFIX, SAVE ME!", "I am Phantomhive",
    "I am Siren, Hear me Sing", "Demon Slayer", "Starlight, Upon Crisis",
    "Baphomet's Follower", "Lake of Fire", "Sabrael, I am here", "Secrets Untold"
  ]
};
