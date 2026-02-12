import { Link, useLocation } from "react-router-dom";
import {
  Home,
  ShoppingBag,
  User,
  ShoppingCart,
  Info,
  Search,
  Scale,
} from "lucide-react";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { cn } from "../../utils/helpers";
import logo from "../../assets/pristinegadgetlogo.jpeg";

export default function Navbar() {
  const { cartCount } = useCart();
  const { user, isAdmin } = useAuth();
  const location = useLocation();

  const navLinks = [
    { name: "Home", path: "/", icon: Home },
    { name: "Shop", path: "/shop", icon: ShoppingBag },
    { name: "Compare", path: "/compare", icon: Scale },
    { name: "About", path: "/about", icon: Info },
    {
      name: user ? (isAdmin ? "Dashboard" : "Account") : "Sign In",
      path: user ? (isAdmin ? "/admin" : "/account") : "/login",
      icon: User,
    },
  ];

  return (
    <>
      {/* Desktop & Mobile Top Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-xl border-b border-gray-200/50 supports-[backdrop-filter]:bg-white/60">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-lg border border-primary-500/30 group-hover:scale-105 transition-transform duration-300">
              <img
                src={logo}
                alt="Pristine Gadgets"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="font-bold text-xl tracking-tight hidden sm:block bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-purple-400">
              Pristine Gadgets
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.name}
                to={link.path}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary-600 flex items-center gap-2",
                  location.pathname === link.path
                    ? "text-primary-600"
                    : "text-gray-600",
                )}
              >
                <link.icon size={18} />
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <Link
              to="/shop"
              className="p-2 hover:bg-primary-50 rounded-full transition-colors text-gray-700 hover:text-primary-600"
            >
              <Search size={24} />
            </Link>
            <Link
              to="/cart"
              className="relative p-2 hover:bg-primary-50 rounded-full transition-colors group"
            >
              <ShoppingCart
                size={24}
                className="text-gray-700 group-hover:text-primary-600 transition-colors"
              />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary-600 text-white text-xs font-bold flex items-center justify-center rounded-full shadow-lg animate-fade-in">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Tab Bar (iOS Style) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 glass border-t border-white/20 pb-safe">
        <div className="flex justify-around items-center h-16">
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.name}
                to={link.path}
                className={cn(
                  "flex flex-col items-center justify-center w-full h-full space-y-1 transition-all duration-300",
                  isActive
                    ? "text-primary-600 scale-110"
                    : "text-gray-400 hover:text-gray-600",
                )}
              >
                <link.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
                <span className="text-[10px] font-medium">{link.name}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
