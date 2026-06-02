import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { Loader2, Sparkles } from "lucide-react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { useAuth } from "@/auth/AuthProvider";

const credsSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(8, "Mínimo de 8 caracteres").max(128),
});
const signupSchema = credsSchema.extend({
  full_name: z.string().min(2, "Informe seu nome").max(120),
});

export default function Auth() {
  const navigate = useNavigate();
  const { session, loading } = useAuth();
  const [busy, setBusy] = useState(false);

  // Form state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  useEffect(() => {
    if (session) navigate("/dashboard", { replace: true });
  }, [session, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-5 w-5 animate-spin text-primary-glow" />
      </div>
    );
  }
  if (session) return <Navigate to="/dashboard" replace />;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = credsSchema.safeParse({ email, password });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) {
      toast.error(error.message === "Invalid login credentials" ? "Email ou senha inválidos" : error.message);
      return;
    }
    toast.success("Bem-vindo de volta!");
    navigate("/dashboard");
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = signupSchema.safeParse({ email, password, full_name: fullName });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0].message);
      return;
    }
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: { full_name: fullName },
      },
    });
    setBusy(false);
    if (error) {
      toast.error(error.message.includes("registered") ? "Esse email já está cadastrado" : error.message);
      return;
    }
    toast.success("Conta criada! Verifique seu email se necessário.");
  };

  const handleGoogle = async () => {
    setBusy(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin + "/dashboard",
    });
    if (result.error) {
      setBusy(false);
      toast.error("Falha ao iniciar login com Google");
      return;
    }
    if (result.redirected) return;
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Link to="/" className="flex items-center justify-center gap-2 mb-8">
          <div className="h-9 w-9 rounded-xl gradient-primary flex items-center justify-center shadow-glow">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-display text-xl font-bold">FluxBot</span>
        </Link>

        <div className="rounded-2xl border border-border bg-card/60 backdrop-blur-xl p-6 shadow-elegant">
          <Tabs defaultValue="login">
            <TabsList className="grid grid-cols-2 w-full bg-secondary/40">
              <TabsTrigger value="login">Entrar</TabsTrigger>
              <TabsTrigger value="signup">Criar conta</TabsTrigger>
            </TabsList>

            <TabsContent value="login" className="mt-5">
              <form onSubmit={handleLogin} className="space-y-4">
                <Field label="Email">
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
                </Field>
                <Field label="Senha">
                  <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" required />
                </Field>
                <Button type="submit" disabled={busy} className="w-full gradient-primary text-primary-foreground border-0">
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Entrar"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup" className="mt-5">
              <form onSubmit={handleSignup} className="space-y-4">
                <Field label="Nome completo">
                  <Input value={fullName} onChange={(e) => setFullName(e.target.value)} autoComplete="name" required />
                </Field>
                <Field label="Email">
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required />
                </Field>
                <Field label="Senha (mín. 8 caracteres)">
                  <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" required />
                </Field>
                <Button type="submit" disabled={busy} className="w-full gradient-primary text-primary-foreground border-0">
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Criar conta"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-border" />
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">ou</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <Button
            type="button"
            variant="outline"
            disabled={busy}
            onClick={handleGoogle}
            className="w-full bg-background border-border"
          >
            <GoogleIcon className="h-4 w-4 mr-2" />
            Continuar com Google
          </Button>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-6">
          Ao continuar, você concorda com nossos termos de uso e política de privacidade.
        </p>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="text-xs text-muted-foreground">{label}</label>
      <div className="mt-1">{children}</div>
    </div>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden>
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.99.66-2.25 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.11A6.6 6.6 0 0 1 5.48 12c0-.73.13-1.44.36-2.11V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.84z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.05l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"/>
    </svg>
  );
}
