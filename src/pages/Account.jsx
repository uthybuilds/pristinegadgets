import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { useNavigate } from "react-router-dom";
import {
  Package,
  User,
  LogOut,
  ChevronRight,
  MapPin,
  Phone,
  Mail,
  Save,
  Loader,
  Edit2,
  X,
} from "lucide-react";
import { formatCurrency } from "../utils/helpers";
import Modal from "../components/ui/Modal";
import { useToast } from "../context/ToastContext";
import { motion } from "framer-motion";

export default function Account() {
  const { user, signOut, isAdmin, loading: authLoading } = useAuth();
  const { success: toastSuccess, error: toastError } = useToast();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Profile editing state
  const [isEditing, setIsEditing] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [profileData, setProfileData] = useState({
    full_name: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    postal_code: "",
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        setLoading(true);

        // Immediately set name from metadata so it doesn't show "Customer" while loading
        const initialName =
          user.user_metadata?.full_name || user.email?.split("@")[0] || "";
        setProfileData((prev) => ({
          ...prev,
          full_name: initialName,
          phone: user.user_metadata?.phone || "",
        }));

        // Fetch Orders
        if (!isAdmin) {
          try {
            const { data: ordersData, error: ordersError } = await supabase
              .from("orders")
              .select("*")
              .eq("user_id", user.id)
              .order("created_at", { ascending: false });

            if (ordersError) {
              console.warn(
                "Orders fetch failed (check if user_id column exists):",
                ordersError,
              );
            } else {
              setOrders(ordersData || []);
            }
          } catch (err) {
            console.warn("Orders fetch failed:", err);
          }
        }

        // Fetch Profile details
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (profileError && profileError.code !== "PGRST116")
          throw profileError;

        if (profile) {
          setProfileData({
            full_name: profile.full_name || initialName,
            phone: profile.phone || user.user_metadata?.phone || "",
            address: profile.address || "",
            city: profile.city || "",
            state: profile.state || "",
            postal_code: profile.postal_code || "",
          });
        }
      } catch (error) {
        console.error("Error fetching account data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, isAdmin]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setUpdating(true);

    try {
      // 1. Update Profile in public.profiles
      // We use .upsert() which handles both Insert and Update
      const { error: profileError } = await supabase.from("profiles").upsert(
        {
          id: user.id,
          email: user.email,
          full_name: profileData.full_name,
          phone: profileData.phone,
          address: profileData.address,
          city: profileData.city,
          state: profileData.state,
          postal_code: profileData.postal_code,
        },
        {
          onConflict: "id",
        },
      );

      if (profileError) {
        console.error("Supabase Profile Error:", profileError);
        throw new Error(profileError.message || "Database update failed");
      }

      // 2. Also update user_metadata so it's consistent everywhere immediately
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          full_name: profileData.full_name,
          phone: profileData.phone,
        },
      });

      if (authError) {
        console.error("Supabase Auth Error:", authError);
        throw authError;
      }

      toastSuccess("Profile updated successfully!");
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
      toastError(error.message || "Failed to update profile");
    } finally {
      setUpdating(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  if (authLoading || loading)
    return (
      <div className="min-h-screen pt-24 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );

  return (
    <div className="min-h-screen pt-20 sm:pt-24 pb-12 sm:pb-16 bg-gray-50 px-4">
      <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8">
        {/* Profile Card */}
        <div className="bg-white p-5 sm:p-8 rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                <User size={28} className="sm:w-8 sm:h-8" />
              </div>
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
                  {profileData.full_name || "Customer"}
                </h1>
                <p className="text-sm sm:text-base text-gray-500">
                  {user?.email}
                </p>
                {isAdmin && (
                  <span className="inline-block mt-2 px-3 py-1 bg-purple-100 text-purple-700 text-[10px] sm:text-xs font-bold rounded-full">
                    Admin Access
                  </span>
                )}
              </div>
            </div>
            <div className="flex w-full sm:w-auto gap-4">
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-purple-50 text-purple-600 rounded-xl font-bold hover:bg-purple-100 transition-colors text-sm sm:text-base"
              >
                {isEditing ? <X size={18} /> : <Edit2 size={18} />}
                {isEditing ? "Cancel" : "Edit Profile"}
              </button>
              <button
                onClick={handleSignOut}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-red-50 text-red-600 rounded-xl font-bold hover:bg-red-100 transition-colors text-sm sm:text-base"
              >
                <LogOut size={18} />
                Sign Out
              </button>
            </div>
          </div>

          {/* Profile Edit Form */}
          {isEditing && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleUpdateProfile}
              className="mt-8 pt-8 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={profileData.full_name}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      full_name: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-600 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Phone Number
                </label>
                <input
                  type="tel"
                  required
                  value={profileData.phone}
                  onChange={(e) =>
                    setProfileData({ ...profileData, phone: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-600 outline-none transition-all"
                />
              </div>
              <div className="sm:col-span-2 space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Shipping Address (Nigeria)
                </label>
                <input
                  type="text"
                  required
                  placeholder="Street Address, Area"
                  value={profileData.address}
                  onChange={(e) =>
                    setProfileData({ ...profileData, address: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-600 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  City
                </label>
                <input
                  type="text"
                  required
                  value={profileData.city}
                  onChange={(e) =>
                    setProfileData({ ...profileData, city: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-600 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  State
                </label>
                <input
                  type="text"
                  required
                  value={profileData.state}
                  onChange={(e) =>
                    setProfileData({ ...profileData, state: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-600 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  Postal Code (Optional)
                </label>
                <input
                  type="text"
                  value={profileData.postal_code}
                  onChange={(e) =>
                    setProfileData({
                      ...profileData,
                      postal_code: e.target.value,
                    })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-purple-600 outline-none transition-all"
                />
              </div>
              <div className="sm:col-span-2 pt-4">
                <button
                  type="submit"
                  disabled={updating}
                  className="w-full py-4 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-purple-200"
                >
                  {updating ? (
                    <Loader className="animate-spin" />
                  ) : (
                    <Save size={20} />
                  )}
                  Save Profile Details
                </button>
              </div>
            </motion.form>
          )}

          {/* Quick View Details (when not editing) */}
          {!isEditing && (
            <div className="mt-8 pt-8 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-gray-50 rounded-lg text-gray-400">
                  <Phone size={18} />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">
                    Phone
                  </p>
                  <p className="text-sm font-medium text-gray-900">
                    {profileData.phone || "Not set"}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 sm:col-span-2">
                <div className="p-2 bg-gray-50 rounded-lg text-gray-400">
                  <MapPin size={18} />
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">
                    Shipping Address
                  </p>
                  <p className="text-sm font-medium text-gray-900 leading-relaxed">
                    {profileData.address
                      ? `${profileData.address}, ${profileData.city}, ${profileData.state}`
                      : "No address saved"}
                    {profileData.postal_code && ` (${profileData.postal_code})`}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Orders Section / Admin View */}
        {isAdmin ? (
          <div className="bg-white p-8 sm:p-12 rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 text-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <Package size={28} className="sm:w-8 sm:h-8" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
              Admin Dashboard
            </h2>
            <p className="text-sm sm:text-base text-gray-500 mb-6 sm:mb-8 max-w-md mx-auto">
              You are logged in as an administrator. Manage your store's orders,
              products, and settings from the dashboard.
            </p>
            <button
              onClick={() => navigate("/admin")}
              className="w-full sm:w-auto px-8 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-colors shadow-lg shadow-purple-200"
            >
              Go to Dashboard
            </button>
          </div>
        ) : (
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4 sm:mb-6 flex items-center gap-2">
              <Package size={20} className="text-purple-600" />
              Order History
            </h2>

            <div className="space-y-4">
              {orders.map((order) => (
                <div
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  className="bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                    <div className="flex items-start justify-between sm:block">
                      <div>
                        <div className="flex items-center gap-3 mb-1 sm:mb-2">
                          <span className="font-mono text-xs sm:text-sm text-gray-400">
                            #{order.id.slice(0, 8)}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold capitalize ${
                              order.status === "delivered"
                                ? "bg-green-100 text-green-700"
                                : order.status === "cancelled"
                                  ? "bg-red-100 text-red-700"
                                  : "bg-yellow-100 text-yellow-700"
                            }`}
                          >
                            {order.status}
                          </span>
                        </div>
                        <p className="text-[10px] sm:text-sm text-gray-500">
                          Placed on{" "}
                          {new Date(order.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <ChevronRight
                        className="sm:hidden text-gray-300"
                        size={18}
                      />
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6 pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-50">
                      <p className="font-bold text-base sm:text-lg text-gray-900">
                        {formatCurrency(order.total_amount)}
                      </p>
                      <ChevronRight className="hidden sm:block text-gray-300 group-hover:text-purple-600 transition-colors" />
                    </div>
                  </div>
                </div>
              ))}

              {orders.length === 0 && (
                <div className="text-center py-10 sm:py-12 bg-white rounded-2xl sm:rounded-3xl border border-gray-100 border-dashed">
                  <Package
                    size={40}
                    className="sm:w-12 sm:h-12 mx-auto text-gray-300 mb-4"
                  />
                  <h3 className="text-base sm:text-lg font-bold text-gray-900">
                    No orders yet
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500">
                    Start shopping to see your orders here.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Order Details Modal */}
        <Modal
          isOpen={!!selectedOrder}
          onClose={() => setSelectedOrder(null)}
          title="Order Details"
        >
          {selectedOrder && (
            <div className="space-y-4 sm:space-y-6">
              <div className="flex justify-between items-center pb-3 sm:pb-4 border-b border-gray-100">
                <div>
                  <p className="text-[10px] sm:text-sm text-gray-500">
                    Order ID
                  </p>
                  <p className="font-mono font-bold text-sm sm:text-base">
                    #{selectedOrder.id.slice(0, 8)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] sm:text-sm text-gray-500">Date</p>
                  <p className="font-bold text-sm sm:text-base">
                    {new Date(selectedOrder.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-gray-900 mb-3 sm:mb-4 text-sm sm:text-base">
                  Items
                </h3>
                <div className="space-y-3 sm:space-y-4">
                  {selectedOrder.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 sm:gap-4"
                    >
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        {item.images?.[0] && (
                          <img
                            src={item.images[0]}
                            alt={item.name}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="flex-grow min-w-0">
                        <p className="font-bold text-gray-900 text-sm sm:text-base truncate">
                          {item.name}
                        </p>
                        <div className="flex flex-wrap items-center gap-2 text-[10px] sm:text-sm text-gray-500">
                          {item.variant?.color && (
                            <span>Color: {item.variant.color}</span>
                          )}
                          {item.variant?.storage && (
                            <span>Storage: {item.variant.storage}</span>
                          )}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-bold text-sm sm:text-base">
                          {formatCurrency(item.price)}
                        </p>
                        <p className="text-[10px] sm:text-sm text-gray-500">
                          x{item.quantity}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 p-3 sm:p-4 rounded-xl space-y-2">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-gray-500">Subtotal</span>
                  <span className="font-medium">
                    {formatCurrency(selectedOrder.total_amount)}
                  </span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-gray-500">Shipping</span>
                  <span className="font-medium">Free</span>
                </div>
                <div className="flex justify-between text-base sm:text-lg font-bold pt-2 border-t border-gray-200">
                  <span>Total</span>
                  <span className="text-purple-600">
                    {formatCurrency(selectedOrder.total_amount)}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                <div>
                  <p className="text-gray-500 mb-1">Shipping Address</p>
                  <p className="font-medium leading-relaxed">
                    {selectedOrder.shipping_address}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500 mb-1">Status</p>
                  <span
                    className={`px-2 py-1 rounded-full text-[10px] sm:text-xs font-bold capitalize ${
                      selectedOrder.status === "delivered"
                        ? "bg-green-100 text-green-700"
                        : selectedOrder.status === "cancelled"
                          ? "bg-red-100 text-red-700"
                          : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {selectedOrder.status}
                  </span>
                </div>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}
