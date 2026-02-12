import { Link } from "react-router-dom";
import { useToast } from "../../context/ToastContext";
import {
  Facebook,
  Twitter,
  Instagram,
  Mail,
  MapPin,
  Phone,
  MessageCircle,
} from "lucide-react";
import logo from "../../assets/pristinegadgetlogo.jpeg";

export default function Footer() {
  const { info } = useToast();

  const handleSocialClick = (platform) => {
    const socialLinks = {
      instagram: "https://instagram.com/pristinegadgets",
      twitter: "https://twitter.com/Maleeqprime",
      whatsapp: "https://wa.me/2347034025834",
    };

    if (socialLinks[platform]) {
      window.open(socialLinks[platform], "_blank");
    } else {
      info("Social media page coming soon!");
    }
  };

  return (
    <footer className="bg-white border-t border-gray-100 pt-16 pb-24 md:pb-16">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12">
        {/* Brand */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl overflow-hidden shadow-sm">
              <img
                src={logo}
                alt="Pristine Gadgets"
                className="w-full h-full object-cover"
              />
            </div>
            <span className="font-bold text-xl text-gray-900">
              Pristine Gadgets
            </span>
          </div>
          <p className="text-gray-500 text-sm leading-relaxed">
            Your premium destination for the latest gadgets. Quality, speed, and
            futuristic tech at your fingertips.
          </p>
        </div>

        {/* Links */}
        <div>
          <h3 className="font-bold text-gray-900 mb-4">Shop</h3>
          <ul className="space-y-2 text-sm text-gray-500">
            <li>
              <Link
                to="/shop"
                className="hover:text-primary-600 transition-colors"
              >
                All Products
              </Link>
            </li>
            <li>
              <Link
                to="/shop?category=smartphones"
                className="hover:text-primary-600 transition-colors"
              >
                Smartphones
              </Link>
            </li>
            <li>
              <Link
                to="/shop?category=tablets"
                className="hover:text-primary-600 transition-colors"
              >
                Tablets
              </Link>
            </li>
            <li>
              <Link
                to="/shop?category=laptops"
                className="hover:text-primary-600 transition-colors"
              >
                Laptops
              </Link>
            </li>
            <li>
              <Link
                to="/shop?category=watches"
                className="hover:text-primary-600 transition-colors"
              >
                Watches
              </Link>
            </li>
            <li>
              <Link
                to="/shop?category=accessories"
                className="hover:text-primary-600 transition-colors"
              >
                Accessories
              </Link>
            </li>
          </ul>
        </div>

        {/* Support */}
        <div>
          <h3 className="font-bold text-gray-900 mb-4">Support</h3>
          <ul className="space-y-2 text-sm text-gray-500">
            <li>
              <Link
                to="/account"
                className="hover:text-primary-600 transition-colors"
              >
                Track Order
              </Link>
            </li>
            <li>
              <Link
                to="/faq"
                className="hover:text-primary-600 transition-colors"
              >
                FAQs
              </Link>
            </li>
            <li>
              <Link
                to="/contact"
                className="hover:text-primary-600 transition-colors"
              >
                Contact Us
              </Link>
            </li>
            <li>
              <Link
                to="/terms"
                className="hover:text-primary-600 transition-colors"
              >
                Terms of Service
              </Link>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="font-bold text-gray-900 mb-4">Contact</h3>
          <ul className="space-y-3 text-sm text-gray-500">
            <li className="flex items-start gap-2">
              <MapPin
                size={16}
                className="text-primary-600 mt-1 flex-shrink-0"
              />
              <span>3 Oshitelu Street, Computer Village, Ikeja, Lagos</span>
            </li>
            <li className="flex items-center gap-2">
              <Mail size={16} className="text-primary-600" />
              <span>pristinegadgets@gmail.com</span>
            </li>
            <li className="flex items-center gap-2">
              <Phone size={16} className="text-primary-600" />
              <span>07034025834</span>
            </li>
          </ul>
          <div className="flex gap-4 mt-6">
            <button
              onClick={() => handleSocialClick("instagram")}
              className="text-gray-400 hover:text-primary-600 transition-colors"
            >
              <Instagram size={20} />
            </button>
            <button
              onClick={() => handleSocialClick("twitter")}
              className="text-gray-400 hover:text-primary-600 transition-colors"
            >
              <Twitter size={20} />
            </button>
            <button
              onClick={() => handleSocialClick("whatsapp")}
              className="text-gray-400 hover:text-green-500 transition-colors"
              title="WhatsApp"
            >
              <MessageCircle size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-12 pt-8 border-t border-gray-100 text-center text-sm text-gray-400">
        © {new Date().getFullYear()} Pristine Gadgets. All rights reserved.
      </div>
    </footer>
  );
}
