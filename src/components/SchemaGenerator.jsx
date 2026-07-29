import React from "react";
import { Helmet } from "react-helmet-async";

const SchemaGenerator = ({ schema }) => {
  if (!schema) return null;

  const schemas = Array.isArray(schema) ? schema.filter(Boolean) : [schema];

  if (schemas.length === 0) return null;

  return (
    <Helmet>
      {schemas.map((s, index) => (
        <script 
          key={index} 
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(s) }} 
        />
      ))}
    </Helmet>
  );
};

export default SchemaGenerator;