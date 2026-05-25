import mongoose from "mongoose";
import { ChatRoom } from "../models/chatRoom.model.js";
import { ChatMessage } from "../models/chatMessage.model.js";
import { Job } from "../models/job.model.js";
import { Application } from "../models/application.model.js";
import { ApiError } from "../utils/apiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { sendSuccess } from "../utils/response.js";
import { getIo } from "../socket/chat.socket.js";

import { validateChatParticipants } from "../services/chatAuthorization.service.js";

// NOTE: authorization is enforced via validateChatParticipants() shared with sockets.


export const createRoom = asyncHandler(async (req, res) => {
  const userId = req.id;
  const { candidateId, recruiterId, jobId } = req.body || {};



  if (!candidateId || !recruiterId || !jobId) {

    throw new ApiError(400, "candidateId, recruiterId, and jobId are required");
  }

  // Only allow creator to be one of the participants.
  if (![String(userId), String(candidateId), String(recruiterId)].includes(String(userId))) {
    if (String(userId) !== String(candidateId) && String(userId) !== String(recruiterId)) {

      throw new ApiError(403, "Not a participant");
    }
  }

  try {
    await validateChatParticipants({
      actingUserId: userId,
      candidateId,
      recruiterId,
      jobId,
    });
  } catch (err) {
    // Strict authorization enforcement
    throw err;
  }


  const normalizedCandidateId = new mongoose.Types.ObjectId(candidateId);
  const normalizedRecruiterId = new mongoose.Types.ObjectId(recruiterId);
  const normalizedJobId = new mongoose.Types.ObjectId(jobId);
  const participants = [normalizedCandidateId, normalizedRecruiterId];



  const room = await ChatRoom.findOneAndUpdate(
    { candidateId: normalizedCandidateId, recruiterId: normalizedRecruiterId, jobId: normalizedJobId },
    {
      $setOnInsert: {
        participants,
        candidateId: normalizedCandidateId,
        recruiterId: normalizedRecruiterId,
        jobId: normalizedJobId,
        unreadCounts: { [String(normalizedCandidateId)]: 0, [String(normalizedRecruiterId)]: 0 },
        isActive: true,
        deletedFor: [],
      },
    },
    { new: true, upsert: true }
  );



  const populatedRoom = await ChatRoom.findById(room._id)
    .populate("candidateId", "fullname profile.profilePhoto")
    .populate("recruiterId", "fullname profile.profilePhoto");



  return sendSuccess(res, 200, populatedRoom, "Room ready");
});

export const startConversation = asyncHandler(async (req, res) => {
  const recruiterId = req.id;
  const { candidateId, jobId } = req.body || {};



  if (!candidateId || !jobId) {
    console.log("[FAILURE POINT] Missing candidateId or jobId");
    throw new ApiError(400, "candidateId and jobId are required");
  }

  try {
    await validateChatParticipants({
      actingUserId: recruiterId,
      candidateId,
      recruiterId,
      jobId,
    });
  } catch (err) {
    // Strict authorization enforcement
    throw err;
  }


  const normalizedCandidateId = new mongoose.Types.ObjectId(candidateId);
  const normalizedRecruiterId = new mongoose.Types.ObjectId(recruiterId);
  const normalizedJobId = new mongoose.Types.ObjectId(jobId);
  const participants = [normalizedCandidateId, normalizedRecruiterId];



  const room = await ChatRoom.findOneAndUpdate(
    { candidateId: normalizedCandidateId, recruiterId: normalizedRecruiterId, jobId: normalizedJobId },
    {
      $setOnInsert: {
        participants,
        candidateId: normalizedCandidateId,
        recruiterId: normalizedRecruiterId,
        jobId: normalizedJobId,
        unreadCounts: { [String(normalizedCandidateId)]: 0, [String(normalizedRecruiterId)]: 0 },
        isActive: true,
        deletedFor: [],
      },
    },
    { new: true, upsert: true }
  );



  const populatedRoom = await ChatRoom.findById(room._id)
    .populate("candidateId", "fullname profile.profilePhoto")
    .populate("recruiterId", "fullname profile.profilePhoto");



  return sendSuccess(res, 200, { roomId: room._id, room: populatedRoom }, "Conversation started");
});

export const getRooms = asyncHandler(async (req, res) => {
  const userId = req.id;
  console.log("[getRooms] Requesting user:", userId);

  const normalizedUserId = new mongoose.Types.ObjectId(userId);

  const rooms = await ChatRoom.find({
    participants: normalizedUserId,
    deletedFor: { $ne: normalizedUserId },
    isActive: true,
  })
    .populate("candidateId", "fullname profile.profilePhoto")
    .populate("recruiterId", "fullname profile.profilePhoto")
    .sort({ lastMessageAt: -1, updatedAt: -1 })
    .limit(Number(req.query.limit) || 50);

  console.log(`[getRooms] Mongo query result count: ${rooms.length}`);

  return sendSuccess(res, 200, rooms, "Rooms fetched");
});

