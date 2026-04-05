import { motion } from "framer-motion";
import { ArrowDown } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden gradient-hero py-20 md:py-28">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-background/30 blur-3xl" />
        <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-background/20 blur-3xl" />
      </div>

      <div className="container relative z-10 px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="max-w-xl text-center sm:max-w-2xl sm:text-left"
        >
          <h1 className="font-display text-3xl font-extrabold leading-tight text-primary-foreground sm:text-4xl md:text-6xl">
            Delicious food,
            <br />
            delivered <span className="italic">fast.</span>
          </h1>
          <p className="mt-4 max-w-md text-base text-primary-foreground/80 sm:max-w-lg sm:text-lg md:text-xl">
            Fresh meals from top restaurants, straight to your door. Browse our curated menu and order in seconds.
          </p>
          <motion.a
            href="#menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-card px-4 py-2 text-sm font-semibold text-foreground shadow-elevated transition-transform hover:scale-105 sm:mt-8 sm:px-6 sm:py-3 sm:text-base"
          >
            Browse Menu <ArrowDown className="h-4 w-4" />
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
