import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import {
  Plus,
  Trash2,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Link as LinkIcon,
} from "lucide-react";

export default function BannerManager() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newBanner, setNewBanner] = useState({
    title: "",
    subtitle: "",
    image_url: "",
    link: "/shop",
    active: true,
  });
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    fetchBanners();
  }, []);

  const fetchBanners = async () => {
    try {
      const { data, error } = await supabase
        .from("banners")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        if (error.code === "42P01") {
          // undefined_table
          console.warn("Banners table does not exist yet.");
          return;
        }
        throw error;
      }
      setBanners(data || []);
    } catch (error) {
      console.error("Error fetching banners:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBanner = async (e) => {
    e.preventDefault();
    try {
      const { data, error } = await supabase
        .from("banners")
        .insert([newBanner])
        .select();

      if (error) throw error;
      setBanners([data[0], ...banners]);
      setIsAdding(false);
      setNewBanner({
        title: "",
        subtitle: "",
        image_url: "",
        link: "/shop",
        active: true,
      });
      alert("Banner added successfully!");
    } catch (error) {
      alert("Error adding banner: " + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this banner?")) return;
    try {
      const { error } = await supabase.from("banners").delete().eq("id", id);
      if (error) throw error;
      setBanners(banners.filter((b) => b.id !== id));
    } catch (error) {
      alert("Error deleting banner: " + error.message);
    }
  };

  const toggleActive = async (banner) => {
    try {
      const { error } = await supabase
        .from("banners")
        .update({ active: !banner.active })
        .eq("id", banner.id);

      if (error) throw error;
      setBanners(
        banners.map((b) =>
          b.id === banner.id ? { ...b, active: !b.active } : b,
        ),
      );
    } catch (error) {
      alert("Error updating banner: " + error.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900">Homepage Banners</h2>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="px-4 py-2 bg-purple-600 text-white rounded-xl flex items-center gap-2 hover:bg-purple-700 transition-colors"
        >
          <Plus size={20} />
          Add Banner
        </button>
      </div>

      {isAdding && (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 animate-fadeIn">
          <h3 className="font-bold mb-4">New Banner Details</h3>
          <form onSubmit={handleAddBanner} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  required
                  className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g. iPhone 15 Pro Max"
                  value={newBanner.title}
                  onChange={(e) =>
                    setNewBanner({ ...newBanner, title: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subtitle
                </label>
                <input
                  type="text"
                  className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="e.g. Titanium. So strong. So light. So Pro."
                  value={newBanner.subtitle}
                  onChange={(e) =>
                    setNewBanner({ ...newBanner, subtitle: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Image URL
                </label>
                <input
                  type="url"
                  required
                  className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="https://..."
                  value={newBanner.image_url}
                  onChange={(e) =>
                    setNewBanner({ ...newBanner, image_url: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Link URL
                </label>
                <input
                  type="text"
                  required
                  className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="/shop"
                  value={newBanner.link}
                  onChange={(e) =>
                    setNewBanner({ ...newBanner, link: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-4 py-2 text-gray-500 hover:text-gray-700 font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-6 py-2 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800"
              >
                Save Banner
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="text-center py-10">Loading banners...</div>
      ) : banners.length === 0 ? (
        <div className="text-center py-10 bg-white rounded-2xl border border-gray-100">
          <ImageIcon className="mx-auto h-12 w-12 text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900">No banners yet</h3>
          <p className="text-gray-500">
            Create your first banner to display on the homepage.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {banners.map((banner) => (
            <div
              key={banner.id}
              className={`group relative rounded-2xl overflow-hidden border-2 transition-all ${
                banner.active
                  ? "border-purple-100 shadow-sm"
                  : "border-gray-100 opacity-75 bg-gray-50"
              }`}
            >
              <div className="aspect-video relative">
                <img
                  src={banner.image_url}
                  alt={banner.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-6">
                  <div className="text-white">
                    <h4 className="font-bold text-lg">{banner.title}</h4>
                    <p className="text-sm opacity-90">{banner.subtitle}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-white flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <LinkIcon size={16} />
                  <span className="truncate max-w-[150px]">{banner.link}</span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleActive(banner)}
                    className={`p-2 rounded-lg transition-colors ${
                      banner.active
                        ? "bg-green-100 text-green-600 hover:bg-green-200"
                        : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    }`}
                    title={banner.active ? "Deactivate" : "Activate"}
                  >
                    {banner.active ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                  <button
                    onClick={() => handleDelete(banner.id)}
                    className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
