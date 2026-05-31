import React from "react";
import Navbar from "@/components/shared/Navbar";
import SectionHeader from "@/components/common/SectionHeader";
import GlassCard from "@/components/common/GlassCard";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/hooks/useNotifications";
import NotificationCard from "@/components/navbar/NotificationCard";
import {
    Bell,
    CheckCheck,
    FolderMinus,
    Inbox,
    RefreshCw,
    SlidersHorizontal,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export const NotificationCenter = () => {
    const navigate = useNavigate();
    const {
        notifications,
        unreadCount,
        loading,
        pagination,
        category,
        setCategory,
        page,
        setPage,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
    } = useNotifications();

    const handleCardClick = (n) => {
        if (!n.isRead) {
            markAsRead(n._id);
        }
        if (n.entityType === "Job" && n.entityId) {
            navigate(`/description/${n.entityId}`);
        } else if (n.entityType === "Application") {
            navigate("/applications");
        } else if (n.entityType === "InterviewSchedule") {
            navigate("/dashboard");
        }
    };

    const categories = [
        { id: "all", label: "All Alerts" },
        { id: "unread", label: "Unread" },
        { id: "applications", label: "Applications" },
        { id: "interview", label: "Interviews" },
        { id: "system", label: "System & Announcements" },
    ];

    return (
        <div className="bg-[#0a0a0a] min-h-screen text-foreground relative pb-20">
            <Navbar />

            <main className="max-w-4xl mx-auto px-6 pt-16">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <SectionHeader
                        label="Platform Alerts"
                        title="Notification Center"
                        subtitle="Keep track of your job matches, applications, interview updates, and system announcements."
                    />
                    <div className="flex items-center gap-2 shrink-0 md:self-end">
                        <Button
                            variant="outline"
                            onClick={() => fetchNotifications(page, category)}
                            disabled={loading}
                            className="h-9 px-3 border-border hover:bg-white/5 text-muted-foreground hover:text-foreground"
                            title="Refresh notifications"
                        >
                            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                        </Button>
                        {unreadCount > 0 && (
                            <Button
                                onClick={markAllAsRead}
                                className="h-9 btn-neon font-semibold text-xs flex items-center gap-1.5"
                            >
                                <CheckCheck className="w-4 h-4" />
                                Mark All Read
                            </Button>
                        )}
                    </div>
                </div>

                {/* Main Glass Layout Container */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    {/* Filters Sidebar */}
                    <div className="md:col-span-1 flex flex-col gap-1.5">
                        <div className="flex items-center gap-2 px-3 py-2 text-xs font-bold tracking-wider text-muted-foreground uppercase mb-1.5">
                            <SlidersHorizontal className="w-3.5 h-3.5" />
                            Filters
                        </div>
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => {
                                    setCategory(cat.id);
                                    setPage(1);
                                }}
                                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                                    category === cat.id
                                        ? "bg-[#00ff88]/10 border-[#00ff88]/30 text-[#00ff88] shadow-[0_0_15px_rgba(0,255,136,0.08)]"
                                        : "bg-transparent border-transparent text-muted-foreground hover:bg-white/5 hover:text-foreground"
                                }`}
                            >
                                <div className="flex items-center justify-between">
                                    <span>{cat.label}</span>
                                    {cat.id === "unread" && unreadCount > 0 && (
                                        <span className="h-5 min-w-5 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center px-1">
                                            {unreadCount}
                                        </span>
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>

                    {/* Feed Content Area */}
                    <div className="md:col-span-3 flex flex-col gap-4">
                        {loading ? (
                            // Skeletons
                            Array.from({ length: 4 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="h-20 rounded-2xl border border-border/40 bg-surface/30 animate-pulse flex items-center p-4 gap-4"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-white/5 shrink-0" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-white/10 rounded w-1/4" />
                                        <div className="h-3 bg-white/5 rounded w-3/4" />
                                    </div>
                                </div>
                            ))
                        ) : notifications.length > 0 ? (
                            <>
                                <div className="flex flex-col gap-3">
                                    {notifications.map((notif) => (
                                        <NotificationCard
                                            key={notif._id}
                                            notification={notif}
                                            onMarkRead={markAsRead}
                                            onDelete={deleteNotification}
                                            onClick={() => handleCardClick(notif)}
                                        />
                                    ))}
                                </div>

                                {/* Pagination Controls */}
                                {pagination.pages > 1 && (
                                    <div className="mt-8 flex items-center justify-between bg-surface/20 border border-border/40 p-3 rounded-2xl">
                                        <span className="text-xs text-muted-foreground px-2">
                                            Page {pagination.page} of {pagination.pages}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                                disabled={page === 1}
                                                className="h-8 border-border hover:bg-white/5"
                                            >
                                                Previous
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setPage((p) => Math.min(pagination.pages, p + 1))}
                                                disabled={page === pagination.pages}
                                                className="h-8 border-border hover:bg-white/5"
                                            >
                                                Next
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </>
                        ) : (
                            // Empty State
                            <GlassCard className="text-center py-16 flex flex-col items-center justify-center">
                                <div className="w-14 h-14 rounded-2xl bg-surface border border-border/80 flex items-center justify-center text-muted-foreground shadow-[0_0_18px_rgba(255,255,255,0.02)] mb-4">
                                    <Inbox className="w-6 h-6 text-muted-foreground/55" />
                                </div>
                                <h4 className="font-display font-semibold text-foreground text-base">
                                    No alerts found
                                </h4>
                                <p className="text-[12px] text-muted-foreground mt-1 max-w-[280px]">
                                    There are no notifications in this category. You&apos;re completely caught up!
                                </p>
                            </GlassCard>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default NotificationCenter;
