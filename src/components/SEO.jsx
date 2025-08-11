import React from 'react';
import { Helmet } from 'react-helmet-async';

/**
 * SEO Component
 * 
 * @param {Object} props - Component props
 * @param {string} props.title - Page title (e.g., 'Home | FirstVITE')
 * @param {string} props.description - Meta description for the page
 * @param {string} [props.keywords] - Comma-separated keywords for SEO
 * @param {string} [props.canonical] - Canonical URL for the page
 * @param {Object} [props.og] - Open Graph meta tags
 * @param {string} [props.og.title] - OG title (defaults to title)
 * @param {string} [props.og.description] - OG description (defaults to description)
 * @param {string} [props.og.image] - OG image URL
 * @param {string} [props.og.type] - OG type (e.g., 'website', 'article')
 * @param {string} [props.og.url] - OG URL (defaults to window.location.href)
 * @param {Object} [props.twitter] - Twitter card meta tags
 * @param {string} [props.twitter.card] - Twitter card type (defaults to 'summary_large_image')
 * @param {string} [props.twitter.site] - Twitter @username for the website
 * @param {string} [props.twitter.creator] - Twitter @username for content creator
 * @returns {JSX.Element} - Returns Helmet component with meta tags
 */
const SEO = ({
  title = 'FirstVITE - Online Learning Platform',
  description = 'FirstVITE E-Learning Pvt Ltd offers professional and management courses, including short programs and degree collaborations with international universities.',
  keywords = 'online courses, e-learning, professional courses, management courses, online education, FirstVITE, skill development',
  canonical = '',
  og = {},
  twitter = {}
}) => {
  const siteName = 'FirstVITE';
  const siteUrl = 'https://firstvite.com';
  const defaultImage = `${siteUrl}/images/firstvite-logo.png`;
  
  // Default Open Graph values
  const ogTitle = og.title || title;
  const ogDescription = og.description || description;
  const ogImage = og.image || defaultImage;
  const ogType = og.type || 'website';
  const ogUrl = og.url || (typeof window !== 'undefined' ? window.location.href : siteUrl);
  
  // Default Twitter card values
  const twitterCard = twitter.card || 'summary_large_image';
  const twitterSite = twitter.site || '@firstvite';
  const twitterCreator = twitter.creator || '@firstvite';
  
  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      {canonical && <link rel="canonical" href={canonical} />}
      
      {/* Open Graph / Facebook */}
      <meta property="og:title" content={ogTitle} />
      <meta property="og:description" content={ogDescription} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={ogUrl} />
      <meta property="og:site_name" content={siteName} />
      
      {/* Twitter */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:title" content={ogTitle} />
      <meta name="twitter:description" content={ogDescription} />
      <meta name="twitter:image" content={ogImage} />
      {twitterSite && <meta name="twitter:site" content={twitterSite} />}
      {twitterCreator && <meta name="twitter:creator" content={twitterCreator} />}
    </Helmet>
  );
};

export default SEO;
