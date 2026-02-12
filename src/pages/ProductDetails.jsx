import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { formatCurrency, cn, getOptimizedImageUrl } from "../utils/helpers";
import ProductCard from "../components/ui/ProductCard";
import {
  Loader,
  ShoppingBag,
  Truck,
  ShieldCheck,
  ArrowLeft,
  Star,
  Minus,
  Plus,
  Share2,
  MessageCircle,
  Scale,
} from "lucide-react";
// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { success, error } = useToast();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  // Variant selections
  const [selectedColor, setSelectedColor] = useState("");
  const [selectedStorage, setSelectedStorage] = useState("");

  const [recentProducts, setRecentProducts] = useState([]);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("id", id)
          .single();

        if (error) throw error;
        setProduct(data);

        // Set default variants if available
        if (data.features?.colors?.length > 0) {
          setSelectedColor(data.features.colors[0]);
        }
        if (data.features?.storage?.length > 0) {
          setSelectedStorage(data.features.storage[0]);
        }

        // Add to Recently Viewed
        const stored = JSON.parse(
          localStorage.getItem("pristine_recent_views") || "[]",
        );
        const newStored = [id, ...stored.filter((item) => item !== id)].slice(
          0,
          4,
        );
        localStorage.setItem(
          "pristine_recent_views",
          JSON.stringify(newStored),
        );
      } catch (error) {
        console.error("Error fetching product:", error);
        // navigate('/shop'); // Optional: redirect on error
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
    window.scrollTo(0, 0);
  }, [id]);

  // Fetch recently viewed products
  useEffect(() => {
    const fetchRecent = async () => {
      const stored = JSON.parse(
        localStorage.getItem("pristine_recent_views") || "[]",
      );
      const otherIds = stored.filter((item) => item !== id);

      if (otherIds.length > 0) {
        const { data } = await supabase
          .from("products")
          .select("*")
          .in("id", otherIds);
        if (data) setRecentProducts(data);
      }
    };
    fetchRecent();
  }, [id]);

  const handleWhatsAppBuy = () => {
    if (!product) return;
    const message = `Hi, I want to buy the ${product.name} (Storage: ${selectedStorage || "N/A"}, Color: ${selectedColor || "N/A"}). Price: ${formatCurrency(product.price * quantity)}`;
    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/2347034025834?text=${encodedMessage}`, "_blank");
  };

  const handleAddToCompare = () => {
    const compareList = JSON.parse(
      localStorage.getItem("pristine_compare_list") || "[]",
    );
    if (compareList.includes(product.id)) {
      success("Already in comparison list");
      return;
    }
    if (compareList.length >= 4) {
      success("You can only compare up to 4 devices");
      return;
    }
    localStorage.setItem(
      "pristine_compare_list",
      JSON.stringify([...compareList, product.id]),
    );
    success("Added to comparison");
    navigate("/compare");
  };

  const handleAddToCart = () => {
    if (!product) return;

    if (product.stock === 0) {
      error("This product is out of stock!");
      return;
    }

    const wasAdded = addToCart(
      product,
      {
        color: selectedColor,
        storage: selectedStorage,
      },
      quantity,
    );

    if (wasAdded) {
      success("Added to cart successfully!");
    } else {
      error(`Cannot add more. Only ${product.stock} items left in stock.`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <Loader className="w-8 h-8 text-purple-600 animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pt-20">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Product not found
        </h2>
        <button
          onClick={() => navigate("/shop")}
          className="px-6 py-2 bg-purple-600 text-white rounded-full hover:bg-purple-700 transition-colors"
        >
          Back to Shop
        </button>
      </div>
    );
  }

  const images = product.images || [];
  const colors = product.features?.colors || [];
  const storage = product.features?.storage || [];
  const specs = product.features?.specs || {};

  return (
    <div className="pt-24 pb-16 min-h-screen bg-gray-50">
      {/* Sticky Mobile Buy Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 p-4 z-50 flex items-center gap-3 shadow-[0_-4px_10px_rgba(0,0,0,0.05)]">
        <div className="flex items-center border border-gray-200 rounded-xl bg-gray-50 h-12">
          <button
            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
            className="px-3 hover:text-purple-600 transition-colors"
          >
            <Minus size={16} />
          </button>
          <span className="w-8 text-center font-bold text-sm">{quantity}</span>
          <button
            onClick={() => setQuantity((q) => q + 1)}
            className="px-3 hover:text-purple-600 transition-colors"
          >
            <Plus size={16} />
          </button>
        </div>
        <button
          onClick={handleAddToCart}
          disabled={product.stock === 0}
          className={cn(
            "flex-1 h-12 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-purple-200 active:scale-95",
            product.stock > 0
              ? "bg-purple-600 text-white"
              : "bg-gray-200 text-gray-400 cursor-not-allowed",
          )}
        >
          <ShoppingBag size={18} />
          {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
        </button>
      </div>

      <div className="container mx-auto px-4 max-w-7xl">
        {/* Breadcrumb / Back */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 hover:text-purple-600 mb-8 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>Back</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Image Gallery */}
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="aspect-square bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 relative group flex items-center justify-center"
            >
              {images[activeImage] ? (
                <img
                  src={getOptimizedImageUrl(images[activeImage], "detail")}
                  alt={product.name}
                  className="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <ShoppingBag size={64} className="text-gray-300" />
              )}
              <div className="absolute top-4 right-4 z-10">
                <button className="p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-white text-gray-600 hover:text-purple-600 transition-all">
                  <Share2 size={20} />
                </button>
              </div>
            </motion.div>

            {images.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(idx)}
                    className={cn(
                      "w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden border-2 transition-all bg-white p-1",
                      activeImage === idx
                        ? "border-purple-600 scale-105"
                        : "border-transparent hover:border-gray-200",
                    )}
                  >
                    <img
                      src={getOptimizedImageUrl(img, "card")}
                      alt={`${product.name} ${idx + 1}`}
                      className="w-full h-full object-contain"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-8">
            <div className="space-y-6">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  {product.brand && (
                    <span className="px-3 py-1 bg-purple-50 text-purple-600 text-xs font-bold rounded-full uppercase tracking-wider">
                      {product.brand}
                    </span>
                  )}
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-bold uppercase tracking-wider rounded-full">
                    {product.category}
                  </span>
                  {product.stock > 0 ? (
                    <span className="px-3 py-1 bg-green-50 text-green-600 text-xs font-bold rounded-full uppercase tracking-wider">
                      In Stock
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-red-50 text-red-600 text-xs font-bold rounded-full uppercase tracking-wider">
                      Out of Stock
                    </span>
                  )}
                </div>
                <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-4 leading-tight">
                  {product.name}
                </h1>
                <div className="flex items-center gap-4">
                  <p className="text-3xl font-black text-purple-600">
                    {formatCurrency(product.price)}
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-yellow-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={18} fill="currentColor" />
                      ))}
                    </div>
                    <span className="text-gray-500 text-sm font-medium">
                      (4.9 • 120+ Reviews)
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-gray-600 leading-relaxed">
                {product.description}
              </p>

              {/* Selection Options */}
              <div className="space-y-6 pt-4">
                {colors.length > 0 && (
                  <div className="space-y-3">
                    <label className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                      Choose Color
                    </label>
                    <div className="flex flex-wrap gap-3">
                      {colors.map((color) => (
                        <button
                          key={color}
                          onClick={() => setSelectedColor(color)}
                          className={cn(
                            "w-10 h-10 rounded-full border-2 transition-all p-1",
                            selectedColor === color
                              ? "border-purple-600 scale-110"
                              : "border-transparent hover:border-gray-300",
                          )}
                        >
                          <div
                            className="w-full h-full rounded-full border border-gray-100"
                            style={{
                              backgroundColor: color.startsWith("#")
                                ? color
                                : undefined,
                            }}
                            title={color}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {storage.length > 0 && (
                  <div className="space-y-3">
                    <label className="text-sm font-bold text-gray-900 uppercase tracking-wider">
                      Select Storage
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {storage.map((size) => (
                        <button
                          key={size}
                          onClick={() => setSelectedStorage(size)}
                          className={cn(
                            "px-6 py-3 rounded-xl border-2 font-bold transition-all text-sm",
                            selectedStorage === size
                              ? "border-purple-600 bg-purple-50 text-purple-700"
                              : "border-gray-100 bg-white text-gray-600 hover:border-gray-200",
                          )}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Desktop Actions */}
              <div className="hidden md:flex items-center gap-4 pt-6">
                <div className="flex items-center border border-gray-200 rounded-xl bg-gray-50 h-14">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-4 hover:text-purple-600 transition-colors"
                  >
                    <Minus size={20} />
                  </button>
                  <span className="w-12 text-center font-bold text-lg">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity((q) => q + 1)}
                    className="px-4 hover:text-purple-600 transition-colors"
                  >
                    <Plus size={20} />
                  </button>
                </div>
                <button
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className={cn(
                    "flex-1 h-14 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95",
                    product.stock > 0
                      ? "bg-purple-600 text-white hover:bg-purple-700 shadow-purple-100"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none",
                  )}
                >
                  <ShoppingBag size={20} />
                  {product.stock > 0 ? "Add to Cart" : "Out of Stock"}
                </button>
                <button
                  onClick={handleAddToCompare}
                  className="w-14 h-14 border border-gray-200 rounded-xl flex items-center justify-center hover:bg-gray-50 transition-colors group"
                  title="Compare"
                >
                  <Scale
                    size={20}
                    className="text-gray-400 group-hover:text-purple-600"
                  />
                </button>
              </div>

              {/* Quick Info Grid */}
              <div className="grid grid-cols-2 gap-4 pt-8 border-t border-gray-100">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 flex-shrink-0">
                    <Truck size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">
                      Fast Delivery
                    </p>
                    <p className="text-xs text-gray-500">24-48 Hours</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600 flex-shrink-0">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">Authentic</p>
                    <p className="text-xs text-gray-500">100% Genuine</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Technical Specifications Section */}
        {Object.keys(specs).length > 0 && (
          <div className="mb-16 bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-2 h-8 bg-purple-600 rounded-full" />
              <h2 className="text-2xl font-black text-gray-900">
                Technical Specifications
              </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(specs).map(([key, value]) => (
                <div
                  key={key}
                  className="flex flex-col p-4 rounded-2xl bg-gray-50 border border-transparent hover:border-purple-100 transition-all"
                >
                  <span className="text-[10px] font-black text-purple-400 uppercase tracking-widest mb-1">
                    {key}
                  </span>
                  <span className="text-gray-900 font-bold">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Support / Contact Section */}
        <div className="mb-16 bg-purple-900 rounded-3xl p-8 md:p-12 text-white relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-800 rounded-full -translate-y-1/2 translate-x-1/2 opacity-20 group-hover:scale-110 transition-transform duration-700" />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="text-center md:text-left">
              <h3 className="text-2xl md:text-3xl font-black mb-2">
                Need Help with Your Choice?
              </h3>
              <p className="text-purple-200">
                Our product experts are ready to guide you to the perfect
                device.
              </p>
            </div>
            <button
              onClick={handleWhatsAppBuy}
              className="px-8 py-4 bg-white text-purple-900 rounded-2xl font-black flex items-center gap-3 hover:bg-purple-50 transition-all shadow-xl shadow-black/20 active:scale-95"
            >
              <MessageCircle size={24} />
              Chat with an Expert
            </button>
          </div>
        </div>

        {/* Recently Viewed / Similar Products */}
        {recentProducts.length > 0 && (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-8 bg-purple-600 rounded-full" />
                <h2 className="text-2xl font-black text-gray-900">
                  Recently Viewed
                </h2>
              </div>
              <button
                onClick={() => navigate("/shop")}
                className="text-purple-600 font-bold hover:underline"
              >
                View All
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {recentProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
