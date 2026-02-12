import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Smartphone,
  CheckCircle,
  AlertCircle,
  RefreshCw,
} from "lucide-react";
import { Link } from "react-router-dom";

export default function TradeIn() {
  const [step, setStep] = useState(1);
  const [device, setDevice] = useState({
    model: "",
    storage: "",
    condition: "",
  });
  const [estimate, setEstimate] = useState(null);

  const models = [
    "iPhone 15 Pro Max",
    "iPhone 15 Pro",
    "iPhone 15 Plus",
    "iPhone 15",
    "iPhone 14 Pro Max",
    "iPhone 14 Pro",
    "iPhone 14 Plus",
    "iPhone 14",
    "iPhone 13 Pro Max",
    "iPhone 13 Pro",
    "iPhone 13",
    "iPhone 13 mini",
  ];

  const handleCalculate = () => {
    // Dummy calculation logic
    let basePrice = 0;
    if (device.model.includes("15 Pro Max")) basePrice = 950000;
    else if (device.model.includes("15 Pro")) basePrice = 850000;
    else if (device.model.includes("14")) basePrice = 600000;
    else basePrice = 400000;

    if (device.condition === "good") basePrice *= 0.8;
    if (device.condition === "fair") basePrice *= 0.6;

    setEstimate(basePrice);
    setStep(2);
  };

  return (
    <div className="pt-20 sm:pt-24 pb-12 sm:pb-20 min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-10 sm:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <span className="px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-xs sm:text-sm font-bold mb-3 sm:mb-4 inline-block">
              Pristine Trade-In
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-black text-gray-900 mb-4 sm:mb-6 leading-tight">
              Upgrade to the Future
            </h1>
            <p className="text-base sm:text-xl text-gray-500 max-w-2xl mx-auto px-4">
              Get credit toward a new iPhone when you trade in your eligible
              smartphone. It's good for you and the planet.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 items-start">
          {/* Form Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-6 sm:p-8 rounded-2xl sm:rounded-3xl shadow-xl border border-gray-100"
          >
            {step === 1 ? (
              <div className="space-y-4 sm:space-y-6">
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4 sm:mb-6">
                  Get your estimate
                </h2>

                <div>
                  <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2">
                    Select Model
                  </label>
                  <select
                    className="w-full p-3 sm:p-4 text-sm sm:text-base rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none"
                    value={device.model}
                    onChange={(e) =>
                      setDevice({ ...device, model: e.target.value })
                    }
                  >
                    <option value="">Choose your iPhone</option>
                    {models.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2">
                    Storage Capacity
                  </label>
                  <select
                    className="w-full p-3 sm:p-4 text-sm sm:text-base rounded-xl bg-gray-50 border border-gray-200 focus:ring-2 focus:ring-purple-500 outline-none"
                    value={device.storage}
                    onChange={(e) =>
                      setDevice({ ...device, storage: e.target.value })
                    }
                  >
                    <option value="">Select storage</option>
                    <option value="128">128GB</option>
                    <option value="256">256GB</option>
                    <option value="512">512GB</option>
                    <option value="1TB">1TB</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-bold text-gray-700 mb-2">
                    Condition
                  </label>
                  <div className="grid grid-cols-3 gap-2 sm:gap-4">
                    {["Excellent", "Good", "Fair"].map((c) => (
                      <button
                        key={c}
                        onClick={() =>
                          setDevice({ ...device, condition: c.toLowerCase() })
                        }
                        className={`p-2 sm:p-3 rounded-xl border text-xs sm:text-sm font-bold transition-all ${
                          device.condition === c.toLowerCase()
                            ? "bg-purple-600 text-white border-purple-600"
                            : "bg-white text-gray-600 border-gray-200 hover:border-purple-200"
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleCalculate}
                  disabled={
                    !device.model || !device.storage || !device.condition
                  }
                  className="w-full py-3 sm:py-4 bg-gray-900 text-white rounded-xl font-bold text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-600 transition-colors flex items-center justify-center gap-2"
                >
                  Calculate Value <ArrowRight size={20} />
                </button>
              </div>
            ) : (
              <div className="text-center py-6 sm:py-8">
                <div className="w-16 h-16 sm:w-20 sm:h-20 bg-green-100 rounded-full flex items-center justify-center text-green-600 mx-auto mb-4 sm:mb-6">
                  <RefreshCw size={32} className="sm:w-10 sm:h-10" />
                </div>
                <h3 className="text-gray-500 text-sm sm:text-base font-bold mb-1 sm:mb-2">
                  Estimated Trade-in Value
                </h3>
                <p className="text-3xl sm:text-5xl font-black text-gray-900 mb-4 sm:mb-6">
                  ₦{estimate.toLocaleString()}
                </p>
                <p className="text-xs sm:text-sm text-gray-400 mb-6 sm:mb-8 px-4">
                  *Final value subject to in-store verification.
                </p>

                <div className="space-y-3 sm:space-y-4">
                  <button
                    onClick={() => setStep(1)}
                    className="w-full py-2.5 sm:py-3 bg-gray-100 text-gray-900 rounded-xl font-bold text-sm sm:text-base hover:bg-gray-200 transition-colors"
                  >
                    Check Another Device
                  </button>
                  <Link
                    to="/shop"
                    className="block w-full py-2.5 sm:py-3 bg-purple-600 text-white rounded-xl font-bold text-sm sm:text-base hover:bg-purple-700 transition-colors"
                  >
                    Apply to Purchase
                  </Link>
                </div>
              </div>
            )}
          </motion.div>

          {/* Info Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-6 sm:space-y-8 px-4 sm:px-0"
          >
            <div className="flex gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-xl flex items-center justify-center text-purple-600 flex-shrink-0">
                <Smartphone size={20} className="sm:w-6 sm:h-6" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 sm:mb-2">
                  How it works
                </h3>
                <p className="text-sm sm:text-base text-gray-500 leading-relaxed">
                  Answer a few questions to get your estimate. If you like the
                  value, apply it instantly to your new purchase or get a gift
                  card.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 flex-shrink-0">
                <CheckCircle size={20} className="sm:w-6 sm:h-6" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 sm:mb-2">
                  Data Secure
                </h3>
                <p className="text-sm sm:text-base text-gray-500 leading-relaxed">
                  We show you how to safely back up and wipe your data before
                  you trade in. Your privacy is our priority.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600 flex-shrink-0">
                <AlertCircle size={20} className="sm:w-6 sm:h-6" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 sm:mb-2">
                  What if I miss something?
                </h3>
                <p className="text-sm sm:text-base text-gray-500 leading-relaxed">
                  If your device is in better condition than described, we'll
                  increase your value. If it's different, we'll let you know the
                  new value.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
