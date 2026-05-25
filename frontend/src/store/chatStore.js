import { create } from "zustand";
import { devtools } from "zustand/middleware";

const useChatStore = create(
  devtools((set, get) => ({
    recentRooms: [],
    unreadCount: 0,
    activeRoomId: null,
    onlineUsers: [],
    typingByUser: {},
    dropdownOpen: false,

    setDropdownOpen: (open) => set({ dropdownOpen: open }),
    setActiveRoomId: (roomId) => set({ activeRoomId: roomId }),

    setRecentRooms: (rooms) => set({ recentRooms: rooms || [] }),
    setUnreadCount: (count) => set({ unreadCount: Number(count || 0) }),

    upsertRoom: (room) => {
      if (!room) return;
      const rooms = get().recentRooms || [];
      const id = room._id || room.roomId;
      const idx = rooms.findIndex((r) => (r._id || r.roomId) === id);
      if (idx >= 0) {
        const next = [...rooms];
        next[idx] = { ...next[idx], ...room };
        set({ recentRooms: next });
      } else {
        set({ recentRooms: [room, ...rooms] });
      }
    },

    setOnlineUsers: (users) => set({ onlineUsers: users || [] }),

    setTyping: ({ userId, isTyping }) => {
      if (!userId) return;
      set({ typingByUser: { ...get().typingByUser, [userId]: !!isTyping } });
    },

    reset: () =>
      set({
        recentRooms: [],
        unreadCount: 0,
        activeRoomId: null,
        onlineUsers: [],
        typingByUser: {},
        dropdownOpen: false,
      }),
  }))
);

export default useChatStore;

