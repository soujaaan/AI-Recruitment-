import React, { useEffect, useMemo } from "react";
import { MessageSquareText } from "lucide-react";
import { Button } from "../ui/button";
import { Tooltip } from "../ui/tooltip";
import { motion } from "framer-motion";
import useChatStore from "@/store/chatStore";

const MessageButton = ({ onToggleDropdown }) => {
  const unreadCount = useChatStore((s) => s.unreadCount);
  const dropdownOpen = useChatStore((s) => s.dropdownOpen);

  const badgeText = useMemo(() => {
    if (!unreadCount) return "";
    return unreadCount > 99 ? "99+" : String(unreadCount);
  }, [unreadCount]);

  useEffect(() => {
    // Optionally: trigger animation only when unread updates.
  }, [unreadCount]);

  return (
    <div className="relative">
      <Tooltip content="Messages">
        <motion.div
          whileHover={{ scale: 1.03 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <Button
            type="button"
            variant="ghost"
            size="icon"
            aria-label="Messages"
            onClick={() => onToggleDropdown(!dropdownOpen)}
            className="relative rounded-xl border border-white/10 hover:bg-white/5 hover:border-[#00ff88]/30 hover:text-[#00ff88] transition-all shadow-[0_0_0px_rgba(0,255,136,0)] hover:shadow-[0_0_18px_rgba(0,255,136,0.25)]"
          >
            <MessageSquareText className="w-5 h-5" />
          </Button>
        </motion.div>
      </Tooltip>

      {unreadCount > 0 && (
        <motion.div
          className="absolute -top-1 -right-1"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.15 }}
        >
          <div className="w-6 h-6 rounded-full bg-red-500/95 text-[11px] text-white flex items-center justify-center border border-white/10 shadow-[0_0_18px_rgba(239,68,68,0.35)] animate-[pulse_1.5s_ease-in-out_infinite]">
            {badgeText}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default MessageButton;

