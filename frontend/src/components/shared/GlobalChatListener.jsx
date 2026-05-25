import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import useChatStore from "@/store/chatStore";
import { apiClient } from "@/lib/api";
import { connectSocket, disconnectSocket, getSocket } from "@/lib/socket";

const GlobalChatListener = () => {
  const { user } = useSelector((store) => store.auth);
  const token = localStorage.getItem("accessToken") || localStorage.getItem("token");

  const {
    setRecentRooms,
    setUnreadCount,
    setOnlineUsers,
    upsertRoom
  } = useChatStore();

  useEffect(() => {
    if (!user || !token) {
      disconnectSocket();
      return;
    }

    const fetchRooms = async () => {
      try {
        const res = await apiClient.get("/api/chat/rooms");
        if (res.data?.success) {
          const rooms = res.data.data || [];
          setRecentRooms(rooms);
          
          // Calculate total unread count
          const totalUnread = rooms.reduce((acc, room) => {
            return acc + (room.unreadCounts?.[user._id] || 0);
          }, 0);
          setUnreadCount(totalUnread);
        }
      } catch (error) {
        console.error("Failed to fetch global chat rooms:", error);
      }
    };

    fetchRooms();

    const socket = connectSocket(token);

    const onOnlineUsers = (users) => {
      setOnlineUsers(users);
    };

    const onReceiveMessage = () => {
      // Refresh rooms to get updated unread count and last message
      fetchRooms();
    };

    socket.on("online_users", onOnlineUsers);
    socket.on("receive_message", onReceiveMessage);

    return () => {
      socket.off("online_users", onOnlineUsers);
      socket.off("receive_message", onReceiveMessage);
    };
  }, [user, token, setRecentRooms, setUnreadCount, setOnlineUsers]);

  return null;
};

export default GlobalChatListener;
