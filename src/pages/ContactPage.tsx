import { useState, useRef } from "react";
import { Mail, Phone, MessageCircle, Video, Send, Loader2, CheckCircle2, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { db } from "@/firebase/config";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const WEB3FORMS_KEY = "2c57d802-361f-42d5-9df3-74b7bc1abbcf";


const ContactPage = () => {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const form = e.currentTarget;
    const firstName = (form.elements.namedItem("firstName") as HTMLInputElement).value.trim();
    const lastName = (form.elements.namedItem("lastName") as HTMLInputElement).value.trim();
    const email = (form.elements.namedItem("email") as HTMLInputElement).value.trim();
    const message = (form.elements.namedItem("message") as HTMLTextAreaElement).value.trim();

    try {
      // 1. Save to Firebase Firestore
      await addDoc(collection(db, "messages"), {
        firstName,
        lastName,
        email,
        message,
        read: false,
        createdAt: serverTimestamp(),
      });

      // 2. Send email via Web3Forms
      await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          name: `${firstName} ${lastName}`,
          email,
          message,
          subject: `New Contact Message from ${firstName} ${lastName} — BiteBuzz`,
        }),
      });

      setSent(true);
      formRef.current?.reset();
      toast.success("Message sent! We'll get back to you soon.");
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] w-full overflow-hidden bg-background px-4 py-10 sm:py-16 sm:px-6 lg:px-8">
      {/* Decorative blob */}
      <div className="pointer-events-none absolute left-1/2 top-0 -z-10 -translate-x-1/2 blur-3xl opacity-30">
        <div
          className="aspect-[1155/678] w-[40rem] sm:w-[72rem] bg-gradient-to-tr from-orange-400 to-rose-400"
          style={{ clipPath: "polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)" }}
        />
      </div>

      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-14">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground mb-4"
          >
            Get in Touch
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-base sm:text-lg leading-relaxed text-muted-foreground max-w-2xl mx-auto"
          >
            Have a question, feedback, or just want to say hi? We'd love to hear from you. Fill in the form or reach out directly.
          </motion.p>
        </div>

        {/* Contact method cards */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-10 sm:mb-14"
        >
          {contactMethods.map((method) => (
            <a
              key={method.id}
              href={method.link}
              target="_blank"
              rel="noopener noreferrer"
              className={`group flex flex-col items-center gap-3 rounded-2xl border border-border bg-card/80 backdrop-blur-sm p-4 sm:p-5 text-center shadow-sm transition-all hover:-translate-y-1 hover:shadow-lg ${method.border}`}
            >
              <div className={`flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl ${method.bg} ${method.color} transition-transform group-hover:scale-110`}>
                {method.icon}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-0.5">{method.name}</p>
                <p className={`text-xs sm:text-sm font-semibold ${method.color} break-all leading-snug`}>{method.value}</p>
              </div>
              <ExternalLink className="h-3 w-3 text-muted-foreground/40 group-hover:text-muted-foreground transition-colors" />
            </a>
          ))}
        </motion.div>

        {/* Contact Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="mx-auto max-w-2xl rounded-3xl border border-border bg-card/60 backdrop-blur-xl p-6 sm:p-10 shadow-2xl"
        >
          {sent ? (
            <div className="flex flex-col items-center justify-center gap-5 py-10 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50 dark:bg-emerald-500/10">
                <CheckCircle2 className="h-10 w-10 text-emerald-500" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">Message Sent!</h2>
                <p className="text-muted-foreground text-sm sm:text-base">Thanks for reaching out. We'll get back to you very soon.</p>
              </div>
              <Button
                variant="outline"
                onClick={() => setSent(false)}
                className="rounded-xl mt-2"
              >
                Send another message
              </Button>
            </div>
          ) : (
            <>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-6">Send us a Message</h2>
              <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div className="grid sm:grid-cols-2 gap-4 sm:gap-5">
                  <div className="space-y-1.5">
                    <label htmlFor="firstName" className="text-sm font-semibold text-foreground">First name</label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      required
                      className="w-full rounded-xl border border-border bg-background/60 px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/50"
                      placeholder="John"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="lastName" className="text-sm font-semibold text-foreground">Last name</label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      required
                      className="w-full rounded-xl border border-border bg-background/60 px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/50"
                      placeholder="Doe"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="email" className="text-sm font-semibold text-foreground">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    required
                    className="w-full rounded-xl border border-border bg-background/60 px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/50"
                    placeholder="john@example.com"
                  />
                </div>
                <div className="space-y-1.5">
                  <label htmlFor="message" className="text-sm font-semibold text-foreground">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={5}
                    className="w-full rounded-xl border border-border bg-background/60 px-4 py-3 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none placeholder:text-muted-foreground/50"
                    placeholder="How can we help you?"
                  />
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-13 rounded-xl font-semibold gap-2 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5 disabled:opacity-60 disabled:translate-y-0"
                >
                  {loading ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Sending…</>
                  ) : (
                    <><Send className="h-4 w-4" /> Send Message</>
                  )}
                </Button>
              </form>
            </>
          )}
        </motion.div>
      </div>
    </div>
  );
};
<h4 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4">Contact Direct</h4>
const contactMethods = [
  {
    id: "email",
    name: "Email",
    value: "kedirmundino05@gmail.com",
    icon: <Mail className="h-5 w-5" />,
    link: "mailto:kedirmundino05@gmail.com",
    color: "text-blue-500",
    bg: "bg-blue-50 dark:bg-blue-500/10",
    border: "hover:border-blue-200 dark:hover:border-blue-500/30",
  },
  {
    id: "phone",
    name: "Phone",
    value: "0994514333",
    icon: <Phone className="h-5 w-5" />,
    link: "tel:0994514333",
    color: "text-emerald-500",
    bg: "bg-emerald-50 dark:bg-emerald-500/10",
    border: "hover:border-emerald-200 dark:hover:border-emerald-500/30",
  },
  {
    id: "telegram",
    name: "Telegram",
    value: "@kedirhala",
    icon: <MessageCircle className="h-5 w-5" />,
    link: "https://t.me/kedirhala",
    color: "text-sky-500",
    bg: "bg-sky-50 dark:bg-sky-500/10",
    border: "hover:border-sky-200 dark:hover:border-sky-500/30",
  },
  {
    id: "tiktok",
    name: "TikTok",
    value: "@ohhsheet2",
    icon: <Video className="h-5 w-5" />,
    link: "https://tiktok.com/@ohhsheet2",
    color: "text-pink-500",
    bg: "bg-pink-50 dark:bg-pink-500/10",
    border: "hover:border-pink-200 dark:hover:border-pink-500/30",
  },
];


export default ContactPage;
