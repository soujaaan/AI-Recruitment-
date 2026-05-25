import express from "express";
import isAuthenticated from "../middlewares/auth.middleware.js";
import { createRoom, getRooms, getMessages, sendMessage, markSeen, startConversation } from "../controllers/chat.controller.js";

const router = express.Router();

router.route("/start").post(isAuthenticated, startConversation);
router.route("/create-room").post(isAuthenticated, createRoom);
router.route("/rooms").get(isAuthenticated, getRooms);
router.route("/messages/:roomId").get(isAuthenticated, getMessages);
router.route("/send").post(isAuthenticated, sendMessage);
router.route("/seen/:roomId").put(isAuthenticated, markSeen);

export default router;

