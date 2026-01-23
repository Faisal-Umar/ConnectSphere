const express = require("express");
const {
  accessChat,
  fetchChats,
  createGroupChat,
  addToGroup,
  removeFromGroup
} = require("../controllers/chatController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", protect, accessChat);          // one-to-one chat
router.get("/", protect, fetchChats);            // fetch chats
router.post("/group", protect, createGroupChat); // create group
router.put("/groupadd", protect, addToGroup);
router.put("/groupremove", protect, removeFromGroup);

module.exports = router;
