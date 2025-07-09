import React from 'react';
import Banner from '../components/Banner';
import Categories from '../components/home/Categories';
import FeaturedBooks from '../components/home/FeaturedBooks';
import Stats from '../components/home/Stats';
import Testimonials from '../components/home/Testimonials';
import Newsletter from '../components/home/Newsletter';
import ContactSection from '../components/home/ContactSection';

function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Banner */}
      <Banner />
      
      {/* Categories Section */}
      <Categories />
      
      {/* Featured Books */}
      <FeaturedBooks />
      
      {/* Stats Section */}
      <Stats />
      
      {/* Testimonials */}
      <Testimonials />
      
      {/* Newsletter */}
      <Newsletter />

      {/* Contact Section */}
      <ContactSection />
      
      {/* You can uncomment this if you want to include the Freebook component */}
      {/* <Freebook /> */}
    </div>
  );
}

export default Home;
