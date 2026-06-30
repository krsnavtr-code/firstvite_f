import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { submitContactForm } from "../../api/contactApi";

const EklabyaTestimonials = () => {
  const navigate = useNavigate();
  // Filter state to trace categories ('all', 'fresher', 'professional', etc.)
  const [activeFilter, setActiveFilter] = useState("all");
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
        message: `Background/Experience level: ${formData.status}. I want to connect with alumni/learners to know more about their experience. [Ref: ${Date.now()}]`,
        courseTitle: "Student Testimonials - Connect with Learners",
        courseId: "student-testimonials",
        subject: "Connect with Alumni Request",
      };

      const result = await submitContactForm(submissionData);

      if (result.success) {
        toast.success("Application saved successfully!");

        const msg = `Hi, I want to connect with alumni/learners to know more about their experience.\nName: ${formData.name}\nPhone: ${formData.phone}\nBackground: ${formData.status}`;
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

        navigate("/thank-you", {
          state: {
            message:
              "Thank you for your interest! Our team will connect you with alumni/learners who can share their experience with you.",
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

  // Exact Featured Success Stories from original file
  const featuredStories = [
    {
      initials: "RK",
      name: "Rahul Kumar",
      role: "Data Analyst",
      company: "TCS, New Delhi",
      salary: "₹8.5 LPA 🎉",
      stars: "★★★★★",
      sidebarBg: "bg-[#0B1C3F]",
      companyColor: "text-[#93C5FD]",
      avatarBg: "bg-[#1A3D8F]",
      categories: ["fresher", "placement", "freelance"],
      tags: [
        { text: "B.Sc → TCS", className: "bg-[#1A3D8F]/10 text-[#1A3D8F]" },
        {
          text: "Zero coding background",
          className: "bg-[#FF5C00]/10 text-[#c94000]",
        },
        {
          text: "₹18K freelance mid-course",
          className: "bg-[#16A34A]/10 text-[#15803d]",
        },
      ],
      quote:
        "Maine yeh course join kiya bina koi coding knowledge ke — honestly Python ka naam bhi sahi se nahi pata tha. Sumit sir ne pehli class se itna clearly samjhaya ki 3rd month mein hi Fiverr pe ek ₹18,000 ka project mil gaya. Client ne khud mujhe find kiya — mera portfolio itna solid ban gaya tha. TCS interview mein interviewer ne mere Capstone Project ke baare mein 20 minutes pooche. Job mil gayi. Yeh course meri zindagi ka best investment hai — koi regret nahi, ek bhi din.",
      outcomes: [
        {
          label: "Background",
          value: "B.Sc Graduate, unemployed",
          valClass: "text-[#1E293B]",
        },
        {
          label: "Mid-course earning",
          value: "₹18,000 freelance project",
          valClass: "text-[#c94000]",
        },
        {
          label: "After course",
          value: "TCS ₹8.5 LPA + freelancing",
          valClass: "text-[#15803d]",
        },
      ],
    },
    {
      initials: "PS",
      name: "Priya Sharma",
      role: "ML Engineer",
      company: "Infosys, Noida",
      salary: "₹10 LPA 🎉",
      stars: "★★★★★",
      sidebarBg: "bg-[#0F4C35]",
      companyColor: "text-[#6EE7B7]",
      avatarBg: "bg-[#059669]",
      categories: ["nonit", "placement"],
      tags: [
        {
          text: "Arts → ML Engineer",
          className: "bg-[#1A3D8F]/10 text-[#1A3D8F]",
        },
        {
          text: "Was terrified of coding",
          className: "bg-[#FF5C00]/10 text-[#c94000]",
        },
        {
          text: "Infosys in 6 months",
          className: "bg-[#16A34A]/10 text-[#15803d]",
        },
      ],
      quote:
        "Mujhe lagta tha Data Science sirf IIT wale log karte hain. Main Arts background se hun — coding sunke hi dar lagta tha. Sumit sir ne pehli class mein kaha — 'coding sikhna cooking sikhne jaisa hai, koi bhi seekh sakta hai.' Aur sach mein aisa hi hua. Step by step, kabhi lost feel nahi kiya. 6 months mein GenAI tak ka safar complete ho gaya. Mock interviews ne confidence aisa build kiya ki Infosys ke 3 rounds mein kabhi nervous nahi hua. ₹10 LPA meri family ke liye sapne jaisa hai.",
      outcomes: [
        {
          label: "Background",
          value: "Arts Graduate, sales job",
          valClass: "text-[#1E293B]",
        },
        {
          label: "Biggest fear",
          value: "Coding seemed impossible",
          valClass: "text-[#c94000]",
        },
        {
          label: "After course",
          value: "₹10 LPA ML Engineer, Infosys",
          valClass: "text-[#15803d]",
        },
      ],
    },
    {
      initials: "RB",
      name: "Reetika Bhadani",
      role: "Senior Data Analyst",
      company: "HCL Technologies, Noida",
      salary: "Promoted in 2 months 🚀",
      stars: "★★★★★",
      sidebarBg: "bg-[#500724]",
      companyColor: "text-[#FBCFE8]",
      avatarBg: "bg-[#BE185D]",
      categories: ["professional", "placement"],
      tags: [
        {
          text: "Working professional",
          className: "bg-[#1A3D8F]/10 text-[#1A3D8F]",
        },
        {
          text: "Time management concern",
          className: "bg-[#FF5C00]/10 text-[#c94000]",
        },
        {
          text: "Promoted without switching!",
          className: "bg-[#16A34A]/10 text-[#15803d]",
        },
      ],
      quote:
        "As a working professional at HCL, I was scared I wouldn't manage time between job and course. But weekend batch + recorded backups made it completely manageable. The Power BI and Python combination was directly applicable to my daily work from week 3. My manager noticed within weeks. I got promoted to Senior Data Analyst within 2 months of completing the course — without switching companies, without a gap year. Sumit sir genuinely cares about every student's growth.",
      outcomes: [
        {
          label: "Background",
          value: "Analyst at HCL",
          valClass: "text-[#1E293B]",
        },
        {
          label: "Challenge",
          value: "Full-time job + course",
          valClass: "text-[#c94000]",
        },
        {
          label: "Result",
          value: "Promoted to Senior in 2 months",
          valClass: "text-[#15803d]",
        },
      ],
    },
    {
      initials: "DP",
      name: "Devansh Pandey",
      role: "ML Engineer",
      company: "Amazon, Hyderabad",
      salary: "Amazon placed! 🚀",
      stars: "★★★★★",
      sidebarBg: "bg-[#052E16]",
      companyColor: "text-[#6EE7B7]",
      avatarBg: "bg-[#059669]",
      categories: ["fresher", "placement", "freelance"],
      tags: [
        {
          text: "Small town fresher → Amazon",
          className: "bg-[#1A3D8F]/10 text-[#1A3D8F]",
        },
        {
          text: "₹25K–₹60K/freelance project",
          className: "bg-[#16A34A]/10 text-[#15803d]",
        },
        {
          text: "Dream in 6 months",
          className: "bg-[#F5A623]/12 text-[#92400E]",
        },
      ],
      quote:
        "Yaar honestly — yeh course meri zindagi badal di. Chote sheher se hun, fresher tha, koi contacts nahi. Sumit sir ne practically sikhaya — real datasets, real business scenarios, real client communication. Fiverr pe pehle ₹5,000 ka project liya, phir ₹15,000, phir ₹60,000 wala bhi aaya! Amazon interview ke liye Sumit sir ne personally mock sessions kiye. 3 rounds clear hue. Ab ML Engineer hun Hyderabad mein aur freelancing bhi chal rahi hai. Jo kabhi socha bhi nahi tha woh 6 months mein mil gaya.",
      outcomes: [
        {
          label: "Background",
          value: "B.Tech Fresher, small town",
          valClass: "text-[#1E293B]",
        },
        {
          label: "Freelancing",
          value: "₹25K–₹60K per project",
          valClass: "text-[#c94000]",
        },
        {
          label: "Placed at",
          value: "Amazon, Hyderabad",
          valClass: "text-[#15803d]",
        },
      ],
    },
    {
      initials: "AM",
      name: "Aditya Mehta",
      role: "BI Analyst",
      company: "Deloitte, Gurgaon",
      salary: "₹9.2 LPA 🎉",
      stars: "★★★★★",
      sidebarBg: "bg-[#431407]",
      companyColor: "text-[#FCA5A5]",
      avatarBg: "bg-[#C2410C]",
      categories: ["nonit", "freelance", "placement"],
      tags: [
        {
          text: "BBA Commerce → Deloitte",
          className: "bg-[#1A3D8F]/10 text-[#1A3D8F]",
        },
        {
          text: "Zero tech background",
          className: "bg-[#FF5C00]/10 text-[#c94000]",
        },
        {
          text: "2 Upwork projects mid-course",
          className: "bg-[#16A34A]/10 text-[#15803d]",
        },
      ],
      quote:
        "I was a BBA graduate with no idea what SQL even was. I joined out of desperation — commerce job going nowhere, watching people younger than me earn 3x more. What I didn't expect: completing 2 freelance Upwork projects in month 4! Sumit sir doesn't just teach you to code — he teaches you to think like a professional solving real business problems. My Deloitte interviewer specifically spent 20 minutes on my Power BI dashboard project from the course.",
      outcomes: [
        {
          label: "Background",
          value: "BBA, junior accountant",
          valClass: "text-[#1E293B]",
        },
        {
          label: "Mid-course",
          value: "2 Upwork projects ✓",
          valClass: "text-[#c94000]",
        },
        {
          label: "After course",
          value: "₹9.2 LPA BI Analyst, Deloitte",
          valClass: "text-[#15803d]",
        },
      ],
    },
    {
      initials: "DT",
      name: "Devendra Trivedi",
      role: "Data Scientist",
      company: "Wipro, Pune",
      salary: "₹11 LPA 🎉",
      stars: "★★★★★",
      sidebarBg: "bg-[#2E1065]",
      companyColor: "text-[#C4B5FD]",
      avatarBg: "bg-[#7C3AED]",
      categories: ["professional", "freelance", "placement"],
      tags: [
        {
          text: "IT Support → Data Scientist",
          className: "bg-[#1A3D8F]/10 text-[#1A3D8F]",
        },
        {
          text: "₹45,000 freelancing mid-course",
          className: "bg-[#16A34A]/10 text-[#15803d]",
        },
        {
          text: "Fiverr + job simultaneously",
          className: "bg-[#F5A623]/12 text-[#92400E]",
        },
      ],
      quote:
        "Eklabya ka course mere liye career-defining tha. Sumit sir ka freelancing module — yeh woh hissa hai jo koi nahi sikhata. Unhone practically sikhaya: Fiverr profile kaise banate hain, proposal kaise likhte hain, pricing kya honi chahiye, delivery professional kaise hoti hai. Maine course ke beech hi 3 projects complete kiye aur ₹45,000 kama liye — almost course fee wapas aa gayi! Ab Wipro mein Data Scientist hun aur side income regularly chal rahi hai.",
      outcomes: [
        {
          label: "Background",
          value: "IT Support Engineer",
          valClass: "text-[#1E293B]",
        },
        {
          label: "Earned during course",
          value: "₹45,000 via Fiverr 🤑",
          valClass: "text-[#c94000]",
        },
        {
          label: "After course",
          value: "₹11 LPA Data Scientist, Wipro",
          valClass: "text-[#15803d]",
        },
      ],
    },
  ];

  // Exact Grid Mini-Testimonials (7-50) from original file
  const gridTestimonials = [
    {
      avBg: "bg-[#1D4ED8]",
      initials: "VS",
      name: "Vishal Sharma",
      role: "Data Engineer",
      company: "Capgemini, Pune",
      stars: "★★★★★",
      salary: "₹9.5 LPA",
      quote:
        "Course join karte waqt mujhe Python ka A bhi nahi pata tha. 6 months baad Capgemini mein Data Engineer hoon. Sumit sir ka patience aur teaching style unmatchable hai. Har concept pe real use case dete hain.",
      categories: ["fresher", "placement"],
      tags: [
        { text: "Fresher → Capgemini", cl: "bg-[#1A3D8F]/10 text-[#1A3D8F]" },
        { text: "₹9.5 LPA", cl: "bg-[#16A34A]/10 text-[#15803d]" },
      ],
      before: "B.Tech, no job",
      after: "Capgemini ₹9.5 LPA",
    },
    {
      avBg: "bg-[#0369A1]",
      initials: "AT",
      name: "Ankita Tiwari",
      role: "Data Analyst",
      company: "HCL Technologies, Noida",
      stars: "★★★★★",
      salary: "₹7.2 LPA",
      quote:
        "BBA karke IT mein jaana possible lagta hi nahi tha. Eklabya ne woh possible kar diya. Power BI seekhne ke baad mujhe HCL ne directly hire kiya. Resume building session meri actual placement wajah bani.",
      categories: ["nonit", "placement"],
      tags: [
        { text: "BBA → HCL", cl: "bg-[#1A3D8F]/10 text-[#1A3D8F]" },
        { text: "No tech background", cl: "bg-[#16A34A]/10 text-[#15803d]" },
      ],
      before: "BBA, confused",
      after: "HCL ₹7.2 LPA",
    },
    {
      avBg: "bg-[#065F46]",
      initials: "KR",
      name: "Karan Rawat",
      role: "AI Specialist",
      company: "Infosys, Gurgaon",
      stars: "★★★★★",
      salary: "₹11 LPA",
      quote:
        "GenAI module tha is course ka highlight. ChatGPT APIs use karke ek project banaya jo interview mein game-changer bana. Infosys ne AI Specialist role ke liye directly select kiya. Sumit sir thank you!",
      categories: ["placement"],
      tags: [
        { text: "GenAI specialist", cl: "bg-[#F5A623]/12 text-[#92400E]" },
        { text: "₹11 LPA", cl: "bg-[#16A34A]/10 text-[#15803d]" },
      ],
      before: "Junior developer",
      after: "Infosys AI ₹11 LPA",
    },
    {
      avBg: "bg-[#BE185D]",
      initials: "PM",
      name: "Pooja Mishra",
      role: "Data Engineer",
      company: "TCS, Mumbai",
      stars: "★★★★★",
      salary: "₹8 LPA",
      quote:
        "Working professional thi, 2 saal ka gap tha career mein. Eklabya ne confidence wapas diya. SQL aur Power BI sikhne ke baad TCS ne hire kar liya. Placement team ne resume se interview tak sab mein help ki.",
      categories: ["professional", "placement"],
      tags: [
        { text: "Career gap → TCS", cl: "bg-[#1A3D8F]/10 text-[#1A3D8F]" },
        { text: "Confidence rebuild", cl: "bg-[#16A34A]/10 text-[#15803d]" },
      ],
      before: "2-year career gap",
      after: "TCS ₹8 LPA",
    },
    {
      avBg: "bg-[#92400E]",
      initials: "SV",
      name: "Saurabh Verma",
      role: "Freelance Data Analyst",
      company: "Self-employed, Lucknow",
      stars: "★★★★★",
      salary: "₹60K+/month freelancing",
      quote:
        "Maine purposely job nahi ki — directly Upwork aur Fiverr pe focus kiya. Sumit sir ka freelancing module itna detailed tha ki 4th month mein hi ₹20,000 ka project mila. Ab monthly ₹60,000+ earn kar raha hoon — job se zyada!",
      categories: ["fresher", "freelance"],
      tags: [
        {
          text: "No job, full freelance",
          cl: "bg-[#F5A623]/12 text-[#92400E]",
        },
        { text: "₹60K+/month", cl: "bg-[#16A34A]/10 text-[#15803d]" },
      ],
      before: "Freelance over job",
      after: "₹60,000+/month",
    },
    {
      avBg: "bg-[#1A3D8F]",
      initials: "NP",
      name: "Neha Pathak",
      role: "Business Analyst",
      company: "Cognizant, Bangalore",
      stars: "★★★★★",
      salary: "₹8.8 LPA",
      quote:
        "History graduate thi main. Sab log kehte the IT mein nahi ja sakti. Eklabya ne prove kar diya ki background matter nahi karti — dedication matter karti hai. Cognizant mein Business Analyst hoon ab.",
      categories: ["nonit", "placement"],
      tags: [
        { text: "History grad → IT", cl: "bg-[#FF5C00]/10 text-[#c94000]" },
        { text: "Proved everyone wrong", cl: "bg-[#16A34A]/10 text-[#15803d]" },
      ],
      before: "History Graduate",
      after: "Cognizant ₹8.8 LPA",
    },
    {
      avBg: "bg-[#0F766E]",
      initials: "MJ",
      name: "Manish Joshi",
      role: "Senior BI Developer",
      company: "Accenture, Hyderabad",
      stars: "★★★★★",
      salary: "₹13 LPA",
      quote:
        "5 saal se same role mein tha, growth band thi. Machine Learning seekha, ek ML project banaya jo meri company ne adopt kar liya. Phir Accenture ne approach kiya. ₹13 LPA offer mila — 70% hike!",
      categories: ["professional", "placement"],
      tags: [
        { text: "70% salary hike", cl: "bg-[#F5A623]/12 text-[#92400E]" },
        {
          text: "Accenture approached me",
          cl: "bg-[#16A34A]/10 text-[#15803d]",
        },
      ],
      before: "₹7.6 LPA, stagnant",
      after: "Accenture ₹13 LPA",
    },
    {
      avBg: "bg-[#7C3AED]",
      initials: "AK",
      name: "Arjun Kapoor",
      role: "Data Analyst",
      company: "Accenture, Delhi",
      stars: "★★★★★', salary: '₹7.8 LPA",
      quote:
        "Dropout tha 2nd year mein. Society ne bol diya career khatam hai. Eklabya join kiya, 6 months mein Accenture ne hire kar liya. Ab log mujhse poochte hain career advice! Sumit sir ne believe kiya mujh par.",
      categories: ["fresher", "placement"],
      tags: [
        { text: "College dropout", cl: "bg-[#FF5C00]/10 text-[#c94000]" },
        { text: "Accenture ₹7.8 LPA", cl: "bg-[#16A34A]/10 text-[#15803d]" },
      ],
      before: "College dropout",
      after: "Accenture ₹7.8 LPA",
    },
    {
      avBg: "bg-[#C2410C]",
      initials: "ST",
      name: "Shweta Tomar",
      role: "Data Consultant",
      company: "Independent, Delhi NCR",
      stars: "★★★★★",
      salary: "₹1.2L/month freelance",
      quote:
        "Teacher thi pehle. Eklabya ne data skills di aur Sumit sir ne freelancing strategy. Ab companies ko directly consult karti hun. ₹1.2 lakh monthly kama rahi hun — teacher salary se 4 guna zyada. Life completely changed.",
      categories: ["professional", "freelance"],
      tags: [
        {
          text: "Teacher → Data Consultant",
          cl: "bg-[#FF5C00]/10 text-[#c94000]",
        },
        { text: "4x income increase", cl: "bg-[#16A34A]/10 text-[#15803d]" },
      ],
      before: "School teacher",
      after: "₹1.2L/month consulting",
    },
    {
      avBg: "bg-[#1D4ED8]",
      initials: "RG",
      name: "Rohan Gupta",
      role: "Data Scientist",
      company: "Flipkart, Bangalore",
      stars: "★★★★★",
      salary: "₹14 LPA",
      quote:
        "Flipkart mein product data science team mein hun. Interview mein recommendation system project ka demo diya — Sumit sir ke saath banaya tha. Interviewer itna impressed hua ki offer letter usi din aaya.",
      categories: ["fresher", "placement"],
      tags: [
        { text: "Flipkart ₹14 LPA", cl: "bg-[#16A34A]/10 text-[#15803d]" },
        {
          text: "Project impressed interviewer",
          cl: "bg-[#F5A623]/12 text-[#92400E]",
        },
      ],
      before: "MBA fresher",
      after: "Flipkart ₹14 LPA",
    },
    {
      avBg: "bg-[#065F46]",
      initials: "DY",
      name: "Divya Yadav",
      role: "Data Scientist",
      company: "EY, Delhi",
      stars: "★★★★★",
      salary: "₹12 LPA",
      quote:
        "Commerce background se EY mein Data Scientist — sounds impossible? Sumit sir ne possible kiya. Statistics module itna strong tha ki EY ke analytics test mein 96% score kiya. Best coaching I've ever had.",
      categories: ["nonit", "placement"],
      tags: [
        { text: "Commerce → EY", cl: "bg-[#1A3D8F]/10 text-[#1A3D8F]" },
        { text: "96% in analytics test", cl: "bg-[#16A34A]/10 text-[#15803d]" },
      ],
      before: "Commerce Graduate",
      after: "EY ₹12 LPA",
    },
    {
      avBg: "bg-[#9D174D]",
      initials: "SS",
      name: "Sunita Singh",
      role: "Analytics Lead",
      company: "IBM, Pune",
      stars: "★★★★★",
      salary: "₹15 LPA",
      quote:
        "10 saal baad career restart ki thi — maternity break ke baad. Eklabya ne ek bhi baar feel nahi karaya ki main 'behind' hun. IBM mein Analytics Lead role mili. Sumit sir ki guidance life mein aai at the right time.",
      categories: ["professional", "placement"],
      tags: [
        { text: "10-yr maternity break", cl: "bg-[#FF5C00]/10 text-[#c94000]" },
        { text: "IBM Lead ₹15 LPA", cl: "bg-[#16A34A]/10 text-[#15803d]" },
      ],
      before: "10-yr career break",
      after: "IBM Lead ₹15 LPA",
    },
    {
      avBg: "bg-[#1A3D8F]",
      initials: "PK",
      name: "Piyush Kumar",
      role: "ML Freelancer",
      company: "Upwork Top Rated, Patna",
      stars: "★★★★★",
      salary: "$800–$2000/project",
      quote:
        "Cyberpunk block setup — international clients se kaam lena sikhaya. Ab dollar mein earn karta hun. $2000 ka project last month complete kiya. Small city, big income!",
      categories: ["fresher", "freelance"],
      tags: [
        { text: "Dollar earnings", cl: "bg-[#F5A623]/12 text-[#92400E]" },
        {
          text: "Small city, global clients",
          cl: "bg-[#16A34A]/10 text-[#15803d]",
        },
      ],
      before: "Patna, Bihar",
      after: "$800–$2000/project",
    },
    {
      avBg: "bg-[#854F0B]",
      initials: "AY",
      name: "Aakash Yadav",
      role: "BI Analyst",
      company: "Deloitte, Mumbai",
      stars: "★★★★★",
      salary: "₹10.5 LPA",
      quote:
        "Mechanical engineer tha — data science mein shift karna bohot risky lagta tha. But Deloitte mein BI Analyst hun ab. Power BI dashboards jo course mein banaye woh directly portfolio mein use kiye. Risk worth it tha!",
      categories: ["nonit", "placement"],
      tags: [
        { text: "Mechanical → Data", cl: "bg-[#FF5C00]/10 text-[#c94000]" },
        { text: "Career switch success", cl: "bg-[#16A34A]/10 text-[#15803d]" },
      ],
      before: "Mechanical Engineer",
      after: "Deloitte ₹10.5 LPA",
    },
    {
      avBg: "bg-[#0369A1]",
      initials: "VB",
      name: "Vikas Bajpai",
      role: "Data Analyst",
      company: "Wipro, Bangalore",
      stars: "★★★★★",
      salary: "₹9 LPA",
      quote:
        "BPO mein tha 4 saal se — repetitive kaam, no growth. Eklabya join kiya secretly. 6 months baad Wipro mein Data Analyst hoon. Family ko pata chala toh surprise mein surprise tha!",
      categories: ["professional", "placement"],
      tags: [
        { text: "BPO → Data Analyst", cl: "bg-[#FF5C00]/10 text-[#c94000]" },
        { text: "Secret transformation", cl: "bg-[#16A34A]/10 text-[#15803d]" },
      ],
      before: "BPO, 4 years stagnant",
      after: "Wipro ₹9 LPA",
    },
    {
      avBg: "bg-[#7C3AED]",
      initials: "TR",
      name: "Tanvi Rastogi",
      role: "Junior Data Scientist",
      company: "Tech Mahindra, Pune",
      stars: "★★★★★",
      salary: "₹8.2 LPA",
      quote:
        "College se seedha Tech Mahindra! Meri university ka highest package tha yeh. Course mein Deep Learning project banaya tha jo portfolio ka star piece ban gaya. Sumit sir ne ek ek concept heart se sikhaya.",
      categories: ["fresher", "placement"],
      tags: [
        {
          text: "Campus highest package",
          cl: "bg-[#16A34A]/10 text-[#15803d]",
        },
        {
          text: "DL project = portfolio star",
          cl: "bg-[#1A3D8F]/10 text-[#1A3D8F]",
        },
      ],
      before: "Final year student",
      after: "Tech Mahindra ₹8.2 LPA",
    },
    {
      avBg: "bg-[#B45309]",
      initials: "SC",
      name: "Sachin Chauhan",
      role: "Data Analytics Consultant",
      company: "Freelance, Jaipur",
      stars: "★★★★★",
      salary: "₹80K/month",
      quote:
        "Hotel management kiya tha — ajeeb lagta hai na? But hospitality data analytics mein niche banaya. Hotels ko data services de raha hun. Eklabya ka course aur Sumit sir ka niche selection guidance ne yeh possible kiya.",
      categories: ["nonit", "freelance"],
      tags: [
        {
          text: "Hotel Mgmt → Analytics",
          cl: "bg-[#FF5C00]/10 text-[#c94000]",
        },
        { text: "Unique niche built", cl: "bg-[#F5A623]/12 text-[#92400E]" },
      ],
      before: "Hotel Management",
      after: "₹80K/month consulting",
    },
    {
      avBg: "bg-[#0F6E56]",
      initials: "MN",
      name: "Mohit Negi",
      role: "ML Engineer",
      company: "Zomato, Gurugram",
      stars: "★★★★★",
      salary: "₹12.5 LPA",
      quote:
        "Zomato ki ML team mein hun — recommendation system aur demand forecasting pe kaam karta hun. Course mein exactly yahi projects banaye the! Sumit sir ka real-world focus industry-ready banata hai directly.",
      categories: ["fresher", "placement"],
      tags: [
        { text: "Zomato ML team", cl: "bg-[#16A34A]/10 text-[#15803d]" },
        {
          text: "Course projects = job projects",
          cl: "bg-[#F5A623]/12 text-[#92400E]",
        },
      ],
      before: "CS Graduate, no job",
      after: "Zomato ₹12.5 LPA",
    },
    {
      avBg: "bg-[#DC2626]",
      initials: "RP",
      name: "Ritu Pandey",
      role: "Analytics Manager",
      company: "KPMG, Noida",
      stars: "★★★★★",
      salary: "₹16 LPA",
      quote:
        "Manager level par tha already but skills outdated thi. Eklabya ne current tools sikha diye. KPMG ne Analytics Manager role ke liye approach kiya LinkedIn pe — directly from my updated profile. ₹16 LPA package.",
      categories: ["professional", "placement"],
      tags: [
        { text: "LinkedIn hire", cl: "bg-[#F5A623]/12 text-[#92400E]" },
        { text: "₹16 LPA manager role", cl: "bg-[#16A34A]/10 text-[#15803d]" },
      ],
      before: "Mid-level analyst",
      after: "KPMG Manager ₹16 LPA",
    },
    {
      avBg: "bg-[#1A3D8F]",
      initials: "AS",
      name: "Ankur Srivastava",
      role: "Data Scientist",
      company: "Paytm, Noida",
      stars: "★★★★★",
      salary: "₹13 LPA",
      quote:
        "Paytm mein fraud detection ML model pe kaam karta hun. Course mein banaye Scikit-learn classification projects directly apply ho rahe hain daily work mein. Sumit sir ki teaching style unique hai — woh interviewer ki tarah soochte hain.",
      categories: ["fresher", "freelance", "placement"],
      tags: [
        { text: "Paytm ₹13 LPA", cl: "bg-[#16A34A]/10 text-[#15803d]" },
        { text: "Fraud detection ML", cl: "bg-[#1A3D8F]/10 text-[#1A3D8F]" },
      ],
      before: "B.Tech fresher",
      after: "Paytm ₹13 LPA",
    },
    {
      avBg: "bg-[#9D174D]",
      initials: "KS",
      name: "Kavya Sharma",
      role: "Business Intelligence Analyst",
      company: "Myntra, Bangalore",
      stars: "★★★★★",
      salary: "₹11.5 LPA",
      quote:
        "Fashion designing se data analytics mein shift ki. Log hasate the! Ab Myntra ke BI team mein hoon — fashion industry data analyze karti hun. Sumit sir ne kaha tha 'your background is your superpower' — aur sach nikla.",
      categories: ["nonit", "placement"],
      tags: [
        {
          text: "Fashion Design → Myntra BI",
          cl: "bg-[#FF5C00]/10 text-[#c94000]",
        },
        {
          text: "Background = superpower",
          cl: "bg-[#F5A623]/12 text-[#92400E]",
        },
      ],
      before: "Fashion Designer",
      after: "Myntra BI ₹11.5 LPA",
    },
    {
      avBg: "bg-[#065F46]",
      initials: "GK",
      name: "Gaurav Khanna",
      role: "Data Analyst",
      company: "HDFC Bank, Mumbai",
      stars: "★★★★★",
      salary: "₹9.8 LPA",
      quote:
        "Banking background tha — Excel se kaam chal raha tha. Python aur SQL seekhne ke baad HDFC ne internal promotion de di. Phir salary hike bhi. Course fee toh 1st month ki hike mein hi wapas aa gayi!",
      categories: ["professional", "placement"],
      tags: [
        { text: "Internal promotion", cl: "bg-[#16A34A]/10 text-[#15803d]" },
        {
          text: "Course fee recovered month 1",
          cl: "bg-[#F5A623]/12 text-[#92400E]",
        },
      ],
      before: "HDFC analyst, stagnant",
      after: "Promoted ₹9.8 LPA",
    },
    {
      avBg: "bg-[#1D4ED8]",
      initials: "SP",
      name: "Shruti Pandya",
      role: "AI/ML Engineer",
      company: "Google Partner Agency, Delhi",
      stars: "★★★★★",
      salary: "₹10 LPA",
      quote:
        "GenAI aur prompt engineering module ne mujhe alag hi level pe le gaya. Google partner agency ne hire kiya specifically for AI product development. Sumit sir future-ready content padhate hain — 2024 ki skills 2025 mein kaam aayi!",
      categories: ["fresher", "placement"],
      tags: [
        { text: "GenAI specialist", cl: "bg-[#F5A623]/12 text-[#92400E]" },
        { text: "Google partner agency", cl: "bg-[#16A34A]/10 text-[#15803d]" },
      ],
      before: "Marketing fresher",
      after: "AI/ML Engineer ₹10 LPA",
    },
    {
      avBg: "bg-[#7C3AED]",
      initials: "AJ",
      name: "Ajay Jain",
      role: "Data Science Trainer + Freelancer",
      company: "Self-employed, Jaipur",
      stars: "★★★★★",
      salary: "₹1.5L/month",
      quote:
        "Course complete karne ke baad khud training dene laga hoon — aur Upwork pe bhi kaam karta hun. Sumit sir ne itni depth mein sikhaya ki ab main dusron ko sikhane ke liye confident hun. ₹1.5 lakh monthly earning.",
      categories: ["professional", "freelance"],
      tags: [
        { text: "Now training others", cl: "bg-[#F5A623]/12 text-[#92400E]" },
        { text: "₹1.5L/month", cl: "bg-[#16A34A]/10 text-[#15803d]" },
      ],
      before: "Sales job, ₹3.5 LPA",
      after: "₹1.5L/month self-employed",
    },
    {
      avBg: "bg-[#B45309]",
      initials: "HM",
      name: "Harsh Mehrotra",
      role: "Data Analyst",
      company: "Swiggy, Bangalore",
      stars: "★★★★★",
      salary: "₹11 LPA",
      quote:
        "Swiggy ke food analytics team mein hun — delivery time prediction model pe kaam karta hun. Yeh wahi project type hai jo Sumit sir ke saath course mein banaya tha. Literally seedha application mili course content ki!",
      categories: ["fresher", "placement"],
      tags: [
        { text: "Swiggy ₹11 LPA", cl: "bg-[#16A34A]/10 text-[#15803d]" },
        {
          text: "Course → direct job application",
          cl: "bg-[#1A3D8F]/10 text-[#1A3D8F]",
        },
      ],
      before: "Statistics grad, confused",
      after: "Swiggy ₹11 LPA",
    },
    {
      avBg: "bg-[#DC2626]",
      initials: "NS",
      name: "Neha Singh",
      role: "Business Analyst",
      company: "Cognizant, Noida",
      stars: "★★★★★",
      salary: "₹6.5 LPA",
      quote:
        "Geography Honours ke baad IT mein jana — nobody believed me. Eklabya ne woh bridge banaya. SQL aur Excel skills ne Cognizant ka door khola. Starting hai yeh — growth ka scope bohot bada hai yahan.",
      categories: ["nonit", "placement"],
      tags: [
        { text: "Geography → IT", cl: "bg-[#FF5C00]/10 text-[#c94000]" },
        { text: "Cognizant first step", cl: "bg-[#16A34A]/10 text-[#15803d]" },
      ],
      before: "Geography Honours",
      after: "Cognizant ₹6.5 LPA",
    },
    {
      avBg: "bg-[#0369A1]",
      initials: "NK",
      name: "Nilesh Kumar",
      role: "Data Science Lead",
      company: "PwC, Gurgaon",
      stars: "★★★★★",
      salary: "₹18 LPA",
      quote:
        "7 saal ka experience tha lekin modern tools nahi aate the. Eklabya ne 6 months mein Python, ML aur GenAI sab cover kara diya. PwC mein Lead role ke saath ₹18 LPA ka offer — career peak pe hun.",
      categories: ["professional", "placement"],
      tags: [
        { text: "7-yr exp + new skills", cl: "bg-[#F5A623]/12 text-[#92400E]" },
        { text: "PwC Lead ₹18 LPA", cl: "bg-[#16A34A]/10 text-[#15803d]" },
      ],
      before: "₹10 LPA, outdated skills",
      after: "PwC Lead ₹18 LPA",
    },
    {
      avBg: "bg-[#9D174D]",
      initials: "PD",
      name: "Preetam Das",
      role: "AI Content + Data Analyst",
      company: "Freelance, Kolkata",
      stars: "★★★★★",
      salary: "₹55K/month",
      quote:
        "Bengali medium se tha, English thodi weak thi. Eklabya mein Hindi mein samjhaya Sumit sir ne — koi problem nahi hua. GenAI tools sikhe aur content + data analytics combo services deta hun. ₹55K monthly kamata hun.",
      categories: ["fresher", "freelance"],
      tags: [
        { text: "Hindi medium learning", cl: "bg-[#1A3D8F]/10 text-[#1A3D8F]" },
        { text: "₹55K/month Kolkata", cl: "bg-[#16A34A]/10 text-[#15803d]" },
      ],
      before: "Bengali medium, confused",
      after: "₹55K/month freelancing",
    },
    {
      avBg: "bg-[#065F46]",
      initials: "AB",
      name: "Aman Bhatt",
      role: "Analytics Engineer",
      company: "Razorpay, Bangalore",
      stars: "★★★★★",
      salary: "₹14.5 LPA",
      quote:
        "Fintech mein career banana tha. Eklabya ke SQL + Python combo ne Razorpay ka door khola. Payment data analytics pe kaam karta hun ab. Course mein banaye financial dataset projects directly relevant nikle!",
      categories: ["professional", "placement"],
      tags: [
        { text: "Razorpay ₹14.5 LPA", cl: "bg-[#16A34A]/10 text-[#15803d]" },
        {
          text: "Fintech dream achieved",
          cl: "bg-[#F5A623]/12 text-[#92400E]",
        },
      ],
      before: "Software tester, ₹6 LPA",
      after: "Razorpay ₹14.5 LPA",
    },
    {
      avBg: "bg-[#1A3D8F]",
      initials: "ZA",
      name: "Zara Ahmed",
      role: "Data Analyst",
      company: "Microsoft India, Hyderabad",
      stars: "★★★★★",
      salary: "₹16 LPA",
      quote:
        "Microsoft mein hun — khwab tha, Eklabya ne haqeeqat banaya. Power BI aur Python skills ne Microsoft ka interview crack karaya. Sumit sir ne personally resume review kiya aur kuch changes suggest kiye — unhi changes ne result diya!",
      categories: ["fresher", "placement"],
      tags: [
        { text: "Microsoft ₹16 LPA", cl: "bg-[#16A34A]/10 text-[#15803d]" },
        {
          text: "Personal resume review",
          cl: "bg-[#F5A623]/12 text-[#92400E]",
        },
      ],
      before: "Engineering fresher",
      after: "Microsoft ₹16 LPA",
    },
    {
      avBg: "bg-[#C2410C]",
      initials: "MR",
      name: "Mayank Rawat",
      role: "Healthcare Data Analyst",
      company: "Apollo Hospitals, Delhi",
      stars: "★★★★★",
      salary: "₹8.5 LPA",
      quote:
        "Pharmacist tha — medical field mein hi rehna tha. Healthcare analytics mein niche banaya. Apollo Hospitals mein patient data analytics karta hun. Sumit sir ne domain-specific use cases sikhaye jo directly kaam aayi.",
      categories: ["nonit", "professional", "placement"],
      tags: [
        {
          text: "Pharmacist → Healthcare Data",
          cl: "bg-[#FF5C00]/10 text-[#c94000]",
        },
        { text: "Domain-specific niche", cl: "bg-[#F5A623]/12 text-[#92400E]" },
      ],
      before: "Pharmacist",
      after: "Apollo ₹8.5 LPA",
    },
    {
      avBg: "bg-[#7C3AED]",
      initials: "LK",
      name: "Lokesh Kumar",
      role: "Data Scientist",
      company: "Naukri.com, Noida",
      stars: "★★★★★",
      salary: "₹10.5 LPA",
      quote:
        "Job search kar raha tha Naukri pe aur unhone hi hire kar liya! NLP project jo course mein banaya tha — job matching algorithm similar hai. Interview mein yeh bola toh sab hanse. Aur hire kar liya!",
      categories: ["fresher", "placement"],
      tags: [
        {
          text: "Hired by Naukri.com itself!",
          cl: "bg-[#F5A623]/12 text-[#92400E]",
        },
        {
          text: "NLP project = interview win",
          cl: "bg-[#16A34A]/10 text-[#15803d]",
        },
      ],
      before: "Searching on Naukri",
      after: "Hired BY Naukri ₹10.5 LPA",
    },
    {
      avBg: "bg-[#0F766E]",
      initials: "TR",
      name: "Tanya Rao",
      role: "ML Research Analyst",
      company: "ICICI Bank, Mumbai",
      stars: "★★★★★",
      salary: "₹12 LPA",
      quote:
        "Banking mein credit risk analytics karna tha. Sumit sir ke ML course ne woh exact skills di. ICICI Bank mein credit model development pe kaam karti hun. Course investment pe ROI bohot high hai!",
      categories: ["professional", "placement"],
      tags: [
        { text: "ICICI Bank ML", cl: "bg-[#16A34A]/10 text-[#15803d]" },
        {
          text: "Credit risk specialization",
          cl: "bg-[#1A3D8F]/10 text-[#1A3D8F]",
        },
      ],
      before: "Bank executive ₹4.5 LPA",
      after: "ICICI ML Analyst ₹12 LPA",
    },
    {
      avBg: "bg-[#854F0B]",
      initials: "RB2",
      name: "Rohit Bajpai",
      role: "AI Tools Consultant",
      company: "Freelance, Kanpur",
      stars: "★★★★★",
      salary: "₹70K/month",
      quote:
        "GenAI module ke baad SMEs ko AI tools implementation consult karta hun. ChatGPT integrations, automation workflows — sab Sumit sir ne practically sikhaya. Kanpur jaisi city se ₹70K monthly — parents shocked hain (khushi mein)!",
      categories: ["fresher", "freelance"],
      tags: [
        { text: "AI tools consultant", cl: "bg-[#F5A623]/12 text-[#92400E]" },
        { text: "₹70K/month Kanpur", cl: "bg-[#16A34A]/10 text-[#15803d]" },
      ],
      before: "Shop assistant",
      after: "AI Consultant ₹70K/month",
    },
    {
      avBg: "bg-[#1D4ED8]",
      initials: "SM",
      name: "Sonal Mishra",
      role: "Data Analyst",
      company: "Bajaj Finance, Pune",
      stars: "★★★★★",
      salary: "₹8 LPA",
      quote:
        "CA dropout thi — accounts se bhaag ke data science mein aayi! Funny lagta hai but Bajaj Finance mein financial data analytics karna aur CA knowledge bhi kaam aati hai. Best of both worlds!",
      categories: ["nonit", "placement"],
      tags: [
        {
          text: "CA dropout → Data Analyst",
          cl: "bg-[#FF5C00]/10 text-[#c94000]",
        },
        {
          text: "Both skills used daily",
          cl: "bg-[#16A34A]/10 text-[#15803d]",
        },
      ],
      before: "CA dropout",
      after: "Bajaj Finance ₹8 LPA",
    },
    {
      avBg: "bg-[#9D174D]",
      initials: "VP",
      name: "Vikram Patel",
      role: "Senior Data Scientist",
      company: "Mahindra, Mumbai",
      stars: "★★★★★",
      salary: "₹17 LPA",
      quote:
        "Automobile industry mein tha, data analytics sikhna tha for IoT data. Eklabya ne Python + ML combination se IoT data analysis possible kar diya. Mahindra mein connected vehicle analytics pe kaam karta hun ab. Unique profile bani!",
      categories: ["professional", "placement"],
      tags: [
        { text: "IoT + Data Science", cl: "bg-[#F5A623]/12 text-[#92400E]" },
        { text: "Mahindra ₹17 LPA", cl: "bg-[#16A34A]/10 text-[#15803d]" },
      ],
      before: "Automobile engineer",
      after: "Mahindra ₹17 LPA",
    },
    {
      avBg: "bg-[#065F46]",
      initials: "VK",
      name: "Vaibhav Keshari",
      role: "Junior Data Scientist",
      company: "Ola Electric, Bangalore",
      stars: "★★★★★",
      salary: "₹9.5 LPA",
      quote:
        "EV space mein job chahiye thi. Ola Electric mein EV battery analytics pe kaam karta hun. Course mein time-series forecasting project specifically battery life prediction pe banaya tha — Sumit sir ka foresight amazing hai!",
      categories: ["fresher", "placement"],
      tags: [
        { text: "Ola Electric ₹9.5 LPA", cl: "bg-[#16A34A]/10 text-[#15803d]" },
        {
          text: "EV + data = rare combo",
          cl: "bg-[#1A3D8F]/10 text-[#1A3D8F]",
        },
      ],
      before: "EEE graduate, no job",
      after: "Ola Electric ₹9.5 LPA",
    },
    {
      avBg: "bg-[#B45309]",
      initials: "PV",
      name: "Pallavi Verma",
      role: "Social Media Data Analyst",
      company: "Freelance + Agency, Mumbai",
      stars: "★★★★★",
      salary: "₹65K/month",
      quote:
        "Influencer marketing mein thi — data samajh nahi aata tha. Eklabya ke baad social media analytics specialist bani. Agencies ko influencer ROI data analysis services deti hun. ₹65K monthly easily earn kar rahi hun.",
      categories: ["nonit", "freelance"],
      tags: [
        {
          text: "Influencer → Data Analyst",
          cl: "bg-[#FF5C00]/10 text-[#c94000]",
        },
        {
          text: "Unique niche: social analytics",
          cl: "bg-[#F5A623]/12 text-[#92400E]",
        },
      ],
      before: "Influencer marketer",
      after: "₹65K/month analytics",
    },
    {
      avBg: "bg-[#1A3D8F]",
      initials: "AV",
      name: "Abhishek Varma",
      role: "Data Engineer",
      company: "Infosys BPM, Pune",
      stars: "★★★★★",
      salary: "₹10.2 LPA",
      quote:
        "BPO mein team leader tha — raat ki shift, koi future nahi dikha. Eklabya join kiya. 7 months mein Infosys BPM mein Data Engineer hoon. Day shift, AC office, double salary. Sumit sir ne literally zindagi badal di.",
      categories: ["professional", "placement"],
      tags: [
        {
          text: "Night shift BPO → Day shift IT",
          cl: "bg-[#FF5C00]/10 text-[#c94000]",
        },
        { text: "Double salary", cl: "bg-[#16A34A]/10 text-[#15803d]" },
      ],
      before: "BPO night shift",
      after: "Infosys ₹10.2 LPA",
    },
    {
      avBg: "bg-[#7C3AED]",
      initials: "SK",
      name: "Siddharth Kumar",
      role: "AI Engineer",
      company: "Byju's, Bangalore",
      stars: "★★★★★",
      salary: "₹10 LPA",
      quote:
        "Ed-tech mein AI apply karna fascinating lagta tha. Byju's mein content personalization algorithm pe kaam karta hun. Course mein Sumit sir ne exactly yahi type ke recommendation system banwaye the. Perfect alignment!",
      categories: ["fresher", "placement"],
      tags: [
        { text: "EdTech AI engineer", cl: "bg-[#16A34A]/10 text-[#15803d]" },
        {
          text: "Course = direct job match",
          cl: "bg-[#1A3D8F]/10 text-[#1A3D8F]",
        },
      ],
      before: "BCA fresher",
      after: "Byju's AI ₹10 LPA",
    },
    {
      avBg: "bg-[#DC2626]",
      initials: "PG",
      name: "Priya Gupta",
      role: "Retail Analytics Manager",
      company: "Reliance Retail, Mumbai",
      stars: "★★★★★",
      salary: "₹13.5 LPA",
      quote:
        "Retail management background se analytics mein aayi. Reliance Retail mein customer behaviour analytics karna — meri retail experience aur data science skills ka perfect combo. Sumit sir ne kaha tha domain + data = gold!",
      categories: ["nonit", "professional", "placement"],
      tags: [
        { text: "Retail + Data = Gold", cl: "bg-[#F5A623]/12 text-[#92400E]" },
        { text: "Reliance ₹13.5 LPA", cl: "bg-[#16A34A]/10 text-[#15803d]" },
      ],
      before: "Retail Manager",
      after: "Reliance Retail ₹13.5 LPA",
    },
    {
      avBg: "bg-[#0369A1]",
      initials: "RM",
      name: "Rahul Mishra",
      role: "Data + No-Code Consultant",
      company: "Freelance, Bhopal",
      stars: "★★★★★",
      salary: "₹50K/month",
      quote:
        "Bhopal se hun — job market limited. Sumit sir ne sikhaya ki geographic limitation aab exist nahi karti digital world mein. No-code AI tools + data analytics combo se local businesses ko serve karta hun. ₹50K monthly Bhopal mein = bahut achha life!",
      categories: ["fresher", "freelance"],
      tags: [
        { text: "Tier-2 city success", cl: "bg-[#1A3D8F]/10 text-[#1A3D8F]" },
        { text: "₹50K/month Bhopal", cl: "bg-[#16A34A]/10 text-[#15803d]" },
      ],
      before: "Unemployed, Bhopal",
      after: "₹50K/month, same city",
    },
    {
      avBg: "bg-[#0F766E]",
      initials: "NC",
      name: "Nitin Chandra",
      role: "Supply Chain Data Analyst",
      company: "Hindustan Unilever, Mumbai",
      stars: "★★★★★",
      salary: "₹11.8 LPA",
      quote:
        "Supply chain mein tha — data se kaafi kaam tha par analysis skills nahi thi. Python + SQL ne HUL mein analytics role dilaya. Demand forecasting aur inventory optimization — Sumit sir ke projects se direct connection hai!",
      categories: ["professional", "placement"],
      tags: [
        {
          text: "Supply chain + analytics",
          cl: "bg-[#F5A623]/12 text-[#92400E]",
        },
        { text: "HUL ₹11.8 LPA", cl: "bg-[#16A34A]/10 text-[#15803d]" },
      ],
      before: "Supply chain exec",
      after: "HUL Analytics ₹11.8 LPA",
    },
    {
      avBg: "bg-[#9D174D]",
      initials: "IK",
      name: "Ishaan Kapoor",
      role: "ML Ops Engineer",
      company: "NVIDIA Partner, Pune",
      stars: "★★★★★",
      salary: "₹15 LPA",
      quote:
        "NVIDIA partner company mein GPU computing aur ML deployment pe kaam karta hun. Course mein Sumit sir ne model deployment bhi sikhaya — woh hissa rare hai in most courses. Us knowledge ne ₹15 LPA offer dilaya!",
      categories: ["fresher", "placement"],
      tags: [
        {
          text: "ML deployment knowledge",
          cl: "bg-[#F5A623]/12 text-[#92400E]",
        },
        { text: "₹15 LPA rare role", cl: "bg-[#16A34A]/10 text-[#15803d]" },
      ],
      before: "CS grad, entry level",
      after: "NVIDIA partner ₹15 LPA",
    },
    {
      avBg: "bg-[#B45309]",
      initials: "JT",
      name: "Jayesh Thakur",
      role: "HR Analytics Specialist",
      company: "Tata Motors, Pune",
      stars: "★★★★★",
      salary: "₹9 LPA",
      quote:
        "HR mein tha — people analytics bolte the but excel se aage nahi badhta tha. Python sikhke HR analytics specialist bana. Tata Motors mein workforce attrition model banaya hai jo HR team use karti hai. Proud moment!",
      categories: ["nonit", "placement"],
      tags: [
        { text: "HR → HR Analytics", cl: "bg-[#FF5C00]/10 text-[#c94000]" },
        { text: "Tata Motors ₹9 LPA", cl: "bg-[#16A34A]/10 text-[#15803d]" },
      ],
      before: "HR Executive, ₹4 LPA",
      after: "Tata Motors ₹9 LPA",
    },
    {
      avBg: "bg-[#1D4ED8]",
      initials: "HB",
      name: "Harsh Bhatia",
      role: "Data Scientist",
      company: "OYO Rooms, Gurgaon",
      stars: "★★★★★",
      salary: "₹11.5 LPA",
      quote:
        "Travel industry pasand thi isliye OYO target kiya. Dynamic pricing model pe interview diya — wahi type ka project Sumit sir ke saath banaya tha! OYO ne ₹11.5 LPA pe hire kiya. Targeted approach works!",
      categories: ["fresher", "placement"],
      tags: [
        {
          text: "Targeted company strategy",
          cl: "bg-[#F5A623]/12 text-[#92400E]",
        },
        { text: "OYO ₹11.5 LPA", cl: "bg-[#16A34A]/10 text-[#15803d]" },
      ],
      before: "Tourism grad",
      after: "OYO Data Scientist ₹11.5 LPA",
    },
    {
      avBg: "bg-[#065F46]",
      initials: "SD",
      name: "Sneha Dubey",
      role: "AI Product Manager",
      company: "Startupblind, Bangalore",
      stars: "★★★★★",
      salary: "₹20 LPA",
      quote:
        "PM thi already but AI nahi aata tha. Eklabya ke baad AI Product Manager bani — ₹20 LPA. Sumit sir ki GenAI module ne ek naya career path open kiya. AI PM ki demand 2025 mein ekdum rocket pe hai!",
      categories: ["professional", "freelance", "placement"],
      tags: [
        { text: "PM → AI PM", cl: "bg-[#F5A623]/12 text-[#92400E]" },
        {
          text: "₹20 LPA highest in list!",
          cl: "bg-[#16A34A]/10 text-[#15803d]",
        },
      ],
      before: "Product Manager ₹11 LPA",
      after: "AI PM ₹20 LPA",
    },
    {
      avBg: "bg-[#1A3D8F]",
      initials: "RV",
      name: "Rohit Verma",
      role: "ML Engineer",
      company: "Tech Mahindra, Pune",
      stars: "★★★★★",
      salary: "₹9.2 LPA",
      quote:
        "Diploma holder tha — degree nahi thi. Sab reject karte the resume dekh ke. Eklabya ka portfolio aur Sumit sir ki mock interview prep ne Tech Mahindra ka door khola. Skills matter more than degrees — proven!",
      categories: ["fresher", "placement"],
      tags: [
        { text: "Diploma, no degree", cl: "bg-[#FF5C00]/10 text-[#c94000]" },
        {
          text: "Skills > Degree proven!",
          cl: "bg-[#16A34A]/10 text-[#15803d]",
        },
      ],
      before: "Diploma, rejected everywhere",
      after: "Tech Mahindra ₹9.2 LPA",
    },
  ];

  // Helper method to look if activeFilter matches
  const shouldShowCard = (categoriesArray) => {
    if (activeFilter === "all") return true;
    return categoriesArray.includes(activeFilter);
  };

  return (
    <div className="font-['Inter',sans-serif] text-[#1E293B] bg-[#F4F7FF] min-h-screen scroll-smooth w-full overflow-x-hidden">
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
              🎓 Connect with Alumni
            </div>
            <div className="font-['Syne',sans-serif] text-[12px] md:text-[20px] font-extrabold text-white mb-1">
              Talk to Our Learners
            </div>
            <div className="text-[12px] text-white/65 leading-snug">
              Get connected with alumni who can share their real experience and
              career journey
            </div>
          </div>
          <div className="p-2 md:p-7">
            <div className="bg-[#FFF7ED] border border-[#FED7AA] rounded-lg py-2.5 px-3.5 mb-4 text-center">
              <p className="text-[12px] text-[#C2410C] font-semibold">
                💬 Get authentic insights from real students who transformed
                their careers
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
              {isSubmitting ? "Submitting..." : "Connect Me with Alumni �"}
            </button>
            <a
              href="https://wa.me/919891030303?text=Hi%2C%20I%20want%20to%20connect%20with%20alumni%20to%20know%20more%20about%20the%20Data%20Science%20course%20experience."
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-[#25D366] text-white border-none rounded-xl py-3 text-[14px] font-semibold cursor-pointer flex items-center justify-center gap-2 decoration-transparent hover:opacity-90 transition-opacity"
            >
              <svg width="17" height="17" fill="#fff" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.558 4.118 1.528 5.843L.057 23.569a.75.75 0 0 0 .921.916l5.85-1.53A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.959 0-3.81-.534-5.4-1.464l-.388-.228-4.029 1.054 1.07-3.912-.252-.402A9.944 9.944 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
              </svg>
              WhatsApp to Connect
            </a>
          </div>
        </div>
      </div>

      {/* STICKY NAV BAR */}
      <nav className="fixed top-0 left-0 right-0 z-[999] bg-[#0B1C3F]/97 backdrop-blur-[8px] flex items-center justify-between px-4 sm:px-8 py-3 shadow-[0_2px_20px_rgba(0,0,0,0.25)]">
        <div className="font-['Syne',sans-serif] text-[18px] font-extrabold text-white">
          <img
            src="https://www.eklabya.com/api/upload/file/eKlabya-fit-logo-8874.png"
            alt="Logo"
            className="h-[30px] rounded-lg"
          />
        </div>
        <div className="flex items-center gap-2.5">
          <a
            href="https://wa.me/919891030303?text=Hi%20Sumit%20sir%2C%20I%20want%20to%20know%20more%20about%20the%20Data%20Science%20course"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 bg-[#25D366] text-white rounded-[8px] py-2 px-3.5 text-[13px] font-semibold tracking-[0.2px] shadow-sm transition-opacity hover:opacity-90 hidden md:block"
          >
            <svg width="14" height="14" fill="#fff" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.558 4.118 1.528 5.843L.057 23.569a.75.75 0 0 0 .921.916l5.85-1.53A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.959 0-3.81-.534-5.4-1.464l-.388-.228-4.029 1.054 1.07-3.912-.252-.402A9.944 9.944 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
            </svg>
            +91 98910 30303
          </a>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-[#FF5C00] text-white font-bold py-2 px-2 rounded-[8px] text-[11px] shadow-sm transition-opacity hover:opacity-95 cursor-pointer border-none"
          >
            Connect with Alumni →
          </button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="bg-gradient-to-br from-[#0B1C3F] via-[#1A3D8F] to-[#0B1C3F] pt-[110px] pb-14 px-3 md:px-6 text-center">
        <div className="inline-block bg-[#FF5C00]/18 border border-[#FF5C00]/40 text-[#FF8C42] rounded-[50px] py-1 px-4 text-[11px] font-bold uppercase tracking-[0.5px] mb-4.5">
          🌟 Verified student reviews
        </div>
        <h1 className="font-['Syne',sans-serif] text-[28px] sm:text-[42px] lg:text-[56px] font-extrabold text-white leading-[1.1] tracking-[-1px] mb-3.5">
          Real Students.
          <br />
          <span className="text-[#FF8C42] italic not-style">Real Results.</span>
          <br />
          Real Money.
        </h1>
        <p className="text-[16px] text-white/70 max-w-[560px] mx-auto mb-9 leading-[1.65]">
          510+ students trained by Sumit Choudhary — from zero experience to top
          companies, many earning through freelancing too.
        </p>

        {/* METRICS ROW */}
        <div className="inline-flex gap-y-4 bg-white/5 border border-white/12 rounded-[14px] py-5 px-9 flex-wrap justify-center max-w-full">
          <div className="text-center px-6 sm:border-r border-solid border-white/12">
            <div className="font-['Syne',sans-serif] text-[26px] font-extrabold text-[#F5A623]">
              510+
            </div>
            <div className="text-[10px] color-white/50 text-white/50 mt-0.5 uppercase tracking-[0.5px]">
              Learners trained
            </div>
          </div>
          <div className="text-center px-6 sm:border-r border-solid border-white/12">
            <div className="font-['Syne',sans-serif] text-[26px] font-extrabold text-[#F5A623]">
              4.8★
            </div>
            <div className="text-[10px] color-white/50 text-white/50 mt-0.5 uppercase tracking-[0.5px]">
              Avg rating
            </div>
          </div>
          <div className="text-center px-6 sm:border-r border-solid border-white/12">
            <div className="font-['Syne',sans-serif] text-[26px] font-extrabold text-[#F5A623]">
              ₹8–15 LPA
            </div>
            <div className="text-[10px] color-white/50 text-white/50 mt-0.5 uppercase tracking-[0.5px]">
              Avg package
            </div>
          </div>
          <div className="text-center px-6">
            <div className="font-['Syne',sans-serif] text-[26px] font-extrabold text-[#F5A623]">
              100%
            </div>
            <div className="text-[10px] color-white/50 text-white/50 mt-0.5 uppercase tracking-[0.5px]">
              Placement support
            </div>
          </div>
        </div>
      </section>

      {/* REACT DYNAMIC STICKY FILTER BAR */}
      <div className="bg-white border-b border-solid border-[#E8EEF8] padding py-4 px-3 md:px-6 flex gap-2 flex-wrap justify-center sticky top-[58px] z-[99]">
        <button
          className={`font-semibold text-[12px] rounded-[20px] py-1.5 px-4 border transition-colors cursor-pointer ${activeFilter === "all" ? "bg-[#0B1C3F] text-white border-[#0B1C3F]" : "bg-[#F4F7FF] text-[#64748B] border-[#E8EEF8] hover:bg-[#0B1C3F] hover:text-white"}`}
          onClick={() => setActiveFilter("all")}
        >
          All Reviews (50+)
        </button>
        <button
          className={`font-semibold text-[12px] rounded-[20px] py-1.5 px-4 border transition-colors cursor-pointer ${activeFilter === "fresher" ? "bg-[#0B1C3F] text-white border-[#0B1C3F]" : "bg-[#F4F7FF] text-[#64748B] border-[#E8EEF8] hover:bg-[#0B1C3F] hover:text-white"}`}
          onClick={() => setActiveFilter("fresher")}
        >
          Freshers
        </button>
        <button
          className={`font-semibold text-[12px] rounded-[20px] py-1.5 px-4 border transition-colors cursor-pointer ${activeFilter === "professional" ? "bg-[#0B1C3F] text-white border-[#0B1C3F]" : "bg-[#F4F7FF] text-[#64748B] border-[#E8EEF8] hover:bg-[#0B1C3F] hover:text-white"}`}
          onClick={() => setActiveFilter("professional")}
        >
          Working Professionals
        </button>
        <button
          className={`font-semibold text-[12px] rounded-[20px] py-1.5 px-4 border transition-colors cursor-pointer ${activeFilter === "nonit" ? "bg-[#0B1C3F] text-white border-[#0B1C3F]" : "bg-[#F4F7FF] text-[#64748B] border-[#E8EEF8] hover:bg-[#0B1C3F] hover:text-white"}`}
          onClick={() => setActiveFilter("nonit")}
        >
          Non-IT Background
        </button>
        <button
          className={`font-semibold text-[12px] rounded-[20px] py-1.5 px-4 border transition-colors cursor-pointer ${activeFilter === "freelance" ? "bg-[#0B1C3F] text-white border-[#0B1C3F]" : "bg-[#F4F7FF] text-[#64748B] border-[#E8EEF8] hover:bg-[#0B1C3F] hover:text-white"}`}
          onClick={() => setActiveFilter("freelance")}
        >
          Freelancers
        </button>
        <button
          className={`font-semibold text-[12px] rounded-[20px] py-1.5 px-4 border transition-colors cursor-pointer ${activeFilter === "placement" ? "bg-[#0B1C3F] text-white border-[#0B1C3F]" : "bg-[#F4F7FF] text-[#64748B] border-[#E8EEF8] hover:bg-[#0B1C3F] hover:text-white"}`}
          onClick={() => setActiveFilter("placement")}
        >
          Top Companies
        </button>
      </div>

      {/* CORE WRAPPER CONTENT */}
      <main className="max-w-[1100px] mx-auto px-3 md:px-6 pb-20 pt-2">
        {/* SECTION 1: FEATURED CARDS */}
        <div className="font-['Syne',sans-serif] text-[22px] font-extrabold text-[#0B1C3F] mt-10 mb-5 flex items-center gap-2.5 after:content-[''] after:flex-1 after:h-[1px] after:bg-[#E8EEF8]">
          ⭐ Featured Success Stories
        </div>

        <div className="flex flex-col gap-5">
          {featuredStories.map((story, i) => {
            // Render only if categories contains current selected state filter value
            if (!shouldShowCard(story.categories)) return null;

            return (
              <div
                key={i}
                className="bg-white rounded-[16px] border border-solid border-[#E8EEF8] overflow-hidden grid grid-cols-1 md:grid-cols-[200px_1fr] transition-all hover:shadow-[0_8px_32px_rgba(11,28,63,0.1)]"
              >
                <div
                  className={`${story.sidebarBg} flex flex-col items-center justify-center p-3 md:p-5 gap-3`}
                >
                  <div
                    className={`${story.avatarBg} w-16 h-16 rounded-full text-white text-[20px] font-extrabold flex items-center justify-center shrink-0`}
                  >
                    {story.initials}
                  </div>
                  <div className="text-[14px] font-bold text-white text-center">
                    {story.name}
                  </div>
                  <div className="text-[11px] text-white/55 text-center mt-px">
                    {story.role}
                  </div>
                  <div
                    className={`text-[11px] font-semibold text-center mt-0.5 ${story.companyColor}`}
                  >
                    {story.company}
                  </div>
                  <div className="bg-[#16A34A]/25 text-[#4ADE80] rounded-[5px] py-1 px-2.5 text-[10px] font-bold mt-1.5">
                    {story.salary}
                  </div>
                  <div className="text-[#F5A623] text-[13px] mt-1 tracking-[1px]">
                    {story.stars}
                  </div>
                </div>

                <div className="p-3 md:p-8 md:border-l border-solid border-[#E8EEF8]">
                  <div className="flex gap-2 flex-wrap mb-3.5">
                    {story.tags.map((tag, tIdx) => (
                      <span
                        key={tIdx}
                        className={`rounded-[4px] py-1 px-2.5 text-[10px] font-semibold ${tag.className}`}
                      >
                        {tag.text}
                      </span>
                    ))}
                  </div>
                  <div className="text-[14px] text-[#1A1A1A] leading-[1.85] italic pl-3.5 border-l-3 border-solid border-[#FF5C00] mb-4.5">
                    "{story.quote}"
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-solid border-[#E8EEF8] pt-3.5">
                    {story.outcomes.map((out, oIdx) => (
                      <div key={oIdx}>
                        <div className="text-[9px] text-[#64748B] uppercase tracking-[0.5px] mb-0.5">
                          {out.label}
                        </div>
                        <div
                          className={`text-[12px] font-semibold ${out.valClass}`}
                        >
                          {out.value}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* SECTION 2: GRID OF REVIEWS (7-50) */}
        <div className="font-['Syne',sans-serif] text-[22px] font-extrabold text-[#0B1C3F] mt-10 mb-5 flex items-center gap-2.5 after:content-[''] after:flex-1 after:h-[1px] after:bg-[#E8EEF8]">
          💬 More Student Reviews
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {gridTestimonials.map((card, idx) => {
            if (!shouldShowCard(card.categories)) return null;

            return (
              <div
                key={idx}
                className="bg-white rounded-[16px] border border-solid border-[#E8EEF8] overflow-hidden flex flex-col transition-all hover:shadow-[0_8px_32px_rgba(11,28,63,0.1)] hover:-translate-y-0.5"
              >
                <div className="p-5 flex gap-3.5 items-start">
                  <div
                    className={`${card.avBg} w-[50px] h-[50px] rounded-full flex items-center justify-center text-[16px] font-extrabold text-white shrink-0`}
                  >
                    {card.initials}
                  </div>
                  <div>
                    <div className="text-[15px] font-bold text-[#0B1C3F] mb-0.5">
                      {card.name}
                    </div>
                    <div className="text-[12px] text-[#64748B]">
                      {card.role}
                    </div>
                    <div className="text-[12px] font-semibold text-[#1A3D8F] mt-px">
                      {card.company}
                    </div>
                    <div className="text-[#F5A623] text-[12px] mt-0.5 tracking-[1px]">
                      {card.stars}
                    </div>
                    <div className="inline-block bg-[#16A34A]/10 text-[#15803d] rounded-[4px] py-0.5 px-2 text-[10px] font-bold mt-1">
                      {card.salary}
                    </div>
                  </div>
                </div>

                <div className="px-5 pb-5 flex-1 flex flex-col gap-3">
                  <div className="text-[13px] text-[#1E293B] leading-[1.75] italic pl-3 border-l-2 border-solid border-[#FF5C00]">
                    "{card.quote}"
                  </div>
                  <div className="flex gap-1.5 flex-wrap">
                    {card.tags.map((t, tI) => (
                      <span
                        key={tI}
                        className={`rounded-[4px] py-1 px-2.5 text-[10px] font-semibold ${t.cl}`}
                      >
                        {t.text}
                      </span>
                    ))}
                  </div>
                  <div className="bg-[#F4F7FF] rounded-[8px] p-2.5 grid grid-cols-2 gap-2 mt-auto">
                    <div>
                      <div className="text-[9px] text-[#64748B] uppercase tracking-[0.5px] mb-0.5">
                        Before
                      </div>
                      <div className="text-[12px] font-semibold text-[#1E293B]">
                        {card.before}
                      </div>
                    </div>
                    <div>
                      <div className="text-[9px] text-[#64748B] uppercase tracking-[0.5px] mb-0.5">
                        After
                      </div>
                      <div className="text-[12px] font-semibold text-[#15803d]">
                        {card.after}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* CTA BOTTOM REGISTRATION SECT */}
        <div className="bg-gradient-to-br from-[#FF5C00] to-[#c94000] rounded-[20px] p-12 sm:p-10 text-center mt-12">
          <h2 className="font-['Syne',sans-serif] text-[24px] sm:text-[36px] font-bold text-white mb-2.5">
            Be our next success story 🚀
          </h2>
          <p className="text-[16px] text-white/85 mb-6 max-w-full">
            December 2026 batch — limited seats. Join 510+ students who
            transformed their careers with Sumit Choudhary.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <button
              onClick={() => setIsModalOpen(true)}
              className="bg-white text-[#FF5C00] rounded-[12px] py-3.5 px-7 text-[15px] font-extrabold no-underline inline-block transition-transform active:scale-95 shadow-sm cursor-pointer border-none"
            >
              Connect with Alumni — Free
            </button>
            <a
              href="https://wa.me/919891030303?text=Hi%2C%20I%20read%20the%20testimonials%20and%20want%20to%20connect%20with%20alumni%20to%20know%20more."
              target="_blank"
              rel="noopener noreferrer"
              className="bg-[#25D366] text-white rounded-[12px] py-3.5 px-6 text-[14px] font-bold no-underline inline-flex items-center gap-2 shadow-sm transition-transform active:scale-95"
            >
              <svg width="17" height="17" fill="#fff" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.558 4.118 1.528 5.843L.057 23.569a.75.75 0 0 0 .921.916l5.85-1.53A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.959 0-3.81-.534-5.4-1.464l-.388-.228-4.029 1.054 1.07-3.912-.252-.402A9.944 9.944 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
              </svg>
              WhatsApp for Alumni Connect
            </a>
          </div>
        </div>
      </main>

      {/* FOOTER BLOCK */}
      <footer className="bg-[#0B1C3F] py-7 px-6 text-center">
        <p className="color-white/40 text-[13px] text-white/40">
          © 2025 Eklabya Centre of Excellence, Noida &nbsp;|&nbsp; Taught by
          Sumit Choudhary &nbsp;|&nbsp; +91 98910 30303
        </p>
      </footer>
    </div>
  );
};

export default EklabyaTestimonials;
