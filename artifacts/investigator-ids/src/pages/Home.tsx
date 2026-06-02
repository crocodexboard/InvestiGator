import { useLocation, Link } from "wouter";
import { Plus, Skull, Pencil } from "lucide-react";
import {
  useListProfiles, useListCustomBadges, useListCustomBanners, useListMaps,
  useListCustomBorders,
  ProfileRecord, CustomBadgeRecord, CustomBannerRecord, MapRecord, CustomBorderRecord,
} from "@workspace/api-client-react";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getSkinClass } from "@/lib/skins";
import { getBadgeRarity } from "@/lib/badges";
import { getBannerCss } from "@/lib/banners";
import { getBannerPatternStyle } from "@/lib/bannerPatterns";
import { useAuth } from "@/contexts/AuthContext";

function renderBadge(badge: string, customBadges: CustomBadgeRecord[]) {
  const custom = customBadges.find(b => b.name === badge);
  if (custom) {
    const accClass = custom.accessory !== "none" ? `badge-accessory-${custom.accessory.replace(/_/g, "-")}` : "";
    return (
      <span
        key={badge}
        className={`badge-custom ${accClass}`}
        style={{ color: custom.color, borderColor: custom.color }}
      >
        {badge}
      </span>
    );
  }
  return <span key={badge} className={`badge-${getBadgeRarity(badge)}`}>{badge}</span>;
}

function resolveBannerCss(
  banner: string | null | undefined,
  customBanners: CustomBannerRecord[],
): Record<string, string> | null {
  if (!banner || banner === "none") return null;
  if (banner.startsWith("custom:")) {
    const id = parseInt(banner.slice(7), 10);
    const cb = customBanners.find(b => b.id === id);
    return cb ? getBannerPatternStyle(cb.patternType, cb.primaryColor, cb.secondaryColor, cb.bgColor) : null;
  }
  const css = getBannerCss(banner);
  return Object.keys(css).length > 0 ? css : null;
}

function getUserLocation(userId: number | null | undefined, maps: MapRecord[]): string | null {
  if (!userId) return null;
  for (const m of maps) {
    for (const p of m.pinpoints) {
      if (p.residents.some((r: { userId: number }) => r.userId === userId)) {
        return `${p.name} — ${m.name}`;
      }
    }
  }
  return null;
}

function ProfileCard({
  profile,
  customBadges,
  customBanners,
  customBorders,
  maps,
  isOwner,
}: {
  profile: ProfileRecord;
  customBadges: CustomBadgeRecord[];
  customBanners: CustomBannerRecord[];
  customBorders: CustomBorderRecord[];
  maps: MapRecord[];
  isOwner: boolean;
}) {
  const [, setLocation] = useLocation();
  const bannerCss = resolveBannerCss(profile.banner, customBanners);
  const location = getUserLocation(profile.userId, maps);
  const activeBorder = profile.boarder
    ? customBorders.find(b => b.name === profile.boarder)
    : null;

  return (
    <Card
      data-testid={`card-profile-${profile.id}`}
      className={`id-card overflow-hidden border-2 bg-card/80 backdrop-blur relative ${getSkinClass(profile.skin || "Red")}`}
    >
      {isOwner && (
        <button
          onClick={() => setLocation(`/edit/${profile.id}`)}
          className="absolute top-10 right-2 z-20 w-7 h-7 flex items-center justify-center border border-primary/40 bg-background/70 text-primary/60 hover:text-primary hover:border-primary transition-all"
          title="Edit your profile"
        >
          <Pencil className="w-3 h-3" />
        </button>
      )}

      <div className="absolute top-0 right-0 p-2 text-xs font-mono text-muted-foreground border-b border-l border-primary/20 bg-background/50 z-10">
        ID: {String(profile.id).padStart(4, "0")}
      </div>

      {bannerCss ? (
        <div
          className="id-banner id-banner-shimmer"
          style={bannerCss as React.CSSProperties}
        />
      ) : (
        <div className="h-2 bg-primary/20" />
      )}

      <CardContent className="p-6 pt-4">
        <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
          <div className={bannerCss ? "-mt-10 z-10 relative flex-shrink-0" : "flex-shrink-0"}>
            <Avatar className="w-32 h-32 rounded-none border-2 border-primary/50 shadow-[0_0_15px_rgba(139,0,0,0.3)]">
              <AvatarImage src={profile.imageData} alt={profile.username} className="object-cover" />
              <AvatarFallback className="rounded-none bg-muted text-4xl text-muted-foreground font-serif">?</AvatarFallback>
            </Avatar>
          </div>
          <div className="flex-1 space-y-3 font-mono w-full">
            <div>
              <div className="text-xs text-primary/70 uppercase tracking-wider mb-1">Subject Alias</div>
              <div className="text-2xl font-bold text-foreground">{profile.displayName}</div>
              <div className="text-sm text-muted-foreground">@{profile.username}</div>
              <div className="text-xs text-muted-foreground/70 mt-0.5">AGE: {profile.ageGroup || "UNKNOWN"}</div>
            </div>
            <div className="flex items-center gap-3 py-2 border-y border-border/50">
              <div className="text-xs text-primary/70 uppercase tracking-wider">Color Ref:</div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border border-border" style={{ backgroundColor: profile.favoriteColor }} />
                <span className="text-sm">{profile.favoriteColor}</span>
              </div>
            </div>
            <div>
              <div className="text-xs text-primary/70 uppercase tracking-wider mb-1">Subject Notes</div>
              <p className="text-sm text-foreground/80 leading-relaxed break-words">
                {profile.bio ? `"${profile.bio}"` : ""}
              </p>
            </div>
            {profile.traits && profile.traits.length > 0 && (
              <div>
                <div className="text-xs text-primary/70 uppercase tracking-wider mb-1">Traits</div>
                <div className="flex flex-wrap gap-1">
                  {profile.traits.map(t => (
                    <span key={t} className="text-xs border border-primary/20 px-1.5 py-0.5 text-primary/60">{t}</span>
                  ))}
                </div>
              </div>
            )}
            {location && (
              <div className="text-xs text-green-400/80 font-mono flex items-center gap-1">
                <span>⌂</span> {location}
              </div>
            )}
            {profile.badges && profile.badges.length > 0 && (
              <div className="flex flex-wrap gap-1 pt-1">
                {profile.badges.map(badge => renderBadge(badge, customBadges))}
              </div>
            )}
          </div>
        </div>
      </CardContent>
      {activeBorder && (
        <img
          src={activeBorder.imageData}
          alt=""
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ objectFit: "fill", zIndex: 5 }}
        />
      )}
      <div className="classified-stamp">IDENTIFIED</div>
    </Card>
  );
}

