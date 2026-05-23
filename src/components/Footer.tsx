import { Link, useLocation } from "react-router-dom";
import { ChefHat, Mail, Phone, MessageCircle, Video } from "lucide-react";

const Footer = () => {
  const location = useLocation();

  if (location.pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="border-t border-border bg-card mt-auto">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10">

          {/* Brand */}
          <div className="flex flex-col gap-4 sm:col-span-2 lg:col-span-1">
            <Link to="/" className="flex items-center gap-2 w-fit">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-warm shrink-0">
                <ChefHat className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-display text-xl font-bold text-foreground">BiteBuzz</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Delivering happiness and delicious food right to your doorstep. Fresh ingredients, bold flavours.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="mb-4 text-sm font-bold text-foreground uppercase tracking-wider">Quick Links</h3>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li><Link to="/" className="hover:text-primary transition-colors">Menu</Link></li>
              <li><Link to="/cart" className="hover:text-primary transition-colors">Cart</Link></li>
              <li><Link to="/orders" className="hover:text-primary transition-colors">My Orders</Link></li>
              <li><Link to="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="mb-4 text-sm font-bold text-foreground uppercase tracking-wider">Contact</h3>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li>
                <a href="mailto:kedirmundino05@gmail.com" className="flex items-center gap-2 hover:text-primary transition-colors break-all">
                  <Mail className="h-4 w-4 shrink-0" />
                  <span>kedirmundino05@gmail.com</span>
                </a>
              </li>
              <li>
                <a href="tel:0994514333" className="flex items-center gap-2 hover:text-primary transition-colors">
                  <Phone className="h-4 w-4 shrink-0" />
                  <span>0994514333</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="mb-4 text-sm font-bold text-foreground uppercase tracking-wider">Follow Us</h3>
            <div className="flex flex-wrap gap-3">
              <a
                href="https://tiktok.com/@ohhsheet2"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-xl bg-muted px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all hover:scale-105"
              >
                <Video className="h-4 w-4 shrink-0" />
                <span>@ohhsheet2</span>
              </a>
              <a
                href="https://t.me/kedirhala"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 rounded-xl bg-muted px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all hover:scale-105"
              >
                <MessageCircle className="h-4 w-4 shrink-0" />
                <span>@kedirhala</span>
              </a>
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="mt-10 border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-muted-foreground">
          <span>&copy; {new Date().getFullYear()} BiteBuzz. All rights reserved.</span>
          <span className="text-center sm:text-right">Made with ❤️ for great food experiences</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
