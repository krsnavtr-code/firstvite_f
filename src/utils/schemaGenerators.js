/**
 * Schema Generators Utility
 *
 * Collection of functions to generate structured data schemas for SEO
 * Following schema.org standards for Google Rich Results
 */

const siteUrl = "https://eklabya.com";

/**
 * Generate Course Schema
 *
 * @param {Object} courseData - Course information
 * @param {string} courseData.name - Course name
 * @param {string} courseData.description - Course description
 * @param {string} courseData.url - Course URL
 * @param {string} [courseData.image] - Course image URL
 * @param {string} [courseData.provider] - Course provider name
 * @param {string} [courseData.providerUrl] - Course provider URL
 * @param {string} [courseData.instructor] - Instructor name
 * @param {string} [courseData.instructorUrl] - Instructor URL
 * @param {string} [courseData.courseCode] - Course code
 * @param {string} [courseData.category] - Course category
 * @param {number} [courseData.price] - Course price
 * @param {string} [courseData.currency] - Price currency (default: INR)
 * @param {string} [courseData.duration] - Course duration (e.g., "PT30H" for 30 hours)
 * @param {number} [courseData.ratingValue] - Average rating (1-5)
 * @param {number} [courseData.reviewCount] - Number of reviews
 * @param {string} [courseData.offers] - Offer URL
 * @param {string} [courseData.availability] - Availability status
 * @returns {Object} - Course schema object
 */
export const generateCourseSchema = ({
  name,
  description,
  url,
  image,
  provider = "eklabya centre of excellence",
  providerUrl = siteUrl,
  instructor,
  instructorUrl,
  courseCode,
  category,
  price,
  currency = "INR",
  duration,
  ratingValue,
  reviewCount,
  offers,
  availability = "https://schema.org/InStock",
} = {}) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Course",
    name,
    description,
    url: url.startsWith("http") ? url : `${siteUrl}${url}`,
    provider: {
      "@type": "Organization",
      name: provider,
      url: providerUrl,
    },
  };

  if (image) {
    schema.image = image.startsWith("http") ? image : `${siteUrl}${image}`;
  }

  if (instructor) {
    schema.instructor = {
      "@type": "Person",
      name: instructor,
      ...(instructorUrl && { url: instructorUrl }),
    };
  }

  if (courseCode) {
    schema.courseCode = courseCode;
  }

  if (category) {
    schema.about = {
      "@type": "Thing",
      name: category,
    };
  }

  if (price !== undefined) {
    schema.offers = {
      "@type": "Offer",
      category: "Paid",
      priceCurrency: currency,
      price: price,
      availability,
      ...(offers && { url: offers }),
    };
  }

  if (duration) {
    schema.duration = duration;
  }

  if (ratingValue && reviewCount) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue,
      reviewCount,
      bestRating: "5",
      worstRating: "1",
    };
  }

  return schema;
};

/**
 * Generate FAQ Schema
 *
 * @param {Array} faqs - Array of FAQ objects
 * @param {string} faqs[].question - FAQ question
 * @param {string} faqs[].answer - FAQ answer
 * @returns {Object} - FAQPage schema object
 */
export const generateFAQSchema = (faqs) => {
  if (!faqs || !Array.isArray(faqs)) {
    return null;
  }
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
  };
};

/**
 * Generate Breadcrumb Schema
 *
 * @param {Array} breadcrumbs - Array of breadcrumb objects
 * @param {string} breadcrumbs[].name - Breadcrumb name
 * @param {string} breadcrumbs[].url - Breadcrumb URL
 * @returns {Object} - BreadcrumbList schema object
 */
export const generateBreadcrumbSchema = (breadcrumbs) => {
  if (!breadcrumbs || !Array.isArray(breadcrumbs)) {
    return null;
  }
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbs.map((breadcrumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: breadcrumb.name,
      item: breadcrumb.url.startsWith("http")
        ? breadcrumb.url
        : `${siteUrl}${breadcrumb.url}`,
    })),
  };
};

