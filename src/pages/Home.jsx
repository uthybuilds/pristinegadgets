import { useState, useEffect } from "react";
import Hero from "../components/home/Hero";
import PromoSection from "../components/home/PromoSection";
import FAQ from "../components/home/FAQ";
import { supabase } from "../lib/supabase";
import { formatCurrency } from "../utils/helpers";

// Local Assets
import smartphoneImg from "../assets/categories/smartphone.jpg";
import tabletImg from "../assets/categories/tablet.jpg";
import laptopImg from "../assets/categories/laptop.jpg";
import watchImg from "../assets/categories/watch.jpg";
import audioImg from "../assets/categories/audio.jpg";

import {
  ArrowRight,
  Smartphone,
  Tablet,
  Laptop,
  Watch,
  Headphones,
  Zap,
  ShieldCheck,
  Truck,
  Globe,
  Loader,
  ShoppingBag,
  CreditCard,
  Star,
  User,
  CheckCircle,
} from "lucide-react";
import { Link } from "react-router-dom";

const categories = [
  {
    name: "Smartphones",
    icon: Smartphone,
    image: smartphoneImg,
    colSpan: "col-span-1 md:col-span-2",
    rowSpan: "md:row-span-2",
    description: "iPhone 17 Pro Max & Future Flagships",
  },
  {
    name: "Tablets",
    icon: Tablet,
    image: tabletImg,
    colSpan: "col-span-1 md:col-span-2",
    rowSpan: "row-span-1",
    description: "iPad Pro M5 & OLED Displays",
  },
  {
    name: "Laptops",
    icon: Laptop,
    image: laptopImg,
    colSpan: "col-span-1 md:col-span-2",
    rowSpan: "row-span-1",
    description: "MacBook Pro M5",
  },
  {
    name: "Watches",
    icon: Watch,
    image: watchImg,
    colSpan: "col-span-1 md:col-span-2",
    rowSpan: "row-span-1",
    description: "Apple Watch Ultra 3",
  },
  {
    name: "Audio",
    icon: Headphones,
    image: audioImg,
    colSpan: "col-span-1 md:col-span-2",
    rowSpan: "row-span-1",
    description: "AirPods Max 2",
  },
];

const features = [
  {
    icon: ShieldCheck,
    title: "100% Authentic",
    desc: "Every device is rigorously tested and certified pristine.",
  },
  {
    icon: Truck,
    title: "Express Delivery",
    desc: "Same-day dispatch for orders placed before 2 PM.",
  },
  {
    icon: Globe,
    title: "Global Standards",
    desc: "Sourced directly from top-tier international suppliers.",
  },
  {
    icon: CreditCard,
    title: "Secure Payment",
    desc: "Multiple encrypted payment options for your total peace of mind.",
  },
  {
    icon: Headphones,
    title: "Expert Support",
    desc: "24/7 dedicated tech specialists ready to assist your every need.",
  },
  {
    icon: Star,
    title: "Elite Warranty",
    desc: "Comprehensive coverage plans on all premium devices.",
  },
];

