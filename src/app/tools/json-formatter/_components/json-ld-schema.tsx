export default function JsonLdSchema() {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "JSON Formatter & Validator",
    "description": "Free online JSON formatter, validator, and beautifier. Format messy JSON, validate syntax, fix errors, minify for production.",
    "url": "https://www.siteagent.eu/tools/json-formatter",
    "applicationCategory": "DeveloperApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "EUR"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "ratingCount": "127",
      "bestRating": "5"
    },
    "featureList": [
      "JSON Beautifier with custom indentation",
      "Real-time syntax validation",
      "One-click error fixes",
      "JSON minifier for production",
      "Format converter (JSON/YAML/CSV)",
      "Syntax highlighting themes",
      "JSON path explorer",
      "Schema generator"
    ],
    "screenshot": "https://www.siteagent.eu/og-image.png",
    "author": {
      "@type": "Organization",
      "name": "SiteAgent",
      "url": "https://www.siteagent.eu"
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
} 