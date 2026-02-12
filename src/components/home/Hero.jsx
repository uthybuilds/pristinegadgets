import { Link } from "react-router-dom";
import {
  ArrowRight,
  Shield,
  Truck,
  Zap,
  TrendingUp,
  Star,
  Award,
  Smartphone,
  Cpu,
  Camera,
  Battery,
} from "lucide-react";

export default function Hero() {
  return (
    <div className="relative overflow-hidden bg-white min-h-[85vh] flex items-center">
      {/* Optimized Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-[50vw] h-[50vw] bg-purple-100/50 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-0 left-0 w-[50vw] h-[50vw] bg-indigo-100/50 rounded-full blur-3xl opacity-50" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
        {/* Added Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

        {/* Floating Abstract Shapes */}
        <div className="absolute top-20 left-10 w-24 h-24 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute top-40 right-10 w-32 h-32 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-32 h-32 bg-pink-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 w-full relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center pt-20">
        {/* Text Content */}
        <div className="space-y-8 text-center lg:text-left animate-[fadeIn_0.8s_ease-out]">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/50 backdrop-blur-xl border border-purple-100 text-purple-700 text-sm font-bold shadow-sm ring-1 ring-purple-500/10">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
            </span>
            Next-Gen Tech is Here
          </div>

          <h1 className="text-6xl md:text-8xl font-black text-gray-900 tracking-tighter leading-[1.1]">
            Future <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-purple-500 to-indigo-600 animate-gradient-x">
              Ready.
            </span>
          </h1>

          <div className="flex flex-wrap justify-center lg:justify-start gap-4">
            <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1 rounded-lg border border-yellow-100">
              <Star className="text-yellow-500 fill-yellow-500" size={14} />
              <span className="text-xs font-bold text-yellow-700">
                4.9/5 Rating
              </span>
            </div>
            <div className="flex items-center gap-1 bg-green-50 px-3 py-1 rounded-lg border border-green-100">
              <Award className="text-green-500" size={14} />
              <span className="text-xs font-bold text-green-700">
                #1 Tech Store
              </span>
            </div>
          </div>

          <p className="text-gray-500 text-xl md:text-2xl max-w-lg mx-auto lg:mx-0 font-medium leading-relaxed">
            Upgrade your lifestyle with the most sophisticated gadgets on the
            planet. Pristine quality, futuristic performance.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start pt-4">
            <Link
              to="/shop"
              className="group relative px-8 py-4 bg-gray-900 text-white rounded-2xl font-bold overflow-hidden transition-all hover:shadow-2xl hover:shadow-purple-500/30"
            >
              <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-purple-600 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative flex items-center gap-2">
                Shop Collection{" "}
                <ArrowRight
                  size={20}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </div>
            </Link>
            <Link
              to="/shop?category=deals"
              className="px-8 py-4 bg-white text-gray-900 border border-gray-200 rounded-2xl font-bold hover:bg-gray-50 transition-all hover:border-purple-200 hover:text-purple-700 flex items-center gap-2 justify-center"
            >
              View Exclusive Deals
            </Link>
          </div>

          {/* Trust Indicators */}
          <div className="pt-8 flex items-center justify-center lg:justify-start gap-8 text-gray-400 text-sm font-medium border-t border-gray-100 mt-8">
            <div className="flex items-center gap-2">
              <Zap size={18} className="text-purple-500" />
              <span>Fast Delivery</span>
            </div>
            <div className="flex items-center gap-2">
              <Truck size={18} className="text-purple-500" />
              <span>Nationwide Shipping</span>
            </div>
          </div>
        </div>

        {/* Visual / Floating Elements */}
        <div
          className="relative flex items-center justify-center lg:justify-end h-[500px] lg:h-[600px] perspective-1000 animate-fadeInUp mt-12 lg:mt-0"
          style={{ animationDelay: "0.2s" }}
        >
          {/* Middle Floating Icons (Replaced Element) */}
          <div className="absolute -left-4 xl:-left-16 top-1/2 -translate-y-1/2 hidden xl:flex flex-col gap-6 z-0">
            <div
              className="w-14 h-14 rounded-full bg-white/40 backdrop-blur-md border border-white/50 flex items-center justify-center shadow-lg animate-float text-purple-900"
              style={{ animationDelay: "0s" }}
            >
              <Cpu size={24} />
            </div>
            <div
              className="w-14 h-14 rounded-full bg-white/40 backdrop-blur-md border border-white/50 flex items-center justify-center shadow-lg animate-float text-indigo-900"
              style={{ animationDelay: "1.5s" }}
            >
              <Camera size={24} />
            </div>
            <div
              className="w-14 h-14 rounded-full bg-white/40 backdrop-blur-md border border-white/50 flex items-center justify-center shadow-lg animate-float text-pink-900"
              style={{ animationDelay: "3s" }}
            >
              <Battery size={24} />
            </div>
          </div>

          {/* Main Card Container */}
          <div className="relative z-10 w-full max-w-xs sm:max-w-md h-[450px] sm:h-[550px] animate-float group">
            {/* Glowing Backdrop */}
            <div className="absolute -inset-4 bg-gradient-to-r from-purple-600 via-pink-500 to-indigo-600 rounded-[3rem] opacity-30 blur-2xl group-hover:opacity-50 transition-opacity duration-700 animate-pulse-slow" />

            {/* Glassmorphism Card */}
            <div className="relative w-full h-full bg-gradient-to-br from-purple-500/10 to-indigo-500/10 backdrop-blur-2xl border border-white/20 rounded-[2.5rem] shadow-2xl overflow-hidden">
              {/* Shine Effect */}
              <div className="absolute inset-0 bg-gradient-to-tr from-white/20 via-transparent to-transparent opacity-50 pointer-events-none z-20" />

              {/* Image Container with Blend Mode */}
              <div className="absolute inset-0 p-8 flex items-center justify-center">
                <div className="w-full h-full transform group-hover:scale-105 transition-transform duration-700 ease-out">
                  <img
                    src="https://images.unsplash.com/photo-1759588071950-9dd15fd23ba5?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fDE3JTIwcHJvJTIwbWF4fGVufDB8fDB8fHww"
                    alt="iPhone 17 Pro Max"
                    className="w-full h-full object-cover rounded-[2rem] shadow-lg mix-blend-multiply brightness-110 contrast-125"
                  />
                </div>
              </div>

              {/* Futuristic UI Overlay Elements */}
              <div className="absolute bottom-10 left-0 right-0 px-8 z-30">
                <div className="flex justify-between items-center bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-white/50 shadow-lg transform translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Starting at
                    </p>
                    <p className="text-lg font-black text-gray-900">
                      ₦1,199,000
                    </p>
                  </div>
                  <div className="h-10 w-10 bg-black rounded-full flex items-center justify-center text-white">
                    <ArrowRight size={18} />
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Badge 1 - Top Right */}
            <div
              className="absolute -top-8 -right-4 lg:-right-12 bg-white/90 backdrop-blur-xl p-4 rounded-3xl shadow-xl border border-white/40 animate-float"
              style={{ animationDelay: "1.5s" }}
            >
              <div className="flex items-center gap-3">
                <div className="bg-purple-100 p-3 rounded-2xl">
                  <TrendingUp className="text-purple-600" size={24} />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Top Seller
                  </p>
                  <p className="font-bold text-gray-900">iPhone 17 Pro Max</p>
                  <p className="text-xs text-green-600 font-bold">Low Stock</p>
                </div>
              </div>
            </div>

            {/* Floating Badge 2 - Bottom Left - MOVED DOWN to prevent overlap */}
            <div
              className="absolute -bottom-24 -left-4 lg:-bottom-32 lg:-left-24 bg-white/90 backdrop-blur-xl p-5 rounded-3xl shadow-xl border border-white/40 animate-float"
              style={{ animationDelay: "2.5s" }}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-8">
                  <span className="text-sm font-bold text-gray-500">
                    Performance
                  </span>
                  <span className="text-sm font-bold text-green-500">+34%</span>
                </div>
                <div className="w-32 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 w-[34%]" />
                </div>
                <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
                  <Zap size={14} className="text-purple-500" />
                  <span>A19 Pro Chip</span>
                </div>
              </div>
            </div>

            {/* New Floating Badge 3 - Right Middle */}
            <div
              className="absolute top-1/2 -right-16 bg-white/90 backdrop-blur-xl p-3 rounded-2xl shadow-xl border border-white/40 animate-float hidden xl:block"
              style={{ animationDelay: "2.0s" }}
            >
              <div className="flex flex-col items-center gap-1">
                <Smartphone size={20} className="text-gray-400" />
                <span className="text-[10px] font-bold text-gray-500">
                  Grade 5 Titanium
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
