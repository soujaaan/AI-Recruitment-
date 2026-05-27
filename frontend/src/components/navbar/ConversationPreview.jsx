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
      className="w-full text-left px-3 py-2.5 hover:bg-white/4 transition-all flex gap-3 items-start"
    >
      <div className="relative flex-shrink-0 mt-0.5">
        <Avatar className="w-8 h-8 rounded-xl bg-surface/80 border border-border/70">
          <AvatarFallback className="text-[11px] tracking-wide">
            {room?.name?.slice(0, 2).toUpperCase() || "U"}
          </AvatarFallback>
        </Avatar>
        <span
          className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-surface ${
            isOnline ? "bg-[#00ff88]" : "bg-zinc-500"
          }`}
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-[13px] font-medium text-foreground truncate">
              {room?.name || "Unknown"}
            </span>
            {unread > 0 && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88] flex-shrink-0" />
            )}
          </div>
          {timeLabel && (
            <span className="text-[10px] text-muted-foreground flex-shrink-0">
              {timeLabel}
            </span>
          )}
        </div>

        {room?.meta && (
          <div className="mt-0.5 text-[11px] text-muted-foreground truncate">
            {room.meta}
          </div>
        )}

        <div className="mt-0.5 text-[11px] text-foreground/90 truncate flex items-center justify-between gap-2">
          <span className="truncate">
            {truncate(lastMessage, 68) || "No messages yet"}
          </span>
          {unread > 0 && (
            <span className="ml-2 inline-flex items-center justify-center min-w-[18px] h-4 rounded-full bg-[#00ff88]/15 text-[#00ff88] text-[10px] font-medium px-1.5">
              {unread > 99 ? "99+" : unread}
            </span>
          )}
        </div>
      </div>
    </button>
  );
};

export default ConversationPreview;

