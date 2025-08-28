import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import chatApi from "../../api/chatApi";

const defaultWelcome = [
  {
    id: "bot-welcome",
    role: "bot",
    text: "Hi! I'm your LMS assistant. Ask me about courses, enrollment, payments, or technical issues.",
    ts: Date.now(),
  },
];

function usePersistentState(key, initial) {
  const [state, setState] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {}
  }, [key, state]);
  return [state, setState];
}

// In-memory store for per-user call request flow state
const callRequest = {};

const faq = [
  // Payments & Refunds
  {
    q: /refund|money back|cancel order|cancel enrollment/i,
    a: "For refunds, please visit LMS > Payments > Refunds or contact support@firstvite.com.",
  },
  {
    q: /payment|pay|fees|billing|invoice|transaction/i,
    a: "You can manage payments under LMS > Billing. We support credit/debit cards, UPI, and net banking.",
  },
  {
    q: /failed payment|transaction failed|not paid/i,
    a: "If your payment failed, please wait 10 minutes. If still not updated, contact support@firstvite.com with your transaction ID.",
  },
  {
    q: /call|phone|talk to someone|speak with agent/i,
    a: "Sure! I can arrange a call. Please tell me your preferred language (e.g. English, Hindi).",
  },

  // Enrollment & Courses
  {
    q: /enroll|enrollment|join course|start course/i,
    a: "To enroll, open a course and click 'Enroll'. If you already paid, check 'My Courses'.",
  },
  {
    q: /course not showing|course missing|can't access course/i,
    a: "If a course is not showing, refresh your LMS dashboard. If still missing, check if payment is successful or contact support.",
  },
  {
    q: /my courses|enrolled courses|purchased courses/i,
    a: "You can find all your enrolled courses under LMS > My Courses.",
  },

  // Certificates
  {
    q: /certificate|course completion|download certificate/i,
    a: "Certificates are available after course completion in LMS > Certificates.",
  },

  // Classes / Sessions
  {
    q: /live class|webinar|session|online class/i,
    a: "Upcoming live sessions are listed in LMS > Schedule. You can join 5 minutes before the start.",
  },
  {
    q: /recorded class|recording|previous session/i,
    a: "Recorded sessions are available under the respective course in LMS > Recordings.",
  },

  // Account & Login
  {
    q: /login|sign in|can't login|password/i,
    a: "If you forgot your password, use 'Forgot Password' on the login page. If login issues persist, contact support@firstvite.com.",
  },
  {
    q: /sign up|create account|register/i,
    a: "To create an account, go to the signup page, fill in your details, and verify your email.",
  },
  {
    q: /profile|update details|change email|change phone/i,
    a: "You can update your profile from LMS > Account Settings.",
  },

  // Technical Issues
  {
    q: /not working|error|technical issue|bug/i,
    a: "Please try clearing cache and refreshing. If the issue continues, contact support@firstvite.com with a screenshot.",
  },
  {
    q: /video not playing|content not loading/i,
    a: "Check your internet connection and browser. Try using Chrome/Firefox latest version. If issue persists, contact support.",
  },

  // General Help
  {
    q: /contact|support|help|agent/i,
    a: "You can reach our support team at support@firstvite.com or via the Help section in the LMS.",
  },
  { q: /hello|hi|hey/i, a: "Hello! 👋 How can I help you today?" },
  { q: /thank you|thanks/i, a: "You're welcome! Happy learning 🚀" },
  { q: /bye|goodbye|see you/i, a: "Goodbye! Have a great day ahead 🌟" },
];

function getBotReply(text, userId) {
  // initialize user state
  if (!callRequest[userId]) {
    callRequest[userId] = { step: 0, language: null, number: null };
  }

  const state = callRequest[userId];

  // Check if user is in "call request" flow
  if (state.step > 0) {
    if (state.step === 1) {
      state.language = text;
      state.step = 2;
      return "Got it! Please share your phone number so our team can call you.";
    } else if (state.step === 2) {
      // basic phone validation (10-15 digits, allows +, spaces, hyphens)
      const cleaned = text.replace(/[^\d+]/g, "");
      const digits = cleaned.replace(/\D/g, "");
      if (digits.length < 10 || digits.length > 15) {
        return "That doesn't look like a valid phone number. Please enter a 10-15 digit phone number (you can include country code).";
      }
      state.number = cleaned;
      state.step = 0; // reset flow
      return `Thanks! We will arrange a call in ${state.language} at ${state.number}. Our support team will contact you soon.`;
    }
  }

  // Normal FAQ handling
  const matched = faq.find((f) => f.q.test(text));
  if (matched) {
    // If it's a call request, set step
    if (/call|phone|talk to someone|speak with agent/i.test(text)) {
      state.step = 1;
    }
    return matched.a;
  }

  return "I'm not fully sure. I can connect you to a human agent shortly. Please describe your issue in more detail.";
}

