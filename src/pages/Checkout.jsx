import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import { formatCurrency } from "../utils/helpers";
import {
  ArrowLeft,
  Loader,
  CheckCircle,
  ShoppingBag,
  Upload,
  X,
  Copy,
  UserCheck,
  MessageCircle,
  Package,
} from "lucide-react";
import { useDropzone } from "react-dropzone";
import { motion } from "framer-motion";

export default function Checkout() {
  const { cart, cartTotal, clearCart } = useCart();
  const { error: toastError, success: toastSuccess } = useToast();
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState("NEW");
  const [currentProofUrl, setCurrentProofUrl] = useState("");
  const [proofFile, setProofFile] = useState(null);
  const [proofPreview, setProofPreview] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
  });

  const [shippingFee, setShippingFee] = useState(0);

  // Calculate shipping whenever state changes
  useEffect(() => {
    if (!formData.state) {
      setShippingFee(0);
      return;
    }

    const state = formData.state.toLowerCase().trim();
    // Research-based shipping: Lagos (~3000-5000), Outside Lagos (~7000-10000)
    if (state.includes("lagos")) {
      setShippingFee(5000);
    } else if (state) {
      setShippingFee(10000);
    } else {
      setShippingFee(0);
    }
  }, [formData.state]);

  const grandTotal = cartTotal + shippingFee;

  // Auto-fill form if user is logged in
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: profile?.full_name || user.user_metadata?.full_name || prev.name,
        email: user.email || prev.email,
        phone: profile?.phone || user.user_metadata?.phone || prev.phone,
        address: profile?.address || prev.address,
        city: profile?.city || prev.city,
        state: profile?.state || prev.state,
        zip: profile?.postal_code || prev.zip,
      }));
    }
  }, [user, profile]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onDrop = useCallback((acceptedFiles) => {
    const file = acceptedFiles[0];
    if (file) {
      setProofFile(file);
      setProofPreview(URL.createObjectURL(file));
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/*": [] },
    multiple: false,
  });

  const removeProof = () => {
    setProofFile(null);
    setProofPreview(null);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toastSuccess("Copied to clipboard!");
  };

  const handleWhatsAppRedirect = async (
    orderNo,
    currentProofUrl,
    useNativeShare = false,
  ) => {
    const fullAddress = `${formData.address}, ${formData.city}, ${formData.state} ${formData.zip}`;
    const baseMessage =
      `New Order #${orderNo}\n\n` +
      `Customer: ${formData.name}\n` +
      `Phone: ${formData.phone}\n` +
      `Address: ${fullAddress}\n` +
      `Total Amount: ${formatCurrency(grandTotal)}\n` +
      `Shipping: ${formatCurrency(shippingFee)}`;

    const whatsappUrl = `https://wa.me/2347034025834?text=${encodeURIComponent(baseMessage + "\n\nPayment Proof: " + (currentProofUrl || ""))}`;

    // Try to share the actual file if requested (only works on user click)
    if (
      useNativeShare &&
      navigator.share &&
      proofFile &&
      navigator.canShare &&
      navigator.canShare({ files: [proofFile] })
    ) {
      try {
        await navigator.share({
          files: [proofFile],
          title: `Order #${orderNo} Proof`,
          text: baseMessage,
        });
        return;
      } catch (error) {
        if (error.name !== "AbortError") {
          console.error("Error sharing file:", error);
        }
      }
    }

    // Fallback: Copy text to clipboard for convenience if on desktop
    try {
      await navigator.clipboard.writeText(baseMessage);
    } catch (err) {
      console.error("Failed to copy text:", err);
    }

    // Direct WhatsApp API link to force open the app
    const directApiUrl = `whatsapp://send?phone=2347034025834&text=${encodeURIComponent(baseMessage + "\n\nPayment Proof: " + (currentProofUrl || ""))}`;
    window.location.href = directApiUrl;

    // Secondary fallback for browsers that don't support protocol links
    setTimeout(() => {
      window.open(whatsappUrl, "_blank");
    }, 500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (cart.length === 0) {
      toastError("Your cart is empty.");
      return;
    }

    if (!proofFile) {
      toastError("Please upload a proof of payment to continue.");
      return;
    }

    setLoading(true);

    try {
      // 1. Upload Proof to Cloudinary
      const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
      const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

      let proofUrl = "";

      if (CLOUD_NAME && UPLOAD_PRESET) {
        const data = new FormData();
        data.append("file", proofFile);
        data.append("upload_preset", UPLOAD_PRESET);
        data.append("folder", "pristine-orders");

        const res = await fetch(
          `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
          { method: "POST", body: data },
        );

        const fileData = await res.json();
        if (fileData.error) throw new Error(fileData.error.message);
        proofUrl = fileData.secure_url;
      } else {
        console.warn(
          "Cloudinary config missing, skipping upload but proceeding with order.",
        );
      }

      // 2. Create Order
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const orderData = {
        user_id: user?.id || null, // Associate with logged in user if available
        customer_name: formData.name,
        customer_email: formData.email,
        customer_phone: formData.phone,
        shipping_address: `${formData.address}, ${formData.city}, ${formData.state} ${formData.zip}`,
        items: cart,
        total_amount: grandTotal,
        shipping_fee: shippingFee,
        subtotal: cartTotal,
        status: "pending_payment",
        payment_method: "bank_transfer",
        payment_proof_url: proofUrl,
      };

      const { data: order, error } = await supabase
        .from("orders")
        .insert([orderData])
        .select()
        .single();

      if (error) throw error;

      if (order?.order_number) setOrderNumber(order.order_number);
      setCurrentProofUrl(proofUrl);
      toastSuccess("Order placed successfully!");

      // 3. Deduct Stock from Products
      const stockUpdates = cart.map(async (item) => {
        const { data: product, error: fetchError } = await supabase
          .from("products")
          .select("stock")
          .eq("id", item.id)
          .single();

        if (fetchError) {
          console.error(
            `Error fetching stock for product ${item.id}:`,
            fetchError,
          );
          return;
        }

        const newStock = Math.max(0, (product.stock || 0) - item.quantity);

        const { error: updateError } = await supabase
          .from("products")
          .update({ stock: newStock })
          .eq("id", item.id);

        if (updateError) {
          console.error(
            `Error updating stock for product ${item.id}:`,
            updateError,
          );
        }
      });

      await Promise.all(stockUpdates);

      setSuccess(true);
      clearCart();

      // Immediate redirect to WhatsApp app
      handleWhatsAppRedirect(order?.order_number || orderNumber, proofUrl);
    } catch (error) {
      console.error("Error placing order:", error);
      toastError("Failed to place order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex flex-col items-center justify-center text-center px-4 bg-gray-50">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-6"
        >
          <CheckCircle size={48} />
        </motion.div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Order Placed! #{orderNumber}
        </h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          Redirecting you to complete your order on WhatsApp...
        </p>
        <div className="flex flex-col gap-4">
          <button
            onClick={() =>
              handleWhatsAppRedirect(orderNumber, currentProofUrl, true)
            }
            className="px-8 py-3 bg-[#25D366] text-white rounded-xl font-bold hover:bg-[#128C7E] transition-colors flex items-center justify-center gap-2"
          >
            <MessageCircle size={20} />
            Click here if not redirected
          </button>
          <button
            onClick={() => navigate("/shop")}
            className="px-8 py-3 bg-gray-200 text-gray-900 rounded-xl font-bold hover:bg-gray-300 transition-all"
          >
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    navigate("/shop");
    return null;
  }

  return (
    <div className="min-h-screen pt-20 md:pt-24 pb-16 bg-gray-50">
      <div className="container mx-auto px-4 max-w-6xl">
        <button
          onClick={() => navigate("/cart")}
          className="flex items-center gap-2 text-gray-500 hover:text-purple-600 mb-6 md:mb-8 transition-colors text-sm font-medium"
        >
          <ArrowLeft size={18} />
          <span>Back to Cart</span>
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Checkout Form */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                Checkout
              </h1>
              {user && (
                <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-1.5 rounded-full border border-green-100">
                  <UserCheck size={16} />
                  <span className="text-xs font-bold">Details auto-filled</span>
                </div>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-4">
                  Contact Information
                </h2>

                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-purple-600 text-sm"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleChange}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs sm:text-sm font-medium text-gray-700">
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      required
                      className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-purple-600 text-sm"
                      placeholder="john@example.com"
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs sm:text-sm font-medium text-gray-700">
                      Phone
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      required
                      className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-purple-600 text-sm"
                      placeholder="+234..."
                      value={formData.phone}
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-100 shadow-sm space-y-4">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-4">
                  Shipping Address
                </h2>

                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-medium text-gray-700">
                    Address
                  </label>
                  <input
                    type="text"
                    name="address"
                    required
                    className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-purple-600 text-sm"
                    placeholder="123 Main St"
                    value={formData.address}
                    onChange={handleChange}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs sm:text-sm font-medium text-gray-700">
                      City
                    </label>
                    <input
                      type="text"
                      name="city"
                      required
                      className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-purple-600 text-sm"
                      value={formData.city}
                      onChange={handleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs sm:text-sm font-medium text-gray-700">
                      State
                    </label>
                    <input
                      type="text"
                      name="state"
                      required
                      className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-purple-600 text-sm"
                      value={formData.state}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-medium text-gray-700">
                    ZIP Code
                  </label>
                  <input
                    type="text"
                    name="zip"
                    className="w-full p-3 rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-purple-600 text-sm"
                    value={formData.zip}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                  Payment Method: Bank Transfer
                </h2>

                <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                  <p className="text-xs sm:text-sm text-purple-800 mb-4">
                    Please transfer{" "}
                    <strong>{formatCurrency(grandTotal)}</strong> to one of the
                    accounts below:
                  </p>

                  <div className="space-y-3">
                    <div className="bg-white p-3 rounded-lg border border-purple-100 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-[10px] text-gray-500 uppercase font-bold truncate">
                          Zenith Bank
                        </p>
                        <p className="font-mono font-bold text-sm sm:text-base text-gray-900">
                          1012345678
                        </p>
                        <p className="text-[10px] sm:text-xs text-gray-600 truncate">
                          Pristine Gadgets Ltd
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard("1012345678")}
                        className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg flex-shrink-0"
                      >
                        <Copy size={16} />
                      </button>
                    </div>

                    <div className="bg-white p-3 rounded-lg border border-purple-100 flex items-center justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-[10px] text-gray-500 uppercase font-bold truncate">
                          GTBank
                        </p>
                        <p className="font-mono font-bold text-sm sm:text-base text-gray-900">
                          0123456789
                        </p>
                        <p className="text-[10px] sm:text-xs text-gray-600 truncate">
                          Pristine Gadgets Ltd
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => copyToClipboard("0123456789")}
                        className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg flex-shrink-0"
                      >
                        <Copy size={16} />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-gray-900">
                    Upload Proof of Payment
                  </h3>
                  <div
                    {...getRootProps()}
                    className={`border-2 border-dashed rounded-2xl p-6 sm:p-8 text-center transition-all cursor-pointer ${
                      isDragActive
                        ? "border-purple-600 bg-purple-50"
                        : "border-gray-200 hover:border-purple-600 hover:bg-gray-50"
                    }`}
                  >
                    <input {...getInputProps()} />
                    <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Upload size={24} />
                    </div>
                    <p className="text-sm font-bold text-gray-900 mb-1">
                      {isDragActive
                        ? "Drop the file here"
                        : "Select or Drop Image"}
                    </p>
                    <p className="text-xs text-gray-500">
                      Upload a screenshot of your transfer
                    </p>
                  </div>

                  {proofPreview && (
                    <div className="relative w-full aspect-video rounded-xl overflow-hidden border border-gray-200 bg-gray-50 group">
                      <img
                        src={proofPreview}
                        alt="Payment Proof"
                        className="w-full h-full object-contain"
                      />
                      <button
                        type="button"
                        onClick={removeProof}
                        className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-purple-600 text-white rounded-xl font-bold text-lg hover:bg-purple-700 transition-all shadow-lg shadow-purple-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                >
                  {loading ? (
                    <>
                      <Loader className="animate-spin" size={20} />
                      Processing...
                    </>
                  ) : (
                    "Place Order"
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white p-5 sm:p-6 rounded-2xl border border-gray-100 shadow-sm sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Order Summary
              </h2>

              <div className="space-y-4 max-h-[300px] sm:max-h-[400px] overflow-y-auto pr-2 custom-scrollbar mb-6">
                {cart.map((item) => (
                  <div
                    key={`${item.id}-${JSON.stringify(item.variant)}`}
                    className="flex gap-4"
                  >
                    <div className="w-16 h-16 bg-gray-50 rounded-lg flex-shrink-0 overflow-hidden flex items-center justify-center">
                      {item.images?.[0] ? (
                        <img
                          src={item.images[0]}
                          alt={item.name}
                          className="w-full h-full object-contain p-1"
                        />
                      ) : (
                        <ShoppingBag size={20} className="text-gray-300" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-900 text-sm truncate">
                        {item.name}
                      </h4>
                      <p className="text-xs text-gray-500">
                        {item.quantity} × {formatCurrency(item.price)}
                      </p>
                      {item.variant && (
                        <p className="text-[10px] text-purple-600 font-medium uppercase mt-1">
                          {item.variant.color} / {item.variant.storage}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 pt-6 border-t border-gray-100">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-medium">
                    {formatCurrency(cartTotal)}
                  </span>
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>Shipping</span>
                  <span
                    className={
                      shippingFee === 0
                        ? "text-gray-400"
                        : "text-purple-600 font-bold"
                    }
                  >
                    {shippingFee === 0
                      ? "Select State"
                      : formatCurrency(shippingFee)}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold text-gray-900 pt-3 border-t border-gray-100 mt-3">
                  <span>Total</span>
                  <span>{formatCurrency(grandTotal)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
