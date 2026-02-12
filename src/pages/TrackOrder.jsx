import { useState } from "react";
import { supabase } from "../lib/supabase";
import {
  Search,
  Package,
  CheckCircle,
  Clock,
  Truck,
  XCircle,
  ArrowRight,
} from "lucide-react";
import { formatCurrency } from "../utils/helpers";
import { motion } from "framer-motion";

export default function TrackOrder() {
  const [orderId, setOrderId] = useState("");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!orderId.trim()) return;

    setLoading(true);
    setError("");
    setOrder(null);

    try {
      // First try full UUID
      let { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId.trim())
        .maybeSingle();

      // If not found, try prefix match (first 8 chars)
      if (!data) {
        const { data: prefixData, error: prefixError } = await supabase
          .from("orders")
          .select("*")
          .ilike("id", `${orderId.trim()}%`);

        if (prefixError) throw prefixError;
        if (prefixData && prefixData.length === 1) {
          data = prefixData[0];
        } else if (prefixData && prefixData.length > 1) {
          throw new Error(
            "Multiple orders found with this prefix. Please provide more characters.",
          );
        }
      }

      if (error) throw error;
      if (!data) throw new Error("Order not found");

      setOrder(data);
    } catch (err) {
      console.error("Error finding order:", err);
      setError("Order not found. Please check your Order ID and try again.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusStep = (status) => {
    const steps = [
      "pending",
      "pending_payment",
      "processing",
      "shipped",
      "delivered",
    ];
    const index = steps.indexOf(status);
    return index === -1 ? 0 : index; // Default to 0 if unknown (or cancelled)
  };

  const steps = [
    { label: "Order Placed", icon: Package },
    { label: "Processing", icon: Clock },
    { label: "Shipped", icon: Truck },
    { label: "Delivered", icon: CheckCircle },
  ];

  const currentStepIndex = order
    ? getStatusStep(
        order.status === "pending_payment" ? "pending" : order.status,
      )
    : 0;

  return (
    <div className="min-h-screen pt-24 sm:pt-32 pb-12 sm:pb-16 px-4 sm:px-6 bg-gray-50">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
            Track Your Order
          </h1>
          <p className="text-sm sm:text-base text-gray-600 px-4">
            Enter your Order ID to see the current status of your package.
          </p>
        </div>

        {/* Search Box */}
        <div className="bg-white p-1.5 sm:p-2 rounded-xl sm:rounded-2xl shadow-lg shadow-purple-100 mb-8 sm:mb-12 max-w-xl mx-auto border border-gray-100">
          <form
            onSubmit={handleSearch}
            className="flex items-center gap-1 sm:gap-2"
          >
            <div className="pl-3 sm:pl-4 text-gray-400">
              <Search size={18} className="sm:w-5 sm:h-5" />
            </div>
            <input
              type="text"
              placeholder="Order ID (e.g. 550e8400...)"
              className="flex-1 py-3 sm:py-4 bg-transparent outline-none text-sm sm:text-base text-gray-900 placeholder-gray-400 min-w-0"
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
            />
            <button
              type="submit"
              disabled={loading}
              className="px-4 sm:px-6 py-2.5 sm:py-3 bg-purple-600 text-white rounded-lg sm:rounded-xl font-bold hover:bg-purple-700 transition-all disabled:opacity-50 text-sm sm:text-base flex-shrink-0"
            >
              {loading ? "..." : "Track"}
            </button>
          </form>
        </div>

        {/* Error Message */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 text-red-600 p-3 sm:p-4 rounded-xl text-center border border-red-100 mb-8 text-sm sm:text-base"
          >
            {error}
          </motion.div>
        )}

        {/* Order Details */}
        {order && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
          >
            {/* Status Header */}
            <div className="bg-gray-900 text-white p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="min-w-0 w-full sm:w-auto">
                  <p className="text-gray-400 text-[10px] sm:text-sm mb-1 uppercase tracking-wider">
                    Order ID
                  </p>
                  <p className="font-mono text-sm sm:text-lg md:text-xl truncate">
                    {order.id}
                  </p>
                </div>
                <div className="px-3 py-1.5 sm:px-4 sm:py-2 bg-white/10 rounded-full backdrop-blur-md border border-white/20 flex-shrink-0">
                  <span className="font-bold uppercase tracking-wider text-[10px] sm:text-xs">
                    {order.status.replace("_", " ")}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-8">
              {/* Progress Steps */}
              <div className="relative flex justify-between mb-10 sm:mb-12 px-2">
                {/* Progress Bar Background */}
                <div className="absolute top-4 sm:top-5 left-8 right-8 h-0.5 sm:h-1 bg-gray-100 z-0" />

                {/* Active Progress Bar */}
                <div
                  className="absolute top-4 sm:top-5 left-8 h-0.5 sm:h-1 bg-purple-600 z-0 transition-all duration-1000"
                  style={{
                    width: `calc(${(currentStepIndex / (steps.length - 1)) * 100}% - 0px)`,
                    maxWidth: "calc(100% - 64px)",
                  }}
                />

                {steps.map((step, index) => {
                  const isActive = index <= currentStepIndex;
                  return (
                    <div
                      key={index}
                      className="relative z-10 flex flex-col items-center"
                    >
                      <div
                        className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center border-2 sm:border-4 transition-all duration-500 ${
                          isActive
                            ? "bg-purple-600 border-purple-100 text-white shadow-lg shadow-purple-200"
                            : "bg-white border-gray-100 text-gray-300"
                        }`}
                      >
                        <step.icon
                          size={14}
                          className="sm:w-[18px] sm:h-[18px]"
                        />
                      </div>
                      <p
                        className={`mt-2 sm:mt-3 text-[10px] sm:text-xs md:text-sm font-bold transition-colors text-center ${
                          isActive ? "text-gray-900" : "text-gray-400"
                        }`}
                      >
                        {step.label}
                      </p>
                    </div>
                  );
                })}
              </div>

              {/* Order Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-6 sm:pt-8 border-t border-gray-100">
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="font-bold text-gray-900 text-sm sm:text-base uppercase tracking-wider">
                    Shipping Details
                  </h3>
                  <div>
                    <p className="text-gray-900 font-bold text-sm sm:text-base">
                      {order.customer_name}
                    </p>
                    <p className="text-gray-500 text-xs sm:text-sm mt-1 leading-relaxed">
                      {order.shipping_address}
                    </p>
                    <p className="text-gray-500 text-xs sm:text-sm mt-1">
                      {order.customer_phone}
                    </p>
                  </div>
                </div>

                <div className="space-y-3 sm:space-y-4">
                  <h3 className="font-bold text-gray-900 text-sm sm:text-base uppercase tracking-wider">
                    Order Summary
                  </h3>
                  <div className="space-y-3">
                    {order.items.map((item, i) => (
                      <div
                        key={i}
                        className="flex justify-between text-xs sm:text-sm gap-4"
                      >
                        <span className="text-gray-600 min-w-0 truncate">
                          {item.quantity}x {item.name}
                        </span>
                        <span className="font-medium text-gray-900 flex-shrink-0">
                          {formatCurrency(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                    <div className="pt-3 border-t border-gray-100 flex justify-between font-bold text-base sm:text-lg">
                      <span className="text-gray-900">Total</span>
                      <span className="text-purple-600">
                        {formatCurrency(order.total_amount)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
