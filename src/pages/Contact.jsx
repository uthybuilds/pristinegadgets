import { Mail, MapPin, Phone, Send } from "lucide-react";

export default function Contact() {
  return (
    <div className="pt-20 sm:pt-24 pb-12 sm:pb-16 px-4 sm:px-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10 sm:mb-16 animate-fadeInUp">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-gray-900 mb-4 sm:mb-6 leading-tight">
            Get in Touch
          </h1>
          <p className="text-base sm:text-xl text-gray-500 max-w-2xl mx-auto px-4">
            Have a question about the latest tech? Our team of experts is ready
            to assist you.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:gap-12 max-w-2xl mx-auto">
          {/* Contact Info */}
          <div className="space-y-6 sm:space-y-8 animate-fadeInLeft">
            <div className="bg-white p-6 sm:p-8 rounded-2xl sm:rounded-3xl shadow-sm border border-gray-100">
              <h3 className="text-xl sm:text-2xl font-bold mb-6 text-gray-900">
                Contact Information
              </h3>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 flex-shrink-0">
                    <MapPin size={20} className="sm:w-6 sm:h-6" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-gray-900 text-sm sm:text-base">
                      Headquarters
                    </h4>
                    <p className="text-gray-500 text-xs sm:text-sm leading-relaxed">
                      3 Oshitelu Street, Computer Village
                      <br />
                      Ikeja, Lagos, Nigeria
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 flex-shrink-0">
                    <Phone size={20} className="sm:w-6 sm:h-6" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-gray-900 text-sm sm:text-base">
                      Phone
                    </h4>
                    <p className="text-gray-500 text-xs sm:text-sm">
                      07034025834
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 flex-shrink-0">
                    <Mail size={20} className="sm:w-6 sm:h-6" />
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-gray-900 text-sm sm:text-base">
                      Email
                    </h4>
                    <p className="text-gray-500 text-xs sm:text-sm truncate">
                      pristinegadgets@gmail.com
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-900 to-indigo-900 p-6 sm:p-8 rounded-2xl sm:rounded-3xl text-white relative overflow-hidden">
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
              <div className="relative z-10">
                <h3 className="text-xl sm:text-2xl font-bold mb-4">
                  Business Hours
                </h3>
                <ul className="space-y-3 text-purple-100 text-xs sm:text-sm">
                  <li className="flex justify-between items-center border-b border-white/10 pb-2">
                    <span className="font-medium">Monday - Friday</span>
                    <span className="bg-white/10 px-2 py-1 rounded">
                      9:00 AM - 8:00 PM
                    </span>
                  </li>
                  <li className="flex justify-between items-center border-b border-white/10 pb-2">
                    <span className="font-medium">Saturday</span>
                    <span className="bg-white/10 px-2 py-1 rounded">
                      10:00 AM - 6:00 PM
                    </span>
                  </li>
                  <li className="flex justify-between items-center">
                    <span className="font-medium">Sunday</span>
                    <span className="bg-red-400/20 text-red-200 px-2 py-1 rounded">
                      Closed
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
