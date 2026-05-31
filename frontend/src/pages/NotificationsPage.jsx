import React, { useState, useMemo } from "react";
import Navbar from "@/components/shared/Navbar";
import SectionHeader from "@/components/common/SectionHeader";
import GlassCard from "@/components/common/GlassCard";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/hooks/useNotifications";
import NotificationCard from "@/components/navbar/NotificationCard";
import {
    Bell,
    CheckCheck,
    Trash2,
    Inbox,
    RefreshCw,
    SlidersHorizontal,
    Search,
    X,
    Grid,
    CheckSquare,
    Square,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export const NotificationsPage = () => {
    const navigate = useNavigate();
    const {
        notifications,
        rawNotifications,
        unreadCount,
        loading,
        pagination,
        category,
        setCategory,
        searchQuery,
        setSearchQuery,
        fetchNotifications,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        deleteBulkNotifications,
        loadMore,
    } = useNotifications();

    const [selectedIds, setSelectedIds] = useState([]);

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
        { id: "messages", label: "Messages" },
        { id: "recommendations", label: "AI Match" },
        { id: "system", label: "System" },
    ];

    // Handle single checkbox selection
    const handleSelectCard = (id, isChecked) => {
        if (isChecked) {
            setSelectedIds((prev) => [...prev, id]);
        } else {
            setSelectedIds((prev) => prev.filter((item) => item !== id));
        }
    };

    // Toggle Select All
    const isAllSelected = useMemo(() => {
        if (notifications.length === 0) return false;
        return notifications.every((n) => selectedIds.includes(n._id));
    }, [notifications, selectedIds]);

    const handleSelectAllToggle = () => {
        if (isAllSelected) {
            // Deselect all
            const notifIds = notifications.map((n) => n._id);
            setSelectedIds((prev) => prev.filter((id) => !notifIds.includes(id)));
        } else {
            // Select all active notifications in search results
            const notifIds = notifications.map((n) => n._id);
            setSelectedIds((prev) => {
                const union = new Set([...prev, ...notifIds]);
                return Array.from(union);
            });
        }
    };

    // Bulk Delete Action
    const handleBulkDelete = async () => {
        if (selectedIds.length === 0) return;
        await deleteBulkNotifications(selectedIds);
        setSelectedIds([]);
    };

    const hasMore = pagination.page < pagination.pages;

    return (
        <div className="bg-[#0a0a0a] min-h-screen text-foreground relative pb-24">
            <Navbar />

            <main className="max-w-5xl mx-auto px-6 pt-16">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                    <SectionHeader
                        label="Inbox"
                        title="Notifications"
                        subtitle="Manage your platform interactions, real-time alerts, and messaging inbox."
                    />
                    <div className="flex flex-wrap items-center gap-2.5 shrink-0 md:self-end">
                        <Button
                            variant="outline"
                            onClick={() => fetchNotifications(1, category)}
                            disabled={loading}
                            className="h-9 px-3 border-border hover:bg-white/5 text-muted-foreground hover:text-foreground"
                            title="Refresh alerts"
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
                        {selectedIds.length > 0 && (
                            <Button
                                onClick={handleBulkDelete}
                                className="h-9 bg-red-600 hover:bg-red-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-[0_0_15px_rgba(220,38,38,0.25)] border border-red-500/20"
                            >
                                <Trash2 className="w-4 h-4" />
                                Delete Selected ({selectedIds.length})
                            </Button>
                        )}
                    </div>
                </div>

                {/* Search Bar Widget */}
                <div className="relative mb-8 max-w-md">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/60" />
                    <input
                        type="text"
                        placeholder="Search notifications..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-[#050505] border border-border/80 rounded-2xl pl-10 pr-9 py-2.5 text-xs text-foreground placeholder:text-muted-foreground/45 focus:border-[#00ff88]/50 focus:ring-1 focus:ring-[#00ff88]/30 outline-none transition-all shadow-[0_0_15px_rgba(0,0,0,0.4)]"
                    />
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery("")}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    )}
                </div>

                {/* Main Grid Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Filters Sidebar */}
                    <div className="lg:col-span-1 flex flex-col gap-1.5">
                        <div className="flex items-center gap-2 px-3 py-2 text-xs font-bold tracking-wider text-muted-foreground uppercase mb-1.5">
                            <SlidersHorizontal className="w-3.5 h-3.5" />
                            Category tabs
                        </div>
                        <div className="flex lg:flex-col overflow-x-auto space-x-2 lg:space-x-0 lg:space-y-1 pb-3 lg:pb-0 scrollbar-none">
                            {categories.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => {
                                        setCategory(cat.id);
                                        setSelectedIds([]);
                                    }}
                                    className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-semibold border transition-all whitespace-nowrap ${
                                        category === cat.id
                                            ? "bg-[#00ff88]/10 border-[#00ff88]/30 text-[#00ff88] shadow-[0_0_15px_rgba(0,255,136,0.08)]"
                                            : "bg-transparent border-transparent text-muted-foreground hover:bg-white/5 hover:text-foreground"
                                    }`}
                                >
                                    <div className="flex items-center justify-between gap-3">
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
                    </div>

                    {/* Feed Content Column */}
                    <div className="lg:col-span-3 flex flex-col gap-4">
                        {/* Bulk Select Control Bar */}
                        {notifications.length > 0 && (
                            <div className="flex items-center gap-3 px-2 py-1 mb-1">
                                <button
                                    onClick={handleSelectAllToggle}
                                    className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors font-medium select-none"
                                >
                                    {isAllSelected ? (
                                        <CheckSquare className="w-4 h-4 text-[#00ff88]" />
                                    ) : (
                                        <Square className="w-4 h-4" />
                                    )}
                                    {isAllSelected ? "Deselect All" : "Select All Available"}
                                </button>
                                {selectedIds.length > 0 && (
                                    <span className="text-xs text-[#00ff88] font-semibold animate-pulse">
                                        ({selectedIds.length} selected)
                                    </span>
                                )}
                            </div>
                        )}

                        {notifications.length > 0 ? (
                            <>
                                <div className="flex flex-col gap-3">
                                    {notifications.map((notif) => (
                                        <NotificationCard
                                            key={notif._id}
                                            notification={notif}
                                            onMarkRead={markAsRead}
                                            onDelete={deleteNotification}
                                            onClick={() => handleCardClick(notif)}
                                            selectable={true}
                                            checked={selectedIds.includes(notif._id)}
                                            onSelect={handleSelectCard}
                                        />
                                    ))}
                                </div>

                                {/* Load More Pagination Button (LinkedIn style) */}
                                {hasMore && (
                                    <div className="mt-8 flex justify-center">
                                        <Button
                                            onClick={loadMore}
                                            disabled={loading}
                                            className="h-10 px-8 rounded-full border border-[#00ff88]/30 hover:border-[#00ff88] bg-transparent text-foreground hover:bg-[#00ff88]/5 transition-all text-xs font-semibold shadow-[0_0_18px_rgba(0,255,136,0.06)]"
                                        >
                                            {loading ? "Loading more feed..." : "Load More Activity"}
                                        </Button>
                                    </div>
                                )}
                            </>
                        ) : loading ? (
                            // Skeletons
                            Array.from({ length: 4 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="h-20 rounded-2xl border border-border/40 bg-[#080808]/30 animate-pulse flex items-center p-4 gap-4"
                                >
                                    <div className="w-10 h-10 rounded-xl bg-white/5 shrink-0" />
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-white/10 rounded w-1/4" />
                                        <div className="h-3 bg-white/5 rounded w-3/4" />
                                    </div>
                                </div>
                            ))
                        ) : (
                            // Empty State
                            <GlassCard className="text-center py-20 flex flex-col items-center justify-center">
                                <div className="w-14 h-14 rounded-2xl bg-surface border border-border/80 flex items-center justify-center text-muted-foreground shadow-[0_0_18px_rgba(255,255,255,0.02)] mb-4">
                                    <Inbox className="w-6 h-6 text-muted-foreground/55" />
                                </div>
                                <h4 className="font-display font-semibold text-foreground text-base">
                                    No activities found
                                </h4>
                                <p className="text-[12px] text-muted-foreground mt-1 max-w-[280px]">
                                    We couldn&apos;t find any notifications here. You&apos;re completely up to date!
                                </p>
                            </GlassCard>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default NotificationsPage;
