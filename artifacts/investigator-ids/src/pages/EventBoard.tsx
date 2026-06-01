import { useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";
import { useListEvents } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function EventBoard() {
  const [, setLocation] = useLocation();
  const { data: events, isLoading } = useListEvents();

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <Button
        variant="ghost"
        onClick={() => setLocation("/")}
        className="mb-8 font-mono text-muted-foreground hover:text-foreground hover:border-primary"
      >
        <ArrowLeft className="mr-2 w-4 h-4" />
        BACK TO ARCHIVE
      </Button>

      <header className="mb-12 text-center space-y-3">
        <h1 className="text-4xl md:text-6xl font-bold text-red-700 glitch-text uppercase tracking-widest" data-text="EVENT BOARD">
          EVENT BOARD
        </h1>
        <p className="text-lg text-muted-foreground font-mono uppercase tracking-widest border-y border-border py-2 inline-block">
          ACTIVE TRANSMISSIONS — CLASSIFIED OPERATIONS
        </p>
      </header>

      {isLoading ? (
        <div className="text-center py-24 border border-dashed border-red-900/50">
          <p className="text-xl text-red-600/60 font-mono tracking-[0.2em] animate-pulse">SCANNING FOR EVENTS...</p>
        </div>
      ) : !events || events.length === 0 ? (
        <div className="text-center py-24 border border-dashed border-red-900/50 bg-black/50">
          <p className="text-2xl text-red-600/80 font-mono tracking-[0.2em] animate-pulse">
            NO ACTIVE EVENTS.<br />STAND BY.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {events.map(event => (
            <Card key={event.id} className="overflow-hidden border-2 border-primary/40 bg-card/80 backdrop-blur relative group">
              <div className="absolute top-0 right-0 p-2 text-xs font-mono text-muted-foreground border-b border-l border-primary/20 bg-background/50">
                EVT-{String(event.id).padStart(4, "0")}
              </div>
              <CardContent className="p-0">
                {event.imageData && (
                  <div className="w-full aspect-video overflow-hidden border-b border-primary/20">
                    <img
                      src={event.imageData}
                      alt={event.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                )}
                <div className="p-6 space-y-3 font-mono">
                  <div className="text-xs text-primary/70 uppercase tracking-wider">Event Designation</div>
                  <h2 className="text-2xl font-bold text-foreground uppercase tracking-wide">{event.title}</h2>
                  {event.description && (
                    <p className="text-sm text-foreground/80 leading-relaxed border-t border-border/40 pt-3 whitespace-pre-wrap">
                      {event.description}
                    </p>
                  )}
                  <div className="text-xs text-muted-foreground pt-2">
                    FILED: {new Date(event.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
