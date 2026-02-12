import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Mail,
  Loader,
  ArrowRight,
  AlertCircle,
  CheckCircle,
  ArrowLeft,
  Lock,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ForgotPassword() {
  const { resetPassword, verifyOTP } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("email"); // 'email' or 'otp'
  const [status, setStatus] = useState({ type: "", message: "" });

  const handleSubmitEmail = async (e) => {
    e.preventDefault();
    setLoading(true);
    setStatus({ type: "", message: "" });

    try {
      await resetPassword(email);
      setStatus({
        type: "success",
        message: "Password reset code sent to your email.",
      });
      setStep("otp");
    } catch (err) {
      console.error(err);
      setStatus({
        type: "error",
        message: err.message || "Failed to send reset code",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (otp.length < 6) {
      setStatus({
        type: "error",
        message: "Please enter a valid verification code",
      });
      return;
    }

    setLoading(true);
    setStatus({ type: "", message: "" });

    try {
      // For forgot password, Supabase uses 'recovery' type
      await verifyOTP(email, otp, "recovery");
      // After verification, Supabase usually logs the user in or provides a session to update password
      // We'll navigate to update-password page
      navigate("/update-password");
    } catch (err) {
      console.error(err);
      setStatus({
        type: "error",
        message: err.message || "Invalid verification code",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 sm:pt-24 pb-12 sm:pb-16 flex items-center justify-center px-4 bg-gray-50">
      <div className="w-full max-w-md">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden border border-gray-100"
        >
          {/* Header */}
          <div className="bg-purple-600 px-6 sm:px-8 py-8 sm:py-10 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-500 to-purple-700 opacity-90" />
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl" />
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl" />

            <div className="relative z-10">
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                {step === "email" ? "Forgot Password" : "Verify Code"}
              </h1>
              <p className="text-sm sm:text-base text-purple-100 px-4">
                {step === "email"
                  ? "Enter your email to reset password"
                  : `Enter the code sent to ${email}`}
              </p>
            </div>
          </div>

          {/* Form */}
          <div className="p-6 sm:p-8">
            {status.message && (
              <div
                className={`mb-6 p-4 border rounded-xl flex items-center gap-2 text-sm ${
                  status.type === "success"
                    ? "bg-green-50 border-green-100 text-green-700"
                    : "bg-red-50 border-red-100 text-red-600"
                }`}
              >
                {status.type === "success" ? (
                  <CheckCircle size={16} className="flex-shrink-0" />
                ) : (
                  <AlertCircle size={16} className="flex-shrink-0" />
                )}
                {status.message}
              </div>
            )}

            <AnimatePresence mode="wait">
              {step === "email" ? (
                <motion.form
                  key="email-form"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  onSubmit={handleSubmitEmail}
                  className="space-y-4 sm:space-y-5"
                >
                  <div className="space-y-2">
                    <label className="text-xs sm:text-sm font-medium text-gray-700 ml-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                        <Mail size={18} className="sm:w-5 sm:h-5" />
                      </div>
                      <input
                        type="email"
                        required
                        className="w-full pl-11 pr-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-xl border border-gray-200 outline-none focus:ring-2 focus:ring-purple-600 transition-all bg-gray-50 focus:bg-white"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 sm:py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-base sm:text-lg shadow-lg shadow-purple-200 flex items-center justify-center gap-2 transition-all hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                  >
                    {loading ? (
                      <Loader className="animate-spin" />
                    ) : (
                      <>
                        Send Code <ArrowRight size={20} />
                      </>
                    )}
                  </button>
                </motion.form>
              ) : (
                <motion.form
                  key="otp-form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  onSubmit={handleVerifyOTP}
                  className="space-y-5 sm:space-y-6"
                >
                  <div className="space-y-3 sm:space-y-4">
                    <label className="text-xs sm:text-sm font-medium text-gray-700 text-center block">
                      Verification Code
                    </label>
                    <div className="flex justify-center">
                      <input
                        type="text"
                        maxLength={8}
                        required
                        className="w-full max-w-[200px] sm:max-w-[240px] text-center text-xl sm:text-2xl tracking-[0.3em] font-bold py-3 sm:py-4 rounded-xl sm:rounded-2xl border-2 border-gray-200 outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 transition-all bg-gray-50 focus:bg-white"
                        placeholder="00000000"
                        value={otp}
                        onChange={(e) =>
                          setOtp(e.target.value.replace(/\D/g, ""))
                        }
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3.5 sm:py-4 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-base sm:text-lg shadow-lg shadow-purple-200 flex items-center justify-center gap-2 transition-all hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                  >
                    {loading ? (
                      <Loader className="animate-spin" />
                    ) : (
                      <>
                        Verify Code <CheckCircle size={20} />
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep("email")}
                    className="w-full text-xs sm:text-sm text-gray-500 hover:text-purple-600 transition-colors font-medium"
                  >
                    Change Email Address
                  </button>
                </motion.form>
              )}
            </AnimatePresence>

            <div className="mt-6 sm:mt-8 text-center">
              <Link
                to="/login"
                className="inline-flex items-center gap-2 text-gray-500 text-xs sm:text-sm hover:text-purple-600 transition-colors"
              >
                <ArrowLeft size={16} />
                Back to Login
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
