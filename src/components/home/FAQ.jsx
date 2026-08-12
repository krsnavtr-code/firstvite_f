import React, { useState } from "react";
import { FaChevronDown, FaQuestionCircle } from "react-icons/fa";

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "Is Eklabya's certification recognized by employers?",
      answer:
        "Yeah, it is. Eklabya has got ISO certification, along with partnerships with NSDC and NIELIT. So what you get at the end of the course is a real, verifiable certificate that counts in both the industry and government sectors, not just some generic 'completion certificate'.",
    },
    {
      question: "Do Eklabya courses actually help with job placement?",
      answer:
        "They do. Eklabya has got a dedicated placement support team that can help you out with resume building, interview prep, and actually get you in front of their hiring partner network. We've had alumni from Eklabya get hired by companies like TCS, Infosys, Wipro, HCL, Capgemini, IBM, Microsoft and even Amazon.",
    },
    {
      question: "Are the courses live or self-paced?",
      answer:
        "Both, actually. The way it works is that most courses combine live, instructor-led sessions with self-paced recorded lectures, so you can learn in your own time without missing out on the structured guidance.",
    },
    {
      question: "What if I have no prior experience in tech or business?",
      answer:
        "Don't worry about that. Most of Eklabya's courses are designed to take you from being clueless to job-ready, with a structured, project-based approach. You don't need to have any prior experience, just a commitment to the process.",
    },
    {
      question:
        "How is the Eklabya Scholarship Exam different from a regular discount?",
      answer:
        "The Scholarship Exam is a genuine, merit-based, digitally proctored assessment. The thing is, the awards are based purely on how you do in the exam, not your financial situation, so students who really know their stuff get some real help towards paying for certification.",
    },
    {
      question: "Can I get help if I'm stuck on a topic?",
      answer:
        "Yes. Every course comes with live doubt-clearing sessions, not to mention forum support that guarantees a response within 24 hours, so you're never stuck for long.",
    },
    {
      question: "Are courses available in languages other than English?",
      answer:
        "Yes, Eklabya courses are available in all the multiple languages including Hindi and more, which makes high quality technical and professional education more accessible to a wider range of folks across India.",
    },
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-6 md:py-10 bg-gradient-to-b from-white via-slate-50/50 to-white dark:from-gray-900 dark:via-gray-900/80 dark:to-gray-900 transition-colors duration-300">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-4 space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/80 px-3.5 py-1 rounded-full text-blue-600 dark:text-blue-400 text-xs font-extrabold uppercase tracking-wider">
            <FaQuestionCircle className="text-xs" /> Got Questions?
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
            Find answers to common questions about Eklabya courses and
            certifications.
          </p>
        </div>

        {/* Accordion List */}
        <div className="space-y-1.5">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className={`rounded-2xl transition-all duration-200 border ${
                  isOpen
                    ? "bg-white dark:bg-gray-800 border-blue-500/40 shadow-md shadow-blue-500/5"
                    : "bg-white dark:bg-gray-800/80 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-2xs"
                } overflow-hidden`}
              >
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 focus:outline-none cursor-pointer"
                >
                  <span className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                    {faq.question}
                  </span>

                  {/* Rotating Chevron Icon */}
                  <div
                    className={`w-7 h-7 rounded-full bg-slate-100 dark:bg-gray-700/60 flex items-center justify-center text-slate-500 dark:text-slate-400 shrink-0 transition-transform duration-300 ${
                      isOpen
                        ? "rotate-180 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400"
                        : "rotate-0"
                    }`}
                  >
                    <FaChevronDown className="text-xs" />
                  </div>
                </button>

                {/* Smooth Collapsible Answer Section */}
                {isOpen && (
                  <div className="px-6 pb-5 pt-1 border-t border-slate-100 dark:border-slate-700/60">
                    <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
