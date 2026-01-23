const Message = require("../models/Message");
const Chat = require("../models/Chat");

exports.sendMessage = async (req, res) => {
  const { content, chatId } = req.body;

  if (!content || !chatId) {
    return res.status(400).json({ message: "Invalid data" });
  }

  try {
    let message = await Message.create({
      sender: req.user._id,
      content,
      chat: chatId
    });

    message = await message.populate("sender", "name email");
    message = await message.populate("chat");
    message = await Chat.populate(message, {
      path: "chat.users",
      select: "name email"
    });

    await Chat.findByIdAndUpdate(chatId, {
      latestMessage: message
    });

    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.fetchMessages = async (req, res) => {
  try {
    const messages = await Message.find({ chat: req.params.chatId })
      .populate("sender", "name email")
      .sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
