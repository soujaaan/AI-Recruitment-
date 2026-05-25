import React, { useEffect, useState, useRef } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useSearchParams } from "react-router-dom";
import useChatStore from "@/store/chatStore";
import { apiClient } from "@/lib/api";
import { connectSocket, disconnectSocket, getSocket } from "@/lib/socket";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Send, Check, CheckCheck, Loader2, ArrowLeft } from "lucide-react";
import { format } from "date-fns";

const MessagesPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useSelector((store) => store.auth);
  const token = localStorage.getItem("accessToken") || localStorage.getItem("token");

  const {
    recentRooms,
    activeRoomId,
    setRecentRooms,
    setActiveRoomId,
    upsertRoom,
    onlineUsers,
    setOnlineUsers,
    typingByUser,
    setTyping,
    reset,
  } = useChatStore();

  const [messages, setMessages] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Initialize socket and fetch rooms
  useEffect(() => {
    if (!user || !token) {
      navigate("/login");
      return;
    }

    const socket = connectSocket(token);

    socket.on("online_users", (users) => {
      setOnlineUsers(users);
    });

    socket.on("receive_message", (payload) => {
      const { roomId, message } = payload;
      
      // If message is for the active room, append it and mark as seen
      if (roomId === activeRoomId) {
        setMessages((prev) => {
          // If we sent it, API response handles it to avoid duplicate
          if (String(message.senderId) === String(user._id)) return prev;
          // Avoid duplicate by ID
          if (prev.some((m) => String(m._id) === String(message._id))) return prev;
          return [...prev, message];
        });
        if (String(message.senderId) !== String(user._id)) {
          socket.emit("mark_seen", { roomId });
        }
      }

      // Refresh rooms to update last message and unread count
      fetchRooms();
    });

    socket.on("user_typing", ({ roomId, userId, isTyping }) => {
      if (roomId === activeRoomId) {
        setTyping({ userId, isTyping });
      }
    });

    socket.on("messages_seen", ({ roomId, userId }) => {
      if (roomId === activeRoomId) {
        setMessages((prev) =>
          prev.map((m) =>
            m.senderId === user._id && !m.isRead
              ? { ...m, isRead: true, readAt: new Date() }
              : m
          )
        );
      }
    });

    return () => {
      socket.off("online_users");
      socket.off("receive_message");
      socket.off("user_typing");
      socket.off("messages_seen");
    };
  }, [user, token, activeRoomId, setOnlineUsers, setTyping, navigate]);

  // Handle URL query param for active room
  useEffect(() => {
    const roomParam = searchParams.get("room");
    if (roomParam) {
      setActiveRoomId(roomParam);
    }
  }, [searchParams, setActiveRoomId]);

  // Fetch Rooms
  const fetchRooms = async () => {
    try {
      const res = await apiClient.get("/api/chat/rooms");
      if (res.data?.success) {
        console.log(`[ChatStore] Hydrating recentRooms snapshot. Count: ${res.data.data?.length || 0}`);
        setRecentRooms(res.data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch rooms:", error);
    } finally {
      setLoadingRooms(false);
    }
  };

  useEffect(() => {
    fetchRooms();
    // We intentionally don't clear the chat store on unmount to keep cache if needed,
    // but you can call reset() if you want a fresh state each time.
  }, []);

  // Fetch Messages when activeRoomId changes
  useEffect(() => {
    if (!activeRoomId) return;

    const fetchActiveMessages = async () => {
      setLoadingMessages(true);
      try {
        const res = await apiClient.get(`/api/chat/messages/${activeRoomId}`);
        if (res.data?.success) {
          const fetchedMessages = res.data.data.messages || [];
          console.log(`[ChatStore] Hydrating active room messages. Count: ${fetchedMessages.length}`);
          setMessages(fetchedMessages);
        }
        
        // Join room via socket
        const socket = getSocket();
        console.log(`[Socket] Joining room: ${activeRoomId}`);
        socket.emit("join_room", { roomId: activeRoomId });
        socket.emit("mark_seen", { roomId: activeRoomId });
        
        // Refresh rooms to clear unread counts
        fetchRooms();
      } catch (error) {
        console.error("Failed to fetch messages:", error);
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchActiveMessages();
  }, [activeRoomId]);

  // Auto-scroll
  useEffect(() => {
    if (messagesEndRef.current) {
      // Use auto for initial load, smooth for new messages
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, typingByUser]);

  const handleSendMessage = async (e) => {
    if (e) e.preventDefault();
    if (!messageText.trim() || !activeRoomId || sending) return;

    setSending(true);
    const socket = getSocket();
    socket.emit("stop_typing", { roomId: activeRoomId });

    try {
      // Optimistic append
      const tempId = Date.now().toString();
      const optimisticMsg = {
        _id: tempId,
        roomId: activeRoomId,
        senderId: user._id,
        text: messageText.trim(),
        createdAt: new Date().toISOString(),
        isRead: false,
      };
      setMessages((prev) => [...prev, optimisticMsg]);
      setMessageText("");

      const res = await apiClient.post("/api/chat/send", {
        roomId: activeRoomId,
        text: optimisticMsg.text,
      });

      if (res.data?.success) {
        setMessages((prev) =>
          prev.map((m) => (m._id === tempId ? res.data.data : m))
        );
        fetchRooms();
      }
    } catch (error) {
      console.error("Send failed:", error);
      // Revert optimistic if needed
      setMessages((prev) => prev.filter((m) => m._id !== Date.now().toString()));
    } finally {
      setSending(false);
    }
  };

  const handleTyping = (e) => {
    setMessageText(e.target.value);
    
    if (!activeRoomId) return;
    const socket = getSocket();
    
    socket.emit("typing", { roomId: activeRoomId, isTyping: true });
    
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop_typing", { roomId: activeRoomId });
    }, 2000);
  };

  const activeRoom = recentRooms.find((r) => r._id === activeRoomId);

  // Derive active user info for the header
  // Note: the room participants usually hold IDs. If the backend doesn't populate, 
  // we might just show "Participant" or we need to fetch user details. 
  // Ideally, 'getRooms' API should populate candidateId and recruiterId with name/avatar.
  // Wait, does getRooms populate? In chat.controller.js, it just does ChatRoom.find().
  // Let's rely on standard candidateId / recruiterId or fallback.
  // We will assume participants are populated or we show basic info.

  return (
    <div className="flex h-screen bg-[#0a0a0a] pt-16 overflow-hidden">
      {/* Sidebar - Conversations List */}
      <div className={`w-full md:w-80 border-r border-white/10 flex flex-col ${activeRoomId ? 'hidden md:flex' : 'flex'}`}>
        <div className="p-4 border-b border-white/10">
          <h2 className="text-xl font-display font-bold text-foreground">Messages</h2>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {loadingRooms ? (
            <div className="p-4 flex justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : recentRooms.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              <p>No conversations yet.</p>
            </div>
          ) : (
            recentRooms.map((room) => {
              const isPopulatedUser = (obj) => obj && typeof obj === "object" && "_id" in obj;

              const isCandPopulated = isPopulatedUser(room.candidateId);
              const candidateIdStr = isCandPopulated ? String(room.candidateId._id) : String(room.candidateId);
              const isCandidate = candidateIdStr === String(user?._id);
              
              const otherUserObj = isCandidate ? room.recruiterId : room.candidateId;
              const isOtherPopulated = isPopulatedUser(otherUserObj);
              
              const otherUserId = isOtherPopulated ? String(otherUserObj._id) : String(otherUserObj);
              const otherUserName = isOtherPopulated && otherUserObj.fullname 
                ? otherUserObj.fullname 
                : `User ${String(otherUserId || "").slice(-4)}`;

                
              const otherUserAvatar = isOtherPopulated && otherUserObj.profile?.profilePhoto
                ? otherUserObj.profile.profilePhoto
                : `https://api.dicebear.com/7.x/initials/svg?seed=${otherUserId}`;

              const isOnline = onlineUsers.includes(otherUserId);
              const unreadCount = room.unreadCounts?.[user?._id] || 0;
              const isActive = room._id === activeRoomId;

              return (
                <div
                  key={room._id}
                  onClick={() => setActiveRoomId(room._id)}
                  className={`p-4 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors flex items-center gap-3 ${isActive ? 'bg-white/10' : ''}`}
                >
                  <div className="relative">
                    <Avatar className="w-12 h-12">
                      <AvatarImage src={otherUserAvatar} />
                      <AvatarFallback>{String(otherUserName || "").charAt(0).toUpperCase() || "U"}</AvatarFallback>
                    </Avatar>
                    {isOnline && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-[#0a0a0a] rounded-full"></span>
                    )}
                  </div>

                  
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1">
                      <h4 className="font-medium text-foreground truncate">
                        {otherUserName}
                      </h4>
                      {room.lastMessageAt && (
                        <span className="text-xs text-muted-foreground">
                          {format(new Date(room.lastMessageAt), "MMM d")}
                        </span>
                      )}
                    </div>
                    <p className={`text-sm truncate ${unreadCount > 0 ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                      {room.lastMessage || "Started a conversation"}
                    </p>
                  </div>

                  {unreadCount > 0 && (
                    <div className="w-5 h-5 rounded-full bg-accent text-[#0a0a0a] flex items-center justify-center text-xs font-bold">
                      {unreadCount}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className={`flex-1 flex flex-col ${!activeRoomId ? 'hidden md:flex' : 'flex'}`}>
        {!activeRoomId ? (
          <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
              <Send className="w-8 h-8 opacity-50" />
            </div>
            <p>Select a conversation to start messaging</p>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="h-16 border-b border-white/10 flex items-center px-4 bg-surface/50 backdrop-blur-md">
              <button 
                className="md:hidden mr-3 text-muted-foreground hover:text-foreground"
                onClick={() => setActiveRoomId(null)}
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              {(() => {
                const isPopulatedUser = (obj) => obj && typeof obj === "object" && "_id" in obj;
                
                const isCandPopulated = isPopulatedUser(activeRoom?.candidateId);
                const candidateIdStr = isCandPopulated ? String(activeRoom.candidateId._id) : String(activeRoom?.candidateId || "");
                const isCandidate = candidateIdStr === String(user?._id);
                
                const otherUserObj = isCandidate ? activeRoom?.recruiterId : activeRoom?.candidateId;
                const isOtherPopulated = isPopulatedUser(otherUserObj);
                
                const otherUserId = isOtherPopulated ? String(otherUserObj._id) : String(otherUserObj || "");
                const otherUserName = isOtherPopulated && otherUserObj.fullname 
                  ? otherUserObj.fullname 
                  : `User ${String(otherUserId || "").slice(-4)}`;

                  
                const otherUserAvatar = isOtherPopulated && otherUserObj.profile?.profilePhoto
                  ? otherUserObj.profile.profilePhoto
                  : `https://api.dicebear.com/7.x/initials/svg?seed=${otherUserId}`;
                  
                const isOnline = onlineUsers.includes(otherUserId);

                return (
                  <div 
                    className={`flex items-center gap-3 ${user?.role === 'recruiter' || user?.role === 'admin' ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''}`}
                    onClick={() => {
                      if ((user?.role === 'recruiter' || user?.role === 'admin') && otherUserId) {
                        navigate(`/candidate/${otherUserId}`);
                      }
                    }}
                  >
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={otherUserAvatar} />
                      <AvatarFallback>{otherUserName.charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div>
                      <h3 className="font-medium text-foreground hover:text-accent transition-colors">
                        {otherUserName}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {isOnline ? "Online" : "Offline"}
                      </p>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {loadingMessages ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex justify-center py-8 text-muted-foreground text-sm">
                  This is the start of your conversation.
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const isMine = String(msg.senderId) === String(user?._id);
                  const showAvatar = idx === messages.length - 1 || String(messages[idx + 1]?.senderId) !== String(msg.senderId);
                  
                  // Extract otherUserAvatar again for message bubbles
                  const isPopulatedUser = (obj) => obj && typeof obj === "object" && "_id" in obj;
                  
                  const isCandPopulated = isPopulatedUser(activeRoom?.candidateId);
                  const candidateIdStr = isCandPopulated ? String(activeRoom.candidateId._id) : String(activeRoom?.candidateId || "");
                  const isCandidate = candidateIdStr === String(user?._id);
                  
                  const otherUserObj = isCandidate ? activeRoom?.recruiterId : activeRoom?.candidateId;
                  const isOtherPopulated = isPopulatedUser(otherUserObj);
                  
                  const otherUserId = isOtherPopulated ? String(otherUserObj._id) : String(otherUserObj || "");
                  const otherUserName = isOtherPopulated && otherUserObj.fullname ? otherUserObj.fullname : "U";
                  const otherUserAvatar = isOtherPopulated && otherUserObj.profile?.profilePhoto
                    ? otherUserObj.profile.profilePhoto
                    : `https://api.dicebear.com/7.x/initials/svg?seed=${otherUserId}`;

                  return (
                    <div key={msg._id} className={`flex gap-3 ${isMine ? "justify-end" : "justify-start"}`}>
                      {!isMine && showAvatar && (
                        <Avatar className="w-8 h-8 self-end">
                          <AvatarImage src={otherUserAvatar} />
                          <AvatarFallback>{otherUserName.charAt(0).toUpperCase()}</AvatarFallback>
                        </Avatar>
                      )}
                      {!isMine && !showAvatar && <div className="w-8" />}
                      
                      <div className={`max-w-[70%] rounded-2xl px-4 py-2 ${isMine ? "bg-accent text-[#0a0a0a] rounded-br-sm" : "bg-white/10 text-foreground rounded-bl-sm"}`}>
                        <p className="text-sm">{msg.text}</p>
                        <div className={`text-[10px] flex items-center gap-1 mt-1 ${isMine ? "text-[#0a0a0a]/70 justify-end" : "text-muted-foreground justify-start"}`}>
                          {format(new Date(msg.createdAt), "HH:mm")}
                          {isMine && (
                            msg.isRead ? <CheckCheck className="w-3 h-3" /> : <Check className="w-3 h-3" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              
              {/* Typing indicator */}
              {activeRoom && Object.entries(typingByUser).some(([uid, isT]) => isT && uid !== user?._id) && (
                <div className="flex gap-3 justify-start">
                  <div className="bg-white/5 rounded-2xl px-4 py-3 rounded-bl-sm flex gap-1 items-center">
                    <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" />
                    <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0.2s" }} />
                    <span className="w-2 h-2 rounded-full bg-muted-foreground animate-bounce" style={{ animationDelay: "0.4s" }} />
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-surface/50 border-t border-white/10">
              <form onSubmit={handleSendMessage} className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Type a message..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-full px-4 py-2 text-sm text-foreground focus:outline-none focus:border-accent"
                  value={messageText}
                  onChange={handleTyping}
                  disabled={sending}
                />
                <Button 
                  type="submit" 
                  size="icon" 
                  className="rounded-full bg-accent text-[#0a0a0a] hover:bg-accent/90"
                  disabled={!messageText.trim() || sending}
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;
