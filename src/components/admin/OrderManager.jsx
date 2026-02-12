import { useState } from "react";
import { supabase } from "../../lib/supabase";
import {
  Eye,
  ChevronDown,
  Check,
  X,
  Truck,
  Package,
  Search,
  Trash2,
} from "lucide-react";
import { formatCurrency } from "../../utils/helpers";
import { useToast } from "../../context/ToastContext";
import Modal from "../ui/Modal";

export default function OrderManager({ orders, onRefresh }) {
  const { success: toastSuccess, error: toastError } = useToast();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  const statusColors = {
    pending: "bg-yellow-100 text-yellow-700",
    processing: "bg-blue-100 text-blue-700",
    shipped: "bg-purple-100 text-purple-700",
    delivered: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
  };

  const handleStatusUpdate = async (id, newStatus) => {
    const order = orders.find((o) => o.id === id);
    if (!order) return;
    const oldStatus = order.status;

    // Allow re-cancelling to trigger restock logic if needed
    if (oldStatus === newStatus && newStatus !== "cancelled") return;

    setUpdatingId(id);
    try {
      // 1. Update Order Status
      const { error: updateError } = await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", id);

      if (updateError) throw updateError;

      // 2. Handle Stock Logic
      // Restock if moving TO cancelled OR if already cancelled and user is re-triggering
      if (newStatus === "cancelled") {
        let successCount = 0;
        const restockPromises = order.items.map(async (item) => {
          const productId = item.id || item.productId;
          if (!productId) return;

          try {
            const { data: product, error: fetchError } = await supabase
              .from("products")
              .select("stock")
              .eq("id", productId)
              .single();

            if (fetchError) throw fetchError;

            if (product) {
              const currentStock = Number(product.stock) || 0;
              const quantityToRestock = Number(item.quantity) || 1;
              const newStock = currentStock + quantityToRestock;

              const { error: updateError } = await supabase
                .from("products")
                .update({ stock: newStock })
                .eq("id", productId);

              if (updateError) throw updateError;
              successCount++;
            }
          } catch (err) {
            console.error(`Error restocking item ${productId}:`, err);
          }
        });

        await Promise.all(restockPromises);

        if (successCount === order.items.length) {
          toastSuccess(
            oldStatus === "cancelled"
              ? "Stock restock re-applied"
              : "Order cancelled and items returned to stock",
          );
        } else if (successCount > 0) {
          toastSuccess(
            `Partial restock: ${successCount}/${order.items.length} items returned to stock`,
          );
        } else {
          toastError(
            "Failed to restock items automatically. Please check inventory.",
          );
        }
      }
      // Deduct if moving FROM cancelled back to an active status
      else if (oldStatus === "cancelled" && newStatus !== "cancelled") {
        let successCount = 0;
        const deductPromises = order.items.map(async (item) => {
          const productId = item.id || item.productId;
          if (!productId) return;

          try {
            const { data: product, error: fetchError } = await supabase
              .from("products")
              .select("stock")
              .eq("id", productId)
              .single();

            if (fetchError) throw fetchError;

            if (product) {
              const currentStock = Number(product.stock) || 0;
              const quantityToDeduct = Number(item.quantity) || 1;
              const newStock = Math.max(0, currentStock - quantityToDeduct);

              const { error: updateError } = await supabase
                .from("products")
                .update({ stock: newStock })
                .eq("id", productId);

              if (updateError) throw updateError;
              successCount++;
            }
          } catch (err) {
            console.error(`Error deducting item ${productId}:`, err);
          }
        });

        await Promise.all(deductPromises);

        if (successCount === order.items.length) {
          toastSuccess("Order reactivated and items deducted from stock");
        } else {
          toastSuccess(
            `Order reactivated. Stock updated for ${successCount}/${order.items.length} items`,
          );
        }
      } else {
        toastSuccess(`Order status updated to ${newStatus}`);
      }

      onRefresh();
    } catch (err) {
      console.error("Error updating status:", err);
      toastError("Failed to update status");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleManualRestock = async (order) => {
    if (
      !window.confirm(
        "Manually restock items from this order? Only do this if stock wasn't automatically returned.",
      )
    )
      return;

    setUpdatingId(order.id);
    try {
      let successCount = 0;
      const restockPromises = order.items.map(async (item) => {
        const productId = item.id || item.productId;
        if (!productId) return;

        const { data: product } = await supabase
          .from("products")
          .select("stock")
          .eq("id", productId)
          .single();

        if (product) {
          const { error } = await supabase
            .from("products")
            .update({
              stock:
                (Number(product.stock) || 0) + (Number(item.quantity) || 1),
            })
            .eq("id", productId);
          if (!error) successCount++;
        }
      });

      await Promise.all(restockPromises);
      toastSuccess(
        `Manually restocked ${successCount}/${order.items.length} items`,
      );
      onRefresh();
    } catch (err) {
      toastError("Manual restock failed");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDeleteOrder = async (id) => {
    if (
      !window.confirm(
        "Are you sure you want to delete this order? This action cannot be undone.",
      )
    ) {
      return;
    }

    setUpdatingId(id);
    try {
      const { error } = await supabase.from("orders").delete().eq("id", id);

      if (error) throw error;

      toastSuccess("Order deleted successfully");
      onRefresh();
    } catch (err) {
      console.error("Error deleting order:", err);
      toastError("Failed to delete order");
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = orders.filter(
    (order) =>
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="relative w-full md:w-96">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Search orders (ID, Name, Email)..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-purple-600 bg-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-bold text-gray-700">Order ID</th>
                <th className="px-6 py-4 font-bold text-gray-700">Customer</th>
                <th className="px-6 py-4 font-bold text-gray-700">Proof</th>
                <th className="px-6 py-4 font-bold text-gray-700">Date</th>
                <th className="px-6 py-4 font-bold text-gray-700">Total</th>
                <th className="px-6 py-4 font-bold text-gray-700">Status</th>
                <th className="px-6 py-4 font-bold text-gray-700 text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredOrders.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 font-mono text-sm text-gray-500">
                    #{order.order_number || order.id.slice(0, 8)}
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="font-medium text-gray-900">
                        {order.customer_name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {order.customer_email}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {order.payment_proof_url ? (
                      <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-100 bg-gray-50">
                        <img
                          src={order.payment_proof_url}
                          alt="Proof"
                          className="w-full h-full object-cover cursor-pointer hover:scale-110 transition-transform"
                          onClick={() => setSelectedOrder(order)}
                        />
                      </div>
                    ) : (
                      <span className="text-xs text-gray-400 italic">None</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 font-bold text-gray-900">
                    {formatCurrency(order.total_amount)}
                  </td>
                  <td className="px-6 py-4">
                    <div className="relative inline-block">
                      {updatingId === order.id ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                      ) : (
                        <select
                          value={order.status}
                          onChange={(e) =>
                            handleStatusUpdate(order.id, e.target.value)
                          }
                          className={`appearance-none pl-3 pr-8 py-1 rounded-full text-xs font-bold uppercase cursor-pointer outline-none focus:ring-2 focus:ring-offset-1 focus:ring-purple-500 ${statusColors[order.status]}`}
                        >
                          <option value="pending">Pending</option>
                          <option value="processing">Processing</option>
                          <option value="shipped">Shipped</option>
                          <option value="delivered">Delivered</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      )}
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none opacity-50" />
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right flex items-center justify-end gap-1">
                    <button
                      onClick={() => setSelectedOrder(order)}
                      className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye size={18} />
                    </button>
                    {order.status === "cancelled" && (
                      <button
                        onClick={() => handleDeleteOrder(order.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Order"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filteredOrders.length === 0 && (
                <tr>
                  <td
                    colSpan="7"
                    className="px-6 py-8 text-center text-gray-500"
                  >
                    No orders found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {filteredOrders.map((order) => (
          <div
            key={order.id}
            className="bg-white p-4 rounded-xl shadow-sm border border-gray-100"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <span className="font-mono text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
                  #{order.order_number || order.id.slice(0, 8)}
                </span>
                <p className="font-bold text-gray-900 mt-2">
                  {order.customer_name}
                </p>
                <p className="text-xs text-gray-500">{order.customer_email}</p>
                {order.payment_proof_url && (
                  <div className="mt-3 w-20 h-20 rounded-lg overflow-hidden border border-gray-100 bg-gray-50">
                    <img
                      src={order.payment_proof_url}
                      alt="Proof"
                      className="w-full h-full object-cover"
                      onClick={() => setSelectedOrder(order)}
                    />
                  </div>
                )}
              </div>
              <div className="relative">
                {updatingId === order.id ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600"></div>
                ) : (
                  <div className="relative inline-block">
                    <select
                      value={order.status}
                      onChange={(e) =>
                        handleStatusUpdate(order.id, e.target.value)
                      }
                      className={`appearance-none pl-3 pr-6 py-1 rounded-full text-[10px] font-bold uppercase cursor-pointer outline-none focus:ring-2 focus:ring-offset-1 focus:ring-purple-500 ${statusColors[order.status]}`}
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none opacity-50" />
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-between items-center py-3 border-t border-gray-50">
              <div>
                <p className="text-xs text-gray-500">Date</p>
                <p className="text-sm font-medium">
                  {new Date(order.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500">Total</p>
                <p className="text-lg font-bold text-purple-600">
                  {formatCurrency(order.total_amount)}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-50 flex items-center gap-3">
              <button
                onClick={() => setSelectedOrder(order)}
                className="flex items-center gap-2 px-4 py-2 bg-gray-50 text-gray-600 rounded-lg text-sm font-medium hover:bg-gray-100 flex-1 justify-center"
              >
                <Eye size={16} />
                View Details
              </button>
              {order.status === "cancelled" && (
                <button
                  onClick={() => handleDeleteOrder(order.id)}
                  className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 flex-1 justify-center"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              )}
            </div>
          </div>
        ))}
        {orders.length === 0 && (
          <div className="text-center py-8 text-gray-500 bg-white rounded-xl border border-gray-100">
            No orders found.
          </div>
        )}
      </div>

      <Modal
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        title={`Order Details - #${selectedOrder?.order_number || selectedOrder?.id.slice(0, 8)}`}
      >
        {selectedOrder && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-50 p-4 rounded-xl">
                <h3 className="font-bold text-gray-900 mb-2">Customer Info</h3>
                <p>
                  <span className="text-gray-500">Name:</span>{" "}
                  {selectedOrder.customer_name}
                </p>
                <p>
                  <span className="text-gray-500">Email:</span>{" "}
                  {selectedOrder.customer_email}
                </p>
                <p>
                  <span className="text-gray-500">Phone:</span>{" "}
                  {selectedOrder.customer_phone}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl">
                <h3 className="font-bold text-gray-900 mb-2">
                  Shipping Address
                </h3>
                <p className="whitespace-pre-wrap">
                  {selectedOrder.shipping_address}
                </p>
              </div>
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-4">
                Order Status Timeline
              </h3>
              <div className="relative flex items-center justify-between w-full p-4">
                {["pending", "processing", "shipped", "delivered"].map(
                  (step, index) => {
                    const stepIndex = [
                      "pending",
                      "processing",
                      "shipped",
                      "delivered",
                    ].indexOf(step);
                    const currentIndex = [
                      "pending",
                      "processing",
                      "shipped",
                      "delivered",
                    ].indexOf(selectedOrder.status);
                    const isCompleted = stepIndex <= currentIndex;
                    const isCurrent = stepIndex === currentIndex;
                    const isCancelled = selectedOrder.status === "cancelled";

                    return (
                      <div
                        key={step}
                        className="flex flex-col items-center relative z-10 w-full"
                      >
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                            isCancelled
                              ? "bg-gray-200 text-gray-400"
                              : isCompleted
                                ? "bg-purple-600 text-white shadow-lg scale-110"
                                : "bg-gray-100 text-gray-400"
                          }`}
                        >
                          {isCompleted && !isCancelled ? (
                            <Check size={16} />
                          ) : (
                            index + 1
                          )}
                        </div>
                        <p
                          className={`text-xs mt-2 font-medium capitalize ${
                            isCurrent && !isCancelled
                              ? "text-purple-600"
                              : "text-gray-500"
                          }`}
                        >
                          {step}
                        </p>

                        {/* Connecting Line */}
                        {index < 3 && (
                          <div
                            className={`absolute top-4 left-1/2 w-full h-1 -z-10 ${
                              isCancelled
                                ? "bg-gray-100"
                                : stepIndex < currentIndex
                                  ? "bg-purple-600"
                                  : "bg-gray-100"
                            }`}
                          />
                        )}
                      </div>
                    );
                  },
                )}
              </div>
              {selectedOrder.status === "cancelled" && (
                <div className="bg-red-50 text-red-600 p-3 rounded-xl text-center text-sm font-bold mt-2">
                  This order has been cancelled.
                </div>
              )}
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-4">
                Payment Verification
              </h3>
              {selectedOrder.payment_proof_url ? (
                <div className="space-y-3">
                  <div className="aspect-[4/3] rounded-xl overflow-hidden border border-gray-100 bg-gray-50 group relative">
                    <img
                      src={selectedOrder.payment_proof_url}
                      alt="Payment Proof"
                      className="w-full h-full object-contain"
                    />
                    <a
                      href={selectedOrder.payment_proof_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white font-medium gap-2"
                    >
                      <Eye size={20} />
                      View Full Size
                    </a>
                  </div>
                  <p className="text-xs text-gray-500 text-center italic">
                    Click image to view in full size
                  </p>
                </div>
              ) : (
                <div className="p-8 border-2 border-dashed border-gray-200 rounded-xl text-center">
                  <Package className="mx-auto text-gray-300 mb-2" size={32} />
                  <p className="text-sm text-gray-500">
                    No payment proof uploaded
                  </p>
                </div>
              )}
            </div>

            <div>
              <h3 className="font-bold text-gray-900 mb-4">Order Items</h3>
              <div className="space-y-3">
                {selectedOrder.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-3 border border-gray-100 rounded-xl"
                  >
                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                      {item.images?.[0] && (
                        <img
                          src={item.images[0]}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                    <div className="flex-grow">
                      <p className="font-bold text-gray-900">{item.name}</p>
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        {item.variant?.color && (
                          <span>Color: {item.variant.color}</span>
                        )}
                        {item.variant?.storage && (
                          <span>Storage: {item.variant.storage}</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{formatCurrency(item.price)}</p>
                      <p className="text-sm text-gray-500">
                        Qty: {item.quantity}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-4 border-t border-gray-100">
              <div className="flex justify-between items-center text-gray-600">
                <span>Subtotal</span>
                <span className="font-medium">
                  {formatCurrency(
                    selectedOrder.subtotal ||
                      selectedOrder.total_amount -
                        (selectedOrder.shipping_fee || 0),
                  )}
                </span>
              </div>
              <div className="flex justify-between items-center text-gray-600">
                <span>Shipping Fee</span>
                <span className="font-medium">
                  {formatCurrency(selectedOrder.shipping_fee || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                <span className="font-bold text-lg text-gray-900">
                  Total Amount
                </span>
                <span className="font-bold text-2xl text-purple-600">
                  {formatCurrency(selectedOrder.total_amount)}
                </span>
              </div>
            </div>

            {selectedOrder.status === "cancelled" && (
              <div className="pt-6 space-y-3">
                <button
                  onClick={() => handleManualRestock(selectedOrder)}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-orange-50 text-orange-600 rounded-xl font-medium hover:bg-orange-100 transition-all border border-orange-100"
                >
                  <Package size={18} />
                  Force Restock Items
                </button>
                <button
                  onClick={() => {
                    handleDeleteOrder(selectedOrder.id);
                    setSelectedOrder(null);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-red-50 text-red-600 rounded-2xl font-bold hover:bg-red-100 transition-all border border-red-100"
                >
                  <Trash2 size={20} />
                  Delete Cancelled Order
                </button>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
