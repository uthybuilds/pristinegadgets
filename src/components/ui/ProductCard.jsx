import { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { useCart } from "../../context/CartContext";
import { formatCurrency, cn, getOptimizedImageUrl } from "../../utils/helpers";

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const [isLoaded, setIsLoaded] = useState(false);

  // Optimize image for card display (square crop)
  const rawImageUrl =
    product.images?.[0] || "https://via.placeholder.com/500?text=No+Image";
  const imageUrl = getOptimizedImageUrl(rawImageUrl, "card");

  return (
    <div className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative">
      <Link to={`/product/${product.id}`} className="block">
        <div className="aspect-square relative overflow-hidden bg-gray-50">
          {/* Skeleton Loader Overlay */}
          {!isLoaded && (
            <div className="absolute inset-0 bg-gray-100 animate-pulse flex items-center justify-center">
              <div className="w-10 h-10 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
            </div>
          )}
          <img
            src={imageUrl}
            alt={product.name}
            loading="lazy"
            onLoad={() => setIsLoaded(true)}
            className={cn(
              "w-full h-full object-cover transition-all duration-700 group-hover:scale-110",
              isLoaded ? "opacity-100" : "opacity-0",
            )}
          />
          {/* Badge if stock low */}
          {product.stock > 0 && product.stock < 5 && (
            <div className="absolute top-2 left-2 px-2 py-1 bg-red-500 text-white text-[10px] font-bold uppercase tracking-wider rounded-md z-10">
              Low Stock
            </div>
          )}
        </div>
      </Link>

      <div className="p-4">
        <div className="text-xs text-gray-400 mb-1 uppercase tracking-wide">
          {product.category}
        </div>
        <Link to={`/product/${product.id}`}>
          <h3 className="font-bold text-gray-900 mb-2 line-clamp-1 group-hover:text-primary-600 transition-colors">
            {product.name}
          </h3>
        </Link>

        <div className="flex items-center justify-between mt-2">
          <span className="font-bold text-lg text-primary-600">
            {formatCurrency(product.price)}
          </span>

          <button
            onClick={() => addToCart(product)}
            disabled={product.stock === 0}
            className={cn(
              "p-2 rounded-full transition-all active:scale-90",
              product.stock > 0
                ? "bg-gray-900 text-white hover:bg-primary-600 shadow-md hover:shadow-lg"
                : "bg-gray-100 text-gray-400 cursor-not-allowed",
            )}
          >
            <ShoppingCart size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