/**
 * Generate Article Schema (for blog posts)
 *
 * @param {Object} articleData - Article information
 * @param {string} articleData.headline - Article headline/title
 * @param {string} articleData.description - Article description
 * @param {string} articleData.url - Article URL
 * @param {string} [articleData.image] - Article image URL
 * @param {string} articleData.author - Author name
 * @param {string} [articleData.authorUrl] - Author URL
 * @param {string} articleData.datePublished - Published date (ISO format)
 * @param {string} [articleData.dateModified] - Modified date (ISO format)
 * @param {string} [articleData.publisher] - Publisher name
 * @param {string} [articleData.publisherUrl] - Publisher URL
 * @param {string} [articleData.publisherLogo] - Publisher logo URL
 * @param {string} [articleData.articleSection] - Article section/category
 * @param {number} [articleData.wordCount] - Word count
 * @returns {Object} - Article schema object
 */
export const generateArticleSchema = ({
  headline,
  description,
  url,
  image,
  author,
  authorUrl,
  datePublished,
  dateModified,
  publisher = "eklabya centre of excellence",
  publisherUrl = siteUrl,
  publisherLogo = `${siteUrl}/images/eKlabya-0644.png`,
  articleSection,
  wordCount,
} = {}) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline,
    description,
    url: url.startsWith("http") ? url : `${siteUrl}${url}`,
    author: {
      "@type": "Person",
      name: author,
      ...(authorUrl && { url: authorUrl }),
    },
    datePublished,
    publisher: {
      "@type": "Organization",
      name: publisher,
      url: publisherUrl,
      logo: {
        "@type": "ImageObject",
        url: publisherLogo,
      },
    },
  };

  if (image) {
    schema.image = image.startsWith("http") ? image : `${siteUrl}${image}`;
  }

  if (dateModified) {
    schema.dateModified = dateModified;
  }

  if (articleSection) {
    articleSection: articleSection;
  }

  if (wordCount) {
    schema.wordCount = wordCount;
  }

  return schema;
};

/**
 * Generate Organization Schema (enhanced version)
 *
 * @param {Object} orgData - Organization information
 * @param {string} orgData.name - Organization name
 * @param {string} orgData.url - Organization URL
 * @param {string} orgData.logo - Logo URL
 * @param {string} orgData.description - Organization description
 * @param {string} orgData.telephone - Contact phone
 * @param {string} orgData.email - Contact email
 * @param {Object} orgData.address - Address object
 * @param {string} orgData.founder - Founder name
 * @param {string} orgData.foundingDate - Founding date
 * @param {Array} orgData.sameAs - Social media URLs
 * @returns {Object} - Organization schema object
 */
export const generateOrganizationSchema = ({
  name = "eklabya centre of excellence",
  url = siteUrl,
  logo = `${siteUrl}/images/eKlabya-0644.png`,
  description = "eklabya centre of excellence is an online education company based in Noida, offering professional and management courses—including short programs and degree collaborations with international universities.",
  telephone = "+91-9891030303",
  email = "info@eklabya.com",
  address = {
    streetAddress: "A-107, Sector 63",
    addressLocality: "Noida",
    addressRegion: "Uttar Pradesh",
    postalCode: "201301",
    addressCountry: "IN",
  },
  founder = "Anand Shekhar",
  foundingDate = "2020",
  sameAs = [
    "https://www.linkedin.com/company/eklabya-elearning",
    "https://www.facebook.com/profile.php?id=61589473389916",
    "https://www.instagram.com/eklabya_official",
    "https://x.com/eklabyaofficial",
    "https://in.pinterest.com/eklabyaofficial",
  ],
} = {}) => {
  return {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name,
    url,
    logo,
    telephone,
    email,
    founder: {
      "@type": "Person",
      name: founder,
    },
    address: {
      "@type": "PostalAddress",
      ...address,
    },
    sameAs,
    description,
    foundingDate,
    contactPoint: {
      "@type": "ContactPoint",
      telephone,
      contactType: "customer service",
      areaServed: "IN",
      availableLanguage: ["English", "Hindi"],
    },
  };
};