export default function Home() {
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNewArrivals();
  }, []);

  const fetchNewArrivals = async () => {
    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(4);

      if (error) throw error;
      setNewArrivals(data || []);
    } catch (error) {
      console.error("Error fetching new arrivals:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 overflow-x-hidden">
      <Hero />

      {/* Brand Navigation Filter */}
      <div className="bg-white border-y border-gray-100 py-6 overflow-hidden sticky top-[72px] z-30 backdrop-blur-md bg-white/80">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-8 md:gap-12 items-center overflow-x-auto no-scrollbar pb-2 md:justify-center">
            {[
              "APPLE",
              "SAMSUNG",
              "SONY",
              "GOOGLE",
              "DELL",
              "HP",
              "BOSE",
              "MICROSOFT",
            ].map((brand) => (
              <Link
                key={brand}
                to={`/shop?brand=${brand}`}
                className="text-sm md:text-base font-bold font-mono text-gray-400 hover:text-purple-600 transition-colors whitespace-nowrap relative group"
              >
                {brand}
                <span className="absolute -bottom-2 left-0 w-0 h-0.5 bg-purple-600 transition-all group-hover:w-full" />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Featured / New Arrivals - MOVED TO TOP */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center text-center mb-16">
            <span className="px-4 py-1 rounded-full bg-purple-100 text-purple-600 text-sm font-bold mb-4">
              New Arrivals
            </span>
            <h2 className="text-4xl font-black text-gray-900">
              Fresh from the Lab
            </h2>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <Loader className="animate-spin text-purple-600" size={40} />
            </div>
          ) : newArrivals.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {newArrivals.map((product) => (
                <Link
                  key={product.id}
                  to={`/product/${product.id}`}
                  className="group bg-white rounded-3xl p-4 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 relative overflow-hidden"
                >
                  <div className="absolute top-4 left-4 z-10">
                    <span className="px-3 py-1 bg-black/5 backdrop-blur-md rounded-full text-xs font-bold text-gray-900">
                      New
                    </span>
                  </div>
                  <div className="h-64 bg-gray-100 rounded-2xl mb-4 relative overflow-hidden flex items-center justify-center">
                    {product.images?.[0] ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                      />
                    ) : (
                      <Smartphone size={48} className="text-gray-300" />
                    )}
                  </div>
                  <div className="px-2">
                    <div className="text-xs font-bold text-purple-600 mb-1 uppercase tracking-wider">
                      {product.category}
                    </div>
                    <h3 className="font-bold text-gray-900 text-lg mb-2 truncate">
                      {product.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xl text-gray-900">
                        {formatCurrency(product.price)}
                      </span>
                      <button className="w-10 h-10 rounded-full bg-gray-900 text-white flex items-center justify-center hover:bg-purple-600 transition-colors">
                        <ArrowRight size={18} />
                      </button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-3xl border border-gray-100 border-dashed">
              <p className="text-gray-500">Check back soon for new arrivals!</p>
            </div>
          )}

          <div className="text-center mt-12">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-purple-600 transition-colors"
            >
              View All Arrivals <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </section>

      {/* Bento Grid Categories */}
      <section className="py-24 px-4 bg-gray-50 relative">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
            <div>
              <span className="text-purple-600 font-bold tracking-wider uppercase text-sm">
                Curated Collection
              </span>
              <h2 className="text-4xl md:text-5xl font-black text-gray-900 mt-2 tracking-tight">
                Explore by Category
              </h2>
            </div>
            <Link
              to="/shop"
              className="group flex items-center gap-2 text-gray-900 font-bold hover:text-purple-600 transition-colors"
            >
              View Full Catalog{" "}
              <ArrowRight
                size={20}
                className="group-hover:translate-x-1 transition-transform"
              />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-6 md:grid-rows-2 gap-4 md:gap-6 h-auto md:h-[500px] lg:h-[600px]">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                to={`/shop?category=${cat.name.toLowerCase()}`}
                className={`h-48 md:h-auto ${cat.colSpan} ${cat.rowSpan} group relative overflow-hidden rounded-2xl md:rounded-3xl bg-gray-100 shadow-sm hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-500`}
              >
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors z-10" />
                <img
                  src={cat.image}
                  alt={cat.name}
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700 will-change-transform"
                />
                <div className="absolute bottom-0 left-0 p-8 z-20 w-full">
                  <div className="flex items-center gap-3 mb-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white">
                      <cat.icon size={20} />
                    </div>
                    <span className="text-white font-bold text-xl">
                      {cat.name}
                    </span>
                  </div>
                  <p className="text-white/80 text-sm opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 delay-100">
                    {cat.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 px-4 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-purple-600 font-bold tracking-wider uppercase text-sm">
              Simple Process
            </span>
            <h2 className="text-3xl md:text-5xl font-black text-gray-900 mt-2 mb-4">
              How It Works
            </h2>
            <p className="text-gray-600 text-lg">
              Getting your dream gadget is as easy as 1-2-3.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gray-200 z-0" />

            {[
              {
                icon: ShoppingBag,
                title: "1. Select Gadget",
                desc: "Browse our collection of pristine devices and add to cart.",
              },
              {
                icon: CreditCard,
                title: "2. Make Payment",
                desc: "Pay securely via Bank Transfer and upload proof.",
              },
              {
                icon: Truck,
                title: "3. Fast Delivery",
                desc: "We deliver to your doorstep in Lagos (24h) or Nationwide (48h).",
              },
            ].map((step, idx) => (
              <div
                key={idx}
                className="relative z-10 flex flex-col items-center text-center group"
              >
                <div className="w-24 h-24 bg-white rounded-full border-4 border-gray-100 flex items-center justify-center text-purple-600 shadow-sm mb-6 group-hover:border-purple-100 group-hover:scale-110 transition-all duration-300">
                  <step.icon size={40} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">
                  {step.title}
                </h3>
                <p className="text-gray-500 max-w-xs mx-auto">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Promo Section */}
      <PromoSection />

      {/* Why Choose Us */}
      <section className="py-32 px-4 bg-gray-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-600/20 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-600/20 rounded-full blur-[100px] mix-blend-screen" />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center max-w-2xl mx-auto mb-20">
            <h2 className="text-3xl md:text-5xl font-black mb-6">
              Why the Elites Choose Pristine.
            </h2>
            <p className="text-gray-400 text-lg">
              We don't just sell gadgets. We curate an experience of excellence,
              speed, and trust.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="p-8 rounded-3xl bg-white/5 backdrop-blur-lg border border-white/10 hover:bg-white/10 transition-colors group"
              >
                <div className="w-14 h-14 rounded-2xl bg-purple-600/20 flex items-center justify-center text-purple-400 mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon size={32} />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-24 px-4 bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
              What Our Customers Say
            </h2>
            <div className="flex justify-center gap-1 text-yellow-400">
              <Star fill="currentColor" size={24} />
              <Star fill="currentColor" size={24} />
              <Star fill="currentColor" size={24} />
              <Star fill="currentColor" size={24} />
              <Star fill="currentColor" size={24} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: "Tunde A.",
                location: "Lagos, Nigeria",
                text: "The delivery was insane! Ordered by 10am, got my iPhone 15 Pro Max by 4pm same day. Pristine is the real deal.",
              },
              {
                name: "Chioma O.",
                location: "Abuja, Nigeria",
                text: "I was skeptical about paying before delivery, but their reputation speaks for itself. Device came sealed and perfect.",
              },
              {
                name: "Emeka K.",
                location: "Port Harcourt",
                text: "Customer service is top notch. They helped me transfer my data and set up my new MacBook. Highly recommended!",
              },
            ].map((review, idx) => (
              <div key={idx} className="bg-gray-50 p-8 rounded-3xl relative">
                <div className="absolute top-8 right-8 text-purple-200">
                  <CheckCircle size={40} />
                </div>
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 font-bold text-lg">
                    {review.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900">{review.name}</h4>
                    <p className="text-xs text-gray-500">{review.location}</p>
                  </div>
                </div>
                <p className="text-gray-600 leading-relaxed">"{review.text}"</p>
                <div className="flex gap-1 text-yellow-400 mt-4">
                  <Star fill="currentColor" size={16} />
                  <Star fill="currentColor" size={16} />
                  <Star fill="currentColor" size={16} />
                  <Star fill="currentColor" size={16} />
                  <Star fill="currentColor" size={16} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <FAQ />
    </div>
  );
}
