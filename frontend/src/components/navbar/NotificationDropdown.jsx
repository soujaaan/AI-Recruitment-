import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { BellRing, CheckCheck, ExternalLink, Inbox } from "lucide-react";
import { Button } from "../ui/button";
import { useNotifications } from "@/hooks/useNotifications";
import NotificationCard from "./NotificationCard";

export const NotificationDropdown = ({ onClose }) => {
    const navigate = useNavigate();
    const {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        deleteNotification,
    } = useNotifications();

    useEffect(() => {
        const onEsc = (e) => {
            if (e.key === "Escape") onClose?.();
        };
        window.addEventListener("keydown", onEsc);
        return () => window.removeEventListener("keydown", onEsc);
    }, [onClose]);

    const handleViewAll = () => {
        onClose();
        navigate("/notifications");
    };

    const handleCardClick = (n) => {
        if (!n.isRead) {
            markAsRead(n._id);
        }
        onClose();
        // Dynamic navigation based on entity
        if (n.entityType === "Job" && n.entityId) {
            navigate(`/description/${n.entityId}`);
        } else if (n.entityType === "Application") {
            navigate("/applications");
        } else if (n.entityType === "InterviewSchedule") {
            navigate("/dashboard");
        }
    };

    const latestNotifications = notifications.slice(0, 5);

    return (
        <AnimatePresence>
            <motion.div
                key="notification_dropdown"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.16, ease: "easeOut" }}
                className="absolute right-0 mt-3 w-[380px] max-w-[92vw] rounded-2xl border border-border/70 bg-[#050505]/95 backdrop-blur-xl shadow-[0_18px_40px_rgba(0,0,0,0.65)] overflow-hidden z-[100]"
            >
                {/* Header */}
                <div className="px-4 py-3 border-b border-border/70 bg-gradient-to-b from-white/3 to-transparent">
                    <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                            <div className="h-7 w-7 rounded-xl bg-surface/80 border border-border/80 flex items-center justify-center shadow-[0_0_0_1px_rgba(0,255,136,0.18)]">
                                <BellRing className="w-3.5 h-3.5 text-[#00ff88]" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-bold tracking-wide text-muted-foreground/80 uppercase">
                                    Alerts
                                </span>
                                <span className="text-[13px] font-semibold text-foreground">
                                    Notifications
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {unreadCount > 0 && (
                                <span className="inline-flex items-center rounded-full bg-[#00ff88]/10 text-[#00ff88] border border-[#00ff88]/30 px-2 py-0.5 text-[11px] font-medium">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88] mr-1.5 animate-pulse" />
                                    {unreadCount} new
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Body Content List */}
                <div className="max-h-[360px] overflow-y-auto py-1.5 px-2 flex flex-col gap-1.5">
                    {latestNotifications.length > 0 ? (
                        latestNotifications.map((n) => (
                            <NotificationCard
                                key={n._id}
                                notification={n}
                                onMarkRead={markAsRead}
                                onDelete={deleteNotification}
                                onClick={() => handleCardClick(n)}
                            />
                        ))
                    ) : (
                        <div className="px-6 py-10 text-center">
                            <div className="w-11 h-11 rounded-2xl bg-surface/80 border border-border/80 mx-auto flex items-center justify-center text-muted-foreground shadow-[0_0_14px_rgba(255,255,255,0.03)]">
                                <Inbox className="w-5 h-5 text-muted-foreground/60" />
                            </div>
                            <p className="mt-3 font-semibold text-foreground text-[13px]">
                                All caught up!
                            </p>
                            <p className="text-[11px] text-muted-foreground mt-1 max-w-[220px] mx-auto">
                                You don&apos;t have any notifications right now.
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer Controls */}
                <div className="px-3.5 py-2.5 border-t border-border/70 bg-gradient-to-t from-white/3 to-transparent flex gap-2">
                    <Button
                        variant="outline"
                        className="flex-1 h-8 rounded-lg border-border bg-transparent text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-surface/60 transition-all flex items-center gap-1.5"
                        onClick={handleViewAll}
                    >
                        <ExternalLink className="w-3.5 h-3.5" />
                        View All
                    </Button>
                    {unreadCount > 0 && (
                        <Button
                            className="flex-1 h-8 rounded-lg btn-neon text-[11px] font-semibold flex items-center gap-1.5"
                            onClick={markAllAsRead}
                        >
                            <CheckCheck className="w-3.5 h-3.5" />
                            Mark All Read
                        </Button>
                    )}
                </div>
            </motion.div>
        </AnimatePresence>
    );
};

export default NotificationDropdown;
