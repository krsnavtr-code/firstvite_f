import React, { useState } from "react";
import { toast } from "react-toastify";
import { submitContactForm } from "../../api/contactApi";

const DataScienceLanding = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    status: "",
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const submitForm = async () => {
    if (
      !formData.name ||
      !formData.phone ||
      !formData.email ||
      !formData.status
    ) {
      toast.error(
        "Please fill in all required fields (Name, Phone, Email, Experience Level).",
      );
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setIsSubmitting(true);
    try {
      const submissionData = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        message: `Background/Experience level: ${formData.status}. I want to enroll in the Data Science & AI Programme. [Ref: ${Date.now()}]`,
        courseTitle: "Data Science & AI Programme",
        courseId: "data-science-ai",
        subject: "Data Science & AI Programme Registration",
      };

      const result = await submitContactForm(submissionData);

      if (result.success) {
        toast.success("Application saved successfully!");

        const msg = `Hi Sumit sir, I want to enroll in the Data Science & AI Programme.\nName: ${formData.name}\nPhone: ${formData.phone}\nBackground: ${formData.status}`;
        window.open(
          `https://wa.me/919891030303?text=${encodeURIComponent(msg)}`,
          "_blank",
        );

        setFormData({
          name: "",
          phone: "",
          email: "",
          status: "",
        });
        setIsModalOpen(false);
      } else {
        toast.error(result.message || "Failed to submit. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting form to DB:", error);
      toast.error(error.message || "Failed to submit. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Trainer Image Base64 (Truncated for clean code, replace with actual or keep original)
  const trainerImg = "";
  return (
    <div className="font-['Inter',sans-serif] text-[#1E293B] bg-white overflow-x-hidden scroll-smooth">
      {/* MODAL OVERLAY */}
      <div
        className={`fixed inset-0 bg-black/65 z-[2000] flex items-center justify-center p-5 overflow-y-auto transition-opacity duration-300 ${isModalOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}
        onClick={(e) => {
          if (e.target === e.currentTarget) setIsModalOpen(false);
        }}
      >
        <div
          className={`bg-white rounded-[16px] max-w-[580px] w-full relative shadow-[0_24px_80px_rgba(0,0,0,0.3)] overflow-hidden m-auto transform transition-transform duration-300 ${isModalOpen ? "scale-100 translate-y-0" : "scale-95 translate-y-5"}`}
        >
          <div className="bg-gradient-to-br from-[#0B1C3F] to-[#1A3D8F] pt-7 px-3 pb-5 text-center relative">
            <button
              className="absolute top-3.5 right-4 bg-white/15 border-none text-[16px] cursor-pointer text-white leading-none w-7 h-7 rounded-full flex items-center justify-center hover:bg-white/25 transition"
              onClick={() => setIsModalOpen(false)}
            >
              ✕
            </button>
            <div className="inline-block bg-[#FF5C00]/20 border border-[#FF5C00]/50 text-[#FF8C42] rounded-full py-1 px-3 text-[11px] font-bold uppercase tracking-wider mb-2.5">
              🔴 Limited Seats Available
            </div>
            <div className="font-['Syne',sans-serif] text-[12px] md:text-[20px] font-extrabold text-white mb-1">
              Apply Now — Secure Your Seat
            </div>
            <div className="text-[12px] text-white/65 leading-snug">
              Our counsellor will call you within 30 minutes with batch details
              & EMI options
            </div>
          </div>
          <div className="p-2 md:p-7">
            <div className="bg-[#FFF7ED] border border-[#FED7AA] rounded-lg py-2.5 px-3.5 mb-4 text-center">
              <p className="text-[12px] text-[#C2410C] font-semibold">
                🏷️ 10% Discount + Scholarship up to ₹10,000 — mention while
                applying!
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3.5">
              <div>
                <label className="block text-[11px] font-bold text-[#334155] mb-1.5 uppercase tracking-wide">
                  Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="Your full name"
                  className="w-full border-2 border-[#E2E8F0] rounded-lg py-2.5 px-3.5 text-[14px] outline-none transition-colors focus:border-[#1A3D8F] focus:ring-2 focus:ring-[#1A3D8F]/10 placeholder-[#CBD5E1]"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-[#334155] mb-1.5 uppercase tracking-wide">
                  Phone Number *
                </label>
                <input
                  type="tel"
                  name="phone"
                  placeholder="+91 XXXXX XXXXX"
                  className="w-full border-2 border-[#E2E8F0] rounded-lg py-2.5 px-3.5 text-[14px] outline-none transition-colors focus:border-[#1A3D8F] focus:ring-2 focus:ring-[#1A3D8F]/10 placeholder-[#CBD5E1]"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div className="mb-3.5">
              <label className="block text-[11px] font-bold text-[#334155] mb-1.5 uppercase tracking-wide">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                placeholder="your@email.com"
                className="w-full border-2 border-[#E2E8F0] rounded-lg py-2.5 px-3.5 text-[14px] outline-none transition-colors focus:border-[#1A3D8F] focus:ring-2 focus:ring-[#1A3D8F]/10 placeholder-[#CBD5E1]"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>
            <div className="mb-3.5">
              <label className="block text-[11px] font-bold text-[#334155] mb-1.5 uppercase tracking-wide">
                Current Experience Level *
              </label>
              <select
                name="status"
                className="w-full border-2 border-[#E2E8F0] rounded-lg py-2.5 px-3.5 text-[14px] outline-none transition-colors focus:border-[#1A3D8F] focus:ring-2 focus:ring-[#1A3D8F]/10 bg-white"
                value={formData.status}
                onChange={handleInputChange}
              >
                <option value="">Current Experience Level *</option>
                <option value="Student / Fresher">Student / Fresher</option>
                <option value="1-3 Years Experience">
                  1-3 Years Experience
                </option>
                <option value="3+ Years Experience">3+ Years Experience</option>
                <option value="Non-IT Professional">Non-IT Professional</option>
              </select>
            </div>
            <button
              className="w-full bg-gradient-to-br from-[#FF5C00] to-[#FF8C42] text-white border-none rounded-xl py-3.5 text-[16px] font-bold cursor-pointer shadow-[0_6px_24px_rgba(255,92,0,0.35)] hover:-translate-y-[1px] transition-transform mb-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={submitForm}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Apply Now — Secure My Seat 🎯"}
            </button>
            <a
              href="https://wa.me/919891030303?text=Hi%20Sumit%20sir%2C%20I%20want%20to%20enroll%20in%20the%20Data%20Science%20%26%20AI%20Programme.%20Please%20share%20batch%20details%20and%20EMI%20options."
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-[#25D366] text-white border-none rounded-xl py-3 text-[14px] font-semibold cursor-pointer flex items-center justify-center gap-2 decoration-transparent hover:opacity-90 transition-opacity"
            >
              <svg width="17" height="17" fill="#fff" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.558 4.118 1.528 5.843L.057 23.569a.75.75 0 0 0 .921.916l5.85-1.53A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.959 0-3.81-.534-5.4-1.464l-.388-.228-4.029 1.054 1.07-3.912-.252-.402A9.944 9.944 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
              </svg>
              WhatsApp Karo — Instant Reply
            </a>
            <p className="text-[11px] text-[#94A3B8] text-center mt-2.5">
              🔒 Your info is 100% safe. No spam, ever.
            </p>
          </div>
        </div>
      </div>

      {/* STICKY NAV */}
      <nav className="fixed top-0 left-0 right-0 z-[999] bg-[#0B1C3F]/95 backdrop-blur-md flex items-center justify-between py-2.5 px-4 md:py-3 md:px-8 shadow-[0_2px_20px_rgba(0,0,0,0.25)]">
        <div className="font-['Syne',sans-serif] text-[18px] font-extrabold text-white">
          ekla<span className="text-[#FF5C00]">bya</span>
        </div>
        <div className="flex gap-2.5 items-center">
          <a
            href="https://wa.me/919891030303?text=Hi%20Sumit%20sir%2C%20I%20want%20to%20know%20more%20about%20the%20Data%20Science%20course"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden md:flex items-center gap-1.5 bg-[#25D366] text-white border-none rounded-lg py-2 px-4 text-[13px] font-semibold cursor-pointer"
          >
            <svg width="15" height="15" fill="#fff" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.558 4.118 1.528 5.843L.057 23.569a.75.75 0 0 0 .921.916l5.85-1.53A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.959 0-3.81-.534-5.4-1.464l-.388-.228-4.029 1.054 1.07-3.912-.252-.402A9.944 9.944 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
            </svg>
            +91 98910 30303
          </a>
          <button
            className="bg-[#FF5C00] text-white border-none rounded-lg py-2 px-4 md:px-[18px] text-[13px] font-bold cursor-pointer hover:bg-[#FF8C42] transition-colors"
            onClick={() => setIsModalOpen(true)}
          >
            Apply Now →
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section className="bg-gradient-to-br from-[#0B1C3F] via-[#1A3D8F] to-[#0B1C3F] min-h-[85vh] flex flex-col items-center justify-center pt-[85px] px-4 pb-[45px] text-center relative overflow-hidden">
        <div className="inline-flex items-center gap-1.5 bg-[#FF5C00]/15 border border-[#FF5C00]/40 text-[#FF8C42] rounded-full py-1 px-3 text-[11px] font-semibold tracking-wide uppercase mb-4 animate-pulse">
          <span className="text-[8px] text-[#FF5C00]">●</span> 🔴 December Batch
          — Limited Seats Left
        </div>
        <h1 className="font-['Syne',sans-serif] text-[28px] md:text-[5vw] lg:text-[52px] font-extrabold text-white leading-[1.1] tracking-[-1px] mb-4 max-w-[800px]">
          Become a <em className="not-italic text-[#FF8C42]">Data Scientist</em>
          <br />
          in 6 Months
        </h1>
        <p className="text-[14px] md:text-[1.8vw] lg:text-[17px] text-white/75 max-w-[580px] leading-relaxed mb-6">
          Learn from <strong className="text-[#FF8C42]">Sumit Choudhary</strong>{" "}
          — 10+ year industry expert. Master Python, SQL, Machine Learning, AI &
          Generative AI with 100% placement assistance.
        </p>
        <div className="flex gap-6 flex-wrap justify-center mb-8 bg-white/5 border border-white/10 rounded-2xl py-3 px-6 max-w-[720px] mx-auto">
          <div className="text-center px-4">
            <div className="font-['Syne',sans-serif] text-[22px] font-extrabold text-[#F5A623]">
              510+
            </div>
            <div className="text-[11px] text-white/60 mt-0.5">
              Learners Trained
            </div>
          </div>
          <div className="hidden sm:block w-px h-8 bg-white/10 align-self-center my-auto"></div>
          <div className="text-center px-4">
            <div className="font-['Syne',sans-serif] text-[22px] font-extrabold text-[#F5A623]">
              4.8★
            </div>
            <div className="text-[11px] text-white/60 mt-0.5">
              Learner Rating
            </div>
          </div>
          <div className="hidden sm:block w-px h-8 bg-white/10 align-self-center my-auto"></div>
          <div className="text-center px-4">
            <div className="font-['Syne',sans-serif] text-[22px] font-extrabold text-[#F5A623]">
              ₹8–15 LPA
            </div>
            <div className="text-[11px] text-white/60 mt-0.5">Avg Package</div>
          </div>
          <div className="hidden sm:block w-px h-8 bg-white/10 align-self-center my-auto"></div>
          <div className="text-center px-4">
            <div className="font-['Syne',sans-serif] text-[22px] font-extrabold text-[#F5A623]">
              100%
            </div>
            <div className="text-[11px] text-white/60 mt-0.5">
              Placement Support
            </div>
          </div>
        </div>

        <div className="flex gap-3 flex-wrap justify-center mb-6">
          <button
            className="bg-gradient-to-br from-[#FF5C00] to-[#FF8C42] text-white rounded-xl py-3 px-6 text-[15px] font-bold shadow-[0_6px_24px_rgba(255,92,0,0.35)] hover:-translate-y-1 transition-transform"
            onClick={() => setIsModalOpen(true)}
          >
            Apply Now — Secure Your Seat 🎯
          </button>
          <button
            className="bg-transparent text-white border border-white/40 rounded-xl py-3 px-5 text-[14px] font-semibold flex items-center gap-1.5 hover:border-white hover:bg-white/10 transition-colors"
            onClick={() => setIsModalOpen(true)}
          >
            📄 Download Brochure
          </button>
        </div>

        <div className="bg-gradient-to-br from-[#F5A623]/15 to-[#FF5C00]/15 border border-[#F5A623]/30 rounded-xl py-2 px-4 mb-5 flex items-center gap-2 flex-wrap justify-center max-w-[640px]">
          <span className="text-[15px]">🎓</span>
          <p className="text-white text-[13px] font-semibold">
            10% Early Bird Discount + Scholarship up to{" "}
            <span className="text-[#F5A623] font-extrabold">₹10,000</span>
          </p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#F5A623] text-[#0B1C3F] rounded-lg py-1 px-3 text-[11px] font-black hover:bg-[#FF8C42] transition-colors ml-1"
          >
            Claim Now →
          </button>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-xl py-3 px-5 inline-flex flex-col md:flex-row items-center gap-3 md:gap-6 flex-wrap justify-center max-w-[720px]">
          <div className="text-center">
            <div className="text-[9px] text-white/50 uppercase tracking-widest mb-0.5">
              Registration
            </div>
            <div className="font-['Syne',sans-serif] text-[18px] font-extrabold text-white">
              ₹2,000
            </div>
            <div className="text-[9px] text-[#FF8C42] mt-0.5">
              Lock your seat
            </div>
          </div>
          <div className="hidden md:block w-px h-8 bg-white/10"></div>
          <div className="text-center">
            <div className="text-[9px] text-white/50 uppercase tracking-widest mb-0.5">
              Total Fee
            </div>
            <div className="font-['Syne',sans-serif] text-[12px] font-extrabold text-white/30 line-through">
              ₹49,000
            </div>
            <div className="font-['Syne',sans-serif] text-[18px] font-extrabold text-white">
              ₹44,100
            </div>
            <div className="text-[9px] text-[#FF8C42] mt-0.5">
              After 10% off
            </div>
          </div>
          <div className="hidden md:block w-px h-8 bg-white/10"></div>
          <div className="text-center">
            <div className="text-[9px] text-white/50 uppercase tracking-widest mb-0.5">
              Zero Cost EMI
            </div>
            <div className="font-['Syne',sans-serif] text-[18px] font-extrabold text-white">
              ₹7,350<span className="text-[11px] text-white/40">/mo</span>
            </div>
            <div className="text-[9px] text-[#FF8C42] mt-0.5">6 months</div>
          </div>
          <div className="hidden md:block w-px h-8 bg-white/10"></div>
          <div className="text-center">
            <div className="text-[9px] text-white/50 uppercase tracking-widest mb-0.5">
              Scholarship
            </div>
            <div className="font-['Syne',sans-serif] text-[18px] font-extrabold text-[#F5A623]">
              ₹10,000
            </div>
            <div className="text-[9px] text-[#FF8C42] mt-0.5">For eligible</div>
          </div>
        </div>
      </section>

      {/* TOOLS STRIP (Needs custom animation class in tailwind config or inline style) */}
      <div className="bg-[#0B1C3F] py-4 px-6 overflow-hidden flex">
        <div
          className="flex gap-10 w-max"
          style={{ animation: "scroll 22s linear infinite" }}
        >
          {/* Note: In tailwind.config.js add keyframes: scroll { from: {transform: 'translateX(0)'}, to: {transform: 'translateX(-50%)'} } */}
          <style>{`@keyframes scroll { from {transform: translateX(0)} to {transform: translateX(-50%)} }`}</style>

          {[
            "Python",
            "SQL",
            "Power BI",
            "Machine Learning",
            "Pandas",
            "NumPy",
            "Scikit-Learn",
            "Generative AI",
            "Tableau",
            "Deep Learning",
            "NLP",
            "TensorFlow",
            "Python",
            "SQL",
            "Power BI",
            "Machine Learning",
            "Pandas",
            "NumPy",
            "Scikit-Learn",
            "Generative AI",
            "Tableau",
            "Deep Learning",
            "NLP",
            "TensorFlow",
          ].map((tool, i) => (
            <span
              key={i}
              className="text-white/70 text-[13px] font-semibold whitespace-nowrap flex items-center gap-2"
            >
              <span className="text-[8px] text-[#FF5C00]">◆</span> {tool}
            </span>
          ))}
        </div>
      </div>

      {/* CURRICULUM */}
      <section className="bg-[#F4F7FF] py-10 md:py-16 px-4 md:px-8">
        <div className="max-w-[1100px] mx-auto">
          <div className="inline-block bg-[#FF5C00]/10 text-[#FF5C00] rounded-md py-1 px-3 text-[12px] font-semibold uppercase tracking-wider mb-3">
            What You'll Learn
          </div>
          <h2 className="font-['Syne',sans-serif] text-[22px] md:text-[32px] font-extrabold text-[#0B1C3F] leading-tight tracking-tight mb-4">
            Complete Course Curriculum
          </h2>
          <p className="text-[16px] text-[#64748B] max-w-[580px] leading-relaxed">
            Zero to job-ready in 6 structured modules covering the full Data
            Science & AI stack.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-12">
            {[
              {
                num: "Module 01",
                title: "Data Analytics Foundations",
                topics: [
                  "Excel for Data Analysis",
                  "SQL & Database Queries",
                  "Statistics & Probability",
                  "Business Reporting",
                ],
              },
              {
                num: "Module 02",
                title: "Python for Data Science",
                topics: [
                  "Python Programming Basics",
                  "Pandas & NumPy",
                  "Data Cleaning & EDA",
                  "Data Visualization",
                ],
              },
              {
                num: "Module 03",
                title: "Data Visualization",
                topics: [
                  "Power BI Dashboards",
                  "Matplotlib & Seaborn",
                  "Storytelling with Data",
                  "Business Intelligence",
                ],
              },
              {
                num: "Module 04",
                title: "Machine Learning",
                topics: [
                  "Supervised & Unsupervised ML",
                  "Classification & Regression",
                  "Model Evaluation & Tuning",
                  "Scikit-Learn Projects",
                ],
              },
              {
                num: "Module 05",
                title: "AI & NLP",
                topics: [
                  "Deep Learning Basics",
                  "Neural Networks",
                  "Natural Language Processing",
                  "Computer Vision Intro",
                ],
              },
              {
                num: "Module 06",
                title: "Generative AI & Capstone",
                topics: [
                  "ChatGPT & Prompt Engineering",
                  "LLMs & AI Tools",
                  "Capstone Industry Project",
                  "Portfolio & GitHub Setup",
                ],
              },
            ].map((mod, idx) => (
              <div
                key={idx}
                className="bg-white border border-[#E2E8F0] rounded-xl p-5 transition-all duration-200 hover:border-[#1A3D8F] hover:shadow-md"
              >
                <div className="text-[11px] font-bold text-[#FF5C00] tracking-widest uppercase mb-2">
                  {mod.num}
                </div>
                <div className="text-[17px] font-bold text-[#0B1C3F] mb-2">
                  {mod.title}
                </div>
                <ul className="flex flex-col gap-1.5 list-none">
                  {mod.topics.map((item, i) => (
                    <li
                      key={i}
                      className="text-[13px] text-[#64748B] flex items-center gap-1.5"
                    >
                      <span className="text-[#FF5C00] text-[11px]">→</span>{" "}
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TRAINER */}
      <section className="bg-[#F4F7FF] py-10 md:py-16 px-4 md:px-8">
        <div className="max-w-[1100px] mx-auto text-center">
          <div className="inline-block bg-[#FF5C00]/10 text-[#FF5C00] rounded-md py-1 px-3 text-[12px] font-semibold uppercase tracking-wider mb-3">
            Your Mentor
          </div>
          <h2 className="font-['Syne',sans-serif] text-[22px] md:text-[32px] font-extrabold text-[#0B1C3F] leading-tight tracking-tight mb-4">
            Learn from a Real Industry Expert
          </h2>
          <p className="text-[16px] text-[#64748B] max-w-[580px] leading-relaxed mx-auto">
            Not a fresher instructor — someone who has built real products and
            trained 510+ students.
          </p>

          <div className="bg-white rounded-2xl p-0 flex flex-col md:grid md:grid-cols-[220px_1fr] overflow-hidden shadow-lg max-w-[800px] mx-auto mt-8 text-left">
            <div className="bg-gradient-to-br from-[#0B1C3F] to-[#1A3D8F] flex items-end justify-center min-h-[220px] md:min-h-[300px] overflow-hidden">
              <img
                src={trainerImg}
                alt="Sumit Choudhary"
                className="w-full h-full object-cover object-top block"
              />
            </div>
            <div className="p-6 md:p-8">
              <div className="inline-block bg-[#FF5C00]/10 text-[#FF5C00] rounded-md py-1 px-2.5 text-[11px] font-bold uppercase tracking-wider mb-2">
                Lead Instructor
              </div>
              <div className="font-['Syne',sans-serif] text-[22px] font-extrabold text-[#0B1C3F] mb-1">
                Sumit Choudhary
              </div>
              <div className="text-[13px] text-[#64748B] mb-4">
                Data Science & AI Specialist — 10+ Years Industry Experience
              </div>
              <ul className="flex flex-col gap-2 list-none">
                {[
                  "10+ years hands-on experience in Data Science, ML & AI across top Indian companies",
                  "Trained 510+ learners — now working at TCS, Infosys, Wipro, Amazon, Deloitte",
                  "Expert in Python, SQL, Power BI, Machine Learning, Deep Learning & Generative AI",
                  "Teaches real-world problem solving, freelancing strategies & portfolio building",
                  "Known for making complex concepts simple — even for non-coders",
                ].map((pt, i) => (
                  <li
                    key={i}
                    className="text-[13px] text-[#1E293B] flex items-start gap-2 leading-relaxed"
                  >
                    <span className="text-[#16A34A] font-bold mt-[1px] shrink-0">
                      ✓
                    </span>{" "}
                    {pt}
                  </li>
                ))}
              </ul>
              <div className="flex gap-2 flex-wrap mt-4">
                {[
                  "Data Science",
                  "Machine Learning",
                  "Generative AI",
                  "Power BI",
                  "Freelancing Expert",
                ].map((badge, i) => (
                  <span
                    key={i}
                    className="bg-[#F4F7FF] border border-[#E8EEF8] rounded-lg py-0.5 px-2.5 text-[11px] font-semibold text-[#0B1C3F]"
                  >
                    {badge}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROJECTS */}
      <section className="bg-[#0B1C3F] py-10 md:py-16 px-4 md:px-8">
        <div className="max-w-[1100px] mx-auto">
          <div className="inline-block bg-[#FF5C00]/20 text-[#FF8C42] rounded-md py-1 px-3 text-[12px] font-semibold uppercase tracking-wider mb-3">
            Hands-On Projects
          </div>
          <h2 className="font-['Syne',sans-serif] text-[22px] md:text-[32px] font-extrabold text-white leading-tight tracking-tight mb-4">
            Work on 8 Real Industry Projects
          </h2>
          <p className="text-[16px] text-white/60 max-w-[580px] leading-relaxed">
            Build a portfolio employers and freelance clients actually want to
            see.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            {[
              {
                icon: "📊",
                title: "Sales Forecasting Dashboard",
                tech: "Python · Power BI · SQL",
              },
              {
                icon: "🔄",
                title: "Customer Churn Prediction",
                tech: "ML · Scikit-Learn · Pandas",
              },
              {
                icon: "🤖",
                title: "AI-Powered Chatbot",
                tech: "NLP · GPT API · Python",
              },
              {
                icon: "📈",
                title: "Stock Price Predictor",
                tech: "Deep Learning · TensorFlow",
              },
              {
                icon: "🎯",
                title: "Recommendation System",
                tech: "ML · Collaborative Filtering",
              },
              {
                icon: "🧠",
                title: "Market Trend Analyser",
                tech: "Python · Visualization · API",
              },
              {
                icon: "💼",
                title: "Freelance Analytics Project",
                tech: "End-to-End Client Delivery",
              },
              {
                icon: "⚡",
                title: "GenAI Capstone Project",
                tech: "LLM · Prompt Engg · Python",
              },
            ].map((proj, i) => (
              <div
                key={i}
                className="bg-white/5 border border-white/10 rounded-xl p-4 relative overflow-hidden hover:border-[#FF5C00]/40 transition-colors"
              >
                <div className="text-[20px] mb-2">{proj.icon}</div>
                <div className="text-[14px] font-bold text-white mb-1">
                  {proj.title}
                </div>
                <div className="text-[11px] text-white/50">{proj.tech}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PLACEMENTS */}
      <section className="bg-[#0B1C3F] py-10 md:py-16 px-4 md:px-8">
        <div className="max-w-[1100px] mx-auto">
          <div className="text-center mb-0">
            <div className="inline-block bg-[#F5A623]/20 text-[#F5A623] rounded-md py-1 px-3 text-[12px] font-semibold uppercase tracking-wider mb-3">
              🎉 December Batch Placements
            </div>
            <h2 className="font-['Syne',sans-serif] text-[22px] md:text-[32px] font-extrabold text-white leading-tight tracking-tight mb-4">
              December 2026 Batch Placements
            </h2>
            <p className="text-[16px] text-white/60 max-w-[580px] leading-relaxed mx-auto">
              Our December batch students are already working at top companies.
              You could be next!
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5 mt-12">
            {[
              {
                in: "AK",
                bg: "#1A3D8F",
                name: "Arjun Kapoor",
                role: "Data Analyst",
                comp: "📍 Accenture, Delhi",
                pkg: "₹7.8 LPA",
              },
              {
                in: "NS",
                bg: "#059669",
                name: "Neha Singh",
                role: "Business Analyst",
                comp: "📍 Cognizant, Noida",
                pkg: "₹6.5 LPA",
              },
              {
                in: "RV",
                bg: "#DC2626",
                name: "Rohit Verma",
                role: "ML Engineer",
                comp: "📍 Tech Mahindra, Pune",
                pkg: "₹9.2 LPA",
              },
              {
                in: "SG",
                bg: "#7C3AED",
                name: "Sneha Gupta",
                role: "Data Scientist",
                comp: "📍 Wipro, Bangalore",
                pkg: "₹10 LPA",
              },
              {
                in: "MK",
                bg: "#B45309",
                name: "Manish Kumar",
                role: "BI Analyst",
                comp: "📍 IBM, Hyderabad",
                pkg: "₹8.4 LPA",
              },
              {
                in: "AT",
                bg: "#0369A1",
                name: "Ankita Tiwari",
                role: "Data Analyst",
                comp: "📍 HCL Technologies, Noida",
                pkg: "₹7.2 LPA",
              },
              {
                in: "KR",
                bg: "#0F766E",
                name: "Karan Rawat",
                role: "AI Specialist",
                comp: "📍 Infosys, Gurgaon",
                pkg: "₹11 LPA",
              },
              {
                in: "PM",
                bg: "#BE185D",
                name: "Pooja Mishra",
                role: "Data Engineer",
                comp: "📍 TCS, Mumbai",
                pkg: "₹8.0 LPA",
              },
              {
                in: "VS",
                bg: "#1D4ED8",
                name: "Vishal Sharma",
                role: "ML Analyst",
                comp: "📍 Capgemini, Pune",
                pkg: "₹9.5 LPA",
              },
              {
                in: "DY",
                bg: "#92400E",
                name: "Divya Yadav",
                role: "Data Scientist",
                comp: "📍 EY, Delhi",
                pkg: "₹12 LPA",
              },
            ].map((plc, i) => (
              <div
                key={i}
                className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center gap-2.5 hover:border-[#F5A623]/40 transition-colors"
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center font-extrabold text-[12px] text-white shrink-0"
                  style={{ background: plc.bg }}
                >
                  {plc.in}
                </div>
                <div>
                  <div className="text-[13px] font-bold text-white mb-0.5">
                    {plc.name}
                  </div>
                  <div className="text-[10px] text-white/50 mb-0.5">
                    {plc.role}
                  </div>
                  <div className="text-[10px] font-bold text-[#F5A623]">
                    {plc.comp}
                  </div>
                  <div className="inline-block bg-[#4ADE80]/15 border border-[#4ADE80]/30 text-[#4ADE80] rounded px-1.5 py-px text-[9px] font-bold mt-1">
                    {plc.pkg}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-gradient-to-br from-[#FF5C00] to-[#FF8C42] text-white border-none rounded-xl py-3 px-6 text-[15px] font-bold cursor-pointer shadow-[0_6px_24px_rgba(255,92,0,0.35)] hover:-translate-y-1 transition-transform"
            >
              I Want to Be Next — Apply Now 🚀
            </button>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="bg-[#F4F7FF] py-10 md:py-16 px-4 md:px-8">
        <div className="max-w-[1100px] mx-auto">
          <div className="inline-block bg-[#FF5C00]/10 text-[#FF5C00] rounded-md py-1 px-3 text-[12px] font-semibold uppercase tracking-wider mb-3">
            Student Reviews
          </div>
          <h2 className="font-['Syne',sans-serif] text-[22px] md:text-[32px] font-extrabold text-[#0B1C3F] leading-tight tracking-tight mb-4">
            Real Students. Real Results. Real Money. 💰
          </h2>
          <p className="text-[16px] text-[#64748B] max-w-[580px] leading-relaxed">
            From zero experience to top companies — and many earning through
            freelancing too.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-12">
            {[
              {
                review:
                  "Maine yeh course join kiya bina koi coding knowledge ke. Sumit sir ne itna clearly samjhaya ki 3rd month mein hi ek freelance project mil gaya — ₹18,000 ka! Aur phir TCS ne hire kar liya. Best investment of my life.",
                in: "RK",
                bg: "#1A3D8F",
                name: "Rahul Kumar",
                role: "Data Analyst — TCS, Delhi",
                tagBg: "bg-[#16A34A]/10 text-[#16A34A]",
                tag: "₹8.5 LPA + freelancing 🔥",
              },
              {
                review:
                  "I was a BBA graduate with zero tech background. After this course, I got placed at Deloitte and completed 2 freelance data projects on Upwork while still studying. Sumit sir's real-world approach is absolutely game-changing!",
                in: "AM",
                bg: "#854F0B",
                name: "Aditya Mehta",
                role: "BI Analyst — Deloitte, Gurgaon",
                tagBg: "bg-[#1A3D8F]/10 text-[#1A3D8F]",
                tag: "Now earning ₹9.2 LPA",
              },
              {
                review:
                  "Mujhe lagta tha Data Science bahut mushkil hai. But Sumit sir ne step-by-step samjhaya. 6 months mein Python se lekar GenAI tak sab seekha. Infosys ne ₹10 LPA pe hire kiya. Mock interviews ki wajah se confidence bhi aa gaya!",
                in: "PS",
                bg: "#0F6E56",
                name: "Priya Sharma",
                role: "ML Engineer — Infosys, Noida",
                tagBg: "bg-[#16A34A]/10 text-[#16A34A]",
                tag: "Now earning ₹10 LPA",
              },
              {
                review:
                  "Eklabya ka course mere liye career-defining raha. Sumit sir ka freelancing module ekdum alag level ka tha — maine course ke beech hi Fiverr pe 3 projects complete kiye aur ₹45,000 kama liye! Ab Wipro mein job bhi hai aur side income bhi chal rahi hai.",
                in: "DT",
                bg: "#7C3AED",
                name: "Devendra Trivedi",
                role: "Data Scientist — Wipro, Pune",
                tagBg: "bg-[#FF5C00]/10 text-[#FF5C00]",
                tag: "₹45,000 freelancing during course! 🤑",
              },
              {
                review:
                  "As a working professional, I was worried about managing time. But recorded backups and weekend batch made it easy. The Power BI + Python combo got me promoted within 2 months of completing. Sumit sir genuinely cares about every student's growth!",
                in: "RB",
                bg: "#DB2777",
                name: "Reetika Bhadani",
                role: "Senior Data Analyst — HCL, Noida",
                tagBg: "bg-[#16A34A]/10 text-[#16A34A]",
                tag: "Promoted within 2 months 🚀",
              },
              {
                review:
                  "Yaar, honestly bolun toh yeh course meri zindagi badal di. Fresher tha, koi experience nahi tha. Sumit sir ne ek ek concept itne practically sikhaya ki ab main freelance ML projects le raha hoon — ₹25,000–₹60,000 per project. Amazon mein bhi interview clear ho gaya!",
                in: "DP",
                bg: "#059669",
                name: "Devansh Pandey",
                role: "ML Engineer — Amazon, Hyderabad",
                tagBg: "bg-[#FF5C00]/10 text-[#FF5C00]",
                tag: "Freelancing ₹25K–₹60K/project 🚀",
              },
            ].map((testi, i) => (
              <div
                key={i}
                className="bg-white rounded-xl p-5 border border-[#E2E8F0] relative"
              >
                <div className="absolute top-4 right-5 font-['Syne',sans-serif] text-[64px] text-[#E8EEF8] leading-none">
                  "
                </div>
                <div className="text-[#F5A623] text-[15px] mb-2.5">★★★★★</div>
                <p className="text-[14px] text-[#1E293B] leading-relaxed mb-4 italic">
                  "{testi.review}"
                </p>
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-[14px] text-white shrink-0"
                    style={{ background: testi.bg }}
                  >
                    {testi.in}
                  </div>
                  <div>
                    <div className="text-[14px] font-bold text-[#0B1C3F]">
                      {testi.name}
                    </div>
                    <div className="text-[11px] text-[#64748B] mt-0.5">
                      {testi.role}
                    </div>
                    <div
                      className={`inline-block rounded px-2 py-0.5 text-[10px] font-bold mt-1 ${testi.tagBg}`}
                    >
                      {testi.tag}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section
        id="enroll"
        className="bg-[#0B1C3F] py-10 md:py-16 px-4 md:px-8 relative overflow-hidden"
      >
        <div className="max-w-[1100px] mx-auto">
          <div className="text-center">
            <div className="inline-block bg-[#FF5C00]/20 text-[#FF8C42] rounded-md py-1 px-3 text-[12px] font-semibold uppercase tracking-wider">
              Enroll Today
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8 max-w-[600px] mx-auto mt-8 text-center">
            <h2 className="font-['Syne',sans-serif] text-[22px] md:text-[32px] font-extrabold text-white leading-tight tracking-tight mb-2">
              Data Science & AI Programme
            </h2>
            <p className="text-white/60 text-[13px]">
              Everything you need to become job-ready + freelance-ready in 6
              months
            </p>

            <div className="flex gap-2 flex-wrap justify-center my-3">
              <span className="bg-[#F5A623]/20 border border-[#F5A623]/40 text-[#F5A623] rounded-lg py-1 px-2.5 text-[11px] font-bold">
                🏷️ 10% Early Bird Discount
              </span>
              <span className="bg-[#4ADE80]/15 border border-[#4ADE80]/30 text-[#4ADE80] rounded-lg py-1 px-2.5 text-[11px] font-bold">
                🎓 Scholarship up to ₹10,000
              </span>
            </div>

            <div className="flex items-center justify-center gap-2 mt-2 mb-0.5 flex-wrap">
              <span className="font-['Syne',sans-serif] text-[18px] font-extrabold text-white/30 line-through">
                ₹49,000
              </span>
              <span className="bg-[#FF5C00] text-white rounded-md py-0.5 px-2 text-[10px] font-bold">
                SAVE ₹4,900
              </span>
            </div>

            <div className="font-['Syne',sans-serif] text-[42px] font-extrabold text-white leading-none my-2">
              ₹44,100<span className="text-[18px] text-white/40"> total</span>
            </div>

            <div className="bg-[#FF5C00]/15 border border-[#FF5C00]/30 rounded-xl py-2 px-4 mx-auto mb-3 inline-block">
              <p className="text-[12px] text-white/70 mb-0.5">
                Zero Cost EMI — 6 months
              </p>
              <strong className="font-['Syne',sans-serif] text-[17px] text-[#FF8C42] font-extrabold">
                ₹7,350 / month
              </strong>
            </div>

            <div className="bg-[#F5A623]/10 border border-[#F5A623]/30 rounded-xl py-1.5 px-3 mb-3 inline-block">
              <p className="text-[11px] text-[#F5A623] font-bold">
                Additional ₹10,000 scholarship for eligible students
              </p>
            </div>

            <p className="text-[12px] text-white/50 mb-5">
              🔒 Lock your seat with just{" "}
              <strong className="text-[#FF8C42]">
                ₹2,000 registration fee
              </strong>{" "}
              — balance due before batch starts
            </p>

            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-5 text-left list-none">
              {[
                "Live Instructor-Led Classes",
                "8 Real Industry Projects",
                "100% Placement Assistance",
                "Industry-Recognized Certificate",
                "Mock Interviews & Resume Help",
                "Freelancing Project Training",
                "Recorded Session Backup",
                "Sumit Choudhary (10+ yr Expert)",
              ].map((feature, idx) => (
                <li
                  key={idx}
                  className="text-[12px] text-white/80 flex items-center gap-1.5"
                >
                  <span className="text-[#4ADE80] font-bold">✓</span> {feature}
                </li>
              ))}
            </ul>

            <button
              className="w-full bg-gradient-to-br from-[#FF5C00] to-[#FF8C42] text-white border-none rounded-xl py-3.5 text-[15px] font-extrabold cursor-pointer shadow-[0_6px_24px_rgba(255,92,0,0.35)] hover:-translate-y-1 transition-transform font-['Inter',sans-serif]"
              onClick={() => setIsModalOpen(true)}
            >
              Enroll Now — Pay ₹2,000 to Register 🔒
            </button>
            <a
              href="https://wa.me/919891030303?text=Hi%20Sumit%20sir%2C%20I%20want%20to%20enroll%20in%20Data%20Science%20course.%20Please%20share%20batch%20details%20and%20EMI%20options."
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-[#25D366] text-white border-none rounded-xl py-3 text-[14px] font-bold cursor-pointer mt-2.5 flex items-center justify-center gap-1.5 no-underline hover:opacity-90 font-['Inter',sans-serif]"
            >
              <svg width="16" height="18" fill="#fff" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.558 4.118 1.528 5.843L.057 23.569a.75.75 0 0 0 .921.916l5.85-1.53A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.959 0-3.81-.534-5.4-1.464l-.388-.228-4.029 1.054 1.07-3.912-.252-.402A9.944 9.944 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
              </svg>
              Chat on WhatsApp — Get Instant Reply
            </a>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-10 md:py-16 px-4 md:px-8">
        <div className="max-w-[1100px] mx-auto">
          <div className="inline-block bg-[#FF5C00]/10 text-[#FF5C00] rounded-md py-1 px-3 text-[12px] font-semibold uppercase tracking-wider mb-3">
            FAQs
          </div>
          <h2 className="font-['Syne',sans-serif] text-[22px] md:text-[32px] font-extrabold text-[#0B1C3F] leading-tight tracking-tight mb-4">
            Common Questions
          </h2>
          <div className="flex flex-col gap-3 mt-12 max-w-[800px]">
            {[
              {
                q: "Do I need coding experience to join?",
                a: "Not at all! This course is designed for absolute beginners. Python and all tools are taught from scratch. BBA, B.Com, B.Sc, Engineering — anyone can join and succeed.",
              },
              {
                q: "How long is the course?",
                a: "The course is 6 months long — live classes + hands-on projects. You can choose weekday or weekend batches based on your schedule. Recordings are always available.",
              },
              {
                q: "How does the EMI work?",
                a: "After 10% discount, total fee is ₹44,100 divided across 6 months = ₹7,350/month. Zero cost — no hidden charges. Pay ₹2,000 now to register and lock your seat.",
              },
              {
                q: "Is placement guaranteed?",
                a: "We provide 100% Placement Assistance — resume building, LinkedIn optimization, mock interviews, and direct company referrals. Our December batch alone placed 10 students at companies like Accenture, IBM, TCS, EY, and more.",
              },
              {
                q: "Can I earn through freelancing during the course?",
                a: "Yes! Sumit sir covers freelancing as part of the curriculum — how to get clients on Fiverr/Upwork, price projects, and deliver professional work. Many students earn ₹15,000–₹60,000 while still learning!",
              },
              {
                q: "Are classes online or offline?",
                a: "Classes are live online via Zoom/Google Meet. Recorded backups are provided for every session — so you never miss anything even with a busy schedule.",
              },
            ].map((faq, i) => (
              <details
                key={i}
                className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden group [&_summary::-webkit-details-marker]:hidden"
              >
                <summary className="p-5 text-[15px] font-semibold text-[#0B1C3F] cursor-pointer flex justify-between items-center select-none group-open:border-[#1A3D8F]">
                  {faq.q}
                  <span className="text-[#FF5C00] text-[20px] shrink-0 group-open:hidden">
                    +
                  </span>
                  <span className="text-[#FF5C00] text-[20px] shrink-0 hidden group-open:block">
                    −
                  </span>
                </summary>
                <div className="px-5 pb-5 text-[14px] text-[#64748B] leading-relaxed">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bg-gradient-to-br from-[#FF5C00] to-[#c94000] py-10 md:py-16 px-4 md:px-8 text-center">
        <div className="max-w-[1100px] mx-auto">
          <h2 className="font-['Syne',sans-serif] text-[22px] md:text-[32px] font-extrabold text-white mb-3 tracking-tight">
            Your Career Change Starts Today 🚀
          </h2>
          <p className="text-[17px] text-white/85 mb-8">
            December batch seats are filling fast. Lock yours with ₹2,000 right
            now.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <button
              className="bg-white text-[#FF5C00] border-none rounded-xl py-3 px-6 text-[15px] font-extrabold cursor-pointer inline-block"
              onClick={() => setIsModalOpen(true)}
            >
              Enroll Now — ₹2,000 to Register
            </button>
            <a
              href="https://wa.me/919891030303?text=Hi%20Sumit%20sir%2C%20Data%20Science%20course%20ke%20baare%20mein%20baat%20karni%20thi."
              target="_blank"
              rel="noopener noreferrer"
              className="bg-transparent text-white border rounded-xl py-3 px-5 text-[14px] font-semibold cursor-pointer inline-flex items-center gap-2 no-underline hover:bg-white/10 transition-colors"
            >
              <svg width="18" height="18" fill="#fff" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.558 4.118 1.528 5.843L.057 23.569a.75.75 0 0 0 .921.916l5.85-1.53A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.959 0-3.81-.534-5.4-1.464l-.388-.228-4.029 1.054 1.07-3.912-.252-.402A9.944 9.944 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
              </svg>
              WhatsApp Karo
            </a>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#0B1C3F] py-7 px-6 text-center">
        <p className="text-white/40 text-[13px]">
          © 2025 Eklabya Centre of Excellence, Noida &nbsp;|&nbsp; +91 98910
          30303 &nbsp;|&nbsp; All Rights Reserved
        </p>
      </footer>
    </div>
  );
};

export default DataScienceLanding;