/**
 * Generate Product Schema (for course as product)
 *
 * @param {Object} productData - Product information
 * @param {string} productData.name - Product name
 * @param {string} productData.description - Product description
 * @param {string} productData.url - Product URL
 * @param {string} [productData.image] - Product image URL
 * @param {number} productData.price - Product price
 * @param {string} [productData.currency] - Price currency (default: INR)
 * @param {number} [productData.ratingValue] - Average rating
 * @param {number} [productData.reviewCount] - Number of reviews
 * @param {string} [productData.availability] - Availability status
 * @returns {Object} - Product schema object
 */
export const generateProductSchema = ({
  name,
  description,
  url,
  image,
  price,
  currency = "INR",
  ratingValue,
  reviewCount,
  availability = "https://schema.org/InStock",
} = {}) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    description,
    url: url.startsWith("http") ? url : `${siteUrl}${url}`,
    offers: {
      "@type": "Offer",
      price,
      priceCurrency: currency,
      availability,
      url: url.startsWith("http") ? url : `${siteUrl}${url}`,
    },
  };

  if (image) {
    schema.image = image.startsWith("http") ? image : `${siteUrl}${image}`;
  }

  if (ratingValue && reviewCount) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue,
      reviewCount,
      bestRating: "5",
      worstRating: "1",
    };
  }

  return schema;
};

/**
 * Generate Video Schema (for course videos)
 *
 * @param {Object} videoData - Video information
 * @param {string} videoData.name - Video name
 * @param {string} videoData.description - Video description
 * @param {string} videoData.url - Video URL
 * @param {string} videoData.thumbnailUrl - Video thumbnail URL
 * @param {string} videoData.uploadDate - Upload date (ISO format)
 * @param {string} [videoData.duration] - Video duration (ISO format, e.g., "PT1M30S")
 * @param {string} [videoData.author] - Video author
 * @returns {Object} - Video schema object
 */
export const generateVideoSchema = ({
  name,
  description,
  url,
  thumbnailUrl,
  uploadDate,
  duration,
  author = "eklabya centre of excellence",
} = {}) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name,
    description,
    thumbnailUrl: thumbnailUrl.startsWith("http")
      ? thumbnailUrl
      : `${siteUrl}${thumbnailUrl}`,
    uploadDate,
    author: {
      "@type": "Organization",
      name: author,
    },
  };

  if (url) {
    schema.contentUrl = url.startsWith("http") ? url : `${siteUrl}${url}`;
  }

  if (duration) {
    schema.duration = duration;
  }

  return schema;
};

/**
 * Generate Review Schema
 *
 * @param {Object} reviewData - Review information
 * @param {string} reviewData.itemReviewed - Item being reviewed
 * @param {string} reviewData.reviewBody - Review content
 * @param {number} reviewData.ratingValue - Rating value (1-5)
 * @param {string} reviewData.author - Review author name
 * @param {string} [reviewData.datePublished] - Review date (ISO format)
 * @returns {Object} - Review schema object
 */
export const generateReviewSchema = ({
  itemReviewed,
  reviewBody,
  ratingValue,
  author,
  datePublished,
} = {}) => {
  return {
    "@context": "https://schema.org",
    "@type": "Review",
    itemReviewed: {
      "@type": "Thing",
      name: itemReviewed,
    },
    reviewBody,
    reviewRating: {
      "@type": "Rating",
      ratingValue,
      bestRating: "5",
      worstRating: "1",
    },
    author: {
      "@type": "Person",
      name: author,
    },
    ...(datePublished && { datePublished }),
  };
};

/**
 * Generate WebSite Schema
 *
 * @param {Object} siteData - Site information
 * @param {string} siteData.name - Site name
 * @param {string} siteData.url - Site URL
 * @param {string} siteData.description - Site description
 * @param {string} [siteData.searchActionUrl] - Search action URL template
 * @returns {Object} - WebSite schema object
 */
export const generateWebSiteSchema = ({
  name = "eklabya",
  url = siteUrl,
  description = "eklabya centre of excellence offers professional and management courses, including short programs and degree collaborations with international universities.",
  searchActionUrl = `${siteUrl}/search?q={search_term_string}`,
} = {}) => {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name,
    url,
    description,
    potentialAction: {
      "@type": "SearchAction",
      target: searchActionUrl,
      "query-input": "required name=search_term_string",
    },
  };
};
