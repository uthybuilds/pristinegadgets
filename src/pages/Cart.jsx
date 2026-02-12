import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import { formatCurrency } from "../utils/helpers";
import {
  Minus,
  Plus,
  Trash2,
  ArrowRight,
  ShoppingBag,
  ArrowLeft,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Cart() {
  const { cart, removeFromCart, updateQuantity, cartTotal, clearCart } =
    useCart();
  const navigate = useNavigate();

  if (cart.length === 0) {
    return (
      <div className="min-h-screen pt-24 pb-16 flex flex-col items-center justify-center text-center px-4">
        <div className="w-24 h-24 bg-purple-50 rounded-full flex items-center justify-center text-purple-600 mb-6">
          <ShoppingBag size={40} />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Your cart is empty
        </h1>
        <p className="text-gray-500 mb-8 max-w-md">
          Looks like you haven't added anything to your cart yet. Explore our
          premium collection of gadgets.
        </p>
        <Link
          to="/shop"
          className="px-8 py-3 bg-purple-600 text-white rounded-xl font-bold hover:bg-purple-700 transition-all hover:shadow-lg hover:shadow-purple-200"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 md:pt-24 pb-24 md:pb-16 bg-gray-50">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex justify-between items-center mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Shopping Cart
          </h1>
          <button
            onClick={() => {
              if (window.confirm("Are you sure you want to clear your cart?")) {
                clearCart();
              }
            }}
            className="text-sm font-medium text-red-500 hover:text-red-600 flex items-center gap-1 transition-colors"
          >
            <Trash2 size={16} />
            Clear Cart
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence mode="popLayout">
              {cart.map((item) => (
                <motion.div
                  key={`${item.id}-${JSON.stringify(item.variant)}`}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="bg-white p-3 sm:p-4 rounded-2xl border border-gray-100 shadow-sm flex gap-3 sm:gap-6"
                >
                  {/* Image */}
                  <div className="w-20 h-20 sm:w-32 sm:h-32 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0 flex items-center justify-center">
                    {item.images?.[0] ? (
                      <img
                        src={item.images[0]}
                        alt={item.name}
                        className="w-full h-full object-contain p-2"
                      />
                    ) : (
                      <ShoppingBag size={24} className="text-gray-300" />
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-bold text-gray-900 text-sm sm:text-lg leading-tight truncate">
                          <Link
                            to={`/product/${item.id}`}
                            className="hover:text-purple-600 transition-colors"
                          >
                            {item.name}
                          </Link>
                        </h3>
                        <button
                          onClick={() => removeFromCart(item.id, item.variant)}
                          className="flex items-center gap-1 text-gray-400 hover:text-red-500 transition-colors p-1"
                        >
                          <Trash2 size={16} />
                          <span className="text-xs font-medium hidden sm:inline">
                            Remove
                          </span>
                        </button>
                      </div>

                      {/* Variants */}
                      <div className="flex flex-wrap gap-2 mt-1 text-[10px] sm:text-sm text-gray-500">
                        {item.variant?.color && (
                          <span className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                            <span
                              className="w-3 h-3 rounded-full border border-gray-200"
                              style={{
                                backgroundColor: item.variant.color.startsWith(
                                  "#",
                                )
                                  ? item.variant.color
                                  : undefined,
                              }}
                            />
                            <span className="capitalize">
                              {item.variant.color}
                            </span>
                          </span>
                        )}
                        {item.variant?.storage && (
                          <span className="bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                            {item.variant.storage}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4">
                      <p className="font-bold text-purple-600 text-base sm:text-lg">
                        {formatCurrency(item.price)}
                      </p>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center border border-gray-200 rounded-lg bg-gray-50 w-fit h-9 sm:h-10">
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.id,
                                item.variant,
                                item.quantity - 1,
                              )
                            }
                            className="px-2 sm:px-3 hover:text-purple-600 transition-colors disabled:opacity-50"
                            disabled={item.quantity <= 1}
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-8 text-center font-bold text-xs sm:text-sm">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateQuantity(
                                item.id,
                                item.variant,
                                item.quantity + 1,
                              )
                            }
                            className="px-2 sm:px-3 hover:text-purple-600 transition-colors"
                          >
                            <Plus size={14} />
                          </button>
                        </div>

                        {/* Mobile Remove Button */}
                        <button
                          onClick={() => removeFromCart(item.id, item.variant)}
                          className="sm:hidden text-xs font-medium text-red-500 bg-red-50 px-3 py-2 rounded-lg"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            <button
              onClick={() => navigate("/shop")}
              className="flex items-center gap-2 text-gray-500 hover:text-purple-600 font-medium mt-4 transition-colors"
            >
              <ArrowLeft size={18} />
              Continue Shopping
            </button>
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                Order Summary
              </h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span className="font-medium">
                    {formatCurrency(cartTotal)}
                  </span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className="text-gray-400 text-xs italic">
                    Calculated at checkout
                  </span>
                </div>
                <div className="h-px bg-gray-100 my-4" />
                <div className="flex justify-between text-lg font-bold text-gray-900">
                  <span>Total</span>
                  <span>{formatCurrency(cartTotal)}</span>
                </div>
              </div>

              <button
                onClick={() => navigate("/checkout")}
                className="w-full py-4 bg-purple-600 text-white rounded-xl font-bold text-lg hover:bg-purple-700 transition-all shadow-lg shadow-purple-200 flex items-center justify-center gap-2 group"
              >
                Proceed to Checkout
                <ArrowRight
                  size={20}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </button>

              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-400">
                <ShoppingBag size={12} />
                <span>Secure Checkout</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
