import React from "react";
import { Avatar, AvatarFallback } from "../ui/avatar";
import { CheckCircle2, Dot } from "lucide-react";

const truncate = (s, n = 55) => {
  if (!s) return "";
  const str = String(s);
  return str.length > n ? str.slice(0, n - 1) + "…" : str;
};

const ConversationPreview = ({ room, isOnline, onClick }) => {
  const unread = room?.unreadCount ?? 0;
  const lastMessage = room?.lastMessage || "";
  const lastAt = room?.lastMessageAt ? new Date(room.lastMessageAt) : null;

  const timeLabel = lastAt
    ? lastAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : "";

  return (
    <button
      onClick={onClick}
      className="w-full text-left px-3 py-2 rounded-xl hover:bg-white/5 transition-all flex gap-3 items-start"
    >
      <div className="relative flex-shrink-0">
        <Avatar className="w-10 h-10 rounded-xl bg-white/5 border border-white/10">
          <AvatarFallback className="text-xs">{room?.name?.slice(0, 2).toUpperCase() || "U"}</AvatarFallback>
        </Avatar>
        <span
          className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border border-surface-elevated ${
            isOnline ? "bg-[#00ff88]" : "bg-amber-400/80"
          }`}
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <div className="font-medium text-foreground truncate">{room?.name || "Unknown"}</div>
          {unread > 0 && (
            <div className="flex items-center gap-1">
              <span className="text-[11px] bg-red-500/90 text-white px-2 py-0.5 rounded-full animate-pulse">
                {unread > 99 ? "99+" : unread}
              </span>
            </div>
          )}
        </div>

        <div className="text-[12px] text-muted-foreground truncate">
          {room?.meta || ""}
        </div>

        <div className="mt-1 text-[12px] text-foreground/90 truncate flex items-center justify-between gap-2">
          <span className="truncate">{truncate(lastMessage, 65)}</span>
          {timeLabel && <span className="text-[11px] text-muted-foreground flex-shrink-0">{timeLabel}</span>}
        </div>
      </div>
    </button>
  );
};

export default ConversationPreview;

