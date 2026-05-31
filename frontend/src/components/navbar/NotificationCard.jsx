import React from "react";
import { motion } from "framer-motion";
import {
    Briefcase,
    Calendar,
    CheckCircle2,
    XCircle,
    Sparkles,
    Megaphone,
    Bell,
    Trash2,
    Check,
    MessageSquare,
    FileText,
    UserCheck,
    Trophy,
    ThumbsUp,
} from "lucide-react";
import { Button } from "../ui/button";

const formatTimeAgo = (dateString) => {
    try {
        const now = new Date();
        const date = new Date(dateString);
        const seconds = Math.floor((now - date) / 1000);
        if (seconds < 5) return "Just now";
        if (seconds < 60) return `${seconds}s ago`;
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m ago`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours}h ago`;
        const days = Math.floor(hours / 24);
        if (days === 1) return "Yesterday";
        if (days < 7) return `${days}d ago`;
        return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
    } catch (e) {
        return "";
    }
};

const getNotificationConfig = (type) => {
    switch (type) {
        // Candidate Types
        case "APPLICATION_STATUS_UPDATED":
        case "APPLICATION_SHORTLISTED":
            return {
                icon: UserCheck,
                colorClass: "text-[#00ff88] bg-[#00ff88]/10 border-[#00ff88]/20",
                glowColor: "rgba(0, 255, 136, 0.15)",
            };
        case "APPLICATION_REJECTED":
            return {
                icon: XCircle,
                colorClass: "text-red-400 bg-red-500/10 border-red-500/20",
                glowColor: "rgba(248, 113, 113, 0.15)",
            };
        case "INTERVIEW_SCHEDULED":
        case "INTERVIEW_UPDATED":
            return {
                icon: Calendar,
                colorClass: "text-amber-400 bg-amber-500/10 border-amber-500/20",
                glowColor: "rgba(251, 191, 36, 0.15)",
            };
        case "INTERVIEW_CANCELLED":
            return {
                icon: Calendar,
                colorClass: "text-rose-500 bg-rose-500/10 border-rose-500/20",
                glowColor: "rgba(244, 63, 94, 0.15)",
            };
        case "JOB_RECOMMENDED":
        case "NEW_JOB_MATCH":
            return {
                icon: Sparkles,
                colorClass: "text-purple-400 bg-purple-500/10 border-purple-500/20",
                glowColor: "rgba(192, 132, 252, 0.15)",
            };
        case "RESUME_ANALYZED":
            return {
                icon: FileText,
                colorClass: "text-blue-400 bg-blue-500/10 border-blue-500/20",
                glowColor: "rgba(96, 165, 250, 0.15)",
            };
        case "CHAT_MESSAGE":
        case "NEW_MESSAGE":
            return {
                icon: MessageSquare,
                colorClass: "text-teal-400 bg-teal-500/10 border-teal-500/20",
                glowColor: "rgba(45, 212, 191, 0.15)",
            };
        case "SYSTEM_ANNOUNCEMENT":
            return {
                icon: Megaphone,
                colorClass: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
                glowColor: "rgba(34, 211, 238, 0.15)",
            };

        // Recruiter Types
        case "NEW_APPLICATION":
            return {
                icon: Briefcase,
                colorClass: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
                glowColor: "rgba(52, 211, 153, 0.15)",
            };
        case "AI_MATCH_FOUND":
            return {
                icon: Trophy,
                colorClass: "text-violet-400 bg-violet-500/10 border-violet-500/20",
                glowColor: "rgba(167, 139, 250, 0.15)",
            };
        case "INTERVIEW_RESPONSE":
            return {
                icon: ThumbsUp,
                colorClass: "text-orange-400 bg-orange-500/10 border-orange-500/20",
                glowColor: "rgba(251, 146, 60, 0.15)",
            };
        case "ADMIN_ALERT":
            return {
                icon: Megaphone,
                colorClass: "text-rose-400 bg-rose-500/10 border-rose-500/20",
                glowColor: "rgba(251, 113, 133, 0.15)",
            };

        default:
            return {
                icon: Bell,
                colorClass: "text-muted-foreground bg-white/5 border-white/10",
                glowColor: "rgba(255, 255, 255, 0.05)",
            };
    }
};

