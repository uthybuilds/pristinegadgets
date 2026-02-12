import { Award, Truck, ShieldCheck, Users } from "lucide-react";
import { motion } from "framer-motion";
import ceoImage from "../assets/pristinegadgetceo.jpeg";

export default function About() {
  const stats = [
    { label: "Happy Customers", value: "10k+" },
    { label: "Premium Products", value: "500+" },
    { label: "Years of Excellence", value: "5+" },
    { label: "Delivery Cities", value: "30+" },
  ];

  return (
    <div className="pt-16 sm:pt-20 min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative bg-purple-900 text-white py-16 sm:py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900 to-black opacity-90" />
        <div className="absolute -top-20 -right-20 w-64 h-64 sm:w-96 sm:h-96 bg-purple-500 rounded-full blur-3xl opacity-20" />
        <div className="absolute -bottom-20 -left-20 w-64 h-64 sm:w-96 sm:h-96 bg-blue-500 rounded-full blur-3xl opacity-20" />

        <div className="container mx-auto px-6 relative z-10 text-center">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold mb-4 sm:mb-6 animate-fadeInUp leading-tight">
            Redefining Tech Retail
          </h1>
          <p
            className="text-base sm:text-xl text-purple-100 max-w-2xl mx-auto animate-fadeInUp px-4"
            style={{ animationDelay: "0.2s" }}
          >
            At Pristine Gadgets, we don't just sell devices; we deliver a
            premium lifestyle experience powered by the latest technology.
          </p>
        </div>
      </section>

      {/* Mission & CEO Section */}
      <section className="py-12 sm:py-20 container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 sm:gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="relative order-2 md:order-1"
          >
            <div className="absolute inset-0 bg-purple-600 rounded-2xl sm:rounded-3xl rotate-2 sm:rotate-3 transform translate-x-2 translate-y-2 sm:translate-x-4 sm:translate-y-4" />
            <img
              src={ceoImage}
              alt="CEO of Pristine Gadgets"
              className="relative rounded-2xl sm:rounded-3xl shadow-2xl w-full object-cover aspect-[4/5] sm:aspect-[3/4]"
            />
            <div className="absolute bottom-4 left-4 sm:bottom-8 sm:left-8 bg-white/90 backdrop-blur-md p-3 sm:p-4 rounded-lg sm:rounded-xl shadow-lg border border-white/20">
              <p className="font-bold text-gray-900 text-sm sm:text-base">
                The Visionary
              </p>
              <p className="text-purple-600 text-xs sm:text-sm">
                CEO & Founder
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-4 sm:space-y-6 order-1 md:order-2"
          >
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              Our Story
            </h2>
            <p className="text-gray-600 text-base sm:text-lg leading-relaxed">
              Founded with a singular mission: to bridge the gap between premium
              technology and accessibility. Pristine Gadgets started as a
              passion project and has grown into a trusted destination for tech
              enthusiasts across the nation.
            </p>
            <p className="text-gray-600 text-base sm:text-lg leading-relaxed italic">
              "We believe that technology should be intuitive, beautiful, and
              accessible. Every product in our inventory is hand-picked to
              ensure it meets our rigorous standards of quality and
              performance."
            </p>

            <div className="grid grid-cols-2 gap-3 sm:gap-6 mt-6 sm:mt-8">
              {stats.map((stat, index) => (
                <div
                  key={index}
                  className="bg-white p-3 sm:p-4 rounded-xl shadow-sm border border-gray-100 text-center sm:text-left"
                >
                  <h3 className="text-xl sm:text-2xl font-bold text-purple-600">
                    {stat.value}
                  </h3>
                  <p className="text-gray-500 text-[10px] sm:text-sm uppercase tracking-wider">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-12 sm:py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4">
              Why Choose Us?
            </h2>
            <p className="text-sm sm:text-base text-gray-500 max-w-2xl mx-auto px-4">
              We're committed to excellence in every aspect of our service.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <FeatureCard
              icon={<Award size={28} className="sm:w-8 sm:h-8" />}
              title="Premium Quality"
              description="100% authentic products sourced directly from manufacturers."
            />
            <FeatureCard
              icon={<Truck size={28} className="sm:w-8 sm:h-8" />}
              title="Fast Delivery"
              description="Swift and secure shipping to your doorstep nationwide."
            />
            <FeatureCard
              icon={<ShieldCheck size={28} className="sm:w-8 sm:h-8" />}
              title="Certified Quality"
              description="Every device undergoes a rigorous inspection process."
            />
            <FeatureCard
              icon={<Users size={28} className="sm:w-8 sm:h-8" />}
              title="Expert Support"
              description="24/7 dedicated customer support for all your needs."
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="p-5 sm:p-6 bg-gray-50 rounded-xl sm:rounded-2xl border border-gray-100 hover:shadow-lg transition-all hover:-translate-y-1 group">
      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 text-purple-600 rounded-lg sm:rounded-xl flex items-center justify-center mb-4 group-hover:bg-purple-600 group-hover:text-white transition-colors">
        {icon}
      </div>
      <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">
        {title}
      </h3>
      <p className="text-sm sm:text-base text-gray-500 leading-relaxed">
        {description}
      </p>
    </div>
  );
}
