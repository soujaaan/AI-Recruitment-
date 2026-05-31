import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { ChatRoom } from "../models/chatRoom.model.js";
import { ChatMessage } from "../models/chatMessage.model.js";
import { Job } from "../models/job.model.js";
import { Application } from "../models/application.model.js";
import { ApiError } from "../utils/apiError.js";

// Attach Socket.IO to an existing HTTP server.
let ioInstance = null;

export const getIo = () => ioInstance;

export const attachChatSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: env.frontendOrigin || true,
      credentials: true,
    },
    // production: consider adapter (Redis) for multi-instance scaling
  });

  
  ioInstance = io;

  // memory-safe presence tracking
  // userId => { online: true, lastSeenAt, typing: Set<roomId> }
  const onlineUsers = new Map();
  const typingByUser = new Map(); // userId => Set(roomId)

  const extractToken = (socket) => {
    // Cookie-based JWT canonical source.
    // Express cookie-parser populates socket.request.cookies
    const token = socket.request?.cookies?.token;
    return token || null;
  };



  const getUserFromSocket = (socket) => socket.data?.user;

  const requireAuth = (socket, next) => {
    try {
      const token = extractToken(socket);
      if (!token) return next(new Error("Unauthorized"));
      if (!env.jwtSecret) return next(new Error("JWT secret not configured"));

      const decoded = jwt.verify(token, env.jwtSecret);
      const userId = decoded.userId || decoded.id || decoded.sub;
      if (!userId) return next(new Error("Invalid token"));

      socket.data.user = { id: userId.toString() };
      return next();
    } catch (e) {
      return next(new Error("Unauthorized"));
    }
  };

  io.use(requireAuth);

  const validateRoomParticipants = async ({ userId, candidateId, recruiterId, jobId }) => {
    const job = await Job.findById(jobId).select("recruiterId");
    if (!job) throw new ApiError(404, "Job not found");
    if (job.recruiterId.toString() !== recruiterId.toString()) {
      throw new ApiError(403, "Unauthorized: recruiter owns this job");
    }

    const application = await Application.findOne({ jobId, candidateId }).select("_id");
    if (!application) throw new ApiError(403, "Unauthorized: candidate applied to this job");

    if (![userId.toString(), candidateId.toString(), recruiterId.toString()].includes(userId.toString())) {
      throw new ApiError(403, "Not a participant");
    }

    return true;
  };

  const joinRoomSecurely = async (socket, roomId) => {
    const userId = getUserFromSocket(socket).id;
    const room = await ChatRoom.findById(roomId).select("participants candidateId recruiterId jobId");
    if (!room) throw new ApiError(404, "Room not found");
    if (!room.participants.some((p) => p.toString() === userId.toString())) {
      throw new ApiError(403, "Not a room participant");
    }

    // Enforce recruiter-candidate authorization based on application/job.
    await validateRoomParticipants({
      userId,
      candidateId: room.candidateId,
      recruiterId: room.recruiterId,
      jobId: room.jobId,
    });

    socket.join(roomId);
  };

  io.on("connection", (socket) => {
    const user = getUserFromSocket(socket);

    // Join a private room corresponding to their userId for notification broadcasts
    socket.join(user.id.toString());

    onlineUsers.set(user.id, { online: true, lastSeenAt: null });
    io.emit("online_users", Array.from(onlineUsers.keys()));

    socket.on("join_room", async ({ roomId }, ack) => {
      try {
        if (!roomId) throw new ApiError(400, "roomId required");
        await joinRoomSecurely(socket, roomId);


        socket.data.activeRooms = socket.data.activeRooms || new Set();
        socket.data.activeRooms.add(roomId.toString());

        return ack?.({ ok: true });
      } catch (e) {
        return ack?.({ ok: false, error: e?.message || "Failed to join" });
      }
    });

    socket.on("typing", ({ roomId, isTyping }, ack) => {
      try {
        const userId = getUserFromSocket(socket).id;
        if (!roomId) return;

        const set = typingByUser.get(userId) || new Set();
        if (isTyping) set.add(roomId.toString());
        else set.delete(roomId.toString());
        typingByUser.set(userId, set);

        // broadcast to other participants
        socket.to(roomId).emit("user_typing", {
          roomId,
          userId,
          isTyping: !!isTyping,
        });
      } catch (e) {
        // ignore
      }
    });

    socket.on("stop_typing", ({ roomId }, ack) => {
      socket.emit("typing", { roomId, isTyping: false }, ack);
    });

    socket.on("send_message", async (payload, ack) => {
      try {
        const userId = getUserFromSocket(socket).id;
        const { roomId, receiverId, text, attachments, messageType } = payload || {};
        if (!roomId) throw new ApiError(400, "roomId required");

        const room = await ChatRoom.findById(roomId).select("participants candidateId recruiterId jobId");
        if (!room) throw new ApiError(404, "Room not found");
        if (!room.participants.some((p) => p.toString() === userId.toString())) {
          throw new ApiError(403, "Not a room participant");
        }

        await validateRoomParticipants({
          userId,
          candidateId: room.candidateId,
          recruiterId: room.recruiterId,
          jobId: room.jobId,
        });

        const hasText = typeof text === "string" && text.trim().length > 0;
        const hasAttachments = Array.isArray(attachments) && attachments.length > 0;
        if (!hasText && !hasAttachments) throw new ApiError(400, "Empty message");

        const receiver = receiverId
          ? receiverId
          : room.candidateId.toString() === userId.toString()
            ? room.recruiterId.toString()
            : room.candidateId.toString();

        const msg = await ChatMessage.create({
          roomId,
          senderId: userId,
          receiverId: receiver,
          text: hasText ? text.trim() : "",
          attachments: hasAttachments ? attachments : [],
          messageType: messageType || (hasAttachments ? "attachment" : "text"),
          deliveredAt: new Date(),
          isRead: false,
        });

        const lastMessage = hasText ? text.trim().slice(0, 200) : hasAttachments ? "Attachment" : "";
        await ChatRoom.findByIdAndUpdate(roomId, {
          $set: {
            lastMessage,
            lastMessageSender: userId,
            lastMessageAt: new Date(),
            [`unreadCounts.${receiver}`]: (room.unreadCounts?.get?.(receiver) || room.unreadCounts?.[receiver] || 0) + 1,
          },
        });

        // ack for sender
        ack?.({ ok: true, message: msg });

        // broadcast to other participants
        socket.to(roomId).emit("receive_message", {
          roomId,
          message: msg,
        });
      } catch (e) {
        ack?.({ ok: false, error: e?.message || "Send failed" });
      }
    });

    socket.on("mark_seen", async ({ roomId }, ack) => {
      try {
        const userId = getUserFromSocket(socket).id;
        if (!roomId) throw new ApiError(400, "roomId required");

        const room = await ChatRoom.findById(roomId).select("participants candidateId recruiterId jobId");
        if (!room) throw new ApiError(404, "Room not found");
        if (!room.participants.some((p) => p.toString() === userId.toString())) {
          throw new ApiError(403, "Not a room participant");
        }

        await ChatMessage.updateMany(
          { roomId, receiverId: userId, isRead: false },
          { $set: { isRead: true, readAt: new Date() } }
        );

        await ChatRoom.findByIdAndUpdate(roomId, {
          $set: { [`unreadCounts.${userId}`]: 0 },
        });

        // notify others to update seen status
        socket.to(roomId).emit("messages_seen", { roomId, userId });
        ack?.({ ok: true });
      } catch (e) {
        ack?.({ ok: false, error: e?.message || "Failed to mark seen" });
      }
    });

    socket.on("disconnect", () => {
      const userId = getUserFromSocket(socket).id;
      const entry = onlineUsers.get(userId);
      if (entry) {
        entry.online = false;
        entry.lastSeenAt = new Date();
      }
      onlineUsers.delete(userId);
      typingByUser.delete(userId);
      io.emit("online_users", Array.from(onlineUsers.keys()));
    });
  });

  return io;
};

