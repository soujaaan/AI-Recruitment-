import mongoose from "mongoose";

const { Schema } = mongoose;

const chatRoomSchema = new Schema(
  {
    participants: [
      {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],

    candidateId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    recruiterId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    jobId: {
      type: Schema.Types.ObjectId,
      ref: "Job",
      required: true,
      index: true,
    },

    lastMessage: {
      type: String,
      default: "",
    },

    lastMessageSender: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },

    lastMessageAt: {
      type: Date,
      default: null,
    },

    // Store per-user unread counts for quick sidebar rendering.
    unreadCounts: {
      type: Map,
      of: Number,
      default: {},
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    deletedFor: {
      type: [Schema.Types.ObjectId],
      ref: "User",
      default: [],
    },
  },
  { timestamps: true }
);

// Uniqueness: one room per (candidate,recruiter,job)
chatRoomSchema.index({ candidateId: 1, recruiterId: 1, jobId: 1 }, { unique: true });
chatRoomSchema.index({ participants: 1 });
chatRoomSchema.index({ updatedAt: -1 });
chatRoomSchema.index({ lastMessageAt: -1 });

export const ChatRoom = mongoose.model("ChatRoom", chatRoomSchema);

