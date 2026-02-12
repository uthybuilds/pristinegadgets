import { Plus, Minus } from "lucide-react";
import { useState } from "react";
import { cn } from "../../utils/helpers";

const faqs = [
  {
    question: "How do I place an order?",
    answer:
      "Ordering is seamless. Simply add your desired gadgets to the cart and proceed to checkout. You will be provided with our official account details. After making a transfer, upload the screenshot of your payment. Our system will automatically direct you to WhatsApp to confirm your order instantly.",
  },
  {
    question: "How can I track my delivery?",
    answer:
      "Tracking is available for all registered users. Once you create an account and log in, you can view the real-time status of your order from 'Pending' to 'Shipped' to 'Delivered' directly in your Account Dashboard.",
  },
  {
    question: "Can I pay on delivery?",
    answer:
      "To maintain our premium service and fast dispatch times, we currently require payment validation before shipping. This ensures your device is reserved and processed immediately.",
  },
  {
    question: "What is your return policy?",
    answer:
      "We accept returns within 7 days of delivery if the item is found to be defective. The item must be returned in the exact condition it was received, with all accessories and packaging intact.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="py-16 sm:py-24 bg-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10 sm:mb-16">
          <span className="text-primary-600 font-semibold tracking-wider text-xs sm:text-sm uppercase">
            Support
          </span>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mt-2 text-gray-900 px-4">
            Frequently Asked Questions
          </h2>
          <p className="text-sm sm:text-base text-gray-500 mt-4 px-6">
            Everything you need to know about shopping with Pristine Gadgets.
          </p>
        </div>

        <div className="space-y-3 sm:space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border border-gray-100 rounded-xl sm:rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-primary-100 bg-white"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
                className="w-full flex items-center justify-between p-5 sm:p-6 text-left gap-4"
              >
                <span
                  className={cn(
                    "font-semibold text-base sm:text-lg leading-tight",
                    openIndex === index ? "text-primary-600" : "text-gray-900",
                  )}
                >
                  {faq.question}
                </span>
                {openIndex === index ? (
                  <Minus className="text-primary-600 flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6" />
                ) : (
                  <Plus className="text-gray-400 flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6" />
                )}
              </button>

              <div
                className={cn(
                  "grid transition-all duration-300 ease-in-out text-gray-500 overflow-hidden",
                  openIndex === index
                    ? "grid-rows-[1fr] opacity-100"
                    : "grid-rows-[0fr] opacity-0",
                )}
              >
                <div className="overflow-hidden">
                  <p className="p-5 sm:p-6 pt-0 text-sm sm:text-base leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
