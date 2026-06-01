import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Upload } from "lucide-react";
import {
  useCreateProfile, useListCustomBanners,
  getListProfilesQueryKey, CustomBannerRecord,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from "@/components/ui/form";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { BANNER_PRESETS, getBannerCss } from "@/lib/banners";
import { getBannerPatternStyle } from "@/lib/bannerPatterns";
import { ALL_TRAITS } from "@/lib/traits";

const AGE_GROUPS = ["9 below", "9-12", "13-15", "16-17", "18-20", "21+"] as const;

const formSchema = z.object({
  username: z.string().min(1, "Required").max(30),
  displayName: z.string().min(1, "Required").max(30),
  ageGroup: z.enum(AGE_GROUPS),
  favoriteColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color"),
  bio: z.string().max(75, "Max 75 characters"),
});

type FormValues = z.infer<typeof formSchema>;

function cropToSquare(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const size = Math.min(img.width, img.height);
        canvas.width = 256; canvas.height = 256;
        const ctx = canvas.getContext("2d");
        if (!ctx) { reject(new Error("No canvas context")); return; }
        ctx.drawImage(img, (img.width - size) / 2, (img.height - size) / 2, size, size, 0, 0, 256, 256);
        resolve(canvas.toDataURL("image/jpeg", 0.9));
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function resolveBannerPreviewCss(
  selectedBanner: string,
  customBanners: CustomBannerRecord[],
): Record<string, string> | null {
  if (!selectedBanner || selectedBanner === "none") return null;
  if (selectedBanner.startsWith("custom:")) {
    const id = parseInt(selectedBanner.slice(7), 10);
    const cb = customBanners.find(b => b.id === id);
    return cb ? getBannerPatternStyle(cb.patternType, cb.primaryColor, cb.secondaryColor, cb.bgColor) : null;
  }
  const css = getBannerCss(selectedBanner);
  return Object.keys(css).length > 0 ? css : null;
}

export default function Creator() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();
  const [imagePreview, setImagePreview] = useState<string>("");
  const [selectedBanner, setSelectedBanner] = useState<string>("none");
  const [bannerTab, setBannerTab] = useState<"presets" | "color" | "custom">("presets");
  const [solidColor, setSolidColor] = useState<string>("#8b0000");
  const [selectedTraits, setSelectedTraits] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const { data: customBanners = [] } = useListCustomBanners();
  const createProfile = useCreateProfile();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: user?.robloxUsername ?? "",
      displayName: "",
      ageGroup: "13-15",
      favoriteColor: "#ff0000",
      bio: "",
    },
  });

  useEffect(() => {
    if (user?.robloxUsername && !form.getValues("username")) {
      form.setValue("username", user.robloxUsername);
    }
  }, [user, form]);

  const bioValue = form.watch("bio");
  const formValues = form.watch();

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try { setImagePreview(await cropToSquare(file)); }
      catch {
        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result as string);
        reader.readAsDataURL(file);
      }
    }
  };

  function toggleTrait(trait: string) {
    setSelectedTraits(prev =>
      prev.includes(trait)
        ? prev.filter(t => t !== trait)
        : prev.length >= 10 ? prev : [...prev, trait]
    );
  }

  const onSubmit = (data: FormValues) => {
    const bannerValue = bannerTab === "color" ? solidColor : selectedBanner;
    createProfile.mutate(
      {
        data: {
          username: data.username,
          displayName: data.displayName,
          favoriteColor: data.favoriteColor,
          bio: data.bio,
          imageData: imagePreview,
          ageGroup: data.ageGroup,
          banner: bannerValue === "none" ? undefined : bannerValue,
          traits: selectedTraits,
        },
      },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListProfilesQueryKey() });
          setLocation("/");
        },
      }
    );
  };

  const bannerPreviewCss = resolveBannerPreviewCss(
    bannerTab === "color" ? solidColor : selectedBanner,
    customBanners,
  );

  const bannerLabel = (() => {
    if (bannerTab === "color") return `SOLID ${solidColor.toUpperCase()}`;
    if (selectedBanner === "none") return "NONE";
    if (selectedBanner.startsWith("custom:")) {
      return customBanners.find(b => `custom:${b.id}` === selectedBanner)?.name ?? "CUSTOM";
    }
    return BANNER_PRESETS.find(p => p.id === selectedBanner)?.label ?? "NONE";
  })();

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <Button variant="ghost" onClick={() => setLocation("/")}
        className="mb-8 font-mono border-border text-muted-foreground hover:text-foreground hover:border-primary">
        <ArrowLeft className="mr-2 w-4 h-4" /> BACK
      </Button>

      <header className="mb-12 border-b border-border pb-6">
        <h1 className="text-3xl font-serif text-primary tracking-widest uppercase">New Subject Entry</h1>
        <p className="text-muted-foreground font-mono text-sm mt-2">AUTHORIZATION REQUIRED. ALL FIELDS MONITORED.</p>
        {user && (
          <p className="text-xs font-mono text-primary/60 mt-1">Logged in as: {user.robloxUsername}</p>
        )}
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="space-y-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 bg-card/50 p-6 border border-border backdrop-blur">
              {/* Avatar upload */}
              <div className="flex flex-col items-center gap-3 mb-4">
                <div
                  className="w-48 h-48 border-2 border-dashed border-primary/50 flex flex-col items-center justify-center cursor-pointer hover:border-primary transition-colors bg-background/50 relative overflow-hidden group"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {imagePreview
                    ? <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    : <>
                        <Upload className="w-8 h-8 text-muted-foreground mb-2 group-hover:text-primary transition-colors" />
                        <span className="text-xs font-mono text-muted-foreground group-hover:text-primary transition-colors text-center px-2">
                          UPLOAD VISUAL<br />(auto-cropped 1:1)
                        </span>
                      </>
                  }
                  <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} data-testid="input-image-upload" />
                </div>
                {imagePreview && (
                  <button type="button"
                    onClick={() => { setImagePreview(""); if (fileInputRef.current) fileInputRef.current.value = ""; }}
                    className="text-xs font-mono text-muted-foreground hover:text-primary transition-colors uppercase tracking-wider">
                    CHANGE IMAGE
                  </button>
                )}
              </div>

              <FormField control={form.control} name="username" render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-mono text-xs uppercase text-primary">Username</FormLabel>
                  <FormControl>
                    <Input placeholder="subject_001" className="font-mono bg-background border-border focus-visible:ring-primary" data-testid="input-username" {...field} />
                  </FormControl>
                  <FormMessage className="font-mono text-xs" />
                </FormItem>
              )} />

              <FormField control={form.control} name="displayName" render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-mono text-xs uppercase text-primary">Display Name</FormLabel>
                  <FormControl>
                    <Input placeholder="UNKNOWN" className="font-mono bg-background border-border focus-visible:ring-primary" data-testid="input-display-name" {...field} />
                  </FormControl>
                  <FormMessage className="font-mono text-xs" />
                </FormItem>
              )} />

              <FormField control={form.control} name="ageGroup" render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-mono text-xs uppercase text-primary">Age Group</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="font-mono bg-background border-border focus:ring-primary" data-testid="select-age-group">
                        <SelectValue placeholder="SELECT AGE GROUP" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-card border-border font-mono">
                      {AGE_GROUPS.map(ag => <SelectItem key={ag} value={ag} className="font-mono">{ag}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <FormMessage className="font-mono text-xs" />
                </FormItem>
              )} />

              <FormField control={form.control} name="favoriteColor" render={({ field }) => (
                <FormItem>
                  <FormLabel className="font-mono text-xs uppercase text-primary">Favorite Color</FormLabel>
                  <FormControl>
                    <div className="flex gap-4 items-center">
                      <Input type="color" className="w-16 h-10 p-1 bg-background border-border cursor-pointer" data-testid="input-color-picker" {...field} />
                      <Input type="text" className="font-mono bg-background border-border focus-visible:ring-primary uppercase" data-testid="input-color-hex" {...field} />
                    </div>
                  </FormControl>
                  <FormMessage className="font-mono text-xs" />
                </FormItem>
              )} />

              <FormField control={form.control} name="bio" render={({ field }) => (
                <FormItem>
                  <div className="flex justify-between items-end">
                    <FormLabel className="font-mono text-xs uppercase text-primary">Bio</FormLabel>
                    <span className={`text-xs font-mono ${bioValue.length >= 70 ? "text-destructive" : "text-muted-foreground"}`}>
                      {bioValue.length}/75 CHARACTERS
                    </span>
                  </div>
                  <FormControl>
                    <Textarea placeholder="Subject exhibits strange behavior..." className="font-mono bg-background border-border focus-visible:ring-primary resize-none" maxLength={75} rows={3} data-testid="input-bio" {...field} />
                  </FormControl>
                  <FormMessage className="font-mono text-xs" />
                </FormItem>
              )} />

              {/* ── Traits ── */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs uppercase text-primary">Traits</span>
                  <span className="text-xs font-mono text-muted-foreground">{selectedTraits.length}/10</span>
                </div>
                <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1 border border-border/30 p-2">
                  {ALL_TRAITS.map(trait => (
                    <button
                      key={trait}
                      type="button"
                      onClick={() => toggleTrait(trait)}
                      className={`px-2 py-0.5 text-xs font-mono border transition-colors ${
                        selectedTraits.includes(trait)
                          ? "bg-primary text-primary-foreground border-primary"
                          : "border-primary/30 text-muted-foreground hover:border-primary hover:text-foreground"
                      }`}
                    >
                      {trait}
                    </button>
                  ))}
                </div>
                {selectedTraits.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {selectedTraits.map(t => (
                      <span key={t} className="text-xs border border-primary/50 px-1.5 py-0.5 text-primary/80 font-mono">{t}</span>
                    ))}
                  </div>
                )}
              </div>

              {/* ── Banner Picker ── */}
              <div className="space-y-3">
                <div className="font-mono text-xs uppercase text-primary">ID Banner</div>

                <div className="flex border-b border-border/40">
                  {(["presets", "color", "custom"] as const).map(tab => (
                    <button key={tab} type="button"
                      onClick={() => {
                        setBannerTab(tab);
                        if (tab === "color") setSelectedBanner(solidColor);
                        else if (tab === "presets") setSelectedBanner("none");
                        else if (tab === "custom") setSelectedBanner("none");
                      }}
                      className={`flex-1 py-1.5 font-mono text-[11px] uppercase transition-colors border-b-2 -mb-px ${
                        bannerTab === tab
                          ? "border-primary text-primary"
                          : "border-transparent text-muted-foreground hover:text-foreground"
                      }`}>
                      {tab === "presets" ? "PRESETS" : tab === "color" ? "SOLID COLOR" : "CUSTOM"}
                    </button>
                  ))}
                </div>

                {bannerTab === "presets" && (
                  <div className="grid grid-cols-4 gap-2">
                    {BANNER_PRESETS.map(preset => (
                      <button key={preset.id} type="button"
                        onClick={() => setSelectedBanner(preset.id)}
                        className={`relative h-10 border-2 transition-all overflow-hidden ${
                          selectedBanner === preset.id
                            ? "border-primary shadow-[0_0_10px_rgba(139,0,0,0.6)]"
                            : "border-border/50 hover:border-primary/60"
                        }`}
                        style={preset.id !== "none"
                          ? (getBannerCss(preset.id) as React.CSSProperties)
                          : { background: "repeating-linear-gradient(45deg,#111 0px,#111 4px,#0a0a0a 4px,#0a0a0a 8px)" }}
                        title={preset.label}>
                        {selectedBanner === preset.id && (
                          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                            <span className="text-primary font-mono text-sm font-bold">✓</span>
                          </div>
                        )}
                        {preset.id === "none" && (
                          <span className="text-muted-foreground text-[10px] font-mono absolute inset-0 flex items-center justify-center">NONE</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                {bannerTab === "color" && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-4">
                      <input type="color" value={solidColor}
                        onChange={e => { setSolidColor(e.target.value); setSelectedBanner(e.target.value); }}
                        className="w-16 h-12 p-1 bg-background border border-border cursor-pointer rounded-none" />
                      <div className="font-mono text-sm">
                        <div className="text-muted-foreground text-xs mb-1">HEX COLOR</div>
                        <div>{solidColor.toUpperCase()}</div>
                      </div>
                    </div>
                    <div className="h-10 w-full border border-border/50" style={{ backgroundColor: solidColor }} />
                  </div>
                )}

                {bannerTab === "custom" && (
                  <div>
                    {customBanners.length === 0 ? (
                      <p className="font-mono text-xs text-muted-foreground/60 py-4 text-center uppercase tracking-wider">
                        No custom banners available yet.
                      </p>
                    ) : (
                      <div className="grid gap-1.5 max-h-64 overflow-y-auto pr-1">
                        <button type="button"
                          onClick={() => setSelectedBanner("none")}
                          className={`relative h-10 border-2 transition-all overflow-hidden ${selectedBanner === "none" ? "border-primary" : "border-border/50 hover:border-primary/60"}`}
                          style={{ background: "repeating-linear-gradient(45deg,#111 0px,#111 4px,#0a0a0a 4px,#0a0a0a 8px)" }}>
                          <span className="text-muted-foreground text-[10px] font-mono absolute inset-0 flex items-center justify-center">NONE</span>
                        </button>
                        {customBanners.map(cb => {
                          const css = getBannerPatternStyle(cb.patternType, cb.primaryColor, cb.secondaryColor, cb.bgColor);
                          const key = `custom:${cb.id}`;
                          return (
                            <button key={cb.id} type="button"
                              onClick={() => setSelectedBanner(key)}
                              className={`relative h-10 border-2 transition-all overflow-hidden text-left ${
                                selectedBanner === key
                                  ? "border-primary shadow-[0_0_10px_rgba(139,0,0,0.6)]"
                                  : "border-border/50 hover:border-primary/60"
                              }`}
                              style={css as React.CSSProperties}>
                              <span className="px-3 font-mono text-xs text-white/90 bg-black/50 h-full flex items-center absolute inset-0">
                                {cb.name}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                <div className="text-xs font-mono text-muted-foreground/60 uppercase tracking-wider">
                  SELECTED: {bannerLabel}
                </div>
              </div>

              {createProfile.isError && (
                <p className="text-destructive font-mono text-xs uppercase">
                  ERROR: FAILED TO FILE SUBJECT. TRY AGAIN.
                </p>
              )}

              <Button type="submit" disabled={createProfile.isPending}
                className="w-full font-mono text-lg tracking-widest bg-primary hover:bg-primary/80 text-primary-foreground border-2 border-transparent hover:border-border transition-all"
                data-testid="button-submit-profile">
                {createProfile.isPending ? "FILING..." : "FILE SUBJECT"}
              </Button>
            </form>
          </Form>
        </div>

        {/* Live Preview */}
        <div className="lg:sticky lg:top-8 h-fit space-y-4">
          <div className="text-xs font-mono text-muted-foreground uppercase border-b border-border pb-2 mb-4">
            Live Preview
          </div>
          <Card className="id-card overflow-hidden border-2 border-primary/40 bg-card/80 backdrop-blur relative">
            <div className="absolute top-0 right-0 p-2 text-xs font-mono text-muted-foreground border-b border-l border-primary/20 bg-background/50 z-10">
              ID: PENDING...
            </div>

            {bannerPreviewCss ? (
              <div className="id-banner id-banner-shimmer" style={bannerPreviewCss as React.CSSProperties} />
            ) : (
              <div className="h-2 bg-primary/20" />
            )}

            <CardContent className="p-6 pt-4">
              <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                <div className={bannerPreviewCss ? "-mt-10 z-10 relative flex-shrink-0" : "flex-shrink-0"}>
                  <Avatar className="w-32 h-32 rounded-none border-2 border-primary/50 shadow-[0_0_15px_rgba(139,0,0,0.3)]">
                    <AvatarImage src={imagePreview} className="object-cover" />
                    <AvatarFallback className="rounded-none bg-muted text-4xl text-muted-foreground font-serif">?</AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex-1 space-y-3 font-mono w-full">
                  <div>
                    <div className="text-xs text-primary/70 uppercase tracking-wider mb-1">Subject Alias</div>
                    <div className="text-2xl font-bold text-foreground truncate">{formValues.displayName || "UNKNOWN"}</div>
                    <div className="text-sm text-muted-foreground truncate">@{formValues.username || "unknown"}</div>
                    <div className="text-xs text-muted-foreground/70 mt-0.5">AGE: {formValues.ageGroup}</div>
                  </div>
                  <div className="flex items-center gap-3 py-2 border-y border-border/50">
                    <div className="text-xs text-primary/70 uppercase tracking-wider">Color Ref:</div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border border-border" style={{ backgroundColor: formValues.favoriteColor }} />
                      <span className="text-sm">{formValues.favoriteColor}</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-primary/70 uppercase tracking-wider mb-1">Subject Notes</div>
                    <p className="text-sm text-foreground/80 leading-relaxed break-words min-h-[40px]">
                      {formValues.bio ? `"${formValues.bio}"` : "NO DATA"}
                    </p>
                  </div>
                  {selectedTraits.length > 0 && (
                    <div>
                      <div className="text-xs text-primary/70 uppercase tracking-wider mb-1">Traits</div>
                      <div className="flex flex-wrap gap-1">
                        {selectedTraits.map(t => (
                          <span key={t} className="text-xs border border-primary/30 px-1.5 py-0.5 text-primary/70">{t}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
