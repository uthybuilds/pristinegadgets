import { ArrowRight, Smartphone, RefreshCw } from "lucide-react";
import { Link } from "react-router-dom";

export default function PromoSection() {
  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4">
        <div className="relative rounded-[3rem] bg-gray-900 overflow-hidden">
          {/* Background Gradients */}
          <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-500/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-500/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center p-8 sm:p-12 lg:p-24">
            <div className="space-y-6 sm:space-y-8 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-purple-300 text-sm font-bold mx-auto lg:mx-0">
                <RefreshCw size={16} />
                <span>Trade-in Program</span>
              </div>
              
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
                Upgrade to the Future. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">
                  Trade-in & Save.
                </span>
              </h2>
              
              <p className="text-gray-400 text-base sm:text-lg max-w-md mx-auto lg:mx-0 leading-relaxed">
                Get up to ₦950,000 credit toward your new iPhone 17 Pro Max when you trade in an eligible smartphone.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-4 justify-center lg:justify-start">
                <Link 
                  to="/trade-in"
                  className="px-8 py-4 bg-white text-gray-900 rounded-2xl font-bold hover:bg-gray-100 transition-all flex items-center justify-center gap-2"
                >
                  Estimate Value <ArrowRight size={20} />
                </Link>
                <Link
                  to="/shop"
                  className="px-8 py-4 bg-white/10 text-white border border-white/10 rounded-2xl font-bold hover:bg-white/20 transition-all flex items-center justify-center"
                >
                  Shop New Devices
                </Link>
              </div>
            </div>
            
            <div className="relative lg:h-[400px] flex items-center justify-center">
                {/* Abstract Visual Representation of Trade-in */}
                <div className="relative w-full max-w-sm aspect-square">
                    <div className="absolute inset-0 bg-gradient-to-tr from-purple-500 to-indigo-500 rounded-3xl opacity-20 rotate-6" />
                    <div className="absolute inset-0 bg-gray-800 border border-white/10 rounded-3xl -rotate-6 backdrop-blur-xl flex items-center justify-center">
                        <Smartphone size={120} className="text-gray-600" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <RefreshCw size={60} className="text-purple-400 animate-spin-slow" />
                        </div>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