export default function LiveChatWidget({ open, onClose }) {
  const [messages, setMessages] = usePersistentState("lms_chat_messages", defaultWelcome);
  const [input, setInput] = useState("");
  const [isMin, setIsMin] = usePersistentState("lms_chat_min", false);
  const [userId, setUserId] = usePersistentState("lms_chat_user_id", "");
  const [isTyping, setIsTyping] = useState(false);
  const [sessionId, setSessionId] = usePersistentState("lms_chat_session_id", "");
  const listRef = useRef(null);
  const navigate = useNavigate();

  const getUnread = () => Number(localStorage.getItem('lms_chat_unread') || 0);
  const setUnread = (val) => {
    localStorage.setItem('lms_chat_unread', String(val));
    try { window.dispatchEvent(new CustomEvent('lms-chat-unread', { detail: { count: val } })); } catch {}
  };
  const incUnreadIfClosed = () => {
    if (!open) setUnread(getUnread() + 1);
  };

  useEffect(() => {
    if (open && listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [open, messages]);

  // Reset unread when chat opens
  useEffect(() => {
    if (open) setUnread(0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  // Ensure a stable userId exists for tracking call flow state
  useEffect(() => {
    if (!userId) {
      const id = `user-${Math.random().toString(36).slice(2, 8)}-${Date.now()}`;
      setUserId(id);
    }
  }, [userId, setUserId]);

  // Ensure a sessionId for persistence
  useEffect(() => {
    if (!sessionId) {
      const sid = `sess-${Math.random().toString(36).slice(2, 8)}-${Date.now()}`;
      setSessionId(sid);
    }
  }, [sessionId, setSessionId]);

  // Load history when widget opens and sessionId exists
  useEffect(() => {
    const load = async () => {
      if (open && sessionId) {
        try {
          const data = await chatApi.getMessages(sessionId, 200);
          if (Array.isArray(data) && data.length) {
            const mapped = data.map(d => ({ id: d._id || `${d.role}-${d.ts}`, role: d.role, text: d.text, ts: new Date(d.ts).getTime() }));
            setMessages(mapped);
            // viewing history clears unread locally too
            setUnread(0);
          } else if (!messages.length) {
            // seed welcome if empty
            setMessages(defaultWelcome);
          }
        } catch (e) {
          // keep local messages if API fails
          // console.error('Failed to load chat history', e);
        }
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, sessionId]);

  const endChat = async (close = true) => {
    try { if (sessionId) await chatApi.endSession(sessionId); } catch {}
    setMessages(defaultWelcome);
    // also reset call flow for this user if exists
    if (userId && callRequest[userId]) callRequest[userId] = { step: 0, language: null, number: null };
    // rotate session id for a fresh conversation
    const sid = `sess-${Math.random().toString(36).slice(2, 8)}-${Date.now()}`;
    setSessionId(sid);
    if (close) onClose?.();
  };

  const handleCallNavigate = () => {
    // Add a short bot message before navigating
    const botMsg = { id: `b-${Date.now()}`, role: "bot", text: "Opening callback request page...", ts: Date.now() };
    setMessages(prev => [
      ...prev,
      botMsg,
    ]);
    // persist bot message
    chatApi.saveMessage({ sessionId, userId, role: 'bot', text: botMsg.text, ts: botMsg.ts }).catch(() => {});
    incUnreadIfClosed();
    // create a handoff record
    chatApi.createHandoff(sessionId, 'User requested callback via quick action').catch(() => {});
    setTimeout(() => navigate("/lms/callback"), 300);
  };

  const send = () => {
    const text = input.trim();
    if (!text) return;

    // Commands to end/close chat
    if (/^(end|close|quit) chat$/i.test(text) || /^(end|close|quit)$/i.test(text)) {
      const userMsg = { id: `u-${Date.now()}`, role: "user", text, ts: Date.now() };
      const botEnd = { id: `b-${Date.now()+1}`, role: "bot", text: "Chat ended. Have a great day!", ts: Date.now()+1 };
      setMessages(prev => [...prev, userMsg, botEnd]);
      chatApi.saveMessage({ sessionId, userId, role: 'user', text: userMsg.text, ts: userMsg.ts }).catch(() => {});
      chatApi.saveMessage({ sessionId, userId, role: 'bot', text: botEnd.text, ts: botEnd.ts }).catch(() => {});
      setInput("");
      setTimeout(() => endChat(true), 400);
      return;
    }

    const userMsg = { id: `u-${Date.now()}`, role: "user", text, ts: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    chatApi.saveMessage({ sessionId, userId, role: 'user', text, ts: userMsg.ts }).catch(() => {});
    setInput("");
    setTimeout(() => {
      setIsTyping(true);
      const reply = getBotReply(text, userId || "anon");
      const botMsg = { id: `b-${Date.now()}`, role: "bot", text: reply, ts: Date.now() };
      setMessages(prev => [
        ...prev,
        botMsg,
      ]);
      chatApi.saveMessage({ sessionId, userId, role: 'bot', text: reply, ts: botMsg.ts }).catch(() => {});
      // If bot suggests human agent, create a handoff
      if (/human agent|talk to (an )?agent|connect you to a human/i.test(reply)) {
        chatApi.createHandoff(sessionId, 'Bot suggested human agent').catch(() => {});
      }
      incUnreadIfClosed();
      setIsTyping(false);
    }, 600);
  };

  const quickReplies = useMemo(
    () => [
      "How to enroll?",
      "Payment options",
      "Refund policy",
      "Get certificate",
    ],
    []
  );

  if (!open) return null;

  return (
    <div className="fixed z-50 bottom-4 right-4 w-80 max-w-[92vw] text-sm">
      <div className="bg-white shadow-xl border border-gray-200 rounded-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 bg-blue-600 text-white">
          <div className="flex items-center gap-2">
            <span className="font-semibold">Live Chat</span>
            <span className="flex items-center gap-1 text-xs opacity-90">
              <span className="inline-block w-2 h-2 rounded-full bg-green-400" /> Online
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMin(!isMin)}
              className="hover:bg-white/20 rounded px-2 py-1"
              aria-label={isMin ? "Expand" : "Minimize"}
            >
              {isMin ? "▢" : "—"}
            </button>
            <button
              onClick={() => endChat(true)}
              className="hover:bg-white/20 rounded px-2 py-1"
              title="End chat"
            >
              ⎋
            </button>
            <button onClick={onClose} className="hover:bg-white/20 rounded px-2 py-1" aria-label="Close">×</button>
          </div>
        </div>

        {/* Body */}
        {!isMin && (
          <>
            <div ref={listRef} className="h-64 overflow-y-auto px-3 py-2 space-y-2 bg-gray-50">
              {messages.map(m => (
                <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[85%] px-3 py-2 rounded-lg whitespace-pre-wrap break-words ${
                      m.role === "user" ? "bg-blue-600 text-white rounded-br-none" : "bg-white border border-gray-200 text-gray-800 rounded-bl-none"
                    }`}
                    title={new Date(m.ts).toLocaleString()}
                  >
                    {m.text}
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-200 text-gray-600 rounded-bl-none rounded-lg px-3 py-2">
                    <span className="inline-flex gap-1 items-center">
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Replies */}
            <div className="flex flex-wrap gap-2 px-3 py-2 bg-white border-t">
              {quickReplies.map((q) => (
                <button
                  key={q}
                  className="text-xs px-2 py-1 border border-gray-200 rounded-full hover:border-blue-400 hover:text-blue-600"
                  onClick={() => setInput(q)}
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Actions bar */}
            <div className="flex items-center justify-between px-3 py-2 bg-white border-t">
              <div className="flex items-center gap-2">
                <button
                  className="text-xs px-2 py-1 border border-gray-200 rounded-lg hover:border-blue-400 hover:text-blue-600"
                  onClick={handleCallNavigate}
                >
                  Request Callback
                </button>
                <button
                  className="text-xs px-2 py-1 border border-gray-200 rounded-lg hover:border-blue-400 hover:text-blue-600"
                  onClick={handleCallNavigate}
                >
                  Talk to Agent
                </button>
              </div>
              <button
                className="text-xs text-gray-500 hover:text-red-600"
                onClick={() => endChat(true)}
                title="End chat and close"
              >
                End Chat
              </button>
            </div>

            {/* Input */}
            <div className="flex items-center gap-2 px-3 py-2 bg-white border-t">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder="Type your message..."
                className="flex-1 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
              <button
                onClick={send}
                className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                disabled={!input.trim()}
              >
                Send
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
