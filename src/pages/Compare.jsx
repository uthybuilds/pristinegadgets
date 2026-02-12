import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { Link } from "react-router-dom";
import { Trash2, ShoppingBag, ArrowLeft, Check, X } from "lucide-react";
import { formatCurrency, getOptimizedImageUrl } from "../utils/helpers";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";

export default function Compare() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useCart();
  const { success } = useToast();

  useEffect(() => {
    fetchCompareProducts();
  }, []);

  const fetchCompareProducts = async () => {
    const compareList = JSON.parse(
      localStorage.getItem("pristine_compare_list") || "[]",
    );

    if (compareList.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .in("id", compareList);

      if (error) throw error;
      setProducts(data);
    } catch (error) {
      console.error("Error fetching compare products:", error);
    } finally {
      setLoading(false);
    }
  };

  const removeFromCompare = (id) => {
    const compareList = JSON.parse(
      localStorage.getItem("pristine_compare_list") || "[]",
    );
    const newList = compareList.filter((item) => item !== id);
    localStorage.setItem("pristine_compare_list", JSON.stringify(newList));
    setProducts(products.filter((p) => p.id !== id));
    success("Removed from comparison");
  };

  const handleAddToCart = (product) => {
    addToCart(
      product,
      {
        color: product.features?.colors?.[0],
        storage: product.features?.storage?.[0],
      },
      1,
    );
    success("Added to cart!");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="min-h-screen pt-24 sm:pt-32 pb-12 sm:pb-16 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">
            Compare Devices
          </h1>
          <p className="text-sm sm:text-base text-gray-500 mb-8 px-4">
            You haven't added any devices to compare yet.
          </p>
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-xl font-bold text-sm sm:text-base hover:bg-purple-700 transition-colors"
          >
            <ShoppingBag size={20} />
            Browse Shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 sm:pt-32 pb-12 sm:pb-16 px-4 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              to="/shop"
              className="p-2 bg-white rounded-full shadow-sm hover:bg-gray-50 text-gray-500"
            >
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Compare Devices
            </h1>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem("pristine_compare_list");
              setProducts([]);
            }}
            className="text-red-600 hover:text-red-700 font-medium text-xs sm:text-sm"
          >
            Clear All
          </button>
        </div>

        <div className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[600px] sm:min-w-[800px]">
            <thead>
              <tr>
                <th className="p-4 sm:p-6 min-w-[150px] sm:min-w-[200px] bg-gray-50 border-b border-r border-gray-100 sticky left-0 z-10">
                  <span className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Product
                  </span>
                </th>
                {products.map((product) => (
                  <th
                    key={product.id}
                    className="p-4 sm:p-6 min-w-[200px] sm:min-w-[250px] border-b border-gray-100 relative group"
                  >
                    <button
                      onClick={() => removeFromCompare(product.id)}
                      className="absolute top-2 right-2 sm:top-4 sm:right-4 p-1.5 sm:p-2 bg-gray-100 rounded-full text-gray-400 hover:bg-red-100 hover:text-red-600 transition-colors sm:opacity-0 group-hover:opacity-100"
                      title="Remove"
                    >
                      <Trash2 size={14} className="sm:w-4 sm:h-4" />
                    </button>
                    <div className="aspect-square w-24 sm:w-32 mx-auto mb-4">
                      <img
                        src={getOptimizedImageUrl(product.images?.[0], "card")}
                        alt={product.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <Link
                      to={`/product/${product.id}`}
                      className="block text-center font-bold text-gray-900 hover:text-purple-600 mb-1 sm:mb-2 text-sm sm:text-base"
                    >
                      {product.name}
                    </Link>
                    <p className="text-center font-bold text-purple-600 text-base sm:text-lg mb-3 sm:mb-4">
                      {formatCurrency(product.price)}
                    </p>
                    <button
                      onClick={() => handleAddToCart(product)}
                      className="w-full py-2 bg-gray-900 text-white rounded-lg font-medium text-xs sm:text-sm hover:bg-gray-800 transition-colors"
                    >
                      Add to Cart
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {/* Category */}
              <tr>
                <th className="p-4 sm:p-6 bg-gray-50 border-r border-gray-100 font-medium text-xs sm:text-sm text-gray-500 sticky left-0 z-10">
                  Category
                </th>
                {products.map((product) => (
                  <td
                    key={product.id}
                    className="p-4 sm:p-6 text-center capitalize text-xs sm:text-sm text-gray-700"
                  >
                    {product.category}
                  </td>
                ))}
              </tr>

              {/* Brand */}
              <tr>
                <th className="p-4 sm:p-6 bg-gray-50 border-r border-gray-100 font-medium text-xs sm:text-sm text-gray-500 sticky left-0 z-10">
                  Brand
                </th>
                {products.map((product) => (
                  <td
                    key={product.id}
                    className="p-4 sm:p-6 text-center capitalize text-xs sm:text-sm text-gray-700"
                  >
                    {product.brand}
                  </td>
                ))}
              </tr>

              {/* Stock Status */}
              <tr>
                <th className="p-4 sm:p-6 bg-gray-50 border-r border-gray-100 font-medium text-xs sm:text-sm text-gray-500 sticky left-0 z-10">
                  Availability
                </th>
                {products.map((product) => (
                  <td key={product.id} className="p-4 sm:p-6 text-center">
                    {product.stock > 0 ? (
                      <span className="inline-flex items-center gap-1 text-green-600 font-medium bg-green-50 px-2 py-1 rounded-full text-[10px] sm:text-xs">
                        <Check size={10} className="sm:w-3 sm:h-3" /> In Stock
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-red-600 font-medium bg-red-50 px-2 py-1 rounded-full text-[10px] sm:text-xs">
                        <X size={10} className="sm:w-3 sm:h-3" /> Out of Stock
                      </span>
                    )}
                  </td>
                ))}
              </tr>

              {/* Storage Options */}
              <tr>
                <th className="p-4 sm:p-6 bg-gray-50 border-r border-gray-100 font-medium text-xs sm:text-sm text-gray-500 sticky left-0 z-10">
                  Storage
                </th>
                {products.map((product) => (
                  <td key={product.id} className="p-4 sm:p-6 text-center">
                    <div className="flex flex-wrap gap-1 justify-center">
                      {product.features?.storage && product.features.storage.length > 0 ? (
                        product.features.storage.map((s) => (
                          <span
                            key={s}
                            className="px-1.5 py-0.5 sm:px-2 sm:py-1 bg-gray-100 rounded text-[10px] sm:text-xs text-gray-600"
                          >
                            {s}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-400 text-xs italic">N/A</span>
                      )}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Colors */}
              <tr>
                <th className="p-4 sm:p-6 bg-gray-50 border-r border-gray-100 font-medium text-xs sm:text-sm text-gray-500 sticky left-0 z-10">
                  Colors
                </th>
                {products.map((product) => (
                  <td key={product.id} className="p-4 sm:p-6 text-center">
                    <div className="flex flex-wrap gap-1.5 sm:gap-2 justify-center">
                      {product.features?.colors && product.features.colors.length > 0 ? (
                        product.features.colors.map((c) => (
                          <div
                            key={c}
                            className="w-4 h-4 sm:w-5 sm:h-5 rounded-full border border-gray-200 shadow-sm"
                            style={{ backgroundColor: c }}
                            title={c}
                          />
                        ))
                      ) : (
                        <span className="text-gray-400 text-xs italic">N/A</span>
                      )}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Description */}
              <tr>
                <th className="p-4 sm:p-6 bg-gray-50 border-r border-gray-100 font-medium text-xs sm:text-sm text-gray-500 sticky left-0 z-10 align-top">
                  Description
                </th>
                {products.map((product) => (
                  <td
                    key={product.id}
                    className="p-4 sm:p-6 text-xs sm:text-sm text-gray-600 align-top min-w-[200px] sm:min-w-[250px]"
                  >
                    <div className="line-clamp-4 hover:line-clamp-none transition-all">
                      {product.description}
                    </div>
                  </td>
                ))}
              </tr>

              {/* Specs */}
              <tr>
                <th className="p-4 sm:p-6 bg-gray-50 border-r border-gray-100 font-medium text-xs sm:text-sm text-gray-500 sticky left-0 z-10 align-top">
                  Key Specs
                </th>
                {products.map((product) => (
                  <td
                    key={product.id}
                    className="p-4 sm:p-6 text-xs sm:text-sm text-gray-700 align-top min-w-[200px] sm:min-w-[250px]"
                  >
                    <ul className="space-y-2">
                      {product.features?.specs ? (
                        Object.entries(product.features.specs).map(
                          ([key, value]) => (
                            <li
                              key={key}
                              className="flex flex-col border-b border-gray-50 pb-1"
                            >
                              <span className="text-[10px] font-bold text-gray-400 uppercase">
                                {key}
                              </span>
                              <span className="font-medium text-gray-900">
                                {value}
                              </span>
                            </li>
                          ),
                        )
                      ) : (
                        <li className="text-gray-400 italic">
                          No specs available
                        </li>
                      )}
                    </ul>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
