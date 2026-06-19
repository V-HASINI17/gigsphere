import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import {
  ArrowLeft,
  Send,
  MessageSquare,
  CheckCheck,
  Check,
  Moon,
  Sun,
  Search,
  Briefcase,
  GraduationCap,
  Wifi,
  WifiOff,
} from "lucide-react";

// ─── Online Status Dot ────────────────────────────────────────────────────────
function OnlineDot({ isOnline }) {
  return (
    <span
      className={`absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white dark:border-slate-900 ${
        isOnline ? "bg-emerald-500" : "bg-slate-400"
      }`}
    />
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({ name, role, isOnline, size = "md" }) {
  const sizeClass = size === "lg" ? "h-12 w-12 text-base" : "h-10 w-10 text-sm";
  const color =
    role === "student"
      ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
      : "bg-indigo-500/10 text-indigo-500 border-indigo-500/20";

  return (
    <div className="relative shrink-0">
      <div
        className={`${sizeClass} ${color} rounded-full font-bold flex items-center justify-center border`}
      >
        {name?.charAt(0)?.toUpperCase()}
      </div>
      <OnlineDot isOnline={isOnline} />
    </div>
  );
}

// ─── Message Bubble ───────────────────────────────────────────────────────────
function MessageBubble({ msg, isMine }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex ${isMine ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[75%] px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
          isMine
            ? "bg-indigo-600 text-white rounded-br-sm"
            : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-100 dark:border-slate-750 rounded-bl-sm"
        }`}
      >
        {msg.message}
        <div
          className={`flex items-center justify-end gap-1 mt-1 ${
            isMine ? "text-indigo-200" : "text-slate-400"
          }`}
        >
          <span className="text-[10px]">
            {new Date(msg.timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
          {isMine &&
            (msg.isRead ? (
              <CheckCheck size={12} className="text-indigo-200" />
            ) : (
              <Check size={12} />
            ))}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
function ChatPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, socket, isUserOnline } = useAuth();

  // URL params: pre-select a conversation from dashboard
  const initOtherUserId = searchParams.get("otherUserId");
  const initGigId = searchParams.get("gigId");

  const [conversations, setConversations] = useState([]);
  const [activeConvo, setActiveConvo] = useState(null); // { otherUser, gig }
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [remoteTyping, setRemoteTyping] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("theme") === "dark"
  );

  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    document.body.classList.toggle("dark", darkMode);
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  // ── Fetch conversations on mount ──
  useEffect(() => {
    fetchConversations();
  }, []);

  const fetchConversations = async () => {
    try {
      const data = await api.get("/chat/conversations");
      setConversations(data);
    } catch (err) {
      console.error("Failed to load conversations:", err.message);
    }
  };

  // ── Auto-open conversation from URL params ──
  useEffect(() => {
    if (initOtherUserId && initGigId && conversations.length > 0) {
      const match = conversations.find(
        (c) =>
          c.otherUser?._id === initOtherUserId &&
          c.gig?._id === initGigId
      );
      if (match) {
        openConversation(match);
      } else {
        // New conversation — build a placeholder
        setActiveConvo({
          otherUser: { _id: initOtherUserId },
          gig: { _id: initGigId },
        });
        fetchMessages(initOtherUserId, initGigId);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initOtherUserId, initGigId, conversations]);

  // ── Open conversation and load messages ──
  const openConversation = (convo) => {
    setActiveConvo(convo);
    fetchMessages(convo.otherUser._id, convo.gig._id);

    // Join gig-specific socket room
    if (socket) {
      socket.emit("joinRoom", {
        gigId: convo.gig._id,
        otherUserId: convo.otherUser._id,
      });
    }
  };

  const fetchMessages = async (otherUserId, gigId) => {
    setLoadingMessages(true);
    try {
      const data = await api.get(
        `/chat/messages/${otherUserId}?gigId=${gigId}`
      );
      setMessages(data);
    } catch (err) {
      console.error("Failed to load messages:", err.message);
    } finally {
      setLoadingMessages(false);
    }
  };

  // ── Auto scroll to bottom ──
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, remoteTyping]);

  // ── Socket.io event listeners ──
  useEffect(() => {
    if (!socket) return;

    // Receive new message
    const handleNewMessage = (msg) => {
      if (
        activeConvo &&
        msg.gigId === activeConvo.gig?._id &&
        (msg.senderId === activeConvo.otherUser?._id ||
          msg.receiverId === activeConvo.otherUser?._id)
      ) {
        setMessages((prev) => [...prev, msg]);
        // Update conversation preview
        setConversations((prev) =>
          prev.map((c) =>
            c.gig?._id === msg.gigId
              ? { ...c, lastMessage: msg.message, timestamp: msg.timestamp }
              : c
          )
        );
      }
    };

    // Typing indicator
    const handleTyping = ({ senderId, gigId }) => {
      if (
        activeConvo &&
        senderId === activeConvo.otherUser?._id &&
        gigId === activeConvo.gig?._id
      ) {
        setRemoteTyping(true);
        setTimeout(() => setRemoteTyping(false), 3000);
      }
    };

    // Read receipts
    const handleMessageRead = ({ gigId, readBy }) => {
      if (activeConvo && gigId === activeConvo.gig?._id) {
        setMessages((prev) =>
          prev.map((m) =>
            m.receiverId === readBy ? { ...m, isRead: true } : m
          )
        );
      }
    };

    socket.on("receive_message", handleNewMessage);
    socket.on("user_typing", handleTyping);
    socket.on("messages_read", handleMessageRead);

    return () => {
      socket.off("receive_message", handleNewMessage);
      socket.off("user_typing", handleTyping);
      socket.off("messages_read", handleMessageRead);
    };
  }, [socket, activeConvo]);

  // ── Send message ──
  const handleSend = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConvo || !socket) return;

    const msgPayload = {
      senderId: user.id,
      receiverId: activeConvo.otherUser._id,
      gigId: activeConvo.gig._id,
      message: newMessage.trim(),
    };

    // Emit via socket
    socket.emit("send_message", msgPayload);

    // Optimistically add to UI
    setMessages((prev) => [
      ...prev,
      {
        ...msgPayload,
        timestamp: new Date().toISOString(),
        isRead: false,
        _id: `local_${Date.now()}`,
      },
    ]);

    // Update thread preview
    setConversations((prev) =>
      prev.map((c) =>
        c.gig?._id === activeConvo.gig._id
          ? { ...c, lastMessage: newMessage.trim(), timestamp: new Date().toISOString() }
          : c
      )
    );

    setNewMessage("");
  };

  // ── Typing indicator emit ──
  const handleInputChange = (e) => {
    setNewMessage(e.target.value);

    if (!socket || !activeConvo) return;

    if (!isTyping) {
      setIsTyping(true);
      socket.emit("typingStart", {
        gigId: activeConvo.gig._id,
        receiverId: activeConvo.otherUser._id,
      });
    }

    clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket.emit("typingStop", {
        gigId: activeConvo.gig._id,
        receiverId: activeConvo.otherUser._id,
      });
    }, 2500);
  };

  const filteredConversations = conversations.filter(
    (c) =>
      c.otherUser?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.gig?.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-brand-light dark:bg-brand-dark text-slate-800 dark:text-slate-100 transition-colors duration-300 flex flex-col md:flex-row">

      {/* ── Thread Sidebar ── */}
      <aside className="w-full md:w-80 bg-white dark:bg-slate-900 border-b md:border-b-0 md:border-r border-slate-200/50 dark:border-slate-800 flex flex-col shrink-0 md:h-screen">

        {/* Sidebar header */}
        <div className="p-5 border-b border-slate-200/50 dark:border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-indigo-500 transition-colors"
            >
              <ArrowLeft size={14} />
              Back
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-850 text-slate-500"
              >
                {darkMode ? <Sun size={14} /> : <Moon size={14} />}
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-extrabold text-lg">
              GS
            </div>
            <div>
              <span className="font-extrabold text-sm">Messages</span>
              <div className="text-[10px] text-slate-400 font-semibold">
                {conversations.length} active thread{conversations.length !== 1 ? "s" : ""}
              </div>
            </div>
          </div>

          <div className="relative">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        {/* Thread List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400 font-medium">
              <MessageSquare size={28} className="mx-auto mb-2 opacity-30" />
              No conversations yet. Accept or get accepted on a gig to start chatting.
            </div>
          ) : (
            filteredConversations.map((convo, idx) => {
              const isActive = activeConvo?.gig?._id === convo.gig?._id && activeConvo?.otherUser?._id === convo.otherUser?._id;
              const online = isUserOnline(convo.otherUser?._id);

              return (
                <button
                  key={idx}
                  onClick={() => openConversation(convo)}
                  className={`w-full p-4 flex items-start gap-3 text-left transition-all border-b border-slate-100 dark:border-slate-850 ${
                    isActive
                      ? "bg-indigo-50 dark:bg-indigo-950/20 border-l-2 border-l-indigo-500"
                      : "hover:bg-slate-50 dark:hover:bg-slate-850"
                  }`}
                >
                  <Avatar
                    name={convo.otherUser?.name}
                    role={convo.otherUser?.role}
                    isOnline={online}
                  />
                  <div className="flex-1 overflow-hidden">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-xs truncate">
                        {convo.otherUser?.name}
                      </span>
                      <span className="text-[10px] text-slate-400 shrink-0 ml-2">
                        {convo.timestamp
                          ? new Date(convo.timestamp).toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : ""}
                      </span>
                    </div>
                    <div className="text-[10px] text-indigo-500 font-semibold truncate">
                      {convo.gig?.title}
                    </div>
                    <div className="text-[11px] text-slate-400 truncate mt-0.5 flex items-center justify-between">
                      <span className="truncate">
                        {convo.lastSender === user.id ? "You: " : ""}
                        {convo.lastMessage}
                      </span>
                      {!convo.isRead && convo.lastSender !== user.id && (
                        <span className="h-2 w-2 rounded-full bg-indigo-500 shrink-0 ml-1.5" />
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </aside>

      {/* ── Chat Window ── */}
      <div className="flex-1 flex flex-col md:h-screen">
        {!activeConvo ? (
          /* Empty state */
          <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-400 space-y-4">
            <div className="h-20 w-20 rounded-3xl bg-indigo-500/10 flex items-center justify-center">
              <MessageSquare size={36} className="text-indigo-400" />
            </div>
            <div className="space-y-1">
              <h3 className="font-extrabold text-base text-slate-600 dark:text-slate-300">
                Select a conversation
              </h3>
              <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                Choose a thread from the left to start messaging. Chats are linked to specific gigs.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="h-16 border-b border-slate-200/50 dark:border-slate-800 flex items-center justify-between px-5 bg-white dark:bg-slate-900 shrink-0">
              <div className="flex items-center gap-3">
                <Avatar
                  name={activeConvo.otherUser?.name}
                  role={activeConvo.otherUser?.role}
                  isOnline={isUserOnline(activeConvo.otherUser?._id)}
                  size="sm"
                />
                <div>
                  <div className="font-bold text-sm flex items-center gap-2">
                    {activeConvo.otherUser?.name || "Loading..."}
                    {activeConvo.otherUser?.role === "student" ? (
                      <GraduationCap size={13} className="text-emerald-500" />
                    ) : (
                      <Briefcase size={13} className="text-indigo-500" />
                    )}
                  </div>
                  <div className="text-[10px] font-semibold text-slate-400 flex items-center gap-1.5">
                    {isUserOnline(activeConvo.otherUser?._id) ? (
                      <>
                        <Wifi size={10} className="text-emerald-500" />
                        <span className="text-emerald-500">Online now</span>
                      </>
                    ) : (
                      <>
                        <WifiOff size={10} />
                        Last seen recently
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="text-[10px] font-bold text-indigo-500 bg-indigo-500/10 px-3 py-1.5 rounded-full flex items-center gap-1.5 max-w-[200px] truncate">
                <Briefcase size={11} />
                <span className="truncate">{activeConvo.gig?.title}</span>
              </div>
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto p-5 space-y-3 bg-slate-50 dark:bg-slate-950/30">
              {loadingMessages ? (
                <div className="flex justify-center py-12">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-slate-400 text-xs text-center gap-2">
                  <MessageSquare size={28} className="opacity-30" />
                  <span>No messages yet. Say hello!</span>
                </div>
              ) : (
                messages.map((msg) => (
                  <MessageBubble
                    key={msg._id}
                    msg={msg}
                    isMine={
                      msg.senderId === user.id ||
                      msg.senderId?._id === user.id ||
                      msg.senderId?._id === user._id
                    }
                  />
                ))
              )}

              {/* Typing indicator */}
              <AnimatePresence>
                {remoteTyping && (
                  <motion.div
                    key="typing"
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex justify-start"
                  >
                    <div className="px-4 py-2.5 rounded-2xl rounded-bl-sm bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-750 flex items-center gap-1.5 shadow-sm">
                      {[0, 0.15, 0.3].map((delay, i) => (
                        <motion.span
                          key={i}
                          className="h-2 w-2 rounded-full bg-slate-400"
                          animate={{ y: [0, -4, 0] }}
                          transition={{ repeat: Infinity, duration: 0.8, delay }}
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form
              onSubmit={handleSend}
              className="p-4 border-t border-slate-200/50 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-3 shrink-0"
            >
              <input
                type="text"
                value={newMessage}
                onChange={handleInputChange}
                placeholder="Type a message..."
                className="flex-1 px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-850 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
              <button
                type="submit"
                disabled={!newMessage.trim()}
                className="h-12 w-12 rounded-2xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center shadow-md shadow-indigo-600/20 transition-all hover:scale-105 active:scale-95"
              >
                <Send size={16} />
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default ChatPage;
