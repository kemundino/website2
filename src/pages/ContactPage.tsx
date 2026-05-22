import { Mail, Phone, MessageCircle, Video } from "lucide-react";
import { motion } from "framer-motion";

const ContactPage = () => {
  const contactMethods = [
    {
      id: "email",
      name: "Email",
      value: "contact@bitebuzz.com",
      icon: <Mail className="h-6 w-6" />,
      link: "mailto:contact@bitebuzz.com",
      color: "text-blue-500",
      bg: "bg-blue-100",
    },
    {
      id: "phone",
      name: "Phone Number",
      value: "+1 (555) 123-4567",
      icon: <Phone className="h-6 w-6" />,
      link: "tel:+15551234567",
      color: "text-green-500",
      bg: "bg-green-100",
    },
    {
      id: "telegram",
      name: "Telegram",
      value: "@bitebuzz_support",
      icon: <MessageCircle className="h-6 w-6" />,
      link: "https://t.me/bitebuzz_support",
      color: "text-sky-500",
      bg: "bg-sky-100",
    },
    {
      id: "tiktok",
      name: "TikTok",
      value: "@bitebuzz",
      icon: <Video className="h-6 w-6" />,
      link: "https://tiktok.com/@bitebuzz",
      color: "text-pink-500",
      bg: "bg-pink-100",
    },
  ];

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
      <div className="text-center mb-12">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="font-display text-4xl font-bold text-foreground mb-4"
        >
          Contact Us
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-lg text-muted-foreground max-w-2xl mx-auto"
        >
          Have questions, feedback, or need support? Reach out to us through any of the channels below.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {contactMethods.map((method, index) => (
          <motion.a
            href={method.link}
            target="_blank"
            rel="noopener noreferrer"
            key={method.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * (index + 1) }}
            className="flex flex-col items-center justify-center p-8 rounded-2xl border border-border bg-card shadow-card transition-transform hover:-translate-y-1 hover:shadow-elevated"
          >
            <div className={`h-16 w-16 rounded-full flex items-center justify-center mb-4 ${method.bg} ${method.color}`}>
              {method.icon}
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">{method.name}</h3>
            <p className="text-muted-foreground font-medium">{method.value}</p>
          </motion.a>
        ))}
      </div>
    </div>
  );
};

export default ContactPage;
