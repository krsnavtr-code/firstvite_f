import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { submitContactForm } from "../../api/contactApi";

const NoCodeAIMLLanding = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    countryCode: "+91",
    experience: "",
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const submitForm = async () => {
    if (
      !formData.name ||
      !formData.email ||
      !formData.phone ||
      !formData.experience
    ) {
      toast.error(
        "Please fill in all required fields (Name, Email, Phone, Experience).",
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
        phone: `${formData.countryCode} ${formData.phone}`,
        message: `Work experience: ${formData.experience}. I want to enroll in the No-Code AI & Machine Learning Program. [Ref: ${Date.now()}]`,
        courseTitle: "No-Code AI & Machine Learning Program",
        courseId: "no-code-ai-ml",
        subject: "No-Code AI & ML Program Registration",
      };

      const result = await submitContactForm(submissionData);

      if (result.success) {
        toast.success("Application saved successfully!");

        const msg = `Hi, I want to enroll in the No-Code AI & Machine Learning Program.\nName: ${formData.name}\nPhone: ${formData.countryCode} ${formData.phone}\nExperience: ${formData.experience}`;
        window.open(
          `https://wa.me/919891030303?text=${encodeURIComponent(msg)}`,
          "_blank",
        );

        setFormData({
          name: "",
          email: "",
          phone: "",
          countryCode: "+91",
          experience: "",
        });
        setIsModalOpen(false);

        navigate("/thank-you", {
          state: {
            message:
              "Thank you for applying to the No-Code AI & Machine Learning Program! Our counsellor will call you with batch details & EMI options.",
          },
        });
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

  const heroCardImg = "";

  return (
    <div className="font-['Inter',sans-serif] text-[#1A1A1A] bg-white overflow-x-hidden scroll-smooth w-full">
      {/* MODAL OVERLAY */}
      <div
        className={`fixed inset-0 bg-black/60 z-[1000] flex items-center justify-center p-4 transition-opacity duration-300 ${isModalOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}
        onClick={(e) => {
          if (e.target === e.currentTarget) setIsModalOpen(false);
        }}
      >
        <div
          className={`bg-white rounded-[12px] max-w-[500px] w-full relative shadow-[0_24px_80px_rgba(0,0,0,0.35)] overflow-hidden transform transition-transform duration-300 max-h-[90vh] overflow-y-auto ${isModalOpen ? "scale-100 translate-y-0" : "scale-95 translate-y-5"}`}
        >
          <button
            className="absolute top-4 right-4 bg-transparent border-none text-[22px] cursor-pointer text-[#AAAAAA] leading-none hover:text-[#1A1A1A] transition z-10"
            onClick={() => setIsModalOpen(false)}
          >
            ✕
          </button>
          <div className="p-6 sm:p-8 md:p-9">
            <h2 className="font-['Inter',sans-serif] text-[20px] sm:text-[22px] font-extrabold text-[#1A1A1A] mb-1 text-center">
              Receive Your Brochure Copy
            </h2>
            <p className="text-[13px] sm:text-[14px] text-[#666] text-center mb-6 leading-relaxed">
              Submit your details below to learn more about the course fee,
              curriculum, benefits and more.
            </p>

            <div className="mb-3">
              <input
                type="text"
                name="name"
                placeholder="Name"
                className="w-full border-[1.5px] border-[#E8E8E8] rounded-[6px] py-2.5 sm:py-3 px-4 text-[14px] sm:text-[15px] outline-none transition-colors focus:border-[#E87722] focus:bg-white bg-[#F5F5F5] placeholder-[#AAAAAA]"
                value={formData.name}
                onChange={handleInputChange}
              />
            </div>

            <div className="mb-3">
              <input
                type="email"
                name="email"
                placeholder="Email"
                className="w-full border-[1.5px] border-[#E8E8E8] rounded-[6px] py-2.5 sm:py-3 px-4 text-[14px] sm:text-[15px] outline-none transition-colors focus:border-[#E87722] focus:bg-white bg-[#F5F5F5] placeholder-[#AAAAAA]"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>

            <div className="mb-3">
              <div className="flex border-[1.5px] border-[#E8E8E8] rounded-[6px] bg-[#F5F5F5] overflow-hidden transition-colors focus-within:border-[#E87722] focus-within:bg-white">
                <select
                  name="countryCode"
                  className="border-none bg-transparent py-2.5 sm:py-3 px-3 text-[13px] sm:text-[14px] font-semibold text-[#1A1A1A] outline-none cursor-pointer border-r-[1.5px] border-[#E8E8E8] min-w-[70px]"
                  value={formData.countryCode}
                  onChange={handleInputChange}
                >
                  <option value="+91">+91</option>
                  <option value="+1">+1</option>
                  <option value="+44">+44</option>
                  <option value="+65">+65</option>
                  <option value="+61">+61</option>
                  <option value="+971">+971</option>
                  <option value="+60">+60</option>
                  <option value="+92">+92</option>
                </select>
                <input
                  type="tel"
                  name="phone"
                  placeholder="Mobile No"
                  className="flex-1 border-none bg-transparent py-2.5 sm:py-3 px-4 text-[14px] sm:text-[15px] outline-none placeholder-[#AAAAAA]"
                  value={formData.phone}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div className="mb-4">
              <select
                name="experience"
                className="w-full border-[1.5px] border-[#E8E8E8] rounded-[6px] py-2.5 sm:py-3 px-4 text-[14px] sm:text-[15px] text-[#666] outline-none bg-[#F5F5F5] appearance-none cursor-pointer transition-colors focus:border-[#E87722] focus:bg-white"
                value={formData.experience}
                onChange={handleInputChange}
                style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23999' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`,
                  backgroundRepeat: "no-repeat",
                  backgroundPosition: "right 14px center",
                }}
              >
                <option value="" disabled>
                  Work experience in years
                </option>
                <option>0-1 years (Fresher)</option>
                <option>1-3 years</option>
                <option>3-5 years</option>
                <option>5-8 years</option>
                <option>8-12 years</option>
                <option>12+ years</option>
              </select>
            </div>

            <p className="text-[11px] text-[#AAAAAA] text-center mb-4 leading-relaxed">
              By submitting this form, you consent to our{" "}
              <a
                href="#"
                className="text-[#2196C4] no-underline hover:underline"
              >
                Terms of Use
              </a>{" "}
              &{" "}
              <a
                href="#"
                className="text-[#2196C4] no-underline hover:underline"
              >
                Privacy Policy
              </a>
              <br />
              and to be contacted by us via Email/Call/Whatsapp/SMS.
            </p>

            <button
              className="w-full bg-[#9B1B1B] text-white border-none rounded-[6px] py-3 text-[15px] sm:text-[16px] font-extrabold cursor-pointer hover:bg-[#7A1212] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={submitForm}
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "SUBMIT"}
            </button>
          </div>
        </div>
      </div>

      {/* NAV */}
      <nav className="bg-white px-[4%] sm:px-[5%] flex items-center justify-between h-[72px] sticky top-0 z-[200] border-b border-[#E8E8E8] shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
        <div className="flex items-center gap-6 lg:gap-10">
          <div className="font-['Syne',sans-serif] text-[18px] font-extrabold text-[#1A1A1A]">
            ekla<span className="text-[#E87722]">bya</span>
          </div>
          <div className="hidden md:flex gap-5 lg:gap-8">
            <a
              href="#what-youll-learn"
              className="text-[13px] lg:text-[14px] font-medium text-[#1A1A1A] no-underline py-1 border-b-2 border-transparent hover:text-[#E87722] hover:border-[#E87722] transition-all whitespace-nowrap"
            >
              What you'll learn
            </a>
            <a
              href="#benefits"
              className="text-[13px] lg:text-[14px] font-medium text-[#1A1A1A] no-underline py-1 border-b-2 border-transparent hover:text-[#E87722] hover:border-[#E87722] transition-all whitespace-nowrap"
            >
              Benefits
            </a>
            <a
              href="#certificate"
              className="text-[13px] lg:text-[14px] font-medium text-[#1A1A1A] no-underline py-1 border-b-2 border-transparent hover:text-[#E87722] hover:border-[#E87722] transition-all whitespace-nowrap"
            >
              Certificate
            </a>
            <a
              href="#program-faculty"
              className="text-[13px] lg:text-[14px] font-medium text-[#1A1A1A] no-underline py-1 border-b-2 border-transparent hover:text-[#E87722] hover:border-[#E87722] transition-all whitespace-nowrap"
            >
              Program Faculty
            </a>
          </div>
        </div>
        <button
          className="bg-[#E87722] text-white border-none rounded-[6px] py-2 px-4 sm:px-6 text-[13px] sm:text-[14px] font-semibold cursor-pointer hover:bg-[#D06010] transition-colors whitespace-nowrap"
          onClick={() => setIsModalOpen(true)}
        >
          Enroll Now
        </button>
      </nav>

      {/* HERO */}
      <section className="bg-gradient-to-br from-[#9B1B1B] to-[#7A1212] px-[4%] sm:px-[5%] py-10 sm:py-16 grid grid-cols-1 md:grid-cols-[1fr_360px] lg:grid-cols-[1fr_400px] gap-10 md:gap-12 lg:gap-[60px] items-center">
        <div className="hero-content order-2 md:order-1">
          <div className="inline-block bg-white/15 text-white text-[12px] sm:text-[13px] font-semibold py-1.5 px-4 rounded-[4px] mb-4 sm:mb-6 tracking-[0.3px]">
            Advance From Generative To Agentic AI
          </div>
          <h1 className="font-['Syne',sans-serif] text-[28px] sm:text-[36px] lg:text-[48px] font-extrabold text-white leading-[1.2] mb-5 sm:mb-7 max-w-[620px]">
            Build Autonomous AI Systems With A Unique No-Code Approach
          </h1>
          <ul className="list-none mb-6 sm:mb-9 flex flex-col gap-3">
            {[
              "Learn from expert faculty",
              "Work on 14+ case studies and 3 hands-on projects",
              "Earn a Certificate of Completion from eKlabya",
              "Includes modules covering concepts on GenAI, Prompt Engineering, RAG, and Agentic AI",
            ].map((item, i) => (
              <li
                key={i}
                className="flex items-start gap-3 text-[14px] sm:text-[15px] text-white/90"
              >
                <span className="text-white font-bold text-[14px] mt-0.5 shrink-0">
                  ✓
                </span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
          <div className="flex gap-3 flex-wrap">
            <button
              className="bg-[#E87722] text-white border-none rounded-[6px] py-3 px-5 sm:px-7 text-[14px] sm:text-[15px] font-bold cursor-pointer hover:bg-[#D06010] transition-all"
              onClick={() => setIsModalOpen(true)}
            >
              Apply Now — Free
            </button>
            <button
              className="bg-transparent text-white border-2 border-white/55 rounded-[6px] py-3 px-5 sm:px-7 text-[14px] sm:text-[15px] font-semibold cursor-pointer hover:border-white hover:bg-white/10 transition-all"
              onClick={() => setIsModalOpen(true)}
            >
              Start Now
            </button>
          </div>
        </div>

        <div className="hero-card bg-white rounded-[12px] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.3)] mx-auto md:ml-auto w-full max-w-[400px] order-1 md:order-2">
          <div className="hero-card-img w-full h-[180px] sm:h-[220px] overflow-hidden bg-gray-100">
            {heroCardImg && (
              <img
                src={heroCardImg}
                alt="No Code and Agentic AI"
                className="w-full h-full object-cover object-center block"
              />
            )}
          </div>
          <div className="p-5 sm:p-6">
            <div className="text-[16px] sm:text-[17px] font-bold text-[#1A1A1A] mb-1">
              No Code and Agentic AI
            </div>
            <div className="text-[13px] sm:text-[14px] text-[#666] mb-4">
              Master AI without writing a single line of code
            </div>
            <div className="flex gap-1.5 flex-wrap mb-5">
              {["14 Weeks", "Online", "10 CEUs"].map((tag, i) => (
                <span
                  key={i}
                  className="bg-[#F5F5F5] border border-[#E8E8E8] rounded-full text-[11px] sm:text-[12px] font-semibold text-[#666] py-1 px-3"
                >
                  {tag}
                </span>
              ))}
            </div>
            <div className="flex flex-col gap-2.5">
              <button
                className="bg-[#2196C4] text-white border-none rounded-[6px] py-2.5 sm:py-3 text-[13px] sm:text-[14px] font-bold cursor-pointer hover:bg-[#1877A0] transition-colors w-full text-center tracking-wide"
                onClick={() => setIsModalOpen(true)}
              >
                DOWNLOAD BROCHURE
              </button>
              <button
                className="bg-white text-[#1A1A1A] border-[1.5px] border-[#E8E8E8] rounded-[6px] py-2.5 sm:py-3 text-[13px] sm:text-[14px] font-semibold cursor-pointer hover:border-[#E87722] hover:text-[#E87722] transition-colors w-full text-center"
                onClick={() => setIsModalOpen(true)}
              >
                GET CURRICULUM
              </button>
              <p className="text-center text-[12px] text-[#666] mt-2 font-medium">
                Application Closes: 2nd Jul 2026
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* TRUST BAR */}
      <div className="bg-[#F5F5F5] py-4 px-[4%] sm:px-[5%] flex items-center justify-center gap-x-8 gap-y-3 flex-wrap border-b border-[#E8E8E8]">
        {[
          "Certificate of Completion",
          "100% Online & Flexible",
          "3 Hands-On Projects",
          "Dedicated Program Manager",
          "10,000+ Learners Globally",
        ].map((item, i) => (
          <div
            key={i}
            className="flex items-center gap-2 text-[12px] sm:text-[13px] font-medium text-[#666]"
          >
            <div className="w-2 h-2 bg-[#E87722] rounded-full shrink-0"></div>{" "}
            {item}
          </div>
        ))}
      </div>

      {/* WHAT YOU LEARN */}
      <section
        id="what-youll-learn"
        className="bg-white py-12 sm:py-16 md:py-[72px] px-[4%] sm:px-[5%]"
      >
        <div className="text-[11px] font-bold tracking-[2px] uppercase text-[#E87722] mb-2">
          What You'll Learn
        </div>
        <h2 className="font-['Syne',sans-serif] text-[24px] sm:text-[30px] lg:text-[34px] font-bold text-[#1A1A1A] mb-3">
          From ML Basics to Autonomous AI Agents
        </h2>
        <p className="text-[15px] sm:text-[16px] text-[#666] mb-8 sm:mb-10 max-w-[580px] leading-relaxed">
          A structured, no-code curriculum designed for professionals across all
          industries — zero coding required.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            {
              icon: "🧠",
              title: "AI & ML Foundations",
              desc: "Understand supervised and unsupervised learning, neural networks, and how ML models make predictions.",
            },
            {
              icon: "⚡",
              title: "Generative AI & Prompting",
              desc: "Master prompt engineering, build RAG pipelines, and harness LLMs for real business automation.",
            },
            {
              icon: "🤖",
              title: "Agentic AI Systems",
              desc: "Design and deploy autonomous AI agents that reason, plan, and execute complex multi-step tasks.",
            },
            {
              icon: "🛠️",
              title: "No-Code Tools",
              desc: "Work hands-on with industry-leading no-code platforms to build real ML models and data pipelines.",
            },
            {
              icon: "👁️",
              title: "Computer Vision",
              desc: "Apply AI to image recognition and visual data analysis without writing a single line of code.",
            },
            {
              icon: "📊",
              title: "Recommendation Engines",
              desc: "Build intelligent recommendation systems used in e-commerce, streaming, and content platforms.",
            },
          ].map((card, i) => (
            <div
              key={i}
              className="border-[1.5px] border-[#E8E8E8] rounded-[10px] p-5 sm:p-6 transition-all hover:border-[#E87722] hover:shadow-[0_6px_24px_rgba(232,119,34,0.1)]"
            >
              <div className="w-10 h-10 bg-[rgba(232,119,34,0.1)] rounded-[10px] flex items-center justify-center text-[18px] mb-3.5">
                {card.icon}
              </div>
              <h4 className="text-[14px] sm:text-[15px] font-bold text-[#1A1A1A] mb-1.5">
                {card.title}
              </h4>
              <p className="text-[12px] sm:text-[13px] text-[#666] leading-relaxed">
                {card.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* BENEFITS */}
      <section
        id="benefits"
        className="bg-[#F5F5F5] py-12 sm:py-16 md:py-[72px] px-[4%] sm:px-[5%]"
      >
        <div className="text-[11px] font-bold tracking-[2px] uppercase text-[#E87722] mb-2">
          Benefits
        </div>
        <h2 className="font-['Syne',sans-serif] text-[24px] sm:text-[30px] lg:text-[34px] font-bold text-[#1A1A1A] mb-3">
          Everything included in your program
        </h2>
        <p className="text-[15px] sm:text-[16px] text-[#666] mb-8 sm:mb-10 max-w-[580px] leading-relaxed">
          Designed so you get maximum value — from live mentoring to a
          recognized certificate.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            {
              num: "1",
              title: "Expert-Designed Curriculum",
              desc: "Industry-relevant modules covering Generative AI, Responsible AI, and Agentic AI built by top professionals.",
            },
            {
              num: "2",
              title: "Weekly Live Mentored Sessions",
              desc: "Reinforce concepts and get personalized guidance every week from experienced AI practitioners.",
            },
            {
              num: "3",
              title: "3 Hands-On Projects",
              desc: "Build a real portfolio with projects in lead scoring, patient analytics, and AI-powered marketing.",
            },
            {
              num: "4",
              title: "Dedicated Program Manager",
              desc: "A dedicated manager to help you with all your queries, scheduling, and learning support.",
            },
            {
              num: "5",
              title: "Certificate of Completion",
              desc: "Earn a recognized certificate to strengthen your resume and LinkedIn profile upon completion.",
            },
            {
              num: "6",
              title: "14+ Case Studies",
              desc: "Real-world industry case studies across healthcare, finance, retail, and e-commerce sectors.",
            },
          ].map((benefit, i) => (
            <div
              key={i}
              className="bg-white border-[1.5px] border-[#E8E8E8] rounded-[10px] p-5 sm:p-6 flex gap-4 items-start transition-all hover:border-[#2196C4]"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 bg-[#2196C4] text-white rounded-lg flex items-center justify-center text-[14px] sm:text-[16px] font-extrabold shrink-0">
                {benefit.num}
              </div>
              <div>
                <h4 className="text-[14px] font-bold text-[#1A1A1A] mb-1">
                  {benefit.title}
                </h4>
                <p className="text-[12px] sm:text-[13px] text-[#666] leading-relaxed">
                  {benefit.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CERTIFICATE SECTION */}
      <section
        id="certificate"
        className="bg-white py-12 sm:py-16 md:py-[72px] px-[4%] sm:px-[5%]"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-12 lg:gap-16 items-center">
          <div className="relative order-2 md:order-1">
            <div className="absolute inset-[-4px] sm:inset-[-8px] rounded-[16px] bg-gradient-to-br from-[#2196C4] to-[#E87722] z-[-1] opacity-25 blur-sm"></div>
            <div className="bg-gradient-to-br from-[#2196C4]/20 to-[#E87722]/20 rounded-[12px] p-4 sm:p-6 lg:p-8 shadow-[0_20px_60px_rgba(0,0,0,0.15)]">
              <div className="bg-white rounded-lg p-5 sm:p-8 text-center">
                <div className="font-['Syne',sans-serif] text-[22px] sm:text-[26px] lg:text-[28px] font-extrabold text-[#9B1B1B] mb-2">
                  Certificate of Completion
                </div>
                <div className="text-[14px] sm:text-[16px] text-[#666] mb-3">
                  No-Code AI & Machine Learning Program
                </div>
                <div className="text-[13px] sm:text-[14px] text-[#E87722] font-semibold mb-5">
                  eKlabya
                </div>
                <div className="border-t border-[#E8E8E8] pt-4 text-[11px] sm:text-[12px] text-[#666]">
                  This certifies that the holder has successfully completed the
                  program
                </div>
              </div>
            </div>
          </div>

          <div className="order-1 md:order-2">
            <div className="text-[11px] font-bold tracking-[2px] uppercase text-[#E87722] mb-2">
              Certificate of Completion
            </div>
            <h2 className="font-['Syne',sans-serif] text-[24px] sm:text-[30px] lg:text-[34px] font-bold text-[#1A1A1A] mb-3">
              A credential that sets you apart
            </h2>
            <p className="text-[15px] sm:text-[16px] text-[#666] mb-6 sm:mb-8 max-w-[580px] leading-relaxed">
              Upon successfully completing the program, you will receive an
              eKlabya Certificate of Completion — recognized by industry leaders
              and backed by ISO-certified standards.
            </p>
            <div className="flex flex-col gap-4 mb-8">
              {[
                {
                  icon: "🏆",
                  color: "blue",
                  title: "Industry-Recognized Certification",
                  desc: "ISO-certified and co-badged by government bodies — carries real weight with employers and clients.",
                },
                {
                  icon: "💼",
                  color: "orange",
                  title: "Boost Your Career Profile",
                  desc: "Add it to your LinkedIn, resume, or portfolio to stand out in an AI-driven job market.",
                },
                {
                  icon: "✅",
                  color: "blue",
                  title: "Earned, Not Gifted",
                  desc: "Awarded only upon completing all modules, projects, and assessments — making it genuinely meaningful.",
                },
              ].map((point, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div
                    className={`w-10 h-10 rounded-[10px] flex items-center justify-center text-[18px] shrink-0 ${
                      point.color === "blue"
                        ? "bg-[rgba(33,150,196,0.1)]"
                        : "bg-[rgba(232,119,34,0.1)]"
                    }`}
                  >
                    {point.icon}
                  </div>
                  <div>
                    <h4 className="text-[14px] sm:text-[15px] font-bold text-[#1A1A1A] mb-0.5">
                      {point.title}
                    </h4>
                    <p className="text-[12px] sm:text-[13px] text-[#666] leading-relaxed">
                      {point.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <button
              className="bg-gradient-to-br from-[#9B1B1B] to-[#7A1212] text-white border-none rounded-[6px] py-3 px-6 sm:px-8 text-[14px] sm:text-[16px] font-bold cursor-pointer hover:opacity-95 transition-all w-full sm:w-auto text-center"
              onClick={() => setIsModalOpen(true)}
            >
              Enroll to Earn Your Certificate →
            </button>
          </div>
        </div>
      </section>

      {/* PROGRAM FACULTY */}
      <section
        id="program-faculty"
        className="bg-[#F5F5F5] py-12 sm:py-16 md:py-[72px] px-[4%] sm:px-[5%]"
      >
        <div className="text-[11px] font-bold tracking-[2px] uppercase text-[#E87722] mb-2">
          Program Faculty
        </div>
        <h2 className="font-['Syne',sans-serif] text-[24px] sm:text-[30px] lg:text-[34px] font-bold text-[#1A1A1A] mb-3">
          Learn from the best in the field
        </h2>
        <p className="text-[15px] sm:text-[16px] text-[#666] mb-8 sm:mb-10 max-w-[580px] leading-relaxed">
          Our instructors are active researchers and industry practitioners with
          decades of combined experience.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            {
              initials: "RK",
              name: "Prof. Rajesh Kumar",
              role: "Program Director, AI",
              dept: "Dept. of Computer Science & Engineering",
            },
            {
              initials: "AM",
              name: "Dr. Ananya Mehta",
              role: "Lead Instructor, ML",
              dept: "Data Science & Intelligent Systems",
            },
            {
              initials: "SP",
              name: "Prof. Sundar Pillai",
              role: "Generative AI Specialist",
              dept: "Electrical Engineering & IDSS",
            },
            {
              initials: "VN",
              name: "Dr. Vivek Nair",
              role: "AI Strategy & Responsible AI",
              dept: "Industry Expert & Advisor",
            },
          ].map((faculty, i) => (
            <div
              key={i}
              className="bg-white border-[1.5px] border-[#E8E8E8] rounded-[10px] p-6 text-center transition-all hover:border-[#E87722]"
            >
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[#E87722] to-[#2196C4] flex items-center justify-center text-[20px] font-extrabold text-white mx-auto mb-3">
                {faculty.initials}
              </div>
              <h4 className="text-[14px] sm:text-[15px] font-bold text-[#1A1A1A]">
                {faculty.name}
              </h4>
              <p className="text-[12px] text-[#E87722] font-semibold mt-1">
                {faculty.role}
              </p>
              <p className="text-[11px] sm:text-[12px] text-[#666] mt-0.5 leading-relaxed">
                {faculty.dept}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="bg-[#1a1a2e] py-12 sm:py-16 md:py-[72px] px-[4%] sm:px-[5%]">
        <div className="text-[11px] font-bold tracking-[2px] uppercase text-[#E87722] mb-2">
          Learner Stories
        </div>
        <h2 className="font-['Syne',sans-serif] text-[24px] sm:text-[30px] lg:text-[34px] font-bold text-white mb-3">
          Real outcomes from real people
        </h2>
        <p className="text-[15px] sm:text-[16px] text-white/60 mb-8 sm:mb-10 max-w-[580px] leading-relaxed">
          Thousands of professionals have transformed their careers through
          eKlabya programs.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            {
              stars: "★★★★★",
              quote:
                "This program gave me a solid foundation in how AI actually works. I started applying what I learned from week two.",
              author: "Priya Verma",
              company: "Senior Analyst, HDFC Bank · Mumbai",
            },
            {
              stars: "★★★★★",
              quote:
                "I came from a completely non-technical background. The no-code tools made complex ML concepts genuinely accessible.",
              author: "Arjun Malhotra",
              company: "Product Manager, Flipkart · Bangalore",
            },
            {
              stars: "★★★★★",
              quote:
                "The Generative AI module alone was worth the entire program. The impact on student engagement has been incredible.",
              author: "Dr. Kavitha Rao",
              company: "Associate Professor · IIT Delhi",
            },
          ].map((testi, i) => (
            <div
              key={i}
              className="bg-white/[0.06] border border-white/10 rounded-[10px] p-5 sm:p-6"
            >
              <div className="text-[#F5A623] text-[14px] mb-2.5">
                {testi.stars}
              </div>
              <blockquote className="text-[13px] sm:text-[14px] text-white/80 leading-relaxed mb-4 italic">
                "{testi.quote}"
              </blockquote>
              <div className="text-[13px] font-bold text-white">
                {testi.author}
              </div>
              <div className="text-[11px] sm:text-[12px] text-white/50 mt-0.5">
                {testi.company}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section className="bg-gradient-to-br from-[#9B1B1B] to-[#7A1212] py-14 sm:py-16 px-[4%] sm:px-[5%] text-center">
        <h2 className="font-['Syne',sans-serif] text-[26px] sm:text-[34px] lg:text-[38px] font-extrabold text-white mb-3">
          Ready to lead with AI?
        </h2>
        <p className="text-[15px] sm:text-[17px] text-white/80 mb-6 sm:mb-8 max-w-[600px] mx-auto">
          Join 10,000+ professionals. Application closes 2nd July 2026 — seats
          are limited.
        </p>
        <div className="flex gap-3 justify-center flex-wrap">
          <button
            className="bg-[#E87722] text-white border-none rounded-[6px] py-3 px-6 sm:px-7.5 text-[14px] sm:text-[15px] font-bold cursor-pointer hover:bg-[#D06010] transition-all"
            onClick={() => setIsModalOpen(true)}
          >
            Apply Now — Free
          </button>
          <button
            className="bg-transparent text-white border-2 border-white/55 rounded-[6px] py-3 px-6 sm:px-7.5 text-[14px] sm:text-[15px] font-semibold cursor-pointer hover:border-white hover:bg-white/10 transition-all"
            onClick={() => setIsModalOpen(true)}
          >
            Get Started
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#0F0F1A] border-t border-white/10 py-8 px-[4%] sm:px-[5%] flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="font-['Syne',sans-serif] text-[18px] font-extrabold text-white">
          ekla<span className="text-[#E87722]">bya</span>
        </div>
        <p className="text-[12px] sm:text-[13px] text-white/40 order-3 sm:order-2">
          © 2026 eKlabya. All rights reserved.
        </p>
        <div className="flex gap-4 sm:gap-6 order-2 sm:order-3 flex-wrap justify-center">
          <a
            href="#"
            className="text-[12px] sm:text-[13px] text-white/45 no-underline hover:text-white transition-colors"
          >
            Privacy Policy
          </a>
          <a
            href="#"
            className="text-[12px] sm:text-[13px] text-white/45 no-underline hover:text-white transition-colors"
          >
            Terms of Use
          </a>
          <a
            href="#"
            className="text-[12px] sm:text-[13px] text-white/45 no-underline hover:text-white transition-colors"
          >
            Contact Us
          </a>
        </div>
      </footer>
    </div>
  );
};

export default NoCodeAIMLLanding;
