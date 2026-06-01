import { useState } from "react";
import { Skull } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

export default function Auth() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [robloxUsername, setRobloxUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const { login, register, isLoading } = useAuth();
  const { toast } = useToast();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (mode === "register") {
      if (password !== confirm) {
        setError("Passwords do not match.");
        return;
      }
      if (password.length < 6) {
        setError("Password must be at least 6 characters.");
        return;
      }
    }

    try {
      if (mode === "login") {
        await login(robloxUsername.trim(), password);
        toast({ title: "ACCESS GRANTED", description: `Welcome back, ${robloxUsername}` });
      } else {
        await register(robloxUsername.trim(), password);
        toast({ title: "SUBJECT REGISTERED", description: `Welcome to the archive, ${robloxUsername}` });
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unknown error");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center space-y-3">
          <Skull className="w-12 h-12 text-red-700 mx-auto animate-pulse" />
          <h1
            className="text-4xl font-bold text-red-700 glitch-text uppercase tracking-widest"
            data-text="InvestiGator IDs"
          >
            InvestiGator IDs
          </h1>
          <p className="text-sm text-muted-foreground font-mono uppercase tracking-widest">
            {mode === "login" ? "SUBJECT IDENTIFICATION REQUIRED" : "NEW SUBJECT REGISTRATION"}
          </p>
        </div>

        <div className="border border-primary/30 bg-card/60 backdrop-blur p-6 space-y-5">
          <div className="flex border border-primary/20 overflow-hidden">
            <button
              type="button"
              onClick={() => { setMode("login"); setError(""); }}
              className={`flex-1 py-2 text-xs font-mono uppercase tracking-widest transition-colors ${
                mode === "login"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              LOG IN
            </button>
            <button
              type="button"
              onClick={() => { setMode("register"); setError(""); }}
              className={`flex-1 py-2 text-xs font-mono uppercase tracking-widest transition-colors ${
                mode === "register"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              SIGN UP
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-mono text-primary/70 uppercase tracking-wider">
                Roblox Username
              </label>
              <Input
                value={robloxUsername}
                onChange={e => setRobloxUsername(e.target.value)}
                placeholder="YourRobloxName"
                required
                className="font-mono bg-background/60 border-primary/30 focus:border-primary"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-mono text-primary/70 uppercase tracking-wider">
                Password
              </label>
              <Input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="font-mono bg-background/60 border-primary/30 focus:border-primary"
              />
            </div>

            {mode === "register" && (
              <div className="space-y-1">
                <label className="text-xs font-mono text-primary/70 uppercase tracking-wider">
                  Confirm Password
                </label>
                <Input
                  type="password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="font-mono bg-background/60 border-primary/30 focus:border-primary"
                />
              </div>
            )}

            {error && (
              <p className="text-xs text-red-400 font-mono border border-red-900/50 bg-red-950/30 px-3 py-2">
                ⚠ {error}
              </p>
            )}

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full font-mono uppercase tracking-widest bg-primary hover:bg-primary/80"
            >
              {isLoading ? "PROCESSING..." : mode === "login" ? "ENTER ARCHIVE" : "REGISTER SUBJECT"}
            </Button>
          </form>
        </div>

        {mode === "register" && (
          <p className="text-center text-xs text-muted-foreground/60 font-mono">
            Use your exact Roblox username. No email needed.
          </p>
        )}
      </div>
    </div>
  );
}
