export interface PatternCss {
  backgroundColor: string;
  backgroundImage: string;
  backgroundSize: string;
  backgroundRepeat: string;
}

export const BANNER_PATTERN_TYPES = [
  { id: "skulls", label: "☠ Skull Ward" },
  { id: "pentacle", label: "⛧ Inverted Pentacle" },
  { id: "angel", label: "✝ Angel Vigil" },
  { id: "cosmic", label: "★ Cosmic Void" },
  { id: "crosses", label: "✞ Gothic Crosses" },
  { id: "eyes", label: "◎ All-Seeing Eye" },
  { id: "bats", label: "〓 Bat Swarm" },
  { id: "cobwebs", label: "⬡ Cobweb" },
  { id: "roses", label: "✿ Blood Roses" },
  { id: "runes", label: "ᚠ Rune Script" },
  { id: "solid", label: "⬛ Solid Color" },
];

function enc(svg: string): string {
  return `url("data:image/svg+xml,${encodeURIComponent(svg.replace(/\s+/g, " ").trim())}")`;
}

function skulls(p: string, _s: string, bg: string): PatternCss {
  return {
    backgroundColor: bg,
    backgroundImage: enc(`<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48"><rect width="48" height="48" fill="${bg}"/><text x="24" y="36" text-anchor="middle" font-size="28" fill="${p}" opacity="0.85" font-family="serif">&#9760;</text></svg>`),
    backgroundSize: "48px 48px",
    backgroundRepeat: "repeat",
  };
}

function pentacle(p: string, _s: string, bg: string): PatternCss {
  return {
    backgroundColor: bg,
    backgroundImage: enc(`<svg xmlns="http://www.w3.org/2000/svg" width="44" height="44"><rect width="44" height="44" fill="${bg}"/><g transform="translate(22,22)"><circle r="15" fill="none" stroke="${p}" stroke-width="1.1" opacity="0.75"/><path d="M0,15 L-8.82,-12.14 L14.27,4.64 L-14.27,4.64 L8.82,-12.14 Z" fill="none" stroke="${p}" stroke-width="1.3" stroke-linejoin="round" opacity="0.9"/></g></svg>`),
    backgroundSize: "44px 44px",
    backgroundRepeat: "repeat",
  };
}

function angel(p: string, s: string, bg: string): PatternCss {
  return {
    backgroundColor: bg,
    backgroundImage: enc(`<svg xmlns="http://www.w3.org/2000/svg" width="44" height="48"><rect width="44" height="48" fill="${bg}"/><text x="22" y="34" text-anchor="middle" font-size="24" fill="${p}" opacity="0.8" font-family="serif">&#10013;</text><text x="10" y="16" font-size="10" fill="${s}" opacity="0.55" font-family="serif">&#10022;</text><text x="34" y="16" font-size="10" fill="${s}" opacity="0.55" font-family="serif">&#10022;</text></svg>`),
    backgroundSize: "44px 48px",
    backgroundRepeat: "repeat",
  };
}

function cosmic(p: string, s: string, bg: string): PatternCss {
  return {
    backgroundColor: bg,
    backgroundImage: enc(`<svg xmlns="http://www.w3.org/2000/svg" width="52" height="36"><rect width="52" height="36" fill="${bg}"/><text x="6" y="22" font-size="16" fill="${p}" opacity="0.9" font-family="serif">&#9733;</text><text x="28" y="28" font-size="11" fill="${s}" opacity="0.7" font-family="serif">&#10022;</text><text x="44" y="14" font-size="9" fill="${p}" opacity="0.6">&#183;</text><text x="18" y="12" font-size="12" fill="${p}" opacity="0.5" font-family="serif">&#9789;</text><text x="40" y="30" font-size="8" fill="${s}" opacity="0.45">&#183;</text></svg>`),
    backgroundSize: "52px 36px",
    backgroundRepeat: "repeat",
  };
}

function crosses(p: string, _s: string, bg: string): PatternCss {
  return {
    backgroundColor: bg,
    backgroundImage: enc(`<svg xmlns="http://www.w3.org/2000/svg" width="36" height="44"><rect width="36" height="44" fill="${bg}"/><text x="18" y="33" text-anchor="middle" font-size="24" fill="${p}" opacity="0.85" font-family="serif">&#10013;</text></svg>`),
    backgroundSize: "36px 44px",
    backgroundRepeat: "repeat",
  };
}

