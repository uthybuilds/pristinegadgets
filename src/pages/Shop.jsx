import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "../lib/supabase";
import ProductCard from "../components/ui/ProductCard";
import { Filter, Search } from "lucide-react";
import { cn } from "../utils/helpers";

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const rawCategory = searchParams.get("category") || "all";

  const categories = [
    { id: "all", label: "All Gadgets" },
    { id: "smartphones", label: "Smartphones" },
    { id: "tablets", label: "Tablets" },
    { id: "laptops", label: "Laptops" },
    { id: "watches", label: "Watches" },
    { id: "audio", label: "Audio" },
    { id: "accessories", label: "Accessories" },
  ];

  // Normalize and validate category
  const activeCategory = categories.find(
    (c) => c.id === rawCategory.toLowerCase(),
  )
    ? rawCategory.toLowerCase()
    : "all";

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      let query = supabase.from("products").select("*");

      if (activeCategory !== "all") {
        query = query.eq("category", activeCategory);
      }

      // Sort
      if (sortBy === "newest")
        query = query.order("created_at", { ascending: false });
      if (sortBy === "price-low")
        query = query.order("price", { ascending: true });
      if (sortBy === "price-high")
        query = query.order("price", { ascending: false });

      const { data } = await query;

      if (data) setProducts(data);
      setLoading(false);
    };

    fetchProducts();
  }, [activeCategory, sortBy]);

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="min-h-screen pt-24 pb-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header & Search */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Shop Collection
            </h1>
            <p className="text-gray-500">Find your perfect device.</p>
          </div>

          <div className="relative w-full md:w-96 flex gap-2">
            <div className="relative flex-grow">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Search gadgets..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-primary-500 bg-white shadow-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-primary-500 bg-white shadow-sm text-sm font-medium cursor-pointer"
            >
              <option value="newest">Newest</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Categories (Scrollable on Mobile) */}
        <div className="flex overflow-x-auto pb-4 gap-2 mb-8 no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setSearchParams(cat.id === "all" ? {} : { category: cat.id });
              }}
              className={cn(
                "px-6 py-2 rounded-full whitespace-nowrap text-sm font-medium transition-all border",
                activeCategory === cat.id
                  ? "bg-gray-900 text-white border-gray-900 shadow-md"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-300",
              )}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div
                key={i}
                className="bg-white rounded-2xl h-80 animate-pulse border border-gray-100 flex flex-col p-4"
              >
                <div className="aspect-square bg-gray-100 rounded-xl mb-4"></div>
                <div className="h-4 bg-gray-100 rounded w-2/3 mb-2"></div>
                <div className="h-4 bg-gray-100 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="inline-block p-4 rounded-full bg-gray-100 mb-4">
              <Filter size={32} className="text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900">
              No products found
            </h3>
            <p className="text-gray-500">
              Try adjusting your search or category.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
