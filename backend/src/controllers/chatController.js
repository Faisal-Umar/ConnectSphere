const Chat = require("../models/Chat");
const User = require("../models/User");

/* ----------------- 1. Access or Create One-to-One Chat ----------------- */
exports.accessChat = async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({ message: "UserId required" });
  }

  try {
    let chat = await Chat.findOne({
      isGroupChat: false,
      users: { $all: [req.user._id, userId] }
    }).populate("users", "-password");

    if (chat) {
      return res.status(200).json(chat);
    }

    const newChat = await Chat.create({
      chatName: "sender",
      isGroupChat: false,
      users: [req.user._id, userId]
    });

    const fullChat = await Chat.findById(newChat._id).populate(
      "users",
      "-password"
    );

    res.status(201).json(fullChat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ----------------- 2. Fetch All Chats for User ----------------- */
exports.fetchChats = async (req, res) => {
  try {
    const chats = await Chat.find({
      users: { $elemMatch: { $eq: req.user._id } }
    })
      .populate("users", "-password")
      .populate("groupAdmin", "-password")
      .sort({ updatedAt: -1 });

    res.status(200).json(chats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ----------------- 3. Create Group Chat ----------------- */
exports.createGroupChat = async (req, res) => {
  const { users, chatName } = req.body;

  if (!users || !chatName) {
    return res.status(400).json({ message: "Users and chatName required" });
  }

  const members = JSON.parse(users);

  if (members.length < 2) {
    return res.status(400).json({
      message: "Group must have at least 3 users"
    });
  }

  members.push(req.user._id);

  try {
    const groupChat = await Chat.create({
      chatName,
      users: members,
      isGroupChat: true,
      groupAdmin: req.user._id
    });

    const fullGroupChat = await Chat.findById(groupChat._id)
      .populate("users", "-password")
      .populate("groupAdmin", "-password");

    res.status(201).json(fullGroupChat);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ----------------- 4. Add User to Group ----------------- */
exports.addToGroup = async (req, res) => {
  const { chatId, userId } = req.body;

  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    { $addToSet: { users: userId } },
    { new: true }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  res.status(200).json(updatedChat);
};

/* ----------------- 5. Remove User from Group ----------------- */
exports.removeFromGroup = async (req, res) => {
  const { chatId, userId } = req.body;

  const updatedChat = await Chat.findByIdAndUpdate(
    chatId,
    { $pull: { users: userId } },
    { new: true }
  )
    .populate("users", "-password")
    .populate("groupAdmin", "-password");

  res.status(200).json(updatedChat);
};
