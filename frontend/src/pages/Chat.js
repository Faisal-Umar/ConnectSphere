import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { socket, connectSocket } from "../socket";

const Chat = () => {
  const { user } = useContext(AuthContext);

  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");

  /* ---------------- CONNECT SOCKET ---------------- */
  useEffect(() => {
    if (user && user._id) {
      connectSocket(user);
    }

    socket.on("message received", (newMessageReceived) => {
      // 🔥 REAL-TIME UPDATE WITHOUT CLICKING CHAT AGAIN
      if (
        selectedChat &&
        newMessageReceived.chat._id === selectedChat._id
      ) {
        setMessages((prev) => [...prev, newMessageReceived]);
      }
    });

    return () => {
      socket.off("message received");
    };
  }, [user, selectedChat]);

  /* ---------------- FETCH CHATS ---------------- */
  useEffect(() => {
    const fetchChats = async () => {
      const { data } = await axios.get("http://localhost:5000/api/chat", {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      setChats(data);
    };

    if (user) fetchChats();
  }, [user]);

  /* ---------------- FETCH MESSAGES ---------------- */
  const fetchMessages = async (chat) => {
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
    socket.emit("join chat", chat._id);
  };

  /* ---------------- SEND MESSAGE ---------------- */
  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    setNewMessage("");

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

    // 🔥 INSTANT LOCAL UPDATE
    setMessages((prev) => [...prev, data]);

    // 🔥 EMIT SOCKET EVENT
    socket.emit("new message", data);
  };

  return (
    <div style={{ display: "flex" }}>
      {/* CHAT LIST */}
      <div style={{ width: "30%" }}>
        <h2>Chats</h2>
        {chats.map((chat) => (
          <div
            key={chat._id}
            onClick={() => fetchMessages(chat)}
            style={{
              cursor: "pointer",
              borderBottom: "1px solid gray",
            }}
          >
            {chat.chatName}
          </div>
        ))}
      </div>
      <div style={{ width: "70%" }}>
        <h2>Messages</h2>

        {messages.map((msg) => (
          <div key={msg._id}>
            <b>{msg.sender.name}:</b> {msg.content}
          </div>
        ))}

        {selectedChat && (
          <>
            <input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type message"
            />
            <button onClick={sendMessage}>Send</button>
          </>
        )}
      </div>
    </div>
  );
};

export default Chat;
