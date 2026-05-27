import React, { useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import useChatStore from "@/store/chatStore";
import ConversationPreview from "./ConversationPreview";
import { Button } from "../ui/button";
import { useSelector } from "react-redux";
import { MessageSquareMore, Inbox } from "lucide-react";

const MessageDropdown = ({ onClose }) => {
  const navigate = useNavigate();
  const recentRooms = useChatStore((s) => s.recentRooms);
  const onlineUsers = useChatStore((s) => s.onlineUsers);
  const setActiveRoomId = useChatStore((s) => s.setActiveRoomId);
  const setDropdownOpen = useChatStore((s) => s.setDropdownOpen);

  const onlineSet = useMemo(() => new Set((onlineUsers || []).map(String)), [onlineUsers]);
  const user = useSelector((store) => store.auth.user);

  const totalUnread = useMemo(() => {
    if (!recentRooms?.length || !user?._id) return 0;
    return recentRooms.reduce(
      (sum, room) => sum + (room?.unreadCounts?.[user._id] || 0),
      0
    );
  }, [recentRooms, user?._id]);

  useEffect(() => {
    const onEsc = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [onClose]);

  const goToMessages = (roomId) => {
    setActiveRoomId(roomId || null);
    setDropdownOpen(false);
    navigate("/messages");
  };

  return (
    <AnimatePresence>
      <motion.div
        key="msg_dropdown"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.16, ease: "easeOut" }}
        className="absolute right-0 mt-3 w-[360px] max-w-[92vw] rounded-2xl border border-border/70 bg-[#050505]/95 backdrop-blur-xl shadow-[0_18px_40px_rgba(0,0,0,0.65)] overflow-hidden"
      >
        <div className="px-3.5 py-3 border-b border-border/70 bg-gradient-to-b from-white/3 to-transparent">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-xl bg-surface/80 border border-border/80 flex items-center justify-center shadow-[0_0_0_1px_rgba(0,255,136,0.18)]">
                <MessageSquareMore className="w-3.5 h-3.5 text-[#00ff88]" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold tracking-wide text-muted-foreground/80 uppercase">
                  Inbox
                </span>
                <span className="text-[13px] font-medium text-foreground">
                  Conversations
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {totalUnread > 0 && (
                <span className="inline-flex items-center rounded-full bg-[#00ff88]/10 text-[#00ff88] border border-[#00ff88]/40 px-2 py-0.5 text-[11px] font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88] mr-1.5 animate-pulse" />
                  {totalUnread > 99 ? "99+" : totalUnread} new
                </span>
              )}
              <span className="text-[11px] text-muted-foreground">
                Live sync
              </span>
            </div>
          </div>
        </div>

        <div className="max-h-[380px] overflow-y-auto py-1">
          {recentRooms?.length ? (
            <div className="divide-y divide-border/40">
              {recentRooms.map((room) => {
                const otherUserIdOrObj = room.candidateId === user?._id ? room.recruiterId : room.candidateId;

                const isPopulatedUser =
                  otherUserIdOrObj && typeof otherUserIdOrObj === "object" && "_id" in otherUserIdOrObj;

                const otherUserId = isPopulatedUser ? otherUserIdOrObj._id : otherUserIdOrObj;
                const otherUserIdStr = otherUserId ? String(otherUserId) : "";

                const otherUserName = isPopulatedUser && otherUserIdOrObj.fullname
                  ? otherUserIdOrObj.fullname
                  : `User ${String(otherUserIdStr).slice(-4)}`;

                const isOnline = onlineSet.has(String(otherUserIdStr));
                const unreadCount = room.unreadCounts?.[user?._id] || 0;

                return (
                  <ConversationPreview
                    key={room._id || room.roomId}
                    room={{
                      ...room,
                      name: otherUserName,
                      unreadCount: unreadCount,
                    }}
                    isOnline={isOnline}
                    onClick={() => goToMessages(room._id || room.roomId)}
                  />
                );
              })}
            </div>
          ) : (
            <div className="px-6 py-8 text-center text-sm">
              <div className="w-12 h-12 rounded-2xl bg-surface/80 border border-border/80 mx-auto flex items-center justify-center text-[#00ff88] shadow-[0_0_18px_rgba(0,255,136,0.12)]">
                <Inbox className="w-5 h-5" />
              </div>
              <p className="mt-3 font-medium text-foreground text-[13px]">
                No conversations yet
              </p>
              <p className="text-[11px] text-muted-foreground mt-1">
                Your inbox preview will appear once a recruiter or candidate starts a chat.
              </p>
            </div>
          )}
        </div>

        <div className="px-3.5 py-3 border-t border-border/70 bg-gradient-to-t from-white/3 to-transparent flex gap-2">
          <Button
            variant="outline"
            className="flex-1 h-8 rounded-lg border-border/80 bg-transparent text-[12px] text-muted-foreground hover:text-foreground hover:bg-surface/80"
            onClick={() => goToMessages(null)}
          >
            View All
          </Button>
          <Button
            className="flex-1 h-8 rounded-lg btn-neon text-[12px] font-semibold"
            onClick={() => goToMessages(recentRooms?.[0]?._id || null)}
            disabled={!recentRooms?.length}
          >
            Open Inbox
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MessageDropdown;

