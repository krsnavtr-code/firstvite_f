import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { submitContactForm } from "../../api/contactApi";

const NoCodeAIML = () => {
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

  return (
    <div className="font-['Inter',sans-serif] text-[#1A1A1A] bg-white scroll-smooth w-full">
      {/* POPUP FORM OVERLAY */}
      <div
        className={`fixed inset-0 bg-black/60 z-[1000] flex items-center justify-center p-4 transition-all duration-300 ${isModalOpen ? "opacity-100 visible" : "opacity-0 invisible"}`}
        onClick={(e) => {
          if (e.target === e.currentTarget) setIsModalOpen(false);
        }}
      >
        <div className="bg-white rounded-[12px] p-2 md:p-6 w-full max-w-[500px] m-4 relative shadow-[0_24px_80px_rgba(0,0,0,0.35)]">
          <button
            class="position absolute top-3.5 right-4 bg-none border-none text-[22px] color-[#AAAAAA] cursor-pointer hover:text-[#1A1A1A] transition-colors"
            onClick={() => setIsModalOpen(false)}
          >
            ✕
          </button>
          <h2 className="text-[22px] font-extrabold text-[#1A1A1A] mb-1.5 text-center">
            Receive Your Brochure Copy
          </h2>
          <p className="text-[14px] text-[#666] text-center mb-7 leading-relaxed">
            Submit your details below to learn more about the course fee,
            curriculum, benefits and more.
          </p>

          <div className="mb-3.5">
            <input
              type="text"
              name="name"
              placeholder="Name"
              className="w-full p-3.5 border-[1.5px] border-[#gray-200] border-solid rounded-[6px] text-[15px] color-[#1A1A1A] bg-[#F5F5F5] outline-none transition-all focus:border-[#E87722] focus:bg-white placeholder-[#AAAAAA]"
              value={formData.name}
              onChange={handleInputChange}
            />
          </div>

          <div className="mb-3.5">
            <input
              type="email"
              name="email"
              placeholder="Email"
              className="w-full p-3.5 border-[1.5px] border-[#gray-200] border-solid rounded-[6px] text-[15px] color-[#1A1A1A] bg-[#F5F5F5] outline-none transition-all focus:border-[#E87722] focus:bg-white placeholder-[#AAAAAA]"
              value={formData.email}
              onChange={handleInputChange}
            />
          </div>

          <div className="mb-3.5">
            <div className="flex border-[1.5px] border-solid border-[#E8E8E8] rounded-[6px] bg-[#F5F5F5] overflow-hidden transition-all focus-within:border-[#E87722] focus-within:bg-white">
              <select
                name="countryCode"
                className="border-none bg-transparent py-3.5 pl-3.5 pr-2.5 text-[14px] font-bold text-[#1A1A1A] outline-none cursor-pointer border-r-[1.5px] border-solid border-[#E8E8E8] min-w-[74px] appearance-none"
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
                className="flex-1 border-none bg-transparent py-3.5 px-4 text-[15px] text-[#1A1A1A] outline-none placeholder-[#AAAAAA]"
                value={formData.phone}
                onChange={handleInputChange}
              />
            </div>
          </div>

          <div className="mb-3.5">
            <select
              name="experience"
              className="w-full p-3.5 border-[1.5px] border-solid border-[#E8E8E8] rounded-[6px] text-[15px] text-[#666] bg-[#F5F5F5] outline-none appearance-none cursor-pointer transition-all focus:border-[#E87722] focus:bg-white"
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

          <p className="text-[11px] text-[#AAAAAA] text-center mb-4.5 leading-relaxed">
            By submitting this form, you consent to our{" "}
            <a href="#" className="text-[#2196C4] no-underline hover:underline">
              Terms of Use
            </a>{" "}
            &amp;{" "}
            <a href="#" className="text-[#2196C4] no-underline hover:underline">
              Privacy Policy
            </a>
            <br />
            and to be contacted by us via Email/Call/Whatsapp/SMS.
          </p>
          <button
            className="w-full bg-[#9B1B1B] text-white border-none rounded-[6px] p-3.5 text-[16px] font-extrabold cursor-pointer tracking-[0.5px] hover:bg-[#7A1212] transition-colors"
            onClick={submitForm}
            disabled={isSubmitting}
          >
            {isSubmitting ? "SUBMITTING..." : "SUBMIT"}
          </button>
        </div>
      </div>

      {/* NAV */}
      <nav className="bg-white px-[5%] flex items-center justify-between h-[68px] sticky top-0 z-[200] border-b border-solid border-[#E8E8E8] shadow-[0_2px_8px_rgba(0,0,0,0.06)]">
        <div className="flex items-center gap-10">
          <div className="font-['Syne',sans-serif] text-[18px] font-extrabold text-[#1A1A1A]">
            <img
              src="http://www.eklabya.com/api/upload/file/eKlabya-fit-logo-8874.png"
              alt="Logo"
              className="h-[40px]"
            />
          </div>
          <div className="hidden md:flex gap-8">
            <a
              href="#what-youll-learn"
              className="text-[14px] font-medium text-[#1A1A1A] no-underline pb-1 border-b-2 border-solid border-transparent hover:text-[#E87722] hover:border-[#E87722] transition-all"
            >
              What you'll learn
            </a>
            <a
              href="#benefits"
              className="text-[14px] font-medium text-[#1A1A1A] no-underline pb-1 border-b-2 border-solid border-transparent hover:text-[#E87722] hover:border-[#E87722] transition-all"
            >
              Benefits
            </a>
            <a
              href="#certificate"
              className="text-[14px] font-medium text-[#1A1A1A] no-underline pb-1 border-b-2 border-solid border-transparent hover:text-[#E87722] hover:border-[#E87722] transition-all"
            >
              Certificate
            </a>
            <a
              href="#program-faculty"
              className="text-[14px] font-medium text-[#1A1A1A] no-underline pb-1 border-b-2 border-solid border-transparent hover:text-[#E87722] hover:border-[#E87722] transition-all"
            >
              Program Faculty
            </a>
          </div>
        </div>
        <button
          className="bg-[#E87722] text-white border-none py-2.5 px-6 rounded-[6px] text-[14px] font-semibold cursor-pointer transition-all hover:bg-[#D06010]"
          onClick={() => setIsModalOpen(true)}
        >
          Enroll Now
        </button>
      </nav>

      {/* HERO */}
      <section className="bg-gradient-to-br from-[#9B1B1B] to-[#7A1212] py-16 px-[5%] grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-[60px] items-start min-h-[520px]">
        <div className="text-white">
          <div className="inline-block bg-white/15 text-white text-[13px] font-semibold py-1.5 px-4 rounded-[4px] mb-6 tracking-[0.3px]">
            Advance From Generative To Agentic AI
          </div>
          <h1 className="text-[30px] sm:text-[40px] lg:text-[52px] font-extrabold text-white leading-[1.15] mb-7 max-w-[620px]">
            Build Autonomous AI Systems With A Unique No-Code Approach
          </h1>
          <ul className="list-none mb-9 flex flex-col gap-3">
            <li className="flex items-start gap-3 text-[15px] text-white/90 before:content-['✓'] before:text-white before:font-bold before:text-[14px] before:mt-[1px] before:shrink-0">
              Learn from expert faculty
            </li>
            <li className="flex items-start gap-3 text-[15px] text-white/90 before:content-['✓'] before:text-white before:font-bold before:text-[14px] before:mt-[1px] before:shrink-0">
              Work on 14+ case studies and 3 hands-on projects
            </li>
            <li className="flex items-start gap-3 text-[15px] text-white/90 before:content-['✓'] before:text-white before:font-bold before:text-[14px] before:mt-[1px] before:shrink-0">
              Earn a Certificate of Completion from eKlabya
            </li>
            <li className="flex items-start gap-3 text-[15px] text-white/90 before:content-['✓'] before:text-white before:font-bold before:text-[14px] before:mt-[1px] before:shrink-0">
              Includes modules covering concepts on GenAI, Prompt Engineering,
              RAG, and Agentic AI
            </li>
          </ul>
          <div className="flex flex-wrap gap-3.5">
            <button
              className="bg-[#E87722] text-white border-none py-3.5 px-[30px] rounded-[6px] text-[15px] font-bold cursor-pointer transition-all hover:bg-[#D06010] hover:-translate-y-[1px]"
              onClick={() => setIsModalOpen(true)}
            >
              Apply Now — Free
            </button>
            <button
              className="bg-transparent text-white border-2 border-solid border-white/55 py-3.5 px-[30px] rounded-[6px] text-[15px] font-semibold cursor-pointer transition-all hover:border-white hover:bg-white/10"
              onClick={() => setIsModalOpen(true)}
            >
              Start Now
            </button>
          </div>
        </div>

        {/* HERO CARD */}
        <div className="bg-white rounded-[12px] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.3)] self-start w-full max-w-[400px] mx-auto lg:max-w-none">
          <div className="w-full h-[220px] overflow-hidden">
            <img
              src="http://www.eklabya.com/api/upload/file/WhatsApp-Image-2026-06-30-at-11-03-48-AM-2893.jpeg"
              alt="Course Card"
              className="w-full h-full object-cover object-top"
            />
          </div>
          <div className="p-5 md:p-6">
            <h3 className="text-[17px] font-solid text-[#1A1A1A] mb-1.5 font-bold">
              No-Code AI &amp; Machine Learning
            </h3>
            <p className="text-[14px] text-[#666] mb-4">
              Master AI development without typing a single line of code.
            </p>
            <div className="flex flex-wrap gap-1.5 mb-5">
              <span className="bg-[#F5F5F5] border border-solid border-[#E8E8E8] rounded-[100px] text-[12px] font-semibold text-[#666] py-1 px-3">
                3 Hands-on Projects
              </span>
              <span className="bg-[#F5F5F5] border border-solid border-[#E8E8E8] rounded-[100px] text-[12px] font-semibold text-[#666] py-1 px-3">
                14+ Case Studies
              </span>
            </div>
            <div className="flex flex-col gap-2.5">
              <button
                className="bg-[#2196C4] text-white border-none p-3.5 rounded-[6px] text-[14px] font-bold cursor-pointer text-center w-full transition-colors hover:bg-[#1877A0]"
                onClick={() => setIsModalOpen(true)}
              >
                Download Curriculum
              </button>
              <button
                className="bg-white text-[#1A1A1A] border-[1.5px] border-solid border-[#E8E8E8] p-3 rounded-[6px] text-[14px] font-semibold cursor-pointer text-center w-full transition-all hover:border-[#E87722] hover:text-[#E87722]"
                onClick={() => setIsModalOpen(true)}
              >
                View Batch Details
              </button>
            </div>
            <p className="text-center text-[12px] text-[#666] mt-2.5 font-medium">
              Next Cohort Starts Soon. Limited Seats!
            </p>
          </div>
        </div>
      </section>

      {/* TRUST BAR */}
      <div className="bg-[#F5F5F5] py-4 px-[5%] flex items-center justify-center gap-8 lg:gap-12 flex-wrap border-b border-solid border-[#E8E8E8]">
        <div className="flex items-center gap-2 text-[13px] font-medium text-[#666]">
          <span className="w-2 h-2 bg-[#E87722] rounded-full shrink-0"></span>{" "}
          Top Rated AI Cohort
        </div>
        <div className="flex items-center gap-2 text-[13px] font-medium text-[#666]">
          <span className="w-2 h-2 bg-[#E87722] rounded-full shrink-0"></span>{" "}
          100% Online &amp; Flexible
        </div>
        <div className="flex items-center gap-2 text-[13px] font-medium text-[#666]">
          <span className="w-2 h-2 bg-[#E87722] rounded-full shrink-0"></span>{" "}
          Career Support Included
        </div>
      </div>

      {/* WHAT YOU LEARN */}
      <section id="what-youll-learn" className="bg-white py-[72px] px-[5%]">
        <div className="text-left mb-11">
          <span className="text-[11px] font-bold tracking-[2px] uppercase text-[#E87722] block mb-2.5">
            Curriculum
          </span>
          <h2 className="text-[24px] sm:text-[34px] font-bold text-[#1A1A1A] mb-2.5">
            What you will learn in this program
          </h2>
          <p className="text-[16px] text-[#666] max-w-[580px] leading-relaxed">
            A comprehensive industry-designed curriculum divided logically to
            build absolute mastery over AI systems without standard coding.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="border-[1.5px] border-solid border-[#E8E8E8] rounded-[10px] p-6 transition-all hover:border-[#E87722] hover:shadow-[0_6px_24px_rgba(232,119,34,0.1)]">
            <div className="w-11 h-11 bg-[#E87722]/10 rounded-[10px] flex items-center justify-center text-[20px] mb-3.5">
              🧠
            </div>
            <h4 className="text-[15px] font-bold text-[#1A1A1A] mb-1.5">
              GenAI &amp; Prompting
            </h4>
            <p className="text-[13px] text-[#666] Catalog leading-relaxed">
              Understand the logic of LLMs, foundational architectures, and dive
              into advanced prompt engineering frameworks.
            </p>
          </div>

          <div className="border-[1.5px] border-solid border-[#E8E8E8] rounded-[10px] p-6 transition-all hover:border-[#E87722] hover:shadow-[0_6px_24px_rgba(232,119,34,0.1)]">
            <div className="w-11 h-11 bg-[#E87722]/10 rounded-[10px] flex items-center justify-center text-[20px] mb-3.5">
              📂
            </div>
            <h4 className="text-[15px] font-bold text-[#1A1A1A] mb-1.5">
              Knowledge Base &amp; RAG
            </h4>
            <p className="text-[13px] text-[#666] Catalog leading-relaxed">
              Learn Retrieval-Augmented Generation to connect internal databases
              and private text pipelines dynamically to LLMs.
            </p>
          </div>

          <div className="border-[1.5px] border-solid border-[#E8E8E8] rounded-[10px] p-6 transition-all hover:border-[#E87722] hover:shadow-[0_6px_24px_rgba(232,119,34,0.1)]">
            <div className="w-11 h-11 bg-[#E87722]/10 rounded-[10px] flex items-center justify-center text-[20px] mb-3.5">
              🤖
            </div>
            <h4 className="text-[15px] font-bold text-[#1A1A1A] mb-1.5">
              Agentic AI Workflows
            </h4>
            <p className="text-[13px] text-[#666] Catalog leading-relaxed">
              Design standalone AI agents capable of planning tasks, using
              evaluation tools, and reasoning automatically.
            </p>
          </div>

          <div className="border-[1.5px] border-solid border-[#E8E8E8] rounded-[10px] p-6 transition-all hover:border-[#E87722] hover:shadow-[0_6px_24px_rgba(232,119,34,0.1)]">
            <div className="w-11 h-11 bg-[#E87722]/10 rounded-[10px] flex items-center justify-center text-[20px] mb-3.5">
              🛠️
            </div>
            <h4 className="text-[15px] font-bold text-[#1A1A1A] mb-1.5">
              No-Code Deployments
            </h4>
            <p className="text-[13px] text-[#666] Catalog leading-relaxed">
              Package and ship production-ready enterprise applications onto
              modern cloud networks within clicks.
            </p>
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section id="benefits" className="bg-[#F5F5F5] py-[72px] px-[5%]">
        <div className="text-left mb-11">
          <span className="text-[11px] font-bold tracking-[2px] uppercase text-[#E87722] block mb-2.5">
            Advantages
          </span>
          <h2 className="text-[24px] sm:text-[34px] font-bold text-[#1A1A1A] mb-2.5">
            Key benefits of learning with eKlabya
          </h2>
          <p className="text-[16px] text-[#666] max-w-[580px] leading-relaxed">
            We build complete learning ecosystems designed carefully to deliver
            actual strategic growth and high confidence.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white border-[1.5px] border-solid border-[#E8E8E8] rounded-[10px] p-6 flex gap-4 items-start transition-all hover:border-[#2196C4]">
            <div className="min-w-[38px] h-[38px] bg-[#2196C4] text-white rounded-[8px] flex items-center justify-center text-[16px] font-extrabold">
              01
            </div>
            <div>
              <h4 className="text-[14px] font-bold text-[#1A1A1A] mb-1.5">
                Live Live Mentor Support
              </h4>
              <p className="text-[13px] text-[#666] leading-relaxed">
                Never get stuck. Gain instant answers via live chat and
                dedicated weekly doubt clearing clinics.
              </p>
            </div>
          </div>

          <div className="bg-white border-[1.5px] border-solid border-[#E8E8E8] rounded-[10px] p-6 flex gap-4 items-start transition-all hover:border-[#2196C4]">
            <div className="min-w-[38px] h-[38px] bg-[#2196C4] text-white rounded-[8px] flex items-center justify-center text-[16px] font-extrabold">
              02
            </div>
            <div>
              <h4 className="text-[14px] font-bold text-[#1A1A1A] mb-1.5">
                Real-World Case Studies
              </h4>
              <p className="text-[13px] text-[#666] leading-relaxed">
                Solve real production issues built completely on parsed
                production problems of modern tech firms.
              </p>
            </div>
          </div>

          <div className="bg-white border-[1.5px] border-solid border-[#E8E8E8] rounded-[10px] p-6 flex gap-4 items-start transition-all hover:border-[#2196C4]">
            <div className="min-w-[38px] h-[38px] bg-[#2196C4] text-white rounded-[8px] flex items-center justify-center text-[16px] font-extrabold">
              03
            </div>
            <div>
              <h4 className="text-[14px] font-bold text-[#1A1A1A] mb-1.5">
                Flexible Professional Schedule
              </h4>
              <p className="text-[13px] text-[#666] leading-relaxed">
                Designed optimally for dynamic corporate routines. Balance
                learning smoothly with pre-existing work paths.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CERTIFICATE SECTION */}
      <section id="certificate" className="bg-white py-[72px] px-[5%]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-[60px] items-center">
          <div className="relative group">
            <img
              src="http://www.eklabya.com/api/upload/file/WhatsApp-Image-2026-06-30-at-11-04-53-AM-0087.jpeg"
              alt="Certificate"
              className="w-full rounded-[12px] shadow-[0_20px_60px_rgba(0,0,0,0.15)] transition-transform duration-300 group-hover:scale-[1.02]"
            />
            <div className="absolute inset-[-8px] rounded-[16px] bg-gradient-to-br from-[#2196C4] to-[#E87722] -z-10 opacity-25 blur-[16px]"></div>
          </div>
          <div>
            <span className="text-[11px] font-bold tracking-[2px] uppercase text-[#E87722] block mb-2.5">
              Recognition
            </span>
            <h2 className="text-[24px] sm:text-[34px] font-bold text-[#1A1A1A] mb-2.5">
              Get Certified by eKlabya
            </h2>
            <p className="text-[14px] sm:text-[16px] text-[#666] mb-8 leading-relaxed">
              Stand out as a certified AI practitioner. Showcase your hands-on
              ability to construct production-ready agentic workflows safely to
              potential employers.
            </p>

            <div className="flex flex-col gap-5 mb-9">
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-[10px] flex items-center justify-center text-[20px] shrink-0 bg-[#2196C4]/10">
                  🌟
                </div>
                <div>
                  <h4 className="text-[15px] font-bold text-[#1A1A1A] mb-1">
                    Global Validation
                  </h4>
                  <p className="text-[13px] text-[#666] leading-relaxed">
                    Share your unique, verifiable digital certificate on
                    LinkedIn to display verified capabilities.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-11 h-11 rounded-[10px] flex items-center justify-center text-[20px] shrink-0 bg-[#E87722]/10">
                  💼
                </div>
                <div>
                  <h4 className="text-[15px] font-bold text-[#1A1A1A] mb-1">
                    Career Enhancement
                  </h4>
                  <p className="text-[13px] text-[#666] leading-relaxed">
                    Signal command over state-of-the-art AI automation
                    frameworks without getting constrained by regular code.
                  </p>
                </div>
              </div>
            </div>

            <button
              className="bg-gradient-to-r from-[#9B1B1B] to-[#7A1212] text-white border-none py-3.5 px-9 rounded-[6px] text-[16px] font-bold cursor-pointer transition-all hover:opacity-90 hover:-translate-y-[2px]"
              onClick={() => setIsModalOpen(true)}
            >
              Secure Seat Now
            </button>
          </div>
        </div>
      </section>

      {/* PROGRAM FACULTY */}
      <section id="program-faculty" className="bg-[#F5F5F5] py-[72px] px-[5%]">
        <div className="text-left mb-11">
          <span className="text-[11px] font-bold tracking-[2px] uppercase text-[#E87722] block mb-2.5">
            Mentors
          </span>
          <h2 className="text-[24px] sm:text-[34px] font-bold text-[#1A1A1A] mb-2.5">
            Learn from Top Industry Leaders
          </h2>
          <p className="text-[16px] text-[#666] max-w-[580px] leading-relaxed">
            Our academic leads are seasoned professionals who have implemented
            scalable AI solutions at global scale.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div className="bg-white border-[1.5px] border-solid border-[#E820202]/0 border-[#E8E8E8] rounded-[10px] p-7 text-center transition-all hover:border-[#E87722]">
            <div className="w-[68px] h-[68px] rounded-full bg-gradient-to-br from-[#E87722] to-[#2196C4] flex items-center justify-center text-[22px] font-bold text-white mb-3.5 mx-auto">
              SK
            </div>
            <h4 className="text-[15px] font-bold text-[#1A1A1A]">
              Dr. Sumit Kapoor
            </h4>
            <p className="text-[12px] text-[#E87722] font-600 mt-1">
              Ex-Principal Data Scientist
            </p>
            <p className="text-[12px] text-[#666] mt-1 leading-relaxed">
              Focused completely on high-impact predictive analytics and
              multi-agent cloud systems orchestration.
            </p>
          </div>

          <div className="bg-white border-[1.5px] border-solid border-[#E8E8E8] rounded-[10px] p-7 text-center transition-all hover:border-[#E87722]">
            <div className="w-[68px] h-[68px] rounded-full bg-gradient-to-br from-[#E87722] to-[#2196C4] flex items-center justify-center text-[22px] font-bold text-white mb-3.5 mx-auto">
              AM
            </div>
            <h4 className="text-[15px] font-bold text-[#1A1A1A]">
              Ananya Mishra
            </h4>
            <p className="text-[12px] text-[#E87722] font-600 mt-1">
              AI Product Lead
            </p>
            <p className="text-[12px] text-[#666] mt-1 leading-relaxed">
              Specialist in strategic RAG frameworks optimization and context
              window architectures handling.
            </p>
          </div>

          <div className="bg-white border-[1.5px] border-solid border-[#E8E8E8] rounded-[10px] p-7 text-center transition-all hover:border-[#E87722]">
            <div className="w-[68px] h-[68px] rounded-full bg-gradient-to-br from-[#E87722] to-[#2196C4] flex items-center justify-center text-[22px] font-bold text-white mb-3.5 mx-auto">
              RD
            </div>
            <h4 className="text-[15px] font-bold text-[#1A1A1A]">
              Rahul Deshmukh
            </h4>
            <p className="text-[12px] text-[#E87722] font-600 mt-1">
              No-Code Architect
            </p>
            <p className="text-[12px] text-[#666] mt-1 leading-relaxed">
              Pioneer in continuous deployment workflows and safe visual app
              development paradigms mapping.
            </p>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="bg-[#1A1A2E] py-[72px] px-[5%] text-white">
        <div className="text-left mb-11">
          <span className="text-[11px] font-bold tracking-[2px] uppercase text-[#E87722] block mb-2.5">
            Success Stories
          </span>
          <h2 className="text-[24px] sm:text-[34px] font-bold text-white mb-2.5">
            Hear from our successful alumni
          </h2>
          <p className="text-[16px] text-white/60 max-w-[580px]">
            See how professionals transformed their careers using our structured
            no-code approach.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <div className="bg-white/06 border border-white/10 rounded-[10px] p-6 px-5">
            <div className="text-[#F5A623] text-[15px] mb-3">★★★★★</div>
            <blockquote className="text-[14px] text-white/80 leading-relaxed mb-4 italic">
              "As a business manager, I always wanted to create custom AI
              solutions but felt blocked by coding. This program completely
              changed my mindset. I built a RAG pipeline in weeks!"
            </blockquote>
            <p className="text-[13px] font-bold text-white">Rohan Sharma</p>
            <p className="text-[12px] text-white/50 mt-0.5">Product Manager</p>
          </div>

          <div className="bg-white/06 border border-white/10 rounded-[10px] p-6 px-5">
            <div className="text-[#F5A623] text-[15px] mb-3">★★★★★</div>
            <blockquote className="text-[14px] text-white/80 leading-relaxed mb-4 italic">
              "The faculty standard is excellent. The module on Agentic AI was
              incredibly eye-opening, showing how autonomous agents can truly
              change operations."
            </blockquote>
            <p className="text-[13px] font-bold text-white">Priya Nair</p>
            <p className="text-[12px] text-white/50 mt-0.5">Business Analyst</p>
          </div>

          <div className="bg-white/06 border border-white/10 rounded-[10px] p-6 px-22">
            <div className="text-[#F5A623] text-[15px] mb-3">★★★★★</div>
            <blockquote className="text-[14px] text-white/82 leading-relaxed mb-4 italic">
              "Building 14 case studies gave me immense confidence. I could
              easily propose automated workflows to our leadership immediately
              after the program."
            </blockquote>
            <p className="text-[13px] font-bold text-white">Amit Patel</p>
            <p className="text-[12px] text-white/55 mt-0.5">Operations Lead</p>
          </div>
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section className="bg-gradient-to-br from-[#9B1B1B] to-[#7A1212] py-[72px] px-[5%] text-center">
        <h2 className="font-['Syne',sans-serif] text-[clamp(26px,3.5vw,38px)] font-extrabold text-white mb-3.5">
          Ready to Master Autonomous AI?
        </h2>
        <p className="text-[17px] text-white/80 mb-8">
          Join the next batch and learn to build production-grade AI systems
          without code.
        </p>
        <div className="flex gap-3.5 justify-center flex-wrap">
          <button
            className="bg-[#E87722] text-white border-none rounded-[6px] py-3 px-7 text-[15px] font-bold cursor-pointer hover:bg-[#D06010] hover:-translate-y-px transition-all"
            onClick={() => setIsModalOpen(true)}
          >
            Apply Now — Free
          </button>
          <button
            className="bg-transparent text-white border-2 border-white/55 rounded-[6px] py-3 px-7 text-[15px] font-semibold cursor-pointer hover:border-white hover:bg-white/10 transition-all"
            onClick={() => setIsModalOpen(true)}
          >
            Download Syllabus
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#0F0F1A] border-t border-white/10 py-8 px-[4%] sm:px-[5%] flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <div className="font-['Syne',sans-serif] text-[18px] font-extrabold text-white">
          <img
              src="http://www.eklabya.com/api/upload/file/eKlabya-fit-logo-8874.png"
              alt="Logo"
              className="h-[40px]"
            />
        </div>
        <p className="text-[12px] sm:text-[13px] text-white/40 order-3 sm:order-2">
          © 2026 eKlabya. All rights reserved.
        </p>
        <div className="flex gap-6 order-2 sm:order-3">
          <a
            href="#"
            className="text-[13px] text-white/45 no-underline hover:text-white transition-colors"
          >
            Terms of Use
          </a>
          <a
            href="#"
            className="text-[13px] text-white/45 no-underline hover:text-white transition-colors"
          >
            Privacy Policy
          </a>
        </div>
      </footer>
    </div>
  );
};

export default NoCodeAIML;
