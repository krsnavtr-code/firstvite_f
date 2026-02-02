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
        title="Eklabya - Online Learning Platform | Professional & Management Courses"
        description="Eklabya E-Learning offers professional and management courses, including short programs and degree collaborations with international universities. Start your learning journey today!"
        keywords="online courses, e-learning, professional courses, management courses, online education, Eklabya, skill development, online learning platform"
        og={{
          title: "Eklabya - Transform Your Career with Online Learning",
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
