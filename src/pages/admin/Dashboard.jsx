import { useState, useEffect } from "react";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Package,
  LayoutGrid,
  Users,
  BarChart3,
  LogOut,
  Menu,
  X,
  Settings,
  Image,
} from "lucide-react";
import { cn } from "../../utils/helpers";
import DashboardOverview from "../../components/admin/DashboardOverview";
import ProductManager from "../../components/admin/ProductManager";
import OrderManager from "../../components/admin/OrderManager";
import CustomerManager from "../../components/admin/CustomerManager";
import SettingsManager from "../../components/admin/SettingsManager";
import BannerManager from "../../components/admin/BannerManager";

export default function AdminDashboard() {
  const { user, signOut, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [productsRes, ordersRes] = await Promise.all([
        supabase
          .from("products")
          .select("*")
          .order("created_at", { ascending: false }),
        supabase
          .from("orders")
          .select("*")
          .order("created_at", { ascending: false }),
      ]);

      if (productsRes.data) setProducts(productsRes.data);
      if (ordersRes.data) setOrders(ordersRes.data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Set up real-time subscriptions
    const productsSubscription = supabase
      .channel("products-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "products" },
        () => fetchData(),
      )
      .subscribe();

    const ordersSubscription = supabase
      .channel("orders-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => fetchData(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(productsSubscription);
      supabase.removeChannel(ordersSubscription);
    };
  }, []);

  if (authLoading || loading)
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );

  const tabs = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "products", label: "Products", icon: LayoutGrid },
    { id: "orders", label: "Orders", icon: Package },
    { id: "customers", label: "Customers", icon: Users },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "flex flex-col w-64 bg-white border-r border-gray-200 fixed top-0 bottom-0 z-50 pt-20 transition-transform duration-300 ease-in-out",
          isMobileMenuOpen
            ? "translate-x-0"
            : "-translate-x-full md:translate-x-0",
        )}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                <Package className="text-white" size={20} />
              </div>
              <span className="font-bold text-xl text-gray-900">Admin</span>
            </div>
            <button
              onClick={fetchData}
              className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-purple-600 transition-colors"
              title="Refresh Data"
            >
              <BarChart3 size={18} className={cn(loading && "animate-spin")} />
            </button>
          </div>

          <div className="flex items-center justify-between mb-6 md:hidden">
            <h2 className="text-xl font-bold text-gray-900">Admin Menu</h2>
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 text-gray-500 hover:text-gray-900"
            >
              <X size={24} />
            </button>
          </div>

          <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4 hidden md:block">
            Menu
          </h2>
          <nav className="space-y-2">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setIsMobileMenuOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                  activeTab === tab.id
                    ? "bg-purple-50 text-purple-600 shadow-sm"
                    : "text-gray-500 hover:text-gray-900 hover:bg-gray-50",
                )}
              >
                <tab.icon size={20} />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-gray-100 pb-10">
          <button
            onClick={signOut}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 w-full transition-colors"
          >
            <LogOut size={20} />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 md:ml-64 pt-20 md:pt-24 pb-10 px-4 md:px-8 w-full min-w-0">
        <div className="max-w-7xl mx-auto">
          <header className="mb-6 md:mb-8 flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="md:hidden p-2 text-gray-600 bg-white rounded-lg shadow-sm border border-gray-200"
              >
                <Menu size={24} />
              </button>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900 capitalize">
                  {activeTab}
                </h1>
                <p className="text-sm text-gray-500">Welcome back, Admin.</p>
              </div>
            </div>
          </header>

          {activeTab === "overview" && (
            <DashboardOverview products={products} orders={orders} />
          )}
          {activeTab === "products" && (
            <ProductManager products={products} onRefresh={fetchData} />
          )}
          {activeTab === "orders" && (
            <OrderManager orders={orders} onRefresh={fetchData} />
          )}
          {activeTab === "customers" && <CustomerManager />}
          {activeTab === "banners" && <BannerManager />}
          {activeTab === "settings" && <SettingsManager />}
        </div>
      </main>
    </div>
  );
}
