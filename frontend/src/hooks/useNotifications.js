import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
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
    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        limit: 10,
        pages: 1,
    });

    const [category, setCategory] = useState("all");
    const [page, setPage] = useState(1);

    const fetchNotifications = useCallback(async (pageNum = 1, cat = "all") => {
        if (!user) return;
        setLoading(true);
        setError(null);
        try {
            const res = await notificationService.getNotifications({
                page: pageNum,
                limit: 10,
                category: cat !== "all" ? cat : undefined,
            });
            setNotifications(res?.notifications || []);
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
            // Revert on error
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

    // Initial load and category/page change listener
    useEffect(() => {
        if (user) {
            fetchNotifications(page, category);
            fetchUnreadCount();
        } else {
            setNotifications([]);
            setUnreadCount(0);
        }
    }, [user, category, page, fetchNotifications, fetchUnreadCount]);

    // Set up Socket.IO listener for new notifications
    useEffect(() => {
        if (!user) return;
        const socket = getSocket();
        if (socket) {
            const handleNewNotification = (notification) => {
                // Add new notification to active feed list
                setNotifications((prev) => [notification, ...prev]);
                setUnreadCount((prev) => prev + 1);

                // Show slide-up notification toast
                toast(notification.title || "New Notification", {
                    description: notification.message,
                    action: {
                        label: "View Center",
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

    return (
        <NotificationContext.Provider
            value={{
                notifications,
                unreadCount,
                loading,
                error,
                pagination,
                category,
                setCategory,
                page,
                setPage,
                fetchNotifications,
                fetchUnreadCount,
                markAsRead,
                markAllAsRead,
                deleteNotification,
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
