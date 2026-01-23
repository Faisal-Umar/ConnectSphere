import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { socket } from "../socket";

const Chat = () => {
  const { user } = useContext(AuthContext);

  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  // 🔹 CONNECT SOCKET + FETCH CHATS
  useEffect(() => {
    if (!user) return;

    socket.connect();
    socket.emit("setup", user.user);

    axios
      .get("http://localhost:5000/api/chat", {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      })
      .then((res) => {
        setChats(res.data);

        // ✅ JOIN ALL CHAT ROOMS IMMEDIATELY
        res.data.forEach((chat) => {
          socket.emit("join chat", chat._id);
        });
      });

    return () => {
      socket.disconnect();
    };
  }, [user]);

  // 🔹 REAL-TIME MESSAGE LISTENER (FIXED)
  useEffect(() => {
    socket.on("message received", (msg) => {
      // ✅ Update UI ONLY if this chat is currently open
      if (selectedChat && msg.chat._id === selectedChat._id) {
        setMessages((prev) => [...prev, msg]);
      }
    });

    return () => {
      socket.off("message received");
    };
  }, [selectedChat]);

  // 🔹 OPEN CHAT & LOAD HISTORY
  const openChat = async (chat) => {
    setSelectedChat(chat);

    const { data } = await axios.get(
      `http://localhost:5000/api/message/${chat._id}`,
      {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      }
    );

    setMessages(data);
  };

  // 🔹 SEND MESSAGE
  const sendMessage = async () => {
    if (!newMessage || !selectedChat) return;

    const { data } = await axios.post(
      "http://localhost:5000/api/message",
      {
        content: newMessage,
        chatId: selectedChat._id,
      },
      {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      }
    );

    socket.emit("new message", data);
    setMessages((prev) => [...prev, data]);
    setNewMessage("");
  };

  return (
    <div style={{ display: "flex", gap: "20px" }}>
      {/* CHAT LIST */}
      <div style={{ width: "30%" }}>
        <h2>Chats</h2>
        {chats.map((chat) => (
          <div
            key={chat._id}
            onClick={() => openChat(chat)}
            style={{
              cursor: "pointer",
              padding: "6px",
              borderBottom: "1px solid #ddd",
            }}
          >
            {chat.chatName || "Private Chat"}
          </div>
        ))}
      </div>

      {/* CHAT BOX */}
      <div style={{ width: "70%" }}>
        {selectedChat ? (
          <>
            <h3>Messages</h3>

            <div style={{ minHeight: "200px" }}>
              {messages.map((msg) => (
                <div key={msg._id}>
                  <b>{msg.sender.name}:</b> {msg.content}
                </div>
              ))}
            </div>

            <input
              placeholder="Type message"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />
            <button onClick={sendMessage}>Send</button>
          </>
        ) : (
          <p>Select a chat to start messaging</p>
        )}
      </div>
    </div>
  );
};

export default Chat;
