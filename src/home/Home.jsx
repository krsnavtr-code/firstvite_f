import React from 'react';
import SEO from '../components/SEO';
import Banner from '../components/Banner';
import Categories from '../components/home/Categories';
import PopularCourses from '../components/home/PopularCourses';
import Assessment from '../components/home/Assessment';
import Stats from '../components/home/Stats';
import Testimonials from '../components/home/Testimonials';
import Newsletter from '../components/home/Newsletter';
import ContactSection from '../components/home/ContactSection';
import WhyLearnWithEklabya from '../components/home/WhyLearnWithFirstVITE';
import HowWillYourTrainingWork from '../components/home/HowWillYourTrainingWork';
import Content from '../components/home/Content';

function Home() {
  return (
    <>
      <SEO
        title="Online Courses | Eklabya Centre of Excellence"
        description="Eklabya Centre of Excellence offers certified online courses, Advance your career with flexible learning, expert faculty and recognized programs. Start your learning journey today!"
        keywords="online courses, e-learning, professional courses, certified courses, online certificate courses, Eklabya Centre of Excellence, skill development, online learning platform, Java, Python, Data Science, Machine Learning, Artificial Intelligence, Digital Marketing, Web Development, Mobile Development, Cloud Computing, DevOps, Cybersecurity, Blockchain, IoT, AR/VR, Game Development, UI/UX Design, Project Management, Business Analysis, Data Analytics, Business Intelligence, Marketing, Sales, HR, Finance, Operations, Supply Chain, Quality Management, Lean Six Sigma, Agile, Scrum, Kanban, Product Management, Business Strategy, Leadership, Communication, Team Management, Time Management, Problem Solving, Critical Thinking, Creativity, Innovation, Entrepreneurship, Startup, Small Business, Freelancing, Remote Work, Work-Life Balance, Stress Management, Mindfulness, Meditation, Yoga, Fitness, Nutrition, Health, Wellness, Self-Care, Personal Development, Career Development, Professional Development"
        og={{
          title: "Eklabya Centre of Excellence - Transform Your Career with Online Learning",
          description:
            "Join thousands of students learning in-demand skills with our expert-led courses. Flexible learning, industry-recognized certifications, and career support.",
          type: "website",
          image:
            "http://eklabya.com/api/upload/file/img-1753961989896-7541613.png",
        }}
      />
      <div className="flex flex-col min-h-screen">
        {/* Hero Banner */}
        <Banner />

        {/* Categories Section */}
        <Categories />

        {/* Popular Courses */}
        <PopularCourses />

        {/* Featured Books */}
        <Assessment />

        {/* Why learn with Eklabya? */}
        <WhyLearnWithEklabya />

        {/* How will your training work */}
        <HowWillYourTrainingWork />

        {/* Stats Section */}
        <Stats />

        {/* Content */}
        <Content />

        {/* Testimonials */}
        <Testimonials />

        {/* Newsletter */}
        <Newsletter />

        {/* Contact Section */}
        <ContactSection />

        {/* You can uncomment this if you want to include the Freebook component */}
        {/* <Freebook /> */}
      </div>
    </>
  );
}

export default Home;
