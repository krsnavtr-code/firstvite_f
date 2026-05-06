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

// Persistent state hook (No external libs needed)
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

const callRequest = {};

const faq = [
  {
    q: /refund|money back|cancel order|cancel enrollment/i,
    a: "For refunds, please visit LMS > Payments > Refunds or contact info@eklabya.com.",
  },
  {
    q: /payment|pay|fees|billing|invoice|transaction/i,
    a: "You can manage payments under LMS > Billing. We support credit/debit cards, UPI, and net banking.",
  },
  {
    q: /failed payment|transaction failed|not paid/i,
    a: "If your payment failed, please wait 10 minutes. If still not updated, contact info@eklabya.com with your transaction ID.",
  },
  {
    q: /call|phone|talk to someone|speak with agent/i,
    a: "Sure! I can arrange a call. Please tell me your preferred language (e.g. English, Hindi).",
  },
  {
    q: /enroll|enrollment|join course|start course/i,
    a: "To enroll, open a course and click 'Enroll'. If you already paid, check 'My Courses'.",
  },
  {
    q: /certificate|course completion|download certificate/i,
    a: "Certificates are available after course completion in LMS > Certificates.",
  },
  { q: /hello|hi|hey/i, a: "Hello! 👋 How can I help you today?" },
  { q: /thank you|thanks/i, a: "You're welcome! Happy learning 🚀" },
];

function getBotReply(text, userId) {
  if (!callRequest[userId])
    callRequest[userId] = { step: 0, language: null, number: null };
  const state = callRequest[userId];

  if (state.step > 0) {
    if (state.step === 1) {
      state.language = text;
      state.step = 2;
      return "Got it! Please share your phone number so our team can call you.";
    } else if (state.step === 2) {
      const cleaned = text.replace(/[^\d+]/g, "");
      const digits = cleaned.replace(/\D/g, "");
      if (digits.length < 10 || digits.length > 15)
        return "Invalid number. Please enter a 10-15 digit phone number.";
      state.number = cleaned;
      state.step = 0;
      return `Thanks! We will arrange a call in ${state.language} at ${state.number} soon.`;
    }
  }

  const matched = faq.find((f) => f.q.test(text));
  if (matched) {
    if (/call|phone|talk to someone|speak with agent/i.test(text))
      state.step = 1;
    return matched.a;
  }
  return "I can connect you to a human agent shortly. Please describe your issue in more detail.";
}

export default function LiveChatWidget({ open, onClose }) {
  const [messages, setMessages] = usePersistentState(
    "lms_chat_messages",
    defaultWelcome,
  );
  const [input, setInput] = useState("");
  const [isMin, setIsMin] = usePersistentState("lms_chat_min", false);
  const [userId, setUserId] = usePersistentState("lms_chat_user_id", "");
  const [sessionId, setSessionId] = usePersistentState(
    "lms_chat_session_id",
    "",
  );
  const [isTyping, setIsTyping] = useState(false);
  const listRef = useRef(null);
  const navigate = useNavigate();

  const setUnread = (val) => {
    localStorage.setItem("lms_chat_unread", String(val));
    window.dispatchEvent(
      new CustomEvent("lms-chat-unread", { detail: { count: val } }),
    );
  };

  useEffect(() => {
    if (open) {
      setUnread(0);
      if (listRef.current)
        listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [open, messages]);

  useEffect(() => {
    if (!userId)
      setUserId(`user-${Math.random().toString(36).slice(2, 8)}-${Date.now()}`);
    if (!sessionId)
      setSessionId(
        `sess-${Math.random().toString(36).slice(2, 8)}-${Date.now()}`,
      );
  }, []);

  const send = () => {
    const text = input.trim();
    if (!text) return;
    const userMsg = {
      id: `u-${Date.now()}`,
      role: "user",
      text,
      ts: Date.now(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const reply = getBotReply(text, userId);
      const botMsg = {
        id: `b-${Date.now()}`,
        role: "bot",
        text: reply,
        ts: Date.now(),
      };
      setMessages((prev) => [...prev, botMsg]);
      setIsTyping(false);
      if (!open)
        setUnread(Number(localStorage.getItem("lms_chat_unread") || 0) + 1);
    }, 800);
  };

  if (!open) return null;

  return (
    <div
      className={`fixed z-50 bottom-6 right-6 w-96 max-w-[90vw] transition-all duration-300 transform ${isMin ? "h-14" : "h-[500px]"}`}
    >
      <div className="flex flex-col h-full bg-white dark:bg-slate-900 shadow-2xl rounded-3xl border border-slate-100 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div
          className="flex items-center justify-between p-4 bg-blue-600 text-white cursor-pointer"
          onClick={() => setIsMin(!isMin)}
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center font-bold">
                L
              </div>
              <span className="absolute -bottom-1 -right-1 w-3 h-3 bg-emerald-400 border-2 border-blue-600 rounded-full"></span>
            </div>
            <div>
              <p className="text-sm font-bold leading-none">LMS Assistant</p>
              <p className="text-[10px] text-blue-100 mt-1 uppercase tracking-wider font-black">
                Online Now
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setIsMin(!isMin);
              }}
            >
              {isMin ? (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 15l7-7 7 7"
                  />
                </svg>
              ) : (
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M18 12H6"
                  />
                </svg>
              )}
            </button>
            <button
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onClose();
              }}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Chat Body */}
        {!isMin && (
          <>
            <div
              ref={listRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50 dark:bg-slate-950 scroll-smooth"
            >
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[80%] p-3 text-sm shadow-sm ${
                      m.role === "user"
                        ? "bg-blue-600 text-white rounded-2xl rounded-tr-none"
                        : "bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-2xl rounded-tl-none border border-slate-100 dark:border-slate-700"
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white dark:bg-slate-800 p-3 rounded-2xl rounded-tl-none border border-slate-100 dark:border-slate-700">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                      <div className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="px-4 py-3 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex gap-2 overflow-x-auto no-scrollbar">
              {["Payments", "Enrollment", "Certificate"].map((q) => (
                <button
                  key={q}
                  onClick={() => {
                    setInput(q);
                    send();
                  }}
                  className="whitespace-nowrap px-3 py-1.5 bg-slate-50 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-slate-600 dark:text-slate-300 text-xs font-bold rounded-lg transition-colors border border-slate-200 dark:border-slate-700"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Footer Input */}
            <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-800 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-700 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send()}
                  placeholder="Ask anything..."
                  className="flex-1 bg-transparent border-none px-3 py-2 text-sm outline-none dark:text-white"
                />
                <button
                  onClick={send}
                  disabled={!input.trim()}
                  className="p-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-30 transition-all"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M5 10l7-7m0 0l7 7m-7-7v18"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
