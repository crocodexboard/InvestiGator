import { useState } from "react";
import { useLocation } from "wouter";
import { ArrowLeft, X } from "lucide-react";
import { useListMaps, useLiveHere, useMoveOut, MapRecord, PinpointRecord } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";

function HouseIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9,22 9,12 15,12 15,22" />
    </svg>
  );
}

function BuildingIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth={2}>
      <rect x="4" y="2" width="16" height="20" rx="1" />
      <line x1="8" y1="6" x2="8" y2="6.01" strokeWidth={3} />
      <line x1="12" y1="6" x2="12" y2="6.01" strokeWidth={3} />
      <line x1="16" y1="6" x2="16" y2="6.01" strokeWidth={3} />
      <line x1="8" y1="10" x2="8" y2="10.01" strokeWidth={3} />
      <line x1="12" y1="10" x2="12" y2="10.01" strokeWidth={3} />
      <line x1="16" y1="10" x2="16" y2="10.01" strokeWidth={3} />
      <line x1="8" y1="14" x2="8" y2="14.01" strokeWidth={3} />
      <line x1="12" y1="14" x2="12" y2="14.01" strokeWidth={3} />
      <line x1="16" y1="14" x2="16" y2="14.01" strokeWidth={3} />
      <rect x="9" y="18" width="6" height="4" />
    </svg>
  );
}

interface PinpointDetailProps {
  pin: PinpointRecord & { residents: Array<{ userId: number; robloxUsername: string; displayName: string; description: string }> };
  onClose: () => void;
  currentUserId?: number;
  currentUserLocation?: number;
  onLiveHere: (description: string) => void;
  onMoveOut: () => void;
  mapId: number;
}

