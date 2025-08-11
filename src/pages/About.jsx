import React from "react";
import { Link } from "react-router-dom";
import SEO from "../components/SEO";
import { FaBookOpen, FaGraduationCap, FaUsers, FaAward } from "react-icons/fa";

export default function About() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <SEO 
        title="About Us | FirstVITE - Empowering Minds Through Education"
        description="Learn about FirstVITE's mission to provide accessible, high-quality education. Discover our story, values, and the team behind our innovative e-learning platform."
        keywords="about FirstVITE, e-learning platform, online education, learn online, FirstVITE mission, education technology, online courses, professional development"
        og={{
          title: 'About FirstVITE - Empowering Learners Worldwide',
          description: 'Discover how FirstVITE is transforming education through accessible, high-quality online learning experiences for students everywhere.',
          type: 'website'
        }}
      />
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            About Us – FirstVITE
          </h1>
          <p className="text-xl md:text-2xl max-w-3xl mx-auto">
            Empowering minds through knowledge and learning resources
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-black dark:text-white mb-4">
              Empowering Learners. Shaping Futures.
            </h2>
            <div className="w-20 h-1 bg-blue-600 mx-auto mb-8"></div>
            <p className="text-lg text-black dark:text-white max-w-4xl mx-auto">
              We believe that education should be accessible, practical, and
              aligned with real-world needs. As a leading e-learning platform,
              we offer high-quality certification programs, degree courses, and
              career development tools — designed for students, graduates, and
              working professionals seeking to stay competitive in today’s
              fast-changing world.
            </p>
          </div>
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-black dark:text-white mb-4">
              Who We Are
            </h2>
            <div className="w-20 h-1 bg-blue-600 mx-auto mb-8"></div>
            <p className="text-lg text-black dark:text-white max-w-4xl mx-auto">
              Our journey began with a clear purpose: to bridge the gap between
              theoretical education and industry requirements. Backed by a
              passionate team of academic experts, corporate trainers, and
              technology professionals, we are committed to delivering a
              future-ready learning experience.
            </p>
            <p className="text-lg text-black dark:text-white max-w-4xl mx-auto mt-5">
              We work in collaboration with recognized universities, global
              educators, and experienced mentors to develop relevant,
              career-focused content that supports learners at every stage of
              their professional journey.
            </p>
          </div>
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-black dark:text-white mb-4">
              What We Offer
            </h2>
            <div className="w-20 h-1 bg-blue-600 mx-auto mb-8"></div>
            <p className="text-lg text-black dark:text-white max-w-4xl mx-auto">
              We provide a wide range of{" "}
              <strong>online programs and skill-based training,</strong>{" "}
              including:
            </p>
            <ul className="list-disc list-inside font-bold text-lg text-black dark:text-white max-w-4xl mx-auto">
              <li>Professional Certifications & Short-Term Courses</li>
              <li>Corporate Training & Skill Development Modules</li>
            </ul>
            <p className="text-lg text-black dark:text-white max-w-4xl mx-auto mt-5">
              Every course is designed to be{" "}
              <strong>
                flexible, mobile-friendly, and globally recognized,
              </strong>{" "}
              allowing learners to study at their own pace and convenience.
            </p>
          </div>
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-black dark:text-white mb-4">
              Our Vision
            </h2>
            <div className="w-20 h-1 bg-blue-600 mx-auto mb-8"></div>
            <p className="text-lg text-black dark:text-white max-w-4xl mx-auto">
              To become a trusted learning destination for individuals and
              professionals seeking to build skills, grow careers, and embrace
              lifelong learning through modern education.
            </p>
          </div>
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-black dark:text-white mb-4">
              Our Mission
            </h2>
            <div className="w-20 h-1 bg-blue-600 mx-auto mb-8"></div>
            <ul className="list-disc list-none list-inside text-lg text-black dark:text-white max-w-4xl mx-auto">
              <li>
                Make{" "}
                <strong>quality education accessible and affordable</strong>
              </li>
              <li>
                Promote{" "}
                <strong>career-centric, industry-relevant skills</strong>
              </li>
              <li>
                Offer flexible programs that suit different learning needs
              </li>
              <li>
                Empower learners to{" "}
                <strong> achieve career success and personal growth</strong>
              </li>
            </ul>
          </div>
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-black dark:text-white mb-4">
              Focused on Learner Success
            </h2>
            <div className="w-20 h-1 bg-blue-600 mx-auto mb-8"></div>
            <p className="text-lg text-black dark:text-white max-w-4xl mx-auto">
              Each learner’s journey is unique, and our platform is designed to
              support that:
            </p>
            <ul className="list-disc list-none list-inside text-lg text-black dark:text-white max-w-4xl mx-auto">
              <li>Interactive Learning Modules</li>
              <li>Live Webinars & Mentorship Sessions</li>
              <li>Placement Assistance & Interview Prep</li>
              <li>Progress Tracking & Certification</li>
            </ul>
          </div>
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-black dark:text-white mb-4">
              Trusted by Thousands
            </h2>
            <div className="w-20 h-1 bg-blue-600 mx-auto mb-8"></div>
            <p className="text-lg text-black dark:text-white max-w-4xl mx-auto">
              With a growing base of satisfied learners across India and beyond,
              we have built a platform that is trusted by students, working
              professionals, and even corporate clients. Whether you're looking
              to upskill, change careers, or prepare for the future, we’re here
              to guide you every step of the way.
            </p>
          </div>
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-black dark:text-white mb-4">
              Let’s Learn, Grow & Succeed Together
            </h2>
            <div className="w-20 h-1 bg-blue-600 mx-auto mb-8"></div>
            <p className="text-lg text-black dark:text-white max-w-4xl mx-auto">
              Education is more than just a certificate — it's a pathway to
              opportunity. Begin your learning journey with us today and take
              one step closer to achieving your professional and personal goals.
            </p>
          </div>
          {/* Features */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {[
              {
                icon: <FaBookOpen className="text-4xl text-blue-600 mb-4" />,
                title: "Wide Selection",
                description:
                  "Thousands of books across various subjects and disciplines.",
              },
              {
                icon: (
                  <FaGraduationCap className="text-4xl text-blue-600 mb-4" />
                ),
                title: "Expert Educators",
                description:
                  "Learn from industry professionals and experienced educators.",
              },
              {
                icon: <FaUsers className="text-4xl text-blue-600 mb-4" />,
                title: "Community",
                description: "Join a growing community of passionate learners.",
              },
              {
                icon: <FaAward className="text-4xl text-blue-600 mb-4" />,
                title: "Quality Content",
                description:
                  "Carefully curated content to ensure the best learning experience.",
              },
            ].map((feature, index) => (
              <div
                key={index}
                className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md text-center"
              >
                <div className="flex justify-center">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2 text-black dark:text-white">
                  {feature.title}
                </h3>
                <p className="text-black dark:text-white">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
          {/* Team Section */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-black dark:text-white mb-4">
              Our Team
            </h2>
            <div className="w-20 h-1 bg-blue-600 mx-auto mb-12"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  name: "Sachin Sharma",
                  role: "SEO Expert",
                  bio: "Experienced SEO strategist helping educational platforms rank higher and reach the right audience.",
                  image: "/images/team-1.jpg",
                },
                {
                  name: "Krishna Avtar",
                  role: "Developer",
                  bio: "Full-stack developer with a strong focus on building scalable and secure learning platforms.",
                  image: "/images/team-5.jpg",
                },
                {
                  name: "Ritik Kumar",
                  role: "Content Writer",
                  bio: "Crafts compelling educational content that simplifies complex concepts for learners of all ages.",
                  image: "/images/team-3.jpg",
                },
                {
                  name: "Sudev Mohan",
                  role: "Designer",
                  bio: "Passionate UI/UX designer focused on creating intuitive and visually appealing e-learning interfaces.",
                  image: "/images/team-4.jpg",
                },
                {
                  name: "Kiran Rawat",
                  role: "SEO Team",
                  bio: "Optimizes website visibility through data-driven SEO practices tailored for the education sector.",
                  image: "/images/team-2.jpg",
                },
                {
                  name: "Mohit Rajput",
                  role: "Content Writer",
                  bio: "Specializes in writing impactful content that enhances user engagement in digital education platforms.",
                  image: "/images/team-6.jpg",
                },
              ].map((member, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md"
                >
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-64 object-cover"
                  />
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-black dark:text-white">
                      {member.name}
                    </h3>
                    <p className="text-blue-600 mb-3">{member.role}</p>
                    <p className="text-black dark:text-white">{member.bio}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* CTA Section */}
          <div className="mt-20 bg-blue-900 rounded-xl p-8 text-center">
            <h2 className="text-2xl font-bold text-white dark:text-white mb-4">
              Ready to start learning?
            </h2>
            <p className="text-white dark:text-white mb-6 max-w-2xl mx-auto">
              Join thousands of students who are already advancing their careers
              with our courses.
            </p>
            <Link
              to="/courses"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition duration-300"
            >
              Browse Courses
            </Link>
          </div>
          <p className="text-center text-lg text-black dark:text-white mt-12">
            Welcome to FirstVITE — your partner in skill-building and success.
          </p>
        </div>
      </section>
    </div>
  );
}
