import React from "react";
import { Link } from "react-router-dom";
import { FaBookOpen, FaGraduationCap, FaUsers, FaAward } from "react-icons/fa";

export default function About() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 mt-16">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            About Our FirstVite
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
              Our Story
            </h2>
            <div className="w-20 h-1 bg-blue-600 mx-auto mb-8"></div>
            <p className="text-lg text-black dark:text-white max-w-4xl mx-auto">
              Founded in 2023, our FirstVite has been a trusted source of
              knowledge and learning materials for students, professionals, and
              lifelong learners. We believe in making quality education
              accessible to everyone, regardless of their background or
              location.
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
                  image: "../../public/images/team-1.jpg",
                },
                {
                  name: "Krishna Avtar",
                  role: "Developer",
                  bio: "Full-stack developer with a strong focus on building scalable and secure learning platforms.",
                  image: "../../public/images/team-5.jpg",
                },
                {
                  name: "Ritik Kumar",
                  role: "Content Writer",
                  bio: "Crafts compelling educational content that simplifies complex concepts for learners of all ages.",
                  image: "../../public/images/team-3.jpg",
                },
                {
                  name: "Sudev Mohan",
                  role: "Designer",
                  bio: "Passionate UI/UX designer focused on creating intuitive and visually appealing e-learning interfaces.",
                  image: "../../public/images/team-4.jpg",
                },
                {
                  name: "Kiran Rawat",
                  role: "SEO Team",
                  bio: "Optimizes website visibility through data-driven SEO practices tailored for the education sector.",
                  image: "../../public/images/team-2.jpg",
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
                    <p className="text-black dark:text-white">
                      {member.bio}
                    </p>
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
        </div>
      </section>
    </div>
  );
}
