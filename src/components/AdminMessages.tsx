import { useEffect, useState } from "react";
import { db } from "@/firebase/config";
import {
  collection,
  onSnapshot,
  query,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { Trash2, Mail, MailOpen, Clock, User, RefreshCw, Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContextFirebase";

interface Message {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  message: string;
  read: boolean;
  createdAt: any;
}

const AdminMessages = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!isAuthenticated || user?.role !== "admin") {
      setMessages([]);
      setLoading(false);
      setErrorMessage("You must be signed in as an admin to view messages.");
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    const q = query(collection(db, "messages"));
    const unsub = onSnapshot(
      q,
      (snap) => {
        const msgs = snap.docs.map((d) => ({ id: d.id, ...(d.data() as Omit<Message, "id">) }));
        // Sort newest first on the client
        msgs.sort((a, b) => {
          const aTime = a.createdAt?.toDate?.()?.getTime?.() ?? 0;
          const bTime = b.createdAt?.toDate?.()?.getTime?.() ?? 0;
          return bTime - aTime;
        });
        setMessages(msgs);
        setLoading(false);
      },
      (err) => {
        console.error("Messages listener error:", err);
        setLoading(false);
        setErrorMessage("Unable to load messages. Please check your admin permissions.");
      }
    );
    return () => unsub();
  }, [authLoading, isAuthenticated, user?.role]);

  const markRead = async (id: string) => {
    try {
      await updateDoc(doc(db, "messages", id), { read: true });
    } catch (err) {
      console.error("Failed to mark message read:", err);
      toast.error("Unable to mark message as read.");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "messages", id));
      if (selected === id) setSelected(null);
      toast.success("Message deleted.");
    } catch (err) {
      console.error("Failed to delete message:", err);
      toast.error("Unable to delete message.");
    }
  };

  const unreadCount = messages.filter((m) => !m.read).length;
  const selectedMsg = messages.find((m) => m.id === selected);

  const formatDate = (ts: any) => {
    if (!ts) return "—";
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 h-full flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-foreground tracking-tight">
            Messages
          </h1>
          <p className="text-sm text-slate-500 dark:text-muted-foreground mt-0.5">
            {loading ? "Loading…" : `${messages.length} total · ${unreadCount} unread`}
          </p>
        </div>
        {unreadCount > 0 && (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 text-primary text-xs font-bold px-3 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
            {unreadCount} new
          </span>
        )}
      </div>

      {errorMessage ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center py-16">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-100 dark:bg-muted">
            <Inbox className="h-9 w-9 text-slate-400 dark:text-muted-foreground" />
          </div>
          <div>
            <p className="font-bold text-slate-700 dark:text-foreground/90">{errorMessage}</p>
            <p className="text-sm text-slate-400 dark:text-muted-foreground mt-1">Please log in with an admin account and refresh the page.</p>
          </div>
        </div>
      ) : loading ? (
        <div className="flex-1 flex items-center justify-center">
          <RefreshCw className="h-6 w-6 animate-spin text-slate-400" />
        </div>
      ) : messages.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center py-16">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-100 dark:bg-muted">
            <Inbox className="h-9 w-9 text-slate-400 dark:text-muted-foreground" />
          </div>
          <div>
            <p className="font-bold text-slate-700 dark:text-foreground/90">No messages yet</p>
            <p className="text-sm text-slate-400 dark:text-muted-foreground mt-1">Messages from the contact form will appear here.</p>
          </div>
        </div>
      ) : (
        <div className="flex-1 grid lg:grid-cols-5 gap-4 min-h-0 overflow-hidden">
          {/* Message list */}
          <div className="lg:col-span-2 flex flex-col gap-2 overflow-y-auto pr-1">
            <AnimatePresence initial={false}>
              {messages.map((msg) => (
                <motion.button
                  key={msg.id}
                  layout
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  onClick={() => { setSelected(msg.id); markRead(msg.id); }}
                  className={`w-full text-left rounded-2xl border p-4 transition-all hover:shadow-md ${
                    selected === msg.id
                      ? "border-primary/40 bg-primary/5 shadow-md"
                      : msg.read
                      ? "border-border bg-card hover:border-primary/20"
                      : "border-primary/20 bg-primary/5"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative shrink-0">
                      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-slate-200 to-slate-100 dark:from-muted dark:to-muted/60 text-slate-600 dark:text-muted-foreground font-black text-sm">
                        {msg.firstName?.[0] || "?"}
                      </div>
                      {!msg.read && (
                        <span className="absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-primary border-2 border-card" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className={`text-sm font-bold truncate ${msg.read ? "text-slate-700 dark:text-foreground/90" : "text-slate-900 dark:text-foreground"}`}>
                          {msg.firstName} {msg.lastName}
                        </p>
                        {!msg.read ? (
                          <Mail className="h-3.5 w-3.5 text-primary shrink-0" />
                        ) : (
                          <MailOpen className="h-3.5 w-3.5 text-slate-300 dark:text-muted-foreground/40 shrink-0" />
                        )}
                      </div>
                      <p className="text-xs text-slate-400 dark:text-muted-foreground/80 truncate">{msg.email}</p>
                      <p className="text-xs text-slate-500 dark:text-muted-foreground mt-1 line-clamp-2 leading-relaxed">{msg.message}</p>
                    </div>
                  </div>
                </motion.button>
              ))}
            </AnimatePresence>
          </div>

          {/* Message detail */}
          <div className="lg:col-span-3 flex flex-col">
            <AnimatePresence mode="wait">
              {selectedMsg ? (
                <motion.div
                  key={selectedMsg.id}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -12 }}
                  className="h-full rounded-3xl border border-border bg-card p-5 sm:p-7 flex flex-col gap-5"
                >
                  {/* Detail header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-primary/5 text-primary font-black text-lg">
                        {selectedMsg.firstName?.[0] || "?"}
                      </div>
                      <div>
                        <p className="font-black text-slate-900 dark:text-foreground">
                          {selectedMsg.firstName} {selectedMsg.lastName}
                        </p>
                        <a
                          href={`mailto:${selectedMsg.email}`}
                          className="text-sm text-primary hover:underline break-all"
                        >
                          {selectedMsg.email}
                        </a>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(selectedMsg.id)}
                      className="shrink-0 rounded-xl text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Date */}
                  <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    {formatDate(selectedMsg.createdAt)}
                  </div>

                  <hr className="border-border" />

                  {/* Message body */}
                  <div className="flex-1 overflow-y-auto">
                    <p className="text-sm sm:text-base text-slate-700 dark:text-foreground/90 whitespace-pre-wrap leading-relaxed">
                      {selectedMsg.message}
                    </p>
                  </div>

                  {/* Reply */}
                  <a
                    href={`mailto:${selectedMsg.email}?subject=Re: BiteBuzz Contact&body=Hi ${selectedMsg.firstName},%0D%0A%0D%0A`}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground px-5 py-2.5 text-sm font-semibold hover:bg-primary/90 transition-all hover:scale-[1.02] w-full sm:w-auto"
                  >
                    <Mail className="h-4 w-4" /> Reply via Email
                  </a>
                </motion.div>
              ) : (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full hidden lg:flex flex-col items-center justify-center gap-4 text-center rounded-3xl border border-dashed border-border bg-card/50 p-10"
                >
                  <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 dark:bg-muted">
                    <User className="h-8 w-8 text-slate-400 dark:text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-bold text-slate-600 dark:text-foreground/80">Select a message</p>
                    <p className="text-xs text-slate-400 dark:text-muted-foreground mt-1">Click a message on the left to read it</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMessages;
