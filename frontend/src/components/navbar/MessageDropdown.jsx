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
        className="absolute right-0 mt-3 w-[420px] max-w-[90vw] bg-surface border-border rounded-2xl shadow-[0_0_40px_rgba(0,255,136,0.12)] overflow-hidden"
      >
        <div className="p-3 border-b border-white/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquareMore className="w-4 h-4 text-[#00ff88]" />
              <span className="font-semibold text-foreground">Messages</span>
            </div>
            <span className="text-xs text-muted-foreground">Real-time</span>
          </div>
        </div>

        <div className="max-h-[420px] overflow-y-auto">
          {recentRooms?.length ? (
            <div>
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
            <div className="p-8 text-center">
              <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 mx-auto flex items-center justify-center text-[#00ff88]">
                <Inbox className="w-6 h-6" />
              </div>
              <p className="mt-3 font-medium text-foreground">No conversations yet</p>
              <p className="text-xs text-muted-foreground mt-1">Your inbox will appear after an application chat starts.</p>
            </div>
          )}
        </div>

        <div className="p-3 border-t border-white/5 flex gap-2">
          <Button
            className="flex-1 btn-neon-outline"
            onClick={() => goToMessages(null)}
            variant="outline"
          >
            View All Messages
          </Button>
          <Button
            className="flex-1 btn-neon"
            onClick={() => goToMessages(recentRooms?.[0]?._id || null)}
            disabled={!recentRooms?.length}
          >
            Go to Inbox
          </Button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default MessageDropdown;

