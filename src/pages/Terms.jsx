import { Shield, FileText, Lock } from "lucide-react";

export default function Terms() {
  return (
    <div className="pt-20 sm:pt-24 pb-12 sm:pb-16 px-4 sm:px-6 bg-gray-50 min-h-screen">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 md:p-12 shadow-sm border border-gray-100">
        <h1 className="text-3xl sm:text-4xl font-black text-gray-900 mb-6 sm:mb-8 leading-tight">
          Terms of Service
        </h1>

        <div className="prose prose-purple max-w-none space-y-6 sm:space-y-8">
          <section>
            <div className="flex items-center gap-3 mb-3 sm:mb-4">
              <FileText className="text-purple-600 w-5 h-5 sm:w-6 sm:h-6" />
              <h2 className="text-xl sm:text-2xl font-bold m-0 text-gray-900">
                1. Acceptance of Terms
              </h2>
            </div>
            <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
              By accessing and using Pristine Gadgets, you agree to be bound by
              these Terms of Service. If you do not agree to these terms, please
              do not use our services.
            </p>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-3 sm:mb-4">
              <Shield className="text-purple-600 w-5 h-5 sm:w-6 sm:h-6" />
              <h2 className="text-xl sm:text-2xl font-bold m-0 text-gray-900">
                2. Product Authenticity
              </h2>
            </div>
            <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
              We guarantee that all products sold on Pristine Gadgets are 100%
              authentic. Every device undergoes a rigorous 50-point inspection
              process to ensure quality and performance standards are met.
            </p>
          </section>

          <section>
            <div className="flex items-center gap-3 mb-3 sm:mb-4">
              <Lock className="text-purple-600 w-5 h-5 sm:w-6 sm:h-6" />
              <h2 className="text-xl sm:text-2xl font-bold m-0 text-gray-900">
                3. Returns
              </h2>
            </div>
            <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
              You may return any item within 14 days of delivery for a full
              refund, provided the item is in its original condition.
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-gray-900">
              4. Shipping & Delivery
            </h2>
            <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
              We offer express shipping nationwide. Delivery times may vary
              based on location. Orders placed before 2 PM are typically
              processed the same day.
            </p>
          </section>

          <section>
            <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-gray-900">
              5. Privacy Policy
            </h2>
            <p className="text-gray-600 leading-relaxed text-sm sm:text-base">
              Your privacy is paramount. We do not sell or share your personal
              information with third parties for marketing purposes. All payment
              data is encrypted and processed securely.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
