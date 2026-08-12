import React from "react";
import {
  FaVideo,
  FaClipboardCheck,
  FaBullseye,
  FaComments,
  FaFileAlt,
  FaCertificate,
  FaBookReader,
} from "react-icons/fa";

const steps = [
  {
    stepNum: "01",
    icon: <FaVideo className="text-xl text-blue-600 dark:text-blue-400" />,
    title: "Learn from Experts",
    desc: "We've got in-depth video lessons and live sessions put together by industry pros who've actually got experience in the field you're training in.",
  },
  {
    stepNum: "02",
    icon: (
      <FaClipboardCheck className="text-xl text-blue-600 dark:text-blue-400" />
    ),
    title: "See where you stand",
    desc: "Regular quizzes, assignments, and assessments break down the course into chunks, so you know exactly what you've got down pat, before it starts to matter in a real job interview.",
  },
  {
    stepNum: "03",
    icon: <FaBullseye className="text-xl text-blue-600 dark:text-blue-400" />,
    title: "Practical Real World Projects",
    desc: "You get to work on real projects using the same tools, software, and systems that are actually used in industry, not just pretend examples.",
  },
  {
    stepNum: "04",
    icon: <FaComments className="text-xl text-blue-600 dark:text-blue-400" />,
    title: "1:1 Doubt Solving",
    desc: "We set up sessions where you can get your doubts cleared up one on one, or get help via our online forum where someone will get back to you within 24 hours. You won't be stuck alone.",
  },
  {
    stepNum: "05",
    icon: <FaFileAlt className="text-xl text-blue-600 dark:text-blue-400" />,
    title: "Assessment",
    desc: "A final comprehensive exam checks that you've got a handle on the whole course, and that you're not just getting a free pass to a certificate.",
  },
  {
    stepNum: "06",
    icon: (
      <FaCertificate className="text-xl text-blue-600 dark:text-blue-400" />
    ),
    title: "Get your certification",
    desc: "When you've finished, you'll get a certificate from Eklabya that's got some real weight behind it, thanks to our partnerships with NSDC and NIELIT, and employers can actually check it out.",
  },
];

const HowWillYourTrainingWork = () => {
  return (
    <section className="py-6 md:py-12 bg-gradient-to-b from-white via-slate-50/50 to-white dark:from-gray-900 dark:via-gray-900/80 dark:to-gray-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* --- Section Header & Intro --- */}
        <div className="text-center max-w-6xl mx-auto mb-4 space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-100/80 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300 text-xs font-bold uppercase tracking-wider border border-blue-200 dark:border-blue-800 shadow-2xs">
            <FaBookReader className="text-xs" /> Training Workflow
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            How Your Training Works - With Eklabya
          </h2>

          <div className="text-left space-y-2 shadow-sm">
            <p className="text-sm md:text-base text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
              From enrollment to certification, every step of the Eklabya
              learning journey is structured, transparent, and built around
              outcomes, not just attendance. Here's what the path looks like:
            </p>
            <p className="text-sm md:text-base text-slate-700 dark:text-slate-300 leading-relaxed font-normal">
              From signing up all the way to getting certified, the whole
              Eklabya learning experience is laid out in a way that's clear to
              see, follows a specific path, and is focused on results — not just
              on showing up. Here's how it all plays out:
            </p>
          </div>
        </div>

        {/* --- Steps Grid Layout --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-4">
          {steps.map((step, index) => (
            <div
              key={index}
              className="relative bg-white dark:bg-gray-800 rounded-3xl p-1.5 md:p-4 shadow-xs border border-slate-200/80 dark:border-slate-700 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col justify-between overflow-hidden"
            >
              <span className="absolute top-4 right-6 text-6xl font-black text-slate-100 dark:text-gray-700/30 select-none pointer-events-none transition-colors group-hover:text-blue-50 dark:group-hover:text-gray-700/50">
                {step.stepNum}
              </span>

              <div className="relative z-10 space-y-0.5">
                <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center border border-blue-100 dark:border-blue-900 shadow-inner group-hover:scale-105 transition-transform">
                  {step.icon}
                </div>

                <h3 className="text-lg md:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  {step.title}
                </h3>

                <p className="text-xs md:text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-normal">
                  {step.desc}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between">
                <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 tracking-wider uppercase">
                  Step {step.stepNum} of 06
                </span>
                <span className="w-2 h-2 rounded-full bg-blue-500 group-hover:scale-125 transition-transform"></span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowWillYourTrainingWork;