export const getMessages = asyncHandler(async (req, res) => {
  const userId = req.id;
  const { roomId } = req.params;
  const { limit = 30, before } = req.query;

  const room = await ChatRoom.findById(roomId).select("participants candidateId recruiterId jobId");
  if (!room) throw new ApiError(404, "Room not found");
  if (!room.participants.some((p) => p.toString() === userId.toString())) {
    throw new ApiError(403, "Not a room participant");
  }

  const query = { roomId: room._id, deleted: { $ne: true } };
  if (before) {
    query.createdAt = { $lt: new Date(before) };
  }

  const messages = await ChatMessage.find(query)
    .sort({ createdAt: -1 })
    .limit(Number(limit))
    .lean();

  // return chronological order
  messages.reverse();

  console.log(`[ChatRoom] Fetched messages for room ${roomId}. Count: ${messages.length}`);

  return sendSuccess(res, 200, { messages }, "Messages fetched");
});

export const sendMessage = asyncHandler(async (req, res) => {
  const userId = req.id;
  const { roomId, text, receiverId, attachments, messageType } = req.body || {};

  console.log("[sendMessage] Incoming payload:", { roomId, receiverId, messageType, userId });

  if (!roomId) {
    console.log("[FAILURE POINT] Missing roomId");
    throw new ApiError(400, "roomId is required");
  }

  const normalizedRoomId = new mongoose.Types.ObjectId(roomId);
  const normalizedUserId = new mongoose.Types.ObjectId(userId);

  const room = await ChatRoom.findById(normalizedRoomId).select("participants candidateId recruiterId jobId unreadCounts");
  if (!room) {
    console.log("[FAILURE POINT] Room not found", roomId);
    throw new ApiError(404, "Room not found");
  }
  
  if (!room.participants.some((p) => String(p) === String(userId))) {
    console.log("[FAILURE POINT] Not a room participant", { userId, participants: room.participants });
    throw new ApiError(403, "Not a room participant");
  }

  const isText = (messageType || "text") === "text";
  const hasText = typeof text === "string" && text.trim().length > 0;
  const hasAttachments = Array.isArray(attachments) && attachments.length > 0;

  if (!hasText && !hasAttachments) {
    throw new ApiError(400, "Message must contain text or attachments");
  }

  // Determine receiver.
  let actualReceiverId = receiverId ? new mongoose.Types.ObjectId(receiverId) : null;
  if (!actualReceiverId) {
    const receiver = String(room.candidateId) === String(userId) ? room.recruiterId : room.candidateId;
    actualReceiverId = new mongoose.Types.ObjectId(receiver);
  }

  const msg = await ChatMessage.create({
    roomId: normalizedRoomId,
    senderId: normalizedUserId,
    receiverId: actualReceiverId,
    text: hasText ? text.trim() : "",
    attachments: hasAttachments ? attachments : [],
    messageType: hasAttachments && isText ? "attachment" : (messageType || (hasAttachments ? "attachment" : "text")),
    deliveredAt: new Date(),
    isRead: false,
  });

  // Update room last message snapshot.
  const lastMessage = hasText ? text.trim().slice(0, 200) : hasAttachments ? "Attachment" : "";
  const actualReceiverStr = String(actualReceiverId);
  await ChatRoom.findByIdAndUpdate(normalizedRoomId, {
    $set: {
      lastMessage,
      lastMessageSender: normalizedUserId,
      lastMessageAt: new Date(),
      [`unreadCounts.${actualReceiverStr}`]: (room.unreadCounts?.get?.(actualReceiverStr) || room.unreadCounts?.[actualReceiverStr] || 0) + 1,
    },
  });

  const io = getIo();
  if (io) {
    console.log(`[Socket] Emitting receive_message to room ${roomId}`);
    io.to(roomId.toString()).emit("receive_message", {
      roomId: roomId.toString(),
      message: msg,
    });
  }

  console.log(`[ChatRoom] Message sent. RoomId: ${roomId}, SenderId: ${userId}`);

  return sendSuccess(res, 200, msg, "Message sent");
});

export const markSeen = asyncHandler(async (req, res) => {
  const userId = req.id;
  const { roomId } = req.params;

  const room = await ChatRoom.findById(roomId).select("participants candidateId recruiterId");
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

  return sendSuccess(res, 200, { ok: true }, "Marked as seen");
});

