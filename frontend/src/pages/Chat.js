import { useContext, useEffect, useState, useRef } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";
import { socket, connectSocket } from "../socket";
import { useNavigate } from "react-router-dom";
import "./Chat.css";

const Chat = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [loadingMessages, setLoadingMessages] = useState(false);

  // User search states
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  // Group chat creation states
  const [groupModalOpen, setGroupModalOpen] = useState(false);
  const [groupChatName, setGroupChatName] = useState("");
  const [groupSelectedUsers, setGroupSelectedUsers] = useState([]);
  const [availableUsersForGroup, setAvailableUsersForGroup] = useState([]);

  // Socket & DB statuses
  const [socketConnected, setSocketConnected] = useState(false);
  const [dbOnline, setDbOnline] = useState(true);

  const messagesEndRef = useRef(null);

  // Protect route
  useEffect(() => {
    if (!user) {
      navigate("/");
    }
  }, [user, navigate]);

  /* ---------------- CONNECT SOCKET & HEALTH CHECKS ---------------- */
  useEffect(() => {
    if (user && user._id) {
      connectSocket(user);
      setSocketConnected(socket.connected || true);
    }

    const handleConnect = () => setSocketConnected(true);
    const handleDisconnect = () => setSocketConnected(false);

    socket.on("connect", handleConnect);
    socket.on("disconnect", handleDisconnect);

    socket.on("message received", (newMessageReceived) => {
      if (
        selectedChat &&
        newMessageReceived.chat._id === selectedChat._id
      ) {
        setMessages((prev) => [...prev, newMessageReceived]);
      } else {
        // Option to trigger notification/refresh chats list
        refreshChatsList();
      }
    });

    return () => {
      socket.off("connect", handleConnect);
      socket.off("disconnect", handleDisconnect);
      socket.off("message received");
    };
  }, [user, selectedChat]);

  /* ---------------- FETCH CHATS ---------------- */
  const refreshChatsList = async () => {
    if (!user) return;
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/chat`,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );
      setChats(data);
      setDbOnline(true);
    } catch (error) {
      console.error(error);
      if (error.response?.status === 503) {
        setDbOnline(false);
      }
    }
  };

  useEffect(() => {
    refreshChatsList();
  }, [user]);

  /* ---------------- AUTO-SCROLL TO BOTTOM ---------------- */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ---------------- FETCH MESSAGES ---------------- */
  const fetchMessages = async (chat) => {
    setSelectedChat(chat);
    setLoadingMessages(true);

    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/message/${chat._id}`,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );
      setMessages(data);
      setLoadingMessages(false);
      socket.emit("join chat", chat._id);
    } catch (error) {
      console.error(error);
      setLoadingMessages(false);
    }
  };

  /* ---------------- SEND MESSAGE ---------------- */
  const sendMessage = async (e) => {
    if (e && e.key !== "Enter") return;
    if (!newMessage.trim()) return;

    const messageContent = newMessage;
    setNewMessage("");

    try {
      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/message`,
        {
          content: messageContent,
          chatId: selectedChat._id,
        },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      setMessages((prev) => [...prev, data]);
      socket.emit("new message", data);
      
      // Update chats list to reflect the last message order
      refreshChatsList();
    } catch (error) {
      console.error(error);
      alert("Failed to send message");
    }
  };

  /* ---------------- SIDEBAR SEARCH HANDLER ---------------- */
  const handleSearch = async (query) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/user?search=${query}`,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );
      setSearchResults(data);
    } catch (err) {
      console.error("Search failed", err);
    }
  };

  /* ---------------- START 1-on-1 DIRECT CHAT ---------------- */
  const startDirectChat = async (targetUserId) => {
    try {
      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/chat`,
        { userId: targetUserId },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      if (!chats.find((c) => c._id === data._id)) {
        setChats((prev) => [data, ...prev]);
      }
      fetchMessages(data);
      setSearchQuery("");
      setSearchResults([]);
    } catch (err) {
      console.error("Accessing chat failed", err);
      alert("Could not open chat conversation");
    }
  };

  /* ---------------- GROUP CHAT CREATION FLOW ---------------- */
  const openGroupModal = async () => {
    setGroupModalOpen(true);
    try {
      const { data } = await axios.get(
        `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/user`,
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );
      setAvailableUsersForGroup(data);
    } catch (err) {
      console.error("Fetching users failed", err);
    }
  };

  const toggleSelectUserForGroup = (userId) => {
    if (groupSelectedUsers.includes(userId)) {
      setGroupSelectedUsers((prev) => prev.filter((id) => id !== userId));
    } else {
      setGroupSelectedUsers((prev) => [...prev, userId]);
    }
  };

  const handleCreateGroup = async () => {
    if (!groupChatName.trim()) {
      alert("Please enter a group name");
      return;
    }
    if (groupSelectedUsers.length < 2) {
      alert("Please select at least 2 other members");
      return;
    }

    try {
      const { data } = await axios.post(
        `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/chat/group`,
        {
          chatName: groupChatName,
          users: JSON.stringify(groupSelectedUsers),
        },
        {
          headers: {
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      setChats((prev) => [data, ...prev]);
      fetchMessages(data);
      setGroupModalOpen(false);
      setGroupChatName("");
      setGroupSelectedUsers([]);
    } catch (err) {
      console.error("Creating group failed", err);
      alert(err.response?.data?.message || "Could not create group chat");
    }
  };

  // Helper to resolve chat names nicely for 1-on-1s
  const getChatSenderName = (chat) => {
    if (!chat.isGroupChat && chat.users) {
      const sender = chat.users.find((u) => u._id !== user?._id);
      return sender ? sender.name : chat.chatName;
    }
    return chat.chatName;
  };

  const getChatSenderInitials = (chat) => {
    const name = getChatSenderName(chat);
    return name ? name.substring(0, 2).toUpperCase() : "CS";
  };

  if (!user) return null;

  return (
    <div className="chat-layout">
      {/* SIDEBAR PANEL */}
      <div className="chat-sidebar">
        <div className="profile-header">
          <div className="user-avatar-container">
            <div className="avatar avatar-online">{user.name ? user.name.substring(0, 2).toUpperCase() : "ME"}</div>
            <div className="user-info-name">{user.name}</div>
          </div>

          <button className="logout-btn" onClick={logout} title="Sign Out">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>

        {/* SEARCH BAR */}
        <div className="search-bar-container">
          <div className="search-input-wrapper">
            <svg
              className="search-icon-svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search users to start chatting..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>

          <button className="styled-btn secondary" onClick={openGroupModal} style={{ padding: "8px", fontSize: "0.85rem" }}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            New Group Chat
          </button>
        </div>

        {/* CHATS / SEARCH RESULTS DISPLAY */}
        <div className="chat-list">
          {searchQuery ? (
            <>
              <div className="list-section-title">Search Results ({searchResults.length})</div>
              {searchResults.map((searchUser) => (
                <div key={searchUser._id} className="chat-item" onClick={() => startDirectChat(searchUser._id)}>
                  <div className="avatar small">{searchUser.name.substring(0, 2).toUpperCase()}</div>
                  <div className="chat-item-details">
                    <div className="chat-item-name">{searchUser.name}</div>
                    <div className="chat-item-meta">{searchUser.email}</div>
                  </div>
                </div>
              ))}
              {searchResults.length === 0 && (
                <div style={{ color: "var(--text-muted)", fontSize: "0.85rem", textAlign: "center", marginTop: "20px" }}>
                  No users found matching query
                </div>
              )}
            </>
          ) : (
            <>
              <div className="list-section-title">Your Conversations ({chats.length})</div>
              {chats.map((chat) => (
                <div
                  key={chat._id}
                  className={`chat-item ${selectedChat && selectedChat._id === chat._id ? "active" : ""}`}
                  onClick={() => fetchMessages(chat)}
                >
                  <div className={`avatar small ${chat.isGroupChat ? "group" : ""}`}>
                    {getChatSenderInitials(chat)}
                  </div>
                 <div className="chat-item-details">

  <div className="chat-item-top">

    <div className="chat-item-name">
      {getChatSenderName(chat)}
    </div>

    <div className="chat-item-time">
      {chat.latestMessage
        ? new Date(chat.latestMessage.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })
        : ""}
    </div>

  </div>

  <div className="chat-item-meta">
    {chat.latestMessage ? (
      chat.isGroupChat ? (
        <>
          {chat.latestMessage.sender?.name}: {chat.latestMessage.content}
        </>
      ) : (
        chat.latestMessage.content
      )
    ) : (
      chat.isGroupChat
        ? "Group Chat"
        : "Start a conversation"
    )}
  </div>

</div>
                </div>
              ))}
              {chats.length === 0 && (
                <div style={{ color: "var(--text-muted)", fontSize: "0.85rem", textAlign: "center", marginTop: "20px" }}>
                  Search users to begin a chat
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* MAIN CONVERSATION SCREEN */}
      <div className="chat-main">
        {selectedChat ? (
          <>
            {/* ACTIVE CHAT HEADER */}
            <div className="chat-header">
              <div className="chat-header-info">
                <div className={`avatar small ${selectedChat.isGroupChat ? "group" : "avatar-online"}`}>
                  {getChatSenderInitials(selectedChat)}
                </div>
                <div>
                  <div className="chat-header-title">{getChatSenderName(selectedChat)}</div>
                  <div className="chat-header-subtitle">
                      {selectedChat.isGroupChat
                       ? `${selectedChat.users.length} members`
                       : "🟢 Online now"}
                  </div>
                </div>
              </div>

              {/* CONNECTION SYSTEM BADGES */}
              <div style={{ display: "flex", gap: "8px" }}>
                <div className={`status-badge ${dbOnline ? "" : "offline"}`}>
                  <span className="status-dot"></span>
                  {dbOnline ? "Database Online" : "Database Offline"}
                </div>
                <div className={`status-badge ${socketConnected ? "" : "offline"}`}>
                  <span className="status-dot"></span>
                  {socketConnected ? "Socket Active" : "Socket Offline"}
                </div>
              </div>
            </div>

            {/* MESSAGES THREAD CONTAINER */}
            <div className="message-area">
              {loadingMessages ? (
                <div className="loading-indicator">
                  <span className="spinner"></span> Loading messages...
                </div>
              ) : (
                messages.map((msg) => {
                  const isMine = msg.sender._id === user._id;
                  return (
                    <div key={msg._id} className={`message-wrapper ${isMine ? "mine" : "other"}`}>
                      {!isMine && <div className="message-sender">{msg.sender.name}</div>}
                      <div className="message-bubble">
                        {msg.content}
                        <div className="message-meta">
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* INPUT PANEL */}
            <div className="input-area">
              <div className="input-wrapper">
                <input
                  type="text"
                  placeholder="Type a message..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={sendMessage}
                />
              </div>
              <button className="send-btn" onClick={() => sendMessage(null)}>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </div>
          </>
        ) : (
          <div className="placeholder-panel">
            <div className="placeholder-glow-logo">ConnectSphere</div>
            <p>
              Welcome to the future of decentralized real-time communication. Find users in the sidebar search or set up group rooms to start talking securely and seamlessly.
            </p>
            <div style={{ display: "flex", gap: "10px" }}>
              <div className={`status-badge ${dbOnline ? "" : "offline"}`} style={{ padding: "6px 14px", fontSize: "0.8rem" }}>
                <span className="status-dot"></span>
                Database Status: {dbOnline ? "Healthy" : "Offline"}
              </div>
              <div className={`status-badge ${socketConnected ? "" : "offline"}`} style={{ padding: "6px 14px", fontSize: "0.8rem" }}>
                <span className="status-dot"></span>
                Real-Time Sockets: {socketConnected ? "Connected" : "Inactive"}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* NEW GROUP MODAL DIALOG */}
      {groupModalOpen && (
        <div className="modal-backdrop">
          <div className="group-modal">
            <div className="modal-header">
              <h3 className="modal-title">Create Group Chat</h3>
              <button className="close-btn" onClick={() => setGroupModalOpen(false)}>
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div className="form-group">
              <label>Group Name</label>
              <input
                className="styled-input"
                type="text"
                placeholder="e.g. Project Connect Team"
                value={groupChatName}
                onChange={(e) => setGroupChatName(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ marginBottom: "0px" }}>
              <label>Select Members (Min. 2)</label>
            </div>
            
            <div className="modal-users-list">
              {availableUsersForGroup.map((availUser) => (
                <div
                  key={availUser._id}
                  className="user-checkbox-item"
                  onClick={() => toggleSelectUserForGroup(availUser._id)}
                >
                  <input
                    type="checkbox"
                    checked={groupSelectedUsers.includes(availUser._id)}
                    onChange={() => {}} // Click handled by parent item
                  />
                  <span>{availUser.name} ({availUser.email})</span>
                </div>
              ))}
              {availableUsersForGroup.length === 0 && (
                <div style={{ color: "var(--text-muted)", fontSize: "0.85rem", padding: "16px", textAlign: "center" }}>
                  No members available
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="styled-btn secondary" onClick={() => setGroupModalOpen(false)}>
                Cancel
              </button>
              <button className="styled-btn" onClick={handleCreateGroup}>
                Create Group
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;

