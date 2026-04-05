import { Star, Clock, Plus } from "lucide-react";
import type { MenuItem } from "@/data/menu";
import { useCart } from "@/context/CartContext";
import { motion } from "framer-motion";
import { toast } from "sonner";

const MenuCard = ({ item }: { item: MenuItem }) => {
  const { addItem } = useCart();

  const handleAdd = () => {
    addItem(item);
    toast.success(`${item.name} added to cart`);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="group relative overflow-hidden rounded-xl border border-border bg-card shadow-card transition-shadow hover:shadow-elevated sm:rounded-2xl"
    >
      <div className="relative aspect-square sm:aspect-[4/3] overflow-hidden">
        <img
          src={item.image}
          alt={item.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {item.isBestseller && (
          <span className="absolute left-3 top-3 rounded-full bg-secondary px-3 py-1 text-xs font-bold text-secondary-foreground">
            🔥 Best
          </span>
        )}
        {item.isVeg && (
          <span className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-sm border-2 border-accent">
            <span className="h-2.5 w-2.5 rounded-full bg-accent" />
          </span>
        )}
      </div>

      <div className="p-3 sm:p-4">
        <div className="mb-1 flex items-start justify-between">
          <h3 className="font-display text-base font-semibold text-foreground sm:text-lg">{item.name}</h3>
          <span className="ml-2 whitespace-nowrap font-body text-sm font-bold text-primary sm:text-lg">
            ${item.price.toFixed(2)}
          </span>
        </div>

        <p className="mb-2 line-clamp-2 text-xs text-muted-foreground sm:mb-3 sm:text-sm">{item.description}</p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Star className="h-3.5 w-3.5 fill-secondary text-secondary" />
              {item.rating}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {item.prepTime}
            </span>
          </div>

          <button
            onClick={handleAdd}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground transition-transform hover:scale-110 active:scale-95"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default MenuCard;