function PinpointDetail({ pin, onClose, currentUserId, currentUserLocation, onLiveHere, onMoveOut }: PinpointDetailProps) {
  const [desc, setDesc] = useState("");
  const isLivingHere = pin.residents.some(r => r.userId === currentUserId);
  const isLivingElsewhere = currentUserLocation !== undefined && !isLivingHere;

  return (
    <div className="absolute inset-0 bg-black/80 z-20 flex items-center justify-center p-4">
      <div className="bg-card border border-primary/40 max-w-sm w-full max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-primary/20">
          <div className="flex items-center gap-2">
            {pin.type === "live" ? (
              <HouseIcon className="w-4 h-4 text-green-400" />
            ) : (
              <BuildingIcon className="w-4 h-4 text-blue-400" />
            )}
            <h3 className="font-mono font-bold text-foreground uppercase tracking-wide">{pin.name}</h3>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-4 space-y-4 font-mono">
          {pin.imageData && (
            <div className="w-full aspect-square overflow-hidden border border-primary/20">
              <img src={pin.imageData} alt={pin.name} className="w-full h-full object-cover" />
            </div>
          )}

          {pin.description && (
            <p className="text-sm text-foreground/70 whitespace-pre-wrap">{pin.description}</p>
          )}

          {pin.type === "live" && (
            <>
              <div>
                <div className="text-xs text-primary/70 uppercase tracking-wider mb-2">Residents ({pin.residents.length})</div>
                {pin.residents.length === 0 ? (
                  <p className="text-xs text-muted-foreground">Vacant.</p>
                ) : (
                  <div className="space-y-2">
                    {pin.residents.map(r => (
                      <div key={r.userId} className="border border-primary/20 p-2 text-xs">
                        <div className="font-bold text-foreground">{r.displayName}</div>
                        <div className="text-muted-foreground">@{r.robloxUsername}</div>
                        {r.description && <p className="text-foreground/60 mt-1 whitespace-pre-wrap">{r.description}</p>}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {currentUserId && !isLivingHere && (
                <div className="space-y-2 border-t border-primary/20 pt-3">
                  <div className="text-xs text-primary/70 uppercase tracking-wider">Live Here</div>
                  {isLivingElsewhere && (
                    <p className="text-xs text-yellow-500/80">You currently live elsewhere. Moving here will update your location.</p>
                  )}
                  <Textarea
                    value={desc}
                    onChange={e => setDesc(e.target.value.slice(0, 500))}
                    placeholder="Describe your home (optional, max 100 words)..."
                    rows={3}
                    className="text-xs font-mono resize-none"
                  />
                  <Button
                    size="sm"
                    className="w-full font-mono text-xs uppercase tracking-wider"
                    onClick={() => onLiveHere(desc)}
                  >
                    <HouseIcon className="w-3 h-3 mr-1" /> MOVE IN
                  </Button>
                </div>
              )}

              {currentUserId && isLivingHere && (
                <div className="border-t border-primary/20 pt-3">
                  <p className="text-xs text-green-400 font-mono mb-2">✓ You live here</p>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full font-mono text-xs uppercase tracking-wider border-red-900/50 text-red-500 hover:bg-red-950/20"
                    onClick={onMoveOut}
                  >
                    MOVE OUT
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function MapView() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const { data: maps, isLoading, refetch } = useListMaps();
  const liveHere = useLiveHere();
  const moveOut = useMoveOut();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [activeMapId, setActiveMapId] = useState<number | null>(null);
  const [selectedPin, setSelectedPin] = useState<(PinpointRecord & { residents: Array<{ userId: number; robloxUsername: string; displayName: string; description: string }> }) | null>(null);

  const activeMap = maps?.find(m => m.id === activeMapId) ?? maps?.[0] ?? null;

  const currentUserLocation = (() => {
    if (!user || !maps) return undefined;
    for (const m of maps) {
      for (const p of m.pinpoints) {
        if (p.residents.some((r: { userId: number }) => r.userId === user.id)) return p.id;
      }
    }
    return undefined;
  })();

  async function handleLiveHere(mapId: number, pinId: number, description: string) {
    try {
      await liveHere.mutateAsync({ mapId, pinId, data: { description } });
      await refetch();
      queryClient.invalidateQueries();
      setSelectedPin(null);
      toast({ title: "MOVED IN", description: "Your location has been updated." });
    } catch (err: unknown) {
      toast({ title: "FAILED", description: err instanceof Error ? err.message : "Error", variant: "destructive" });
    }
  }

  async function handleMoveOut() {
    try {
      await moveOut.mutateAsync();
      await refetch();
      setSelectedPin(null);
      toast({ title: "MOVED OUT" });
    } catch (err: unknown) {
      toast({ title: "FAILED", description: err instanceof Error ? err.message : "Error", variant: "destructive" });
    }
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <Button variant="ghost" onClick={() => setLocation("/")} className="mb-8 font-mono text-muted-foreground">
        <ArrowLeft className="mr-2 w-4 h-4" /> BACK TO ARCHIVE
      </Button>

      <header className="mb-10 text-center space-y-3">
        <h1 className="text-4xl md:text-6xl font-bold text-red-700 glitch-text uppercase tracking-widest" data-text="THE MAP">
          THE MAP
        </h1>
        <p className="text-lg text-muted-foreground font-mono uppercase tracking-widest border-y border-border py-2 inline-block">
          CHOOSE WHERE YOU DWELL
        </p>
      </header>

      {!user && (
        <div className="mb-4 border border-yellow-900/50 bg-yellow-950/20 p-3 font-mono text-xs text-yellow-400">
          ⚠ Log in to choose your location on the map.
        </div>
      )}

      {isLoading ? (
        <div className="text-center py-24 border border-dashed border-red-900/50">
          <p className="text-xl text-red-600/60 font-mono animate-pulse">LOADING TERRITORY...</p>
        </div>
      ) : !maps || maps.length === 0 ? (
        <div className="text-center py-24 border border-dashed border-red-900/50 bg-black/50">
          <p className="text-2xl text-red-600/80 font-mono animate-pulse">NO MAPS CREATED YET.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {maps.length > 1 && (
            <div className="flex gap-2 flex-wrap">
              {maps.map(m => (
                <button
                  key={m.id}
                  onClick={() => { setActiveMapId(m.id); setSelectedPin(null); }}
                  className={`px-4 py-2 font-mono text-sm uppercase tracking-wider border transition-all ${
                    (activeMap?.id === m.id)
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-primary/30 text-muted-foreground hover:border-primary hover:text-foreground"
                  }`}
                >
                  {m.name}
                </button>
              ))}
            </div>
          )}

          {activeMap && (
            <div className="border border-primary/30 relative overflow-hidden">
              <div className="text-xs font-mono text-primary/70 uppercase tracking-wider p-3 border-b border-primary/20 flex items-center justify-between">
                <span>{activeMap.name}</span>
                <span className="text-muted-foreground">
                  <HouseIcon className="w-3 h-3 inline mr-1 text-green-400" />LIVE
                  <BuildingIcon className="w-3 h-3 inline ml-3 mr-1 text-blue-400" />INFO
                </span>
              </div>

              <div className="relative select-none">
                {activeMap.imageData ? (
                  <img
                    src={activeMap.imageData}
                    alt={activeMap.name}
                    className="w-full block"
                    draggable={false}
                  />
                ) : (
                  <div className="w-full aspect-video bg-black/60 flex items-center justify-center">
                    <p className="text-muted-foreground font-mono text-sm">NO MAP IMAGE</p>
                  </div>
                )}

                {(activeMap.pinpoints as (PinpointRecord & { residents: Array<{ userId: number; robloxUsername: string; displayName: string; description: string }> })[]).map(pin => {
                  const isLivePin = pin.type === "live";
                  const isMeHere = user && pin.residents.some((r: { userId: number }) => r.userId === user.id);
                  return (
                    <button
                      key={pin.id}
                      onClick={() => setSelectedPin(pin)}
                      className="absolute -translate-x-1/2 -translate-y-1/2 group"
                      style={{ left: `${pin.xPercent}%`, top: `${pin.yPercent}%` }}
                    >
                      <div className={`relative flex flex-col items-center ${isMeHere ? "scale-125" : ""}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 shadow-lg transition-all group-hover:scale-110 ${
                          isLivePin
                            ? isMeHere
                              ? "bg-green-500 border-green-300 shadow-green-500/50"
                              : "bg-green-900/80 border-green-600 shadow-green-900/50"
                            : "bg-blue-900/80 border-blue-500 shadow-blue-900/50"
                        }`}>
                          {isLivePin
                            ? <HouseIcon className="w-4 h-4 text-white" />
                            : <BuildingIcon className="w-4 h-4 text-white" />
                          }
                        </div>
                        <div className="mt-0.5 bg-black/80 px-1.5 py-0.5 text-[9px] font-mono text-white whitespace-nowrap max-w-[80px] truncate border border-primary/20">
                          {pin.name}
                        </div>
                        {pin.residents.length > 0 && (
                          <div className="text-[8px] font-mono text-green-400 bg-black/60 px-1">
                            {pin.residents.length} resident{pin.residents.length !== 1 ? "s" : ""}
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}

                {selectedPin && (
                  <PinpointDetail
                    pin={selectedPin}
                    onClose={() => setSelectedPin(null)}
                    currentUserId={user?.id}
                    currentUserLocation={currentUserLocation}
                    onLiveHere={(desc) => handleLiveHere(activeMap.id, selectedPin.id, desc)}
                    onMoveOut={handleMoveOut}
                    mapId={activeMap.id}
                  />
                )}
              </div>
            </div>
          )}

          <div className="text-xs font-mono text-muted-foreground/60 space-y-1">
            <p>— Click a <HouseIcon className="w-3 h-3 inline text-green-400" /> pin to move in or see who lives there.</p>
            <p>— Click a <BuildingIcon className="w-3 h-3 inline text-blue-400" /> pin to see location info.</p>
          </div>
        </div>
      )}
    </div>
  );
}
