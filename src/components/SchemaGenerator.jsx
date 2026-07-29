import React from "react";
import { Helmet } from "react-helmet-async";

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

  const schemas = Array.isArray(schema) ? schema.filter(Boolean) : [schema];

  if (schemas.length === 0) return null;

  return (
    <Helmet>
      {schemas.map((s, index) => (
        <script key={index} type="application/ld+json">
          {JSON.stringify(s)}
        </script>
      ))}
    </Helmet>
  );
};

export default SchemaGenerator;
