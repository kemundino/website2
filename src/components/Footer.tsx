import { Link, useLocation } from "react-router-dom";
import { ChefHat, Mail, Phone, MessageCircle, Video } from "lucide-react";

const Footer = () => {
  const location = useLocation();

  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="border-t border-border bg-card py-12 mt-auto">
      <div className="container px-4 sm:px-6 lg:px-8 mx-auto grid gap-8 md:grid-cols-4">
        <div className="flex flex-col gap-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-warm">
              <ChefHat className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display text-xl font-bold text-foreground">BiteBuzz</span>
          </Link>
          <p className="text-sm text-muted-foreground">
            Delivering happiness and delicious food right to your doorstep.
          </p>
        </div>

        <div>
          <h3 className="mb-4 font-bold text-foreground">Quick Links</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/" className="hover:text-primary transition-colors">Menu</Link></li>
            <li><Link to="/cart" className="hover:text-primary transition-colors">Cart</Link></li>
            <li><Link to="/orders" className="hover:text-primary transition-colors">My Orders</Link></li>
            <li><Link to="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="mb-4 font-bold text-foreground">Contact</h3>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-center gap-2"><Mail className="h-4 w-4" /> contact@bitebuzz.com</li>
            <li className="flex items-center gap-2"><Phone className="h-4 w-4" /> +1 (555) 123-4567</li>
          </ul>
        </div>

        <div>
          <h3 className="mb-4 font-bold text-foreground">Follow Us</h3>
          <div className="flex gap-4">
            <a href="https://tiktok.com/@bitebuzz" target="_blank" rel="noopener noreferrer" className="rounded-full bg-muted p-2 text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors">
              <Video className="h-5 w-5" />
            </a>
            <a href="https://t.me/bitebuzz_support" target="_blank" rel="noopener noreferrer" className="rounded-full bg-muted p-2 text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-colors">
              <MessageCircle className="h-5 w-5" />
            </a>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 mt-12 border-t border-border pt-6 text-center text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} BiteBuzz. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
