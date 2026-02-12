import { useState, useEffect, useRef } from "react";
import {
  Banknote,
  ShoppingBag,
  Package,
  AlertTriangle,
  TrendingUp,
  BarChart3,
} from "lucide-react";
import { formatCurrency } from "../../utils/helpers";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

export default function DashboardOverview({ products, orders }) {
  const [isMounted, setIsMounted] = useState(false);
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 350 });

  useEffect(() => {
    setIsMounted(true);

    if (containerRef.current) {
      const resizeObserver = new ResizeObserver((entries) => {
        if (!entries || entries.length === 0) return;
        const { width, height } = entries[0].contentRect;
        if (width > 0 && height > 0) {
          setDimensions({ width, height });
        }
      });

      resizeObserver.observe(containerRef.current);
      return () => resizeObserver.disconnect();
    }
  }, []);

  const confirmedOrders = orders.filter((o) =>
    ["processing", "shipped", "delivered"].includes(o.status),
  );

  const totalRevenue = confirmedOrders.reduce(
    (sum, order) => sum + (Number(order.total_amount) || 0),
    0,
  );

  const totalConfirmedOrders = confirmedOrders.length;
  const pendingOrders = orders.filter((o) =>
    ["pending", "pending_payment"].includes(o.status),
  ).length;

  const totalProducts = products.length;
  const lowStockProducts = products.filter((p) => (Number(p.stock) || 0) < 5);

  // Prepare Chart Data (Last 7 Days)
  const chartData = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0); // Start of day

    const nextDay = new Date(d);
    nextDay.setDate(d.getDate() + 1); // Start of next day

    const dateStr = d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

    // Sum confirmed orders for this day
    const dayOrders = orders.filter((o) => {
      const orderDate = new Date(o.created_at);
      return (
        orderDate >= d &&
        orderDate < nextDay &&
        ["processing", "shipped", "delivered"].includes(o.status)
      );
    });

    const revenue = dayOrders.reduce(
      (sum, o) => sum + (Number(o.total_amount) || 0),
      0,
    );
    chartData.push({ name: dateStr, revenue });
  }

  const stats = [
    {
      label: "Confirmed Revenue",
      value: formatCurrency(totalRevenue),
      icon: Banknote,
      color: "bg-green-100 text-green-600",
    },
    {
      label: "Pending Orders",
      value: pendingOrders,
      icon: AlertTriangle,
      color: "bg-yellow-100 text-yellow-600",
    },
    {
      label: "Confirmed Sales",
      value: totalConfirmedOrders,
      icon: Package,
      color: "bg-blue-100 text-blue-600",
    },
    {
      label: "Low Stock",
      value: lowStockProducts.length,
      icon: AlertTriangle,
      color: "bg-orange-100 text-orange-600",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Overview
          </h1>
          <p className="text-gray-500 text-sm mt-1">Welcome back, Admin.</p>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="p-2 bg-white border border-gray-200 rounded-xl shadow-sm text-gray-500 hover:text-purple-600 hover:border-purple-100 transition-all flex items-center gap-2"
        >
          <BarChart3 size={18} />
          <span className="text-sm font-medium hidden sm:inline">
            Refresh Dashboard
          </span>
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className={`p-2 sm:p-3 rounded-xl ${stat.color}`}>
                <stat.icon size={20} className="sm:w-6 sm:h-6" />
              </div>
            </div>
            <h3 className="text-gray-500 text-[10px] sm:text-sm font-medium uppercase tracking-wider">
              {stat.label}
            </h3>
            <p className="text-lg sm:text-2xl font-bold text-gray-900 mt-1">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Sales Chart */}
        <div className="lg:col-span-2 bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <TrendingUp size={20} className="text-purple-600" />
              Revenue Analytics
            </h2>
          </div>
          <div
            ref={containerRef}
            className="w-full"
            style={{
              height: "350px",
              minHeight: "350px",
              position: "relative",
            }}
          >
            {isMounted && dimensions.width > 0 && (
              <div style={{ width: "100%", height: "100%" }}>
                <AreaChart
                  width={dimensions.width}
                  height={dimensions.height}
                  data={chartData}
                  margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient
                      id="colorRevenue"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#9333ea" stopOpacity={0.1} />
                      <stop offset="95%" stopColor="#9333ea" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f3f4f6"
                  />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#6b7280", fontSize: 10 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: "#6b7280", fontSize: 10 }}
                    tickFormatter={(value) =>
                      value === 0
                        ? "₦0"
                        : value >= 1000
                          ? `₦${(value / 1000).toFixed(1)}k`
                          : `₦${value}`
                    }
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "12px",
                      border: "none",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                    formatter={(value) => [formatCurrency(value), "Revenue"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#9333ea"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </div>
            )}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-sm border border-gray-100">
          <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
            <AlertTriangle size={20} className="text-orange-500" />
            Low Stock Alerts
          </h2>
          <div className="space-y-3 sm:space-y-4 max-h-[300px] sm:max-h-[340px] overflow-y-auto pr-2 custom-scrollbar">
            {lowStockProducts.length > 0 ? (
              lowStockProducts.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center gap-4 p-3 bg-orange-50 rounded-xl border border-orange-100"
                >
                  <div className="w-12 h-12 bg-white rounded-lg flex-shrink-0 overflow-hidden">
                    {product.images?.[0] && (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {product.name}
                    </p>
                    <p className="text-sm text-orange-600 font-medium">
                      {product.stock} remaining
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">
                All products are well stocked.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Orders Preview */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-lg font-bold mb-4">Recent Activity</h2>
        <div className="space-y-4">
          {orders.slice(0, 5).map((order) => (
            <div
              key={order.id}
              className="flex items-center justify-between p-4 bg-gray-50 rounded-xl"
            >
              <div>
                <p className="font-bold text-gray-900">{order.customer_name}</p>
                <p className="text-sm text-gray-500">
                  {new Date(order.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p className="font-bold text-purple-600">
                  {formatCurrency(order.total_amount)}
                </p>
                <span
                  className={`text-xs px-2 py-1 rounded-full capitalize ${
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
            </div>
          ))}
          {orders.length === 0 && (
            <p className="text-gray-500 text-center py-4">No orders yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
