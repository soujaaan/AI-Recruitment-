import React, { useMemo } from "react";
import { Bell } from "lucide-react";
import { Button } from "../ui/button";
import { Tooltip } from "../ui/tooltip";
import { motion } from "framer-motion";
import { useNotifications } from "@/hooks/useNotifications";

export const NotificationBell = ({ isOpen, onToggle }) => {
    const { unreadCount } = useNotifications();

    const badgeText = useMemo(() => {
        if (!unreadCount) return "";
        return unreadCount > 99 ? "99+" : String(unreadCount);
    }, [unreadCount]);

    return (
        <div className="relative">
            <Tooltip content="Notifications">
                <motion.div
                    whileHover={{ scale: 1.03 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        aria-label="Notifications"
                        onClick={() => onToggle(!isOpen)}
                        className={`relative rounded-xl border transition-all shadow-[0_0_0px_rgba(0,255,136,0)] ${
                            isOpen
                                ? "bg-white/5 border-[#00ff88]/40 text-[#00ff88] shadow-[0_0_18px_rgba(0,255,136,0.25)]"
                                : "border-white/10 hover:bg-white/5 hover:border-[#00ff88]/30 hover:text-[#00ff88] hover:shadow-[0_0_18px_rgba(0,255,136,0.25)]"
                        }`}
                    >
                        <Bell className={`w-5 h-5 ${unreadCount > 0 && !isOpen ? "animate-[swing_2s_ease-in-out_infinite]" : ""}`} />
                    </Button>
                </motion.div>
            </Tooltip>

            {unreadCount > 0 && (
                <motion.div
                    className="absolute -top-1 -right-1 pointer-events-none"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.15 }}
                >
                    <div className="w-5 h-5 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center border border-[#0a0a0a] shadow-[0_0_14px_rgba(239,68,68,0.45)]">
                        {badgeText}
                    </div>
                </motion.div>
            )}

            {/* Injected custom swing keyframes for bell animation */}
            <style dangerouslySetInnerHTML={{__html: `
                @keyframes swing {
                    0% { transform: rotate(0); }
                    10% { transform: rotate(15deg); }
                    20% { transform: rotate(-10deg); }
                    30% { transform: rotate(8deg); }
                    40% { transform: rotate(-6deg); }
                    50% { transform: rotate(4deg); }
                    60% { transform: rotate(-2deg); }
                    70% { transform: rotate(1deg); }
                    100% { transform: rotate(0); }
                }
            `}} />
        </div>
    );
};

export default NotificationBell;
