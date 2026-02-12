import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import {
  Search,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Banknote,
  ShoppingBag,
  Shield,
  Ban,
  Star,
  MoreHorizontal,
} from "lucide-react";
import { formatCurrency } from "../../utils/helpers";

export default function CustomerManager() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeMenu, setActiveMenu] = useState(null);

  useEffect(() => {
    fetchCustomers();

    // Add real-time subscriptions for customers
    const profilesSubscription = supabase
      .channel("profiles-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "profiles" },
        () => fetchCustomers(),
      )
      .subscribe();

    const customerProfilesSubscription = supabase
      .channel("customer-profiles-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "customer_profiles" },
        () => fetchCustomers(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(profilesSubscription);
      supabase.removeChannel(customerProfilesSubscription);
    };
  }, []);

  const fetchCustomers = async () => {
    try {
      const [ordersRes, profilesRes, customerProfilesRes] = await Promise.all([
        supabase
          .from("orders")
          .select(
            "customer_name, customer_email, customer_phone, shipping_address, created_at, total_amount",
          )
          .order("created_at", { ascending: false }),
        supabase.from("profiles").select("*"),
        supabase.from("customer_profiles").select("*"),
      ]);

      if (ordersRes.error)
        console.error("Orders fetch error:", ordersRes.error);
      if (profilesRes.error)
        console.error("Profiles fetch error:", profilesRes.error);
      if (customerProfilesRes.error)
        console.error(
          "Customer profiles fetch error:",
          customerProfilesRes.error,
        );

      // Map profiles by email for status (blacklist/vip)
      const statusMap = new Map();
      if (customerProfilesRes.data) {
        customerProfilesRes.data.forEach((p) =>
          statusMap.set(p.email, p.status),
        );
      }

      const customerMap = new Map();

      // 1. First, add all registered users from profiles
      if (profilesRes.data && profilesRes.data.length > 0) {
        profilesRes.data.forEach((profile) => {
          if (!profile.email) return;
          customerMap.set(profile.email, {
            id: profile.email,
            name: profile.full_name || "Unknown User",
            email: profile.email,
            phone: profile.phone || "No phone",
            address: profile.address || null,
            joined: new Date(profile.created_at),
            lastOrder: null,
            totalOrders: 0,
            totalSpent: 0,
            status: statusMap.get(profile.email) || "regular",
          });
        });
      }

      // 2. Then, aggregate order data (this includes guests and registered users)
      if (ordersRes.data) {
        ordersRes.data.forEach((order) => {
          const email = order.customer_email;
          if (!email) return;

          if (!customerMap.has(email)) {
            // This handles guest orders who aren't in 'profiles'
            customerMap.set(email, {
              id: email,
              name: order.customer_name,
              email: email,
              phone: order.customer_phone,
              address: order.shipping_address,
              joined: new Date(order.created_at),
              lastOrder: new Date(order.created_at),
              totalOrders: 0,
              totalSpent: 0,
              status: statusMap.get(email) || "regular",
            });
          }

          const customer = customerMap.get(email);
          customer.totalOrders += 1;
          customer.totalSpent += Number(order.total_amount) || 0;

          const orderDate = new Date(order.created_at);
          if (!customer.lastOrder || orderDate > customer.lastOrder) {
            customer.lastOrder = orderDate;
          }
          if (orderDate < customer.joined) {
            customer.joined = orderDate;
          }

          // Update name/phone/address from most recent order if it was a guest or missing info
          if (customer.name === "Unknown User")
            customer.name = order.customer_name;
          if (customer.phone === "No phone")
            customer.phone = order.customer_phone;
        });
      }

      setCustomers(Array.from(customerMap.values()));
    } catch (error) {
      console.error("General error fetching customers:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateCustomerStatus = async (email, newStatus) => {
    try {
      const { error } = await supabase
        .from("customer_profiles")
        .upsert({ email, status: newStatus }, { onConflict: "email" });

      if (error) {
        if (error.code === "42P01") {
          alert(
            "Customer profiles table missing. Please create 'customer_profiles' table with columns: email (text, PK), status (text).",
          );
          return;
        }
        throw error;
      }

      setCustomers(
        customers.map((c) =>
          c.email === email ? { ...c, status: newStatus } : c,
        ),
      );
      setActiveMenu(null);
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update status");
    }
  };

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading)
    return (
      <div className="flex justify-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between gap-4 items-center">
          <h2 className="text-xl font-bold text-gray-900">
            Customers ({customers.length})
          </h2>
          <div className="relative w-full sm:w-64">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="Search customers..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-purple-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Desktop View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-sm font-medium">
              <tr>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Contact</th>
                <th className="px-6 py-4">Stats</th>
                <th className="px-6 py-4">Joined</th>
                <th className="px-6 py-4">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((customer) => (
                  <tr
                    key={customer.id}
                    className={`hover:bg-gray-50 transition-colors ${
                      customer.status === "blacklist"
                        ? "bg-red-50 hover:bg-red-100"
                        : customer.status === "vip"
                          ? "bg-amber-50 hover:bg-amber-100"
                          : ""
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                            customer.status === "vip"
                              ? "bg-amber-100 text-amber-600"
                              : customer.status === "blacklist"
                                ? "bg-red-100 text-red-600"
                                : "bg-purple-100 text-purple-600"
                          }`}
                        >
                          {customer.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">
                            {customer.name}
                          </p>
                          <p className="text-sm text-gray-500 flex items-center gap-1">
                            <MapPin size={12} />{" "}
                            {customer.address?.city || "Unknown City"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {customer.status === "vip" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                          <Star size={12} fill="currentColor" /> VIP
                        </span>
                      )}
                      {customer.status === "blacklist" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <Ban size={12} /> Blacklist
                        </span>
                      )}
                      {customer.status === "regular" && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          Regular
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                          <Mail size={14} /> {customer.email}
                        </p>
                        <p className="text-sm text-gray-600 flex items-center gap-2">
                          <Phone size={14} /> {customer.phone}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-900 flex items-center gap-2">
                          <ShoppingBag size={14} className="text-purple-500" />
                          {customer.totalOrders} Orders
                        </p>
                        <p className="text-sm font-bold text-green-600 flex items-center gap-2">
                          <Banknote size={14} />
                          {formatCurrency(customer.totalSpent)}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {customer.joined.toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 relative">
                      <button
                        onClick={() =>
                          setActiveMenu(
                            activeMenu === customer.id ? null : customer.id,
                          )
                        }
                        className="p-2 hover:bg-black/5 rounded-full"
                      >
                        <MoreHorizontal size={20} />
                      </button>

                      {activeMenu === customer.id && (
                        <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 z-50 overflow-hidden">
                          <button
                            onClick={() =>
                              updateCustomerStatus(customer.email, "regular")
                            }
                            className="w-full text-left px-4 py-3 hover:bg-gray-50 text-sm flex items-center gap-2"
                          >
                            <Shield size={16} /> Mark as Regular
                          </button>
                          <button
                            onClick={() =>
                              updateCustomerStatus(customer.email, "vip")
                            }
                            className="w-full text-left px-4 py-3 hover:bg-amber-50 text-amber-700 text-sm flex items-center gap-2"
                          >
                            <Star size={16} /> Mark as VIP
                          </button>
                          <button
                            onClick={() =>
                              updateCustomerStatus(customer.email, "blacklist")
                            }
                            className="w-full text-left px-4 py-3 hover:bg-red-50 text-red-700 text-sm flex items-center gap-2"
                          >
                            <Ban size={16} /> Blacklist
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="6"
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    No customers found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile View (Cards) */}
        <div className="md:hidden divide-y divide-gray-100">
          {filteredCustomers.map((customer) => (
            <div key={customer.id} className="p-4 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-xl">
                  {customer.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{customer.name}</h3>
                  <p className="text-sm text-gray-500">{customer.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-gray-50 p-3 rounded-xl">
                <div>
                  <p className="text-xs text-gray-500 uppercase">Orders</p>
                  <p className="font-bold text-gray-900">
                    {customer.totalOrders}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase">Spent</p>
                  <p className="font-bold text-green-600">
                    {formatCurrency(customer.totalSpent)}
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-2 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <Phone size={14} /> {customer.phone}
                </div>
                <div className="flex items-center gap-2">
                  <MapPin size={14} />{" "}
                  {customer.address?.city || "Unknown Location"}
                </div>
                <div className="flex items-center gap-2">
                  <Calendar size={14} /> Joined:{" "}
                  {customer.joined.toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
          {filteredCustomers.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              No customers found.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
