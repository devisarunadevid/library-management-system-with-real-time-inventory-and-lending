import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { memberService } from "../services/memberService";
import { borrowService } from "../services/borrowService";
import overdueService from "../services/overdueService";
import transactionService from "../services/transactionService";
import { bookService } from "../services/bookService";
import api from "../services/api";
import { BookOpen, Crown, Sparkles, Star, Wand2, Send } from "lucide-react";

const LibrarioChat = ({ role = "MEMBER", context = {} }) => {
  const [messages, setMessages] = useState([
    {
      sender: "AI",
      text: "Hello — I'm the Librario Assistant. Ask me about your borrowed books, overdue fines, membership, borrowing/returning books, or any app-related help.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [localContext, setLocalContext] = useState(context);
  const endRef = useRef(null);

  useEffect(
    () => endRef.current?.scrollIntoView({ behavior: "smooth" }),
    [messages]
  );

  useEffect(() => {
    const loadProfile = async () => {
      if (role === "MEMBER" && !localContext.member && !userProfile) {
        try {
          const email = localStorage.getItem("userEmail");
          if (email) {
            const profile = await memberService.getProfile(email);
            setUserProfile(profile);
            setLocalContext((c) => ({ ...c, member: profile }));
          }
        } catch (err) {
          console.error("Failed to load member profile", err);
        }
      }
    };
    loadProfile();
  }, [role, localContext.member, userProfile]);

  const pushMessage = (m) => setMessages((prev) => [...prev, m].slice(-200));

  const getProfile = () => localContext.member || userProfile;

  const detectIntent = (text) => {
    const t = text.trim().toLowerCase();

    const intentMap = [
      {
        pattern: /^(hi|hello|hey|yo|good (morning|afternoon|evening))\b/,
        intent: "greeting",
      },
      {
        pattern: /(login|sign in|forgot password|how to login|can't login)/,
        intent: "login_help",
      },
      {
        pattern:
          /(how many books (are )?(available|can i borrow|left to borrow)|books available to borrow|available books to borrow)/,
        intent: "available_books_to_borrow",
        roles: ["MEMBER"],
      },
      {
        pattern:
          /(which books( (are|is))?( currently)?( (under|in|with))?( my|me|myself|mine)?( name)?|what books( are)?( currently)?( (under|in|with))?( my|me|myself|mine)?( name)?|books (with|under|in) my name|books with me|which books( have i)? borrowed|books i borrowed|my borrowed books|what books( did i)? (borrow|take)|show my borrowed|list.*borrowed|issued books|borrowed list|books i have|can you show.*borrowed|titles i borrowed|how many books.*borrowed|what are my issued books|tell me what books i (currently )?have|which books are (currently )?with me|show all books i took)/,
        intent: "list_borrowed",
      },
      {
        pattern:
          /(low stock|books?( (that|which) (are|is) )?(low in stock|out of stock|unavailable|not available|with less copies|with few copies left)|out of stock books?|unavailable books?|books unavailable( to borrow)?)/,
        intent: "low_stock_books",
        roles: ["ADMIN", "LIBRARIAN"],
      },
      {
        pattern: /\b(how to borrow|borrow (a|the)? book|request( a)? book)\b/,
        intent: "borrow_help",
      },
      { pattern: /(return|renew|renewal)/, intent: "return_renew_help" },
      {
        pattern: /(reserve|reservation|is available)/,
        intent: "reservation_help",
      },
      {
        pattern:
          /(overdue|fine|fines|how much overdue|how much do i owe|any due|pending fine)/,
        intent: "overdue_info",
      },
      {
        pattern: /(plan|membership|premium|what plan)/,
        intent: "membership_info",
      },
      {
        pattern: /(transaction|payments|history|recent activity)/,
        intent: "transaction_history",
      },
      {
        pattern:
          /(how many books( are (there )?(in the )?library)?|what( is|'s)?( the)? total( number of)? books|books in library|book count|total books|books available)/,
        intent: "library_book_count",
        roles: ["ADMIN", "LIBRARIAN", "MEMBER"],
      },
      { pattern: /(help|how do i|confused)/, intent: "help_general" },
    ];

    for (const { pattern, intent, roles } of intentMap) {
      if (pattern.test(t) && (!roles || roles.includes(role))) {
        return { intent };
      }
    }

    if (
      /(premium (members?|users?)|members?( who (have|are) )?premium|show premium|list premium|premium plan members?)/.test(
        t
      )
    ) {
      return { intent: "librarian_premium_members" };
    }

    if (role === "ADMIN") {
      if (t.includes("book count")) return { intent: "admin_book_count" };
      const overdueMatch = t.match(/overdue for\s+([a-zA-Z0-9\s@.]+)/);
      if (overdueMatch)
        return { intent: "admin_overdue_member", match: overdueMatch };
    }

    if (role === "LIBRARIAN") {
      if (t.includes("pending requests") || t.includes("borrow requests"))
        return { intent: "librarian_pending_requests" };
      if (
        t.includes("what can i do") ||
        t.includes("librarian") ||
        t.includes("help")
      )
        return { intent: "librarian_help" };
    }

    return { intent: "unknown" };
  };

  const cannedResponses = {
    greeting:
      "Hi — I can help you with Librario features: login, borrow, renew, overdue info, membership plans, and more.",
    login_help:
      "To log in: enter your registered email and password. If you forgot your password, use 'Forgot Password' -> enter email -> follow OTP steps. Contact admin if needed.",
    borrow_help:
      "To borrow a book: search Books, click 'Request' (or 'Borrow'). Approval is needed. You can reserve unavailable books.",
    return_renew_help:
      "Return via 'My Borrowed Books' -> Return. Renew using 'Renew' before due date. Limits may apply based on your plan.",
    reservation_help:
      "Reserve books from book details page. Cancel via 'My Reservations'.",
    help_general:
      "I can answer about borrowed books, fines, membership, transactions, and app usage. Ask specific questions like 'Which books have I borrowed?'",
    unknown:
      "Sorry — I couldn't understand that. Try asking differently, e.g., 'Which books have I borrowed?' or 'How much overdue do I have?'.",
  };

  const handleSend = async () => {
    if (loading) return;
    const text = input.trim();
    if (!text) return;
    pushMessage({ sender: "USER", text });
    setInput("");
    await handleIntent(text);
  };

  const handleIntent = async (text) => {
    if (!text || !text.trim()) return;
    const { intent, match } = detectIntent(text);
    setLoading(true);

    try {
      if (cannedResponses[intent]) {
        pushMessage({ sender: "AI", text: cannedResponses[intent] });
        setLoading(false);
        return;
      }

      const profile = getProfile();

      if (role === "MEMBER") {
        switch (intent) {
          case "list_borrowed": {
            try {
              if (!profile?.userId)
                return pushMessage({
                  sender: "AI",
                  text: "Please log in to see your borrowed books.",
                });

              const histRaw = await borrowService.userHistory(profile.userId);

              const hist = Array.isArray(histRaw)
                ? histRaw
                : histRaw?.data ||
                  histRaw?.borrowedBooks ||
                  histRaw?.records ||
                  [];

              if (!Array.isArray(hist)) {
                console.error("Unexpected history format:", histRaw);
                return pushMessage({
                  sender: "AI",
                  text: "Unable to load your borrowed books at the moment.",
                });
              }

              if (hist.length === 0)
                return pushMessage({
                  sender: "AI",
                  text: "You haven't borrowed any books yet.",
                });

              let total = null;

              try {
                total = await bookService.getCount();
              } catch {
                console.warn("Book count not accessible for this role.");
              }

              const titles = hist.map(
                (h) =>
                  h.bookTitle ||
                  h.title ||
                  h.bookName ||
                  h.book?.title ||
                  `Book #${h.id || h.borrowId || "?"}`
              );

              const countText = total
                ? ` (${titles.length}/${total} total books in library)`
                : ` (${titles.length} borrowed)`;

              return pushMessage({
                sender: "AI",
                text: `You have borrowed: ${titles.join(", ")}${countText}.`,
              });
            } catch (err) {
              console.error("list_borrowed error:", err);
              return pushMessage({
                sender: "AI",
                text: "Sorry — something went wrong while fetching your borrowed books.",
              });
            }
          }

          case "overdue_info": {
            if (role === "MEMBER") {
              const ov = profile?.userId
                ? await overdueService.getByUser(profile.userId)
                : null;

              if (!ov?.length)
                return pushMessage({
                  sender: "AI",
                  text: "No overdue books or fines.",
                });

              const total = ov.reduce((s, r) => s + (r.fineAmount || 0), 0);
              const lines = ov.map(
                (r) =>
                  `${r.bookTitle} — ₹${r.fineAmount} (${r.daysOverdue} days overdue)`
              );
              return pushMessage({
                sender: "AI",
                text: `You owe ₹${total}:\n${lines.join("\n")}`,
              });
            }

            if (role === "LIBRARIAN" || role === "ADMIN") {
              const ovAll = await overdueService.getAll();
              if (!ovAll?.length)
                return pushMessage({
                  sender: "AI",
                  text: "No overdue books or fines in the library.",
                });

              const total = ovAll.reduce((s, r) => s + (r.fineAmount || 0), 0);

              const topRecords = ovAll
                .slice(0, 10)
                .map(
                  (r) =>
                    `${r.userName} — ${r.bookTitle} — ₹${r.fineAmount} (${r.daysOverdue} days overdue)`
                );

              return pushMessage({
                sender: "AI",
                text: `Library overdue books (showing top 10):\n${topRecords.join(
                  "\n"
                )}\nTotal fines in library: ₹${total}`,
              });
            }
            break;
          }

          case "membership_info":
            return pushMessage({
              sender: "AI",
              text: profile
                ? `Membership: ${
                    profile.planType || profile.planName || "No Plan"
                  }. Limit: ${profile.borrowingLimit ?? "N/A"} books.`
                : "Login to see your membership.",
            });

          case "transaction_history": {
            if (!profile?.userId)
              return pushMessage({
                sender: "AI",
                text: "Login to see transactions.",
              });
            const txns = await transactionService.getByUser(profile.userId);
            if (!txns?.length)
              return pushMessage({
                sender: "AI",
                text: "No transactions found.",
              });

            const lines = txns
              .slice(-10)
              .map(
                (t) =>
                  `${new Date(
                    t.issueDate || t.requestDate
                  ).toLocaleDateString()} — ${t.fineAmount ?? "-"} — ${
                    t.status
                  }`
              );
            return pushMessage({
              sender: "AI",
              text: `Recent transactions:\n${lines.join("\n")}`,
            });
          }

          case "available_books_to_borrow": {
            try {
              let userId = profile?.userId;
              if (!userId) {
                const email = localStorage.getItem("userEmail");
                if (email) {
                  const prof = await memberService.getProfile(email);
                  setUserProfile(prof);
                  setLocalContext((c) => ({ ...c, member: prof }));
                  userId = prof.userId;
                }
              }

              let totalBooks = 0;
              let availableBooks = 0;
              let borrowed = 0;

              try {
                const res = await api.get("/books/availability");
                totalBooks = res.data.totalBooks;
                availableBooks = res.data.availableBooks;
              } catch (err) {
                console.error("Error fetching book availability:", err);
              }

              if (userId) {
                const hist = await borrowService.userHistory(userId);
                borrowed = Array.isArray(hist)
                  ? hist.length
                  : hist?.data?.length ||
                    hist?.borrowedBooks?.length ||
                    hist?.records?.length ||
                    0;
              }

              const available = Math.max(availableBooks - borrowed, 0);

              return pushMessage({
                sender: "AI",
                text: `Currently, ${available} out of ${totalBooks} books are available for borrowing.`,
              });
            } catch (err) {
              console.error("available_books_to_borrow error:", err);
              return pushMessage({
                sender: "AI",
                text: "Something went wrong while I tried to answer.",
              });
            }
          }
        }
      }

      if (role === "ADMIN") {
        switch (intent) {
          case "admin_book_count": {
            const count = await bookService.getCount();
            return pushMessage({ sender: "AI", text: `Total books: ${count}` });
          }
          case "admin_overdue_member": {
            const name = match?.[1]?.trim();
            const list = await overdueService.getAll();
            const found = list.filter((r) =>
              (r.userName || "").toLowerCase().includes(name.toLowerCase())
            );
            if (!found.length)
              return pushMessage({
                sender: "AI",
                text: `No overdue records for '${name}'.`,
              });
            const total = found.reduce((s, r) => s + (r.fineAmount || 0), 0);
            return pushMessage({
              sender: "AI",
              text: `${name} has ${found.length} overdue record(s). Total fine: ₹${total}.`,
            });
          }
        }
      }

      if (role === "LIBRARIAN") {
        switch (intent) {
          case "librarian_help":
            return pushMessage({
              sender: "AI",
              text: "As a Librarian, you can:\n- Approve/reject borrow requests\n- Mark books returned\n- Manage members and plans\n- Track overdue books\n- Update inventory\n- Get notifications on requests/fines",
            });
          case "librarian_premium_members": {
            try {
              const members = await memberService.getPremiumMembers();

              if (!members || members.length === 0) {
                return pushMessage({
                  sender: "AI",
                  text: "No premium members found.",
                });
              }

              const list = members
                .map((m) => `• ${m.userName || m.name} (${m.userEmail})`)
                .join("\n");

              return pushMessage({
                sender: "AI",
                text: `Premium members:\n${list}`,
              });
            } catch (err) {
              console.error("Error fetching premium members:", err);
              return pushMessage({
                sender: "AI",
                text: "Unable to fetch premium members at the moment.",
              });
            }
          }
          case "librarian_pending_requests": {
            const pending = await borrowService.getPendingRequests();
            return pushMessage({
              sender: "AI",
              text: pending?.length
                ? `Pending requests: ${pending.length}`
                : "No pending requests.",
            });
          }
        }
      }

      if (intent === "library_book_count") {
        try {
          const avail = await bookService.getAvailability();
          return pushMessage({
            sender: "AI",
            text: `Library has ${avail.totalBooks} books, ${avail.availableBooks} are currently available for borrowing.`,
          });
        } catch (err) {
          console.error("Error fetching availability:", err);
          return pushMessage({
            sender: "AI",
            text: "Unable to fetch library book availability at the moment.",
          });
        }
      }

      if (intent === "low_stock_books") {
        try {
          const lowStock = await bookService.getLowStock();
          if (!lowStock.length) {
            return pushMessage({
              sender: "AI",
              text: "No books are currently low in stock.",
            });
          }
          const titles = lowStock.map((b) => b.title).join(", ");
          return pushMessage({
            sender: "AI",
            text: `Low-stock books: ${titles}`,
          });
        } catch (err) {
          console.error("Error fetching low stock:", err);
          return pushMessage({
            sender: "AI",
            text: "Unable to fetch low-stock books right now.",
          });
        }
      }

      return pushMessage({ sender: "AI", text: cannedResponses.unknown });
    } catch (err) {
      console.error("Error handling intent", err);
      pushMessage({
        sender: "AI",
        text: "Something went wrong while I tried to answer.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative w-full">
      <div
        className="fixed inset-0 -z-10 bg-cover bg-center"
        style={{
          backgroundImage: "url('/bibliolibrary.jpg')",
          backgroundAttachment: "fixed",
        }}
      />
      <div className="fixed inset-0 -z-10 bg-[rgba(20,14,5,0.45)] backdrop-blur-[2px]" />

      <div className="relative flex h-full w-full flex-col overflow-hidden rounded-[24px] border border-amber-200/40 bg-white/10 backdrop-blur-sm sm:backdrop-blur-2xl ring-1 ring-white/20 shadow-[0_18px_70px_rgba(0,0,0,0.38)]">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(900px_420px_at_-10%_-20%,rgba(255,210,150,0.18),transparent_60%),radial-gradient(760px_420px_at_120%_10%,rgba(30,64,30,0.12),transparent_55%)]" />

        <header className="relative z-10 flex items-center justify-between gap-2 px-3 sm:px-4 py-2.5 border-b border-amber-200/40 bg-white/10">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-yellow-400 via-amber-500 to-orange-500 ring-1 ring-white/40 text-white shadow">
              <BookOpen className="w-5 h-5" />
            </span>
            <div className="min-w-0">
              <div className="font-extrabold bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 bg-clip-text text-transparent truncate drop-shadow-[0_1px_1px_rgba(0,0,0,0.25)]">
                Librario Bot
              </div>
              <div className="text-[11px] text-cream-50/80 truncate flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Your warm, bookish assistant
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1 text-amber-400">
              <Crown className="w-4.5 h-4.5" />
              <Star className="w-4.5 h-4.5" />
            </div>
            <button
              type="button"
              onClick={() =>
                setMessages([
                  {
                    sender: "AI",
                    text: "Hello — I'm the Librario Assistant. Ask me about your borrowed books, overdue fines, membership, borrowing/returning books, or any app-related help.",
                  },
                ])
              }
              className="h-8 px-3 rounded-lg text-xs font-semibold border border-amber-200/40 bg-gradient-to-r from-yellow-500 via-amber-500 to-orange-500 text-white hover:brightness-110 focus:outline-none focus:ring-2 focus:ring-amber-300/50 transition inline-flex items-center gap-1.5 shadow ring-1 ring-white/30"
              title="Clear chat"
            >
              <Wand2 className="w-3.5 h-3.5" />
              Clear
            </button>
            {loading && (
              <span className="text-[11px] text-cream-50/80 animate-pulse">
                typing…
              </span>
            )}
          </div>
        </header>

        <main className="relative z-10 flex-1 overflow-y-auto chat-scroll">
          <div className="sticky top-0 z-10 px-3 sm:px-4 py-2 bg-white/10 backdrop-blur-sm border-b border-amber-200/40">
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {[
                "how to register",
                "how to login",
                "which books have I borrowed?",
                "how much overdue do I have?",
                "available books to borrow",
              ].map((q) => (
                <button
                  key={q}
                  onClick={() => {
                    setInput(q);
                    setTimeout(handleSend, 0);
                  }}
                  className="shrink-0 rounded-full border border-amber-200/40 bg-white/20 px-3 py-1.5 text-xs text-cream-50/90 hover:bg-white/30 active:translate-y-[0.5px] focus:outline-none focus:ring-2 focus:ring-amber-300/40 transition inline-flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  {q}
                </button>
              ))}
            </div>
          </div>

          <div className="px-3 sm:px-4 py-3 space-y-3">
            {messages.map((m, i) => (
              <div
                key={i}
                className={`flex ${
                  m.sender === "USER" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`relative max-w-[80%] rounded-2xl px-4 py-2.5 whitespace-pre-wrap shadow-sm transition
                 ${
                   m.sender === "USER"
                     ? "bg-gradient-to-br from-amber-500 to-orange-500 text-white hover:brightness-110"
                     : "bg-cream-100 text-brown-900 border border-white/40"
                 }`}
                  style={{ boxShadow: "0 8px 20px rgba(0,0,0,.12)" }}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-cream-100 text-brown-900 border border-white/40 px-4 py-2.5">
                  <span className="inline-flex gap-1.5 align-middle">
                    <span className="dot" />
                    <span className="dot" />
                    <span className="dot" />
                  </span>
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>
        </main>

        <footer className="relative z-10 border-t border-amber-200/40 bg-white/10 px-3 sm:px-4 py-3">
          <div className="flex items-end gap-2">
            <div className="flex-1 rounded-2xl border border-amber-200/40 bg-white/20 backdrop-blur px-3.5 py-2">
              <textarea
                rows={1}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onInput={(e) => {
                  e.currentTarget.style.height = "auto";
                  e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`;
                }}
                onKeyDown={(e) =>
                  e.key === "Enter" &&
                  !e.shiftKey &&
                  (e.preventDefault(), handleSend())
                }
                placeholder="Type a message…"
                className="w-full max-h-40 bg-transparent resize-none leading-6 outline-none text-cream-50/90 placeholder:text-cream-50/60 focus:ring-2 focus:ring-amber-300/40 rounded-md"
              />
            </div>
            <button
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="h-11 w-11 grid place-items-center rounded-full bg-gradient-to-br from-yellow-500 via-amber-500 to-orange-500 text-white shadow-[0_12px_34px_rgba(234,179,8,0.5)] hover:brightness-110 active:translate-y-[0.5px] disabled:opacity-60 disabled:cursor-not-allowed transition focus:outline-none focus:ring-2 focus:ring-amber-300/40 ring-1 ring-white/30"
              aria-label="Send message"
              title="Send"
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </footer>

        <style>{`
          .no-scrollbar::-webkit-scrollbar{display:none}
          .no-scrollbar{-ms-overflow-style:none;scrollbar-width:none}
          .chat-scroll{scroll-behavior:smooth}
          .chat-scroll::-webkit-scrollbar{width:10px}
          .chat-scroll::-webkit-scrollbar-thumb{background:rgba(255,255,255,.25);border-radius:9999px;border:2px solid rgba(0,0,0,0)}
          .chat-scroll::-webkit-scrollbar-track{background:transparent}
          .dot{width:6px;height:6px;border-radius:9999px;background:#475569;display:inline-block;animation:bounce 1.2s infinite both}
          .dot:nth-child(2){animation-delay:.15s}
          .dot:nth-child(3){animation-delay:.3s}
          @keyframes bounce{0%,80%,100%{transform:scale(0)}40%{transform:scale(1)}}
        `}</style>
      </div>
    </div>
  );
};

LibrarioChat.propTypes = {
  role: PropTypes.oneOf(["MEMBER", "ADMIN", "LIBRARIAN"]),
  context: PropTypes.object,
};

export default LibrarioChat;