export const NotificationCard = ({
    notification,
    onMarkRead,
    onDelete,
    onClick,
    selectable = false,
    checked = false,
    onSelect,
}) => {
    const { _id, type, title, message, isRead, createdAt } = notification;
    const config = getNotificationConfig(type);
    const Icon = config.icon;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: -20 }}
            whileHover={{ scale: 1.008 }}
            transition={{ type: "spring", stiffness: 350, damping: 25 }}
            className={`group relative flex items-start gap-4 p-4 rounded-2xl border transition-all duration-300 ${
                isRead
                    ? "bg-[#070707]/60 border-border/40 hover:bg-[#070707]/80 hover:border-border/60"
                    : "bg-[#0b0b0b]/75 border-border hover:bg-[#0c0c0c]/90 hover:border-[#00ff88]/30 shadow-[0_0_0px_rgba(0,255,136,0)] hover:shadow-[0_0_20px_rgba(0,255,136,0.12)]"
            } cursor-pointer`}
            onClick={onClick}
        >
            {/* Unread indicator left border accent */}
            {!isRead && (
                <div className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-[#00ff88] rounded-r-full shadow-[0_0_12px_rgba(0,255,136,0.8)]" />
            )}

            {/* Checkbox overlay for selection when selectable prop is true */}
            {selectable && (
                <div
                    className="shrink-0 flex items-center h-10 pr-1"
                    onClick={(e) => e.stopPropagation()}
                >
                    <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => onSelect?.(_id, e.target.checked)}
                        className="h-4.5 w-4.5 rounded border-border bg-[#050505] text-[#00ff88] focus:ring-[#00ff88] outline-none accent-[#00ff88] cursor-pointer"
                    />
                </div>
            )}

            {/* Icon Container with radial backdrop glow */}
            <div
                className={`relative shrink-0 h-10 w-10 rounded-xl border flex items-center justify-center transition-all duration-300 group-hover:scale-105`}
                style={{
                    backgroundColor: config.colorClass.split(" ")[1],
                    borderColor: config.colorClass.split(" ")[2],
                    boxShadow: `0 0 14px ${config.glowColor}`,
                }}
            >
                <Icon className={`w-4 h-4 ${config.colorClass.split(" ")[0]}`} />
            </div>

            {/* Notification content */}
            <div className="flex-1 min-w-0 pr-8">
                <div className="flex items-baseline justify-between gap-2">
                    <h5
                        className={`text-[13px] transition-colors duration-200 truncate ${
                            isRead
                                ? "text-muted-foreground font-medium"
                                : "text-foreground font-bold group-hover:text-[#00ff88]"
                        }`}
                    >
                        {title}
                    </h5>
                    <span className="text-[10px] text-muted-foreground/60 shrink-0 select-none">
                        {formatTimeAgo(createdAt)}
                    </span>
                </div>
                <p className={`mt-1 text-[12px] leading-relaxed line-clamp-2 ${isRead ? "text-muted-foreground/60" : "text-muted-foreground font-medium"}`}>
                    {message}
                </p>
            </div>

            {/* Action buttons floating on hover */}
            <div className="absolute right-3.5 top-3.5 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                {!isRead && onMarkRead && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                            e.stopPropagation();
                            onMarkRead(_id);
                        }}
                        className="h-7 w-7 rounded-lg border border-white/5 bg-[#121212]/90 hover:bg-[#00ff88]/10 hover:border-[#00ff88]/30 hover:text-[#00ff88] transition-all"
                        title="Mark as read"
                    >
                        <Check className="w-3.5 h-3.5" />
                    </Button>
                )}
                {onDelete && (
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                            e.stopPropagation();
                            onDelete(_id);
                        }}
                        className="h-7 w-7 rounded-lg border border-white/5 bg-[#121212]/90 hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400 transition-all"
                        title="Delete notification"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                )}
            </div>
        </motion.div>
    );
};

export default NotificationCard;
