import { MessageCircle, Instagram, Facebook } from "lucide-react";

type Platform = "whatsapp" | "instagram" | "messenger" | "web" | "telegram";

const CONFIG: Record<Platform, { label: string; color: string; bg: string; Icon: React.ElementType }> = {
  whatsapp:  { label: "WhatsApp",  color: "text-[#25D366]", bg: "bg-[#25D366]/15", Icon: MessageCircle },
  instagram: { label: "Instagram", color: "text-[#E1306C]", bg: "bg-[#E1306C]/15", Icon: Instagram },
  messenger: { label: "Messenger", color: "text-[#0084FF]", bg: "bg-[#0084FF]/15", Icon: Facebook },
  web:       { label: "Web",       color: "text-cyan-400",  bg: "bg-cyan-400/15",  Icon: MessageCircle },
  telegram:  { label: "Telegram",  color: "text-[#2CA5E0]", bg: "bg-[#2CA5E0]/15", Icon: MessageCircle },
};

interface ChannelBadgeProps {
  platform: Platform;
  showLabel?: boolean;
  size?: "xs" | "sm";
}

export function ChannelBadge({ platform, showLabel = false, size = "xs" }: ChannelBadgeProps) {
  const cfg = CONFIG[platform] ?? CONFIG.web;
  const iconSize = size === "xs" ? "h-3 w-3" : "h-3.5 w-3.5";
  const textSize = size === "xs" ? "text-[10px]" : "text-xs";

  return (
    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>
      <cfg.Icon className={iconSize} />
      {showLabel && <span className={`${textSize} font-medium`}>{cfg.label}</span>}
    </span>
  );
}
