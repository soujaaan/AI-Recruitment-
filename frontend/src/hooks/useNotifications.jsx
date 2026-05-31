import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import { notificationService } from "@/services/notification.service";
import { getSocket } from "@/lib/socket";
import { toast } from "sonner";

const NotificationContext = createContext(null);

export const NotificationProvider = ({ children }) => {
    const { user } = useSelector((store) => store.auth);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        limit: 10,
        pages: 1,
    });

    const [category, setCategory] = useState("all");
    const [page, setPage] = useState(1);

    const fetchNotifications = useCallback(async (pageNum = 1, cat = "all", append = false) => {
        if (!user) return;
        setLoading(true);
        setError(null);
        try {
            const res = await notificationService.getNotifications({
                page: pageNum,
                limit: 10,
                category: cat !== "all" ? cat : undefined,
            });
            
            const fetched = res?.notifications || [];
            if (append) {
                setNotifications((prev) => {
                    // Prevent duplicates
                    const existingIds = new Set(prev.map(n => n._id));
                    const uniqueNew = fetched.filter(n => !existingIds.has(n._id));
                    return [...prev, ...uniqueNew];
                });
            } else {
                setNotifications(fetched);
            }
            
            setPagination(res?.pagination || { total: 0, page: pageNum, limit: 10, pages: 1 });
        } catch (err) {
            setError(err.message || "Failed to load notifications");
        } finally {
            setLoading(false);
        }
    }, [user]);

    const fetchUnreadCount = useCallback(async () => {
        if (!user) return;
        try {
            const res = await notificationService.getUnreadCount();
            setUnreadCount(res?.count ?? 0);
        } catch (err) {
            console.error("Failed to load unread count", err);
        }
    }, [user]);

    const markAsRead = async (id) => {
        // Optimistic update
        setNotifications((prev) =>
            prev.map((n) => (n._id === id ? { ...n, isRead: true, readAt: new Date().toISOString() } : n))
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));

        try {
            await notificationService.markAsRead(id);
        } catch (err) {
            fetchNotifications(page, category);
            fetchUnreadCount();
            toast.error("Failed to mark notification as read");
        }
    };

    const markAllAsRead = async () => {
        // Optimistic update
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true, readAt: new Date().toISOString() })));
        setUnreadCount(0);

        try {
            await notificationService.markAllAsRead();
            toast.success("All notifications marked as read");
        } catch (err) {
            fetchNotifications(page, category);
            fetchUnreadCount();
            toast.error("Failed to mark all as read");
        }
    };

    const deleteNotification = async (id) => {
        const deleted = notifications.find((n) => n._id === id);
        // Optimistic update
        setNotifications((prev) => prev.filter((n) => n._id !== id));
        if (deleted && !deleted.isRead) {
            setUnreadCount((prev) => Math.max(0, prev - 1));
        }

        try {
            await notificationService.deleteNotification(id);
            toast.success("Notification deleted");
        } catch (err) {
            fetchNotifications(page, category);
            fetchUnreadCount();
            toast.error("Failed to delete notification");
        }
    };

    const deleteBulkNotifications = async (ids) => {
        if (!Array.isArray(ids) || ids.length === 0) return;
        
        const deletedUnreadCount = notifications.filter(
            (n) => ids.includes(n._id) && !n.isRead
        ).length;

        // Optimistic update
        setNotifications((prev) => prev.filter((n) => !ids.includes(n._id)));
        setUnreadCount((prev) => Math.max(0, prev - deletedUnreadCount));

        try {
            await notificationService.deleteBulkNotifications(ids);
            toast.success("Selected notifications deleted");
        } catch (err) {
            fetchNotifications(page, category);
            fetchUnreadCount();
            toast.error("Failed to delete selected notifications");
        }
    };

    const loadMore = () => {
        const nextPage = page + 1;
        if (nextPage <= pagination.pages) {
            setPage(nextPage);
            fetchNotifications(nextPage, category, true);
        }
    };

    // Initial load and category change listener
    useEffect(() => {
        if (user) {
            fetchNotifications(1, category, false);
            fetchUnreadCount();
            setPage(1);
        } else {
            setNotifications([]);
            setUnreadCount(0);
        }
    }, [user, category, fetchNotifications, fetchUnreadCount]);

    // Set up Socket.IO listener for new notifications
    useEffect(() => {
        if (!user) return;
        const socket = getSocket();
        if (socket) {
            const handleNewNotification = (notification) => {
                // Add new notification to active feed list
                setNotifications((prev) => [notification, ...prev]);
                setUnreadCount((prev) => prev + 1);

                // Auto animate trigger via custom event
                window.dispatchEvent(new CustomEvent("new_notification_arrived", { detail: notification }));

                // Show standard Sonner toast
                toast.info(notification.title || "New Activity Alert", {
                    description: notification.message,
                    duration: 5000,
                    action: {
                        label: "View Inbox",
                        onClick: () => {
                            window.location.href = "/notifications";
                        },
                    },
                });
            };

            socket.on("new_notification", handleNewNotification);
            return () => {
                socket.off("new_notification", handleNewNotification);
            };
        }
    }, [user]);

    // Dynamic client-side instant search filtering
    const filteredNotifications = useMemo(() => {
        if (!searchQuery.trim()) return notifications;
        const query = searchQuery.toLowerCase().trim();
        return notifications.filter(
            (n) => n.title?.toLowerCase().includes(query) || n.message?.toLowerCase().includes(query)
        );
    }, [notifications, searchQuery]);

    return (
        <NotificationContext.Provider
            value={{
                notifications: filteredNotifications,
                rawNotifications: notifications,
                unreadCount,
                loading,
                error,
                pagination,
                category,
                setCategory,
                page,
                setPage,
                searchQuery,
                setSearchQuery,
                fetchNotifications,
                fetchUnreadCount,
                markAsRead,
                markAllAsRead,
                deleteNotification,
                deleteBulkNotifications,
                loadMore,
            }}
        >
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error("useNotifications must be used within a NotificationProvider");
    }
    return context;
};

export default useNotifications;
