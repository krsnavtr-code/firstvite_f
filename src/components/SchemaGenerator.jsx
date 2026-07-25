import React from 'react';
import { Helmet } from 'react-helmet-async';

/**
 * SchemaGenerator Component
 * 
 * Injects JSON-LD structured data into the page head for SEO
 * 
 * @param {Object} props - Component props
 * @param {Object} props.schema - The schema object to convert to JSON-LD
 * @returns {JSX.Element} - Returns Helmet component with JSON-LD script
 */
const SchemaGenerator = ({ schema }) => {
  if (!schema) return null;

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
};

export default SchemaGenerator;