export default function Home() {
  const [, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const { data: profiles, isLoading } = useListProfiles();
  const { data: customBadges = [] } = useListCustomBadges();
  const { data: customBanners = [] } = useListCustomBanners();
  const { data: customBorders = [] } = useListCustomBorders();
  const { data: maps = [] } = useListMaps();

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <header className="mb-10 text-center space-y-4">
        <h1
          className="text-5xl md:text-7xl font-bold text-red-700 glitch-text uppercase tracking-widest"
          data-text="InvestiGator IDs"
        >
          InvestiGator IDs
        </h1>
        <p className="text-xl md:text-2xl text-muted-foreground font-mono uppercase tracking-widest border-y border-border py-2 inline-block">
          The profiles made by other users
        </p>

        {user && (
          <div className="flex items-center justify-center gap-3 pt-1">
            <span className="text-xs font-mono text-primary/60">
              {user.robloxUsername}
              {user.status && (
                <span className="ml-2 text-muted-foreground/70 italic">"{user.status}"</span>
              )}
            </span>
            <button
              onClick={logout}
              className="text-xs font-mono text-muted-foreground/50 hover:text-red-500 transition-colors uppercase tracking-wider"
            >
              [LOG OUT]
            </button>
          </div>
        )}
      </header>

      <nav className="flex justify-center gap-3 mb-12 flex-wrap">
        <Link
          href="/events"
          className="px-5 py-2 font-mono text-sm uppercase tracking-widest border border-primary/40 text-primary/80 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all"
          data-testid="link-event-board"
        >
          EVENT BOARD
        </Link>
        <Link
          href="/bulletin"
          className="px-5 py-2 font-mono text-sm uppercase tracking-widest border border-primary/40 text-primary/80 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all"
          data-testid="link-bulletin-board"
        >
          BULLETIN BOARD
        </Link>
        <Link
          href="/map"
          className="px-5 py-2 font-mono text-sm uppercase tracking-widest border border-primary/40 text-primary/80 hover:border-primary hover:text-primary hover:bg-primary/5 transition-all"
        >
          THE MAP
        </Link>
      </nav>

      {isLoading ? (
        <div className="text-center py-24 border border-dashed border-red-900/50 bg-black/50 backdrop-blur">
          <p className="text-xl text-red-600/60 font-mono tracking-[0.2em] animate-pulse">
            ACCESSING DATABASE...
          </p>
        </div>
      ) : !profiles || profiles.length === 0 ? (
        <div className="text-center py-24 border border-dashed border-red-900/50 bg-black/50 backdrop-blur">
          <p className="text-2xl text-red-600/80 font-mono tracking-[0.2em] animate-pulse">
            NO SUBJECTS IDENTIFIED.<br />DATABASE EMPTY.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {profiles.map(profile => (
            <ProfileCard
              key={profile.id}
              profile={profile}
              customBadges={customBadges}
              customBanners={customBanners}
              customBorders={customBorders as CustomBorderRecord[]}
              maps={maps as MapRecord[]}
              isOwner={!!(user && profile.userId === user.id)}
            />
          ))}
        </div>
      )}

      <button
        onClick={() => setLocation("/moderator")}
        className="fixed top-4 right-4 w-10 h-10 border border-red-900/30 bg-black/80 flex items-center justify-center text-red-900/50 hover:text-red-700 hover:border-red-700 transition-all z-50"
        data-testid="button-moderator-access"
        title=""
      >
        <Skull className="w-5 h-5" />
      </button>

      {user ? (
        <Link
          href="/creator"
          className="fixed bottom-8 right-8 w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(139,0,0,0.6)] hover:scale-110 hover:shadow-[0_0_40px_rgba(139,0,0,0.8)] transition-all animate-pulse duration-1000 z-50 border border-red-500/50"
          data-testid="button-create-profile"
        >
          <Plus className="w-8 h-8" />
        </Link>
      ) : (
        <Link
          href="/creator"
          className="fixed bottom-8 right-8 px-4 py-3 bg-primary text-primary-foreground font-mono text-xs uppercase tracking-widest shadow-[0_0_20px_rgba(139,0,0,0.5)] hover:scale-105 transition-all z-50 border border-red-500/50"
        >
          LOG IN TO CREATE ID
        </Link>
      )}
    </div>
  );
}