function eyes(p: string, s: string, bg: string): PatternCss {
  return {
    backgroundColor: bg,
    backgroundImage: enc(`<svg xmlns="http://www.w3.org/2000/svg" width="60" height="38"><rect width="60" height="38" fill="${bg}"/><path d="M5,19 Q30,4 55,19 Q30,34 5,19 Z" fill="none" stroke="${p}" stroke-width="1.5" opacity="0.75"/><circle cx="30" cy="19" r="7.5" fill="none" stroke="${p}" stroke-width="1.5" opacity="0.75"/><circle cx="30" cy="19" r="3.8" fill="${p}" opacity="0.85"/><circle cx="28" cy="17" r="1.3" fill="${s}" opacity="0.65"/></svg>`),
    backgroundSize: "60px 38px",
    backgroundRepeat: "repeat",
  };
}

function bats(p: string, _s: string, bg: string): PatternCss {
  return {
    backgroundColor: bg,
    backgroundImage: enc(`<svg xmlns="http://www.w3.org/2000/svg" width="60" height="34"><rect width="60" height="34" fill="${bg}"/><circle cx="30" cy="20" r="3.8" fill="${p}" opacity="0.9"/><path d="M26,19 Q18,10 5,15 Q14,17 19,20 Q22,21 26,20 Z" fill="${p}" opacity="0.9"/><path d="M34,19 Q42,10 55,15 Q46,17 41,20 Q38,21 34,20 Z" fill="${p}" opacity="0.9"/><path d="M27.5,16.5 L25,9 L30,13 Z" fill="${p}" opacity="0.9"/><path d="M32.5,16.5 L35,9 L30,13 Z" fill="${p}" opacity="0.9"/></svg>`),
    backgroundSize: "60px 34px",
    backgroundRepeat: "repeat",
  };
}

function cobwebs(p: string, _s: string, bg: string): PatternCss {
  return {
    backgroundColor: bg,
    backgroundImage: enc(`<svg xmlns="http://www.w3.org/2000/svg" width="52" height="52"><rect width="52" height="52" fill="${bg}"/><g stroke="${p}" stroke-width="0.8" fill="none" opacity="0.7"><line x1="26" y1="26" x2="26" y2="4"/><line x1="26" y1="26" x2="44" y2="15"/><line x1="26" y1="26" x2="44" y2="37"/><line x1="26" y1="26" x2="26" y2="48"/><line x1="26" y1="26" x2="8" y2="37"/><line x1="26" y1="26" x2="8" y2="15"/></g><g stroke="${p}" stroke-width="0.8" fill="none"><polygon points="26,11 37.5,18 37.5,32 26,39 14.5,32 14.5,18" opacity="0.55"/><polygon points="26,16 33,20.5 33,31.5 26,36 19,31.5 19,20.5" opacity="0.45"/><polygon points="26,20 30,22.5 30,29.5 26,32 22,29.5 22,22.5" opacity="0.35"/></g></svg>`),
    backgroundSize: "52px 52px",
    backgroundRepeat: "repeat",
  };
}

function roses(p: string, s: string, bg: string): PatternCss {
  return {
    backgroundColor: bg,
    backgroundImage: enc(`<svg xmlns="http://www.w3.org/2000/svg" width="36" height="48"><rect width="36" height="48" fill="${bg}"/><text x="18" y="30" text-anchor="middle" font-size="22" fill="${p}" opacity="0.85" font-family="serif">&#10047;</text><text x="18" y="43" text-anchor="middle" font-size="12" fill="${s}" opacity="0.5" font-family="serif">|</text></svg>`),
    backgroundSize: "36px 48px",
    backgroundRepeat: "repeat",
  };
}

function runes(p: string, _s: string, bg: string): PatternCss {
  return {
    backgroundColor: bg,
    backgroundImage: enc(`<svg xmlns="http://www.w3.org/2000/svg" width="64" height="24"><rect width="64" height="24" fill="${bg}"/><text x="4" y="18" font-size="15" font-family="serif" fill="${p}" opacity="0.82">&#5792;&#5794;&#5798;&#5800;&#5809;&#5810;</text></svg>`),
    backgroundSize: "64px 24px",
    backgroundRepeat: "repeat",
  };
}

function solid(p: string, _s: string, bg: string): PatternCss {
  return {
    backgroundColor: bg,
    backgroundImage: "none",
    backgroundSize: "auto",
    backgroundRepeat: "no-repeat",
  };
}

const RENDERERS: Record<string, (p: string, s: string, bg: string) => PatternCss> = {
  skulls, pentacle, angel, cosmic, crosses, eyes, bats, cobwebs, roses, runes, solid,
};

export function getBannerPatternStyle(
  patternType: string,
  primaryColor: string,
  secondaryColor: string,
  bgColor: string,
): Record<string, string> {
  const renderer = RENDERERS[patternType] ?? solid;
  const css = renderer(primaryColor, secondaryColor, bgColor);
  return {
    backgroundColor: css.backgroundColor,
    backgroundImage: css.backgroundImage,
    backgroundSize: css.backgroundSize,
    backgroundRepeat: css.backgroundRepeat,
  };
}
