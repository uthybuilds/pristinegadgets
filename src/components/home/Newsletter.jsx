import { Mail, ArrowRight } from "lucide-react";

export default function Newsletter() {
  return (
    <section className="py-24 px-4 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="relative overflow-hidden rounded-[3rem] bg-gray-900 px-6 py-16 sm:px-12 sm:py-24 lg:px-16">
          {/* Background Effects */}
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-purple-500/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-indigo-500/20 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-overlay" />
          </div>

          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="max-w-xl text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-purple-300 text-sm font-bold mb-6">
                <Mail size={16} />
                <span>Weekly Tech Digest</span>
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight mb-6">
                Join the <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-400">
                  Inner Circle.
                </span>
              </h2>
              <p className="text-gray-400 text-lg leading-relaxed">
                Get exclusive access to limited drops, early bird discounts, and
                deep dives into future tech. No spam, just pure innovation.
              </p>
            </div>

            <div className="w-full max-w-md">
              <form className="flex flex-col gap-4">
                <div className="relative group">
                  <input
                    type="email"
                    placeholder="Enter your email address"
                    className="w-full px-6 py-5 rounded-2xl bg-white/5 border border-white/10 text-white placeholder-gray-500 outline-none focus:border-purple-500/50 focus:bg-white/10 transition-all"
                  />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/20 to-indigo-500/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                </div>
                <button
                  type="submit"
                  className="w-full px-8 py-5 bg-white text-gray-900 rounded-2xl font-bold hover:bg-gray-100 transition-all flex items-center justify-center gap-2 hover:shadow-lg hover:shadow-white/10"
                >
                  Subscribe Now <ArrowRight size={20} />
                </button>
                <p className="text-center text-xs text-gray-500 mt-2">
                  By subscribing, you agree to our Privacy Policy. Unsubscribe anytime.
                </p>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
