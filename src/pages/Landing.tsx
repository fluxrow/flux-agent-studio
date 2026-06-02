import { Link } from "react-router-dom";
import { Sparkles, Zap, GitBranch, Bot, ArrowRight, MessageSquare, BarChart3, Workflow } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  { icon: GitBranch, title: "Builder visual", desc: "Canvas infinito estilo Figma com drag-and-drop, conexões visuais e preview ao vivo." },
  { icon: Sparkles, title: "IA híbrida", desc: "Misture fluxo e IA. Decida quando o agente improvisa e quando segue o roteiro." },
  { icon: Workflow, title: "Integração n8n", desc: "Webhook, payload e credenciais geradas automaticamente. Conecte qualquer sistema." },
  { icon: BarChart3, title: "CRM + Analytics", desc: "Pipeline, lead scoring, funil de conversão e resumo automático por IA." },
];

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* nav */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-border/40 bg-background/60 backdrop-blur-xl">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl gradient-primary shadow-glow">
              <Sparkles className="h-4 w-4 text-primary-foreground" strokeWidth={2.5} />
            </div>
            <span className="font-display text-xl font-bold tracking-tight">FluxBot</span>
          </div>
          <div className="hidden md:flex items-center gap-7 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition">Recursos</a>
            <a href="#" className="hover:text-foreground transition">Templates</a>
            <a href="#" className="hover:text-foreground transition">Preços</a>
            <a href="#" className="hover:text-foreground transition">Docs</a>
          </div>
          <Link to="/app">
            <Button className="gradient-primary text-primary-foreground border-0 shadow-elegant">
              Entrar no app <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
      </nav>

      {/* hero */}
      <section className="relative pt-40 pb-32">
        <div className="absolute inset-0 grid-bg opacity-30 [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_75%)]" />
        <div className="container relative">
          <div className="mx-auto max-w-3xl text-center animate-fade-in">
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 py-1 text-xs text-primary-glow mb-6">
              <Zap className="h-3 w-3" /> Lançamento · Agentes híbridos com IA
            </div>
            <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight leading-[1.05]">
              Construa <span className="gradient-text">agentes conversacionais</span> que vendem por você
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
              FluxBot combina builder visual, IA e CRM em uma plataforma só.
              Capture, qualifique e converta leads em qualquer canal — sem código.
            </p>
            <div className="mt-9 flex items-center justify-center gap-3">
              <Link to="/app">
                <Button size="lg" className="gradient-primary text-primary-foreground border-0 shadow-elegant h-12 px-7">
                  Começar grátis <ArrowRight className="h-4 w-4 ml-1.5" />
                </Button>
              </Link>
              <Link to="/bot/sdr-imob">
                <Button size="lg" variant="outline" className="h-12 px-7 border-border/80 bg-secondary/40">
                  Ver bot ao vivo
                </Button>
              </Link>
            </div>
            <div className="mt-8 text-xs text-muted-foreground">
              Sem cartão de crédito · 14 dias grátis · WhatsApp, Site, Instagram
            </div>
          </div>

          {/* product preview */}
          <div className="relative mt-16 mx-auto max-w-5xl animate-fade-in">
            <div className="absolute -inset-x-20 -top-10 h-72 gradient-accent opacity-20 blur-3xl rounded-full" />
            <div className="relative rounded-2xl border border-border bg-card/60 backdrop-blur-xl shadow-elegant overflow-hidden">
              <div className="flex items-center gap-1.5 border-b border-border px-4 py-3">
                <div className="h-2.5 w-2.5 rounded-full bg-destructive/70" />
                <div className="h-2.5 w-2.5 rounded-full bg-warning/70" />
                <div className="h-2.5 w-2.5 rounded-full bg-success/70" />
                <span className="ml-3 text-xs text-muted-foreground font-mono">fluxbot.app/builder/sdr-imob</span>
              </div>
              <div className="grid grid-cols-12 min-h-[420px] grid-bg">
                <div className="col-span-2 border-r border-border bg-background/40 p-3 space-y-2">
                  {["Mensagem","Pergunta","Botões","Condição","IA","Webhook"].map((b,i)=>(
                    <div key={b} className={`rounded-lg border border-border bg-card px-3 py-2 text-xs ${i===4?"border-primary/50 shadow-glow":""}`}>{b}</div>
                  ))}
                </div>
                <div className="col-span-7 relative p-8">
                  {[
                    { top:30,left:60,label:"Saudação",type:"Mensagem"},
                    { top:140,left:60,label:"Coleta nome",type:"Pergunta"},
                    { top:250,left:60,label:"IA: Qualifica",type:"IA",glow:true},
                    { top:140,left:340,label:"Webhook → CRM",type:"Webhook"},
                  ].map((n)=>(
                    <div key={n.label} style={{top:n.top,left:n.left}} className={`absolute w-48 rounded-xl border bg-card p-3 shadow-card ${n.glow?"border-primary shadow-glow":"border-border"}`}>
                      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{n.type}</div>
                      <div className="text-sm font-medium mt-0.5">{n.label}</div>
                    </div>
                  ))}
                  <svg className="absolute inset-0 pointer-events-none" style={{width:"100%",height:"100%"}}>
                    <path d="M 180 80 C 180 110, 180 110, 180 170" stroke="hsl(var(--primary))" strokeWidth="2" fill="none" strokeDasharray="4 4"/>
                    <path d="M 180 190 C 180 220, 180 220, 180 280" stroke="hsl(var(--primary))" strokeWidth="2" fill="none"/>
                    <path d="M 230 170 C 290 170, 290 170, 360 170" stroke="hsl(var(--accent))" strokeWidth="2" fill="none"/>
                  </svg>
                </div>
                <div className="col-span-3 border-l border-border bg-background/40 p-4">
                  <div className="text-xs uppercase tracking-widest text-muted-foreground">Preview</div>
                  <div className="mt-3 space-y-2">
                    <div className="rounded-2xl rounded-tl-sm bg-secondary px-3 py-2 text-xs max-w-[85%]">Olá! Sou o assistente da FluxBot.</div>
                    <div className="rounded-2xl rounded-tr-sm gradient-primary text-primary-foreground px-3 py-2 text-xs max-w-[85%] ml-auto">Quero saber mais</div>
                    <div className="rounded-2xl rounded-tl-sm bg-secondary px-3 py-2 text-xs max-w-[85%]">Perfeito! Qual seu nome?</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* features */}
      <section id="features" className="py-24 border-t border-border/50">
        <div className="container">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <div className="text-xs uppercase tracking-widest text-primary-glow mb-3">Plataforma completa</div>
            <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight">Tudo o que você precisa para automatizar conversas</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
            {features.map((f) => (
              <div key={f.title} className="group rounded-2xl border border-border bg-card/60 p-6 hover:border-primary/40 hover:shadow-elegant transition">
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary-glow group-hover:gradient-primary group-hover:text-primary-foreground transition">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-semibold text-lg">{f.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* cta */}
      <section className="py-24">
        <div className="container">
          <div className="relative overflow-hidden rounded-3xl border border-primary/30 bg-card p-12 md:p-16 text-center">
            <div className="absolute inset-0 gradient-accent opacity-10" />
            <div className="relative">
              <h2 className="font-display text-4xl md:text-5xl font-bold tracking-tight">Pronto para criar seu primeiro agente?</h2>
              <p className="mt-4 text-muted-foreground max-w-xl mx-auto">Em minutos, não meses. Templates prontos para SDR, clínicas, imobiliárias, e-commerce e mais.</p>
              <Link to="/app">
                <Button size="lg" className="mt-8 gradient-primary text-primary-foreground border-0 shadow-elegant h-12 px-8">
                  Acessar dashboard <ArrowRight className="h-4 w-4 ml-1.5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border/50 py-8">
        <div className="container flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <Bot className="h-4 w-4" /> FluxBot © 2026
          </div>
          <div className="flex gap-6">
            <a href="#">Privacidade</a><a href="#">Termos</a><a href="#">Status</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
