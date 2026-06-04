import { useState, useRef, useEffect } from "react";
import { Search, Send, Plus, UserCog, Users, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChannelBadge } from "@/components/channels/ChannelBadge";
import { MetaConnectModal } from "@/components/channels/MetaConnectModal";
import { useMetaConversations, useMetaMessages } from "@/hooks/useMetaConversations";
import { sendMetaMessage } from "@/channels/meta/connection";
import type { MetaPlatform, MetaConversation, MetaHandoffStatus } from "@/channels/meta/types";

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "agora";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

function initials(name: string) {
  return name.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase();
}

const HANDOFF_LABELS: Record<MetaHandoffStatus, string> = {
  agent: "Bot ativo",
  human: "Humano",
  resolved: "Resolvido",
};

const HANDOFF_COLORS: Record<MetaHandoffStatus, string> = {
  agent: "text-success",
  human: "text-warning",
  resolved: "text-muted-foreground",
};

interface ConvItemProps {
  conv: MetaConversation;
  active: boolean;
  onClick: () => void;
}

function ConvItem({ conv, active, onClick }: ConvItemProps) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-4 border-b border-border hover:bg-secondary/40 transition ${
        active ? "bg-primary/10 border-l-2 border-l-primary" : ""
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="relative flex-shrink-0">
          <div className="h-10 w-10 rounded-full gradient-accent flex items-center justify-center text-xs font-bold text-background">
            {initials(conv.contactName || "?")}
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1">
            <span className="text-sm font-medium truncate">{conv.contactName}</span>
            <span className="text-[10px] text-muted-foreground flex-shrink-0">{relativeTime(conv.lastMessageAt)}</span>
          </div>
          <div className="text-xs text-muted-foreground truncate">{conv.preview}</div>
          <div className="flex items-center gap-2 mt-1">
            <ChannelBadge platform={conv.platform} showLabel size="xs" />
            {conv.unread > 0 && (
              <span className="ml-auto text-[10px] bg-primary text-primary-foreground rounded-full h-4 min-w-4 px-1 flex items-center justify-center">
                {conv.unread}
              </span>
            )}
          </div>
        </div>
      </div>
    </button>
  );
}

interface ChatPanelProps {
  conv: MetaConversation;
  onHandoffChange: (status: MetaHandoffStatus) => void;
}

function ChatPanel({ conv, onHandoffChange }: ChatPanelProps) {
  const { messages, loading } = useMetaMessages(conv.id);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSend() {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setSending(true);
    setText("");
    try {
      await sendMetaMessage(conv.connectionId, conv.contactExternalId, trimmed);
    } catch (e) {
      console.error("Erro ao enviar mensagem:", e);
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      {/* header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-card/40">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full gradient-accent flex items-center justify-center text-xs font-bold text-background">
            {initials(conv.contactName || "?")}
          </div>
          <div>
            <div className="font-semibold text-sm">{conv.contactName}</div>
            <div className={`text-xs ${HANDOFF_COLORS[conv.handoffStatus]}`}>
              {HANDOFF_LABELS[conv.handoffStatus]}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className="bg-secondary/40"
            onClick={() => onHandoffChange("human")} disabled={conv.handoffStatus === "human"}>
            <UserCog className="h-3.5 w-3.5 mr-1.5" /> Humano
          </Button>
          <Button size="sm" variant="outline" className="bg-secondary/40"
            onClick={() => onHandoffChange("agent")} disabled={conv.handoffStatus === "agent"}>
            <Users className="h-3.5 w-3.5 mr-1.5" /> Bot
          </Button>
          <Button size="sm" variant="outline" className="bg-secondary/40"
            onClick={() => onHandoffChange("resolved")} disabled={conv.handoffStatus === "resolved"}>
            <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" /> Resolver
          </Button>
        </div>
      </div>

      {/* messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-background/40">
        {loading && (
          <div className="text-center text-sm text-muted-foreground py-8">Carregando mensagens…</div>
        )}
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.direction === "outbound" ? "justify-end" : "justify-start"}`}>
            <div className={`px-4 py-2.5 max-w-md text-sm rounded-2xl ${
              msg.direction === "outbound"
                ? "gradient-primary text-primary-foreground rounded-tr-sm shadow-glow"
                : "bg-secondary rounded-tl-sm"
            }`}>
              {msg.messageText}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* input */}
      <div className="border-t border-border p-4 bg-card/40">
        <div className="flex items-end gap-2">
          <Input
            placeholder="Escreva uma mensagem…"
            className="bg-background border-border"
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          />
          <Button
            className="gradient-primary text-primary-foreground border-0"
            onClick={handleSend}
            disabled={!text.trim() || sending}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </>
  );
}

const PLATFORM_FILTERS: { value: MetaPlatform | "all"; label: string }[] = [
  { value: "all", label: "Todos" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "instagram", label: "Instagram" },
  { value: "messenger", label: "Messenger" },
];

export default function Conversations() {
  const [platformFilter, setPlatformFilter] = useState<MetaPlatform | "all">("all");
  const [search, setSearch] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [connectOpen, setConnectOpen] = useState(false);

  const { conversations, loading, markRead, setHandoffStatus } = useMetaConversations(
    platformFilter === "all" ? undefined : platformFilter
  );

  const filtered = conversations.filter(c =>
    !search || c.contactName.toLowerCase().includes(search.toLowerCase()) || c.preview.toLowerCase().includes(search.toLowerCase())
  );

  const activeConv = filtered.find(c => c.id === activeId) ?? filtered[0] ?? null;

  async function handleSelect(conv: MetaConversation) {
    setActiveId(conv.id);
    if (conv.unread > 0) await markRead(conv.id);
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)]">
      {/* list */}
      <aside className="w-80 border-r border-border bg-card/40 flex flex-col">
        <div className="p-4 border-b border-border space-y-3">
          <div className="flex items-center justify-between">
            <h1 className="font-display text-xl font-bold">Conversas</h1>
            <Button size="icon" variant="ghost" onClick={() => setConnectOpen(true)}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              placeholder="Buscar…"
              className="pl-9 h-9 bg-background border-border text-sm"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-1 flex-wrap">
            {PLATFORM_FILTERS.map(f => (
              <button
                key={f.value}
                onClick={() => setPlatformFilter(f.value)}
                className={`text-xs px-2.5 py-1 rounded-full border transition ${
                  platformFilter === f.value
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border text-muted-foreground hover:border-foreground"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading && (
            <div className="p-6 text-center text-sm text-muted-foreground">Carregando…</div>
          )}
          {!loading && filtered.length === 0 && (
            <div className="p-6 text-center space-y-3">
              <div className="text-sm text-muted-foreground">Nenhuma conversa ainda.</div>
              <Button size="sm" variant="outline" onClick={() => setConnectOpen(true)}>
                <Plus className="h-3.5 w-3.5 mr-1.5" /> Conectar canal
              </Button>
            </div>
          )}
          {filtered.map(c => (
            <ConvItem
              key={c.id}
              conv={c}
              active={c.id === (activeConv?.id)}
              onClick={() => handleSelect(c)}
            />
          ))}
        </div>
      </aside>

      {/* main */}
      <main className="flex-1 flex flex-col min-w-0">
        {activeConv ? (
          <ChatPanel
            conv={activeConv}
            onHandoffChange={status => setHandoffStatus(activeConv.id, status)}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
            Selecione uma conversa
          </div>
        )}
      </main>

      <MetaConnectModal open={connectOpen} onClose={() => setConnectOpen(false)} />
    </div>
  );
}
