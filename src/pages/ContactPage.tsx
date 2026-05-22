import { Mail, Phone, MessageCircle, Video, Send } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const ContactPage = () => {
  const contactMethods = [
    {
      id: "email",
      name: "Email",
      value: "contact@bitebuzz.com",
      icon: <Mail className="h-6 w-6" />,
      link: "mailto:contact@bitebuzz.com",
      color: "text-blue-500",
      bg: "bg-blue-50 dark:bg-blue-500/10",
    },
    {
      id: "phone",
      name: "Phone Number",
      value: "+1 (555) 123-4567",
      icon: <Phone className="h-6 w-6" />,
      link: "tel:+15551234567",
      color: "text-green-500",
      bg: "bg-green-50 dark:bg-green-500/10",
    },
    {
      id: "telegram",
      name: "Telegram",
      value: "@bitebuzz_support",
      icon: <MessageCircle className="h-6 w-6" />,
      link: "https://t.me/bitebuzz_support",
      color: "text-sky-500",
      bg: "bg-sky-50 dark:bg-sky-500/10",
    },
    {
      id: "tiktok",
      name: "TikTok",
      value: "@bitebuzz",
      icon: <Video className="h-6 w-6" />,
      link: "https://tiktok.com/@bitebuzz",
      color: "text-pink-500",
      bg: "bg-pink-50 dark:bg-pink-500/10",
    },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Message sent successfully! We will get back to you soon.");
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] w-full overflow-hidden bg-background px-4 py-12 sm:px-6 lg:px-8">
      {/* Decorative background blobs */}
      <div className="pointer-events-none absolute left-1/2 top-0 -z-10 -translate-x-1/2 blur-3xl xl:-top-6 opacity-40">
        <div className="aspect-[1155/678] w-[72.1875rem] bg-gradient-to-tr from-orange-400 to-rose-400" style={{ clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)' }}></div>
      </div>

      <div className="mx-auto max-w-7xl">
        <div className="text-center mb-16">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-display text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl mb-6"
          >
            Get in Touch
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-lg leading-8 text-muted-foreground max-w-2xl mx-auto"
          >
            We'd love to hear from you. Whether you have a question about our menu, pricing, or anything else, our team is ready to answer all your questions.
          </motion.p>
        </div>

        <div className="grid lg:grid-cols-3 gap-10 items-start">
          {/* Contact Form */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-2 rounded-3xl border border-border bg-card/60 backdrop-blur-xl p-8 sm:p-10 shadow-2xl"
          >
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="firstName" className="text-sm font-semibold text-foreground">First name</label>
                  <input type="text" id="firstName" required className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/60" placeholder="John" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="lastName" className="text-sm font-semibold text-foreground">Last name</label>
                  <input type="text" id="lastName" required className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/60" placeholder="Doe" />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-semibold text-foreground">Email</label>
                <input type="email" id="email" required className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all placeholder:text-muted-foreground/60" placeholder="john@example.com" />
              </div>
              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-semibold text-foreground">Message</label>
                <textarea id="message" required rows={5} className="w-full rounded-xl border border-border bg-background/50 px-4 py-3 text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none placeholder:text-muted-foreground/60" placeholder="How can we help you?"></textarea>
              </div>
              <Button type="submit" size="lg" className="w-full rounded-xl text-md font-semibold gap-2 mt-2 h-14 bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5">
                <Send className="h-5 w-5" />
                Send Message
              </Button>
            </form>
          </motion.div>

          {/* Contact Methods */}
          <div className="space-y-6">
            {contactMethods.map((method, index) => (
              <motion.a
                href={method.link}
                target="_blank"
                rel="noopener noreferrer"
                key={method.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * (index + 2) }}
                className="group flex items-center gap-6 rounded-3xl border border-border bg-card/80 backdrop-blur-sm p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:border-primary/20"
              >
                <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl ${method.bg} ${method.color} transition-transform group-hover:scale-110 group-hover:rotate-3`}>
                  {method.icon}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{method.name}</h3>
                  <p className="text-muted-foreground mt-1 text-sm font-medium">{method.value}</p>
                </div>
              </motion.a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
