import React, { useState } from "react";
import { FaPaperPlane, FaCheckCircle, FaEnvelope } from "react-icons/fa";

const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubscribed(true);
    setEmail("");

    setTimeout(() => {
      setIsSubscribed(false);
    }, 5000);
  };

  return (
    <section className="py-16 md:py-20 bg-gradient-to-r from-blue-600 via-indigo-600 to-indigo-800 dark:from-gray-900 dark:via-blue-950 dark:to-gray-900 relative overflow-hidden transition-colors duration-300">
      {/* Decorative Glows */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <div className="max-w-2xl mx-auto space-y-4">
          {/* Badge */}
          <div className="inline-flex items-center gap-1.5 bg-white/10 backdrop-blur-md border border-white/20 px-3.5 py-1 rounded-full text-white text-xs font-bold uppercase tracking-wider shadow-2xs">
            <FaEnvelope className="text-xs" /> Stay Ahead of the Curve
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight">
            Never Miss an Update
          </h2>

          <p className="text-xs sm:text-sm md:text-base text-blue-100 dark:text-gray-300 leading-relaxed font-normal">
            Get new course launches, scholarship deadlines, free masterclasses,
            and career tips delivered straight to your inbox. No spam, just
            things worth your time.
          </p>

          {isSubscribed ? (
            <div
              className="bg-emerald-500/20 border border-emerald-400/40 text-white backdrop-blur-md px-5 py-3.5 rounded-2xl flex items-center justify-center gap-2.5 max-w-md mx-auto shadow-lg"
              role="alert"
            >
              <FaCheckCircle className="text-emerald-400 text-lg shrink-0" />
              <div className="text-xs sm:text-sm text-left">
                <strong className="font-bold">Thank you! </strong>
                <span className="text-emerald-100">
                  You've been subscribed to our newsletter.
                </span>
              </div>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="mt-6 sm:flex items-center justify-center gap-2 max-w-xl mx-auto"
            >
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 text-white placeholder-blue-200 dark:placeholder-gray-400 focus:ring-2 focus:ring-white focus:outline-none rounded-xl text-xs sm:text-sm shadow-inner transition-all"
                placeholder="Enter your email address"
              />
              <div className="mt-3 sm:mt-0 sm:shrink-0">
                <button
                  type="submit"
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 bg-white hover:bg-blue-50 text-blue-700 font-bold text-xs sm:text-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 active:scale-98"
                >
                  <FaPaperPlane className="text-xs" />
                  <span>Subscribe</span>
                </button>
              </div>
            </form>
          )}

          <p className="text-[11px] sm:text-xs text-blue-200 dark:text-gray-400 pt-1">
            We respect your privacy. Unsubscribe at any time.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
