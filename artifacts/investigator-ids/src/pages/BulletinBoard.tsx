import { useLocation } from "wouter";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { useListBulletin, BulletinRecord } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const CATEGORY_LABELS: Record<string, string> = {
  upcoming_event: "UPCOMING EVENT",
  monthly_quest: "MONTHLY QUEST",
  rules: "RULES",
  link: "LINK",
};

const CATEGORY_COLORS: Record<string, string> = {
  upcoming_event: "text-red-500 border-red-500/40 bg-red-950/20",
  monthly_quest: "text-yellow-500 border-yellow-500/40 bg-yellow-950/20",
  rules: "text-blue-400 border-blue-400/40 bg-blue-950/20",
  link: "text-green-400 border-green-400/40 bg-green-950/20",
};

function BulletinItem({ item }: { item: BulletinRecord }) {
  const colorClass = CATEGORY_COLORS[item.category] ?? "text-primary border-primary/40 bg-primary/10";
  const label = CATEGORY_LABELS[item.category] ?? item.category.toUpperCase();

  return (
    <Card className={`overflow-hidden border bg-card/80 backdrop-blur ${colorClass}`}>
      <CardContent className="p-5 font-mono space-y-2">
        <div className="flex items-center justify-between">
          <span className={`text-xs uppercase tracking-widest font-bold px-2 py-0.5 border ${colorClass}`}>
            {label}
          </span>
          {item.url && (
            <a
              href={item.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
            >
              LINK <ExternalLink className="w-3 h-3" />
            </a>
          )}
        </div>
        <h3 className="text-lg font-bold text-foreground uppercase tracking-wide">{item.title}</h3>
        {item.content && (
          <p className="text-sm text-foreground/70 leading-relaxed whitespace-pre-wrap">{item.content}</p>
        )}
      </CardContent>
    </Card>
  );
}

export default function BulletinBoard() {
  const [, setLocation] = useLocation();
  const { data: items, isLoading } = useListBulletin();

  const byCategory = (cat: string) => (items ?? []).filter(i => i.category === cat);

  const upcomingEvents = byCategory("upcoming_event");
  const monthlyQuests = byCategory("monthly_quest");
  const rules = byCategory("rules");
  const links = byCategory("link");

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <Button
        variant="ghost"
        onClick={() => setLocation("/")}
        className="mb-mono text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-2 w-4 h-4" />
        BACK TO ARCHIVE
      </Button>

      <header className="mb-12 text-center space-y-3">
        <h1 className="text-4xl md:text-6xl font-bold text-red-700 glitch-text uppercase tracking-widest" data-text="BULLETIN BOARD">
          BULLETIN BOARD
        </h1>
        <p className="text-lg text-muted-foreground font-mono uppercase tracking-widest border-y border-border py-2 inline-block">
          COMMUNITY DISPATCHES — READ CAREFULLY
        </p>
      </header>

      {isLoading ? (
        <div className="text-center py-24 border border-dashed border-red-900/50">
          <p className="text-xl text-red-600/60 font-mono tracking-[0.2em] animate-pulse">DECRYPTING BULLETIN...</p>
        </div>
      ) : !items || items.length === 0 ? (
        <div className="text-center py-24 border border-dashed border-red-900/50 bg-black/50">
          <p className="text-2xl text-red-600/80 font-mono tracking-[0.2em] animate-pulse">
            BULLETIN EMPTY.<br />NO DISPATCHES FOUND.
          </p>
        </div>
      ) : (
        <div className="space-y-12">
          {upcomingEvents.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-xl font-serif text-red-500 tracking-widest uppercase border-b border-red-500/30 pb-2">
                UPCOMING EVENTS
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {upcomingEvents.map(item => <BulletinItem key={item.id} item={item} />)}
              </div>
            </section>
          )}
          {monthlyQuests.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-xl font-serif text-yellow-500 tracking-widest uppercase border-b border-yellow-500/30 pb-2">
                MONTHLY QUESTS
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {monthlyQuests.map(item => <BulletinItem key={item.id} item={item} />)}
              </div>
            </section>
          )}
          {rules.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-xl font-serif text-blue-400 tracking-widest uppercase border-b border-blue-400/30 pb-2">
                RULES
              </h2>
              <div className="grid grid-cols-1 gap-4">
                {rules.map(item => <BulletinItem key={item.id} item={item} />)}
              </div>
            </section>
          )}
          {links.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-xl font-serif text-green-400 tracking-widest uppercase border-b border-green-400/30 pb-2">
                LINKS
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {links.map(item => <BulletinItem key={item.id} item={item} />)}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
