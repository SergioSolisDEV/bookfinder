// src/components/StructuredData.jsx
import React from "react";

/**
 * Componente para insertar JSON-LD (Structured Data)
 * Ayuda a Google a entender mejor tu contenido
 */

// ====================================
// WEBSITE SCHEMA
// ====================================
export const WebsiteSchema = () => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "BookFinder",
    description: "Descubre y organiza tu biblioteca personal de libros",
    url: "https://bookfinder.vercel.app",
    potentialAction: {
      "@type": "SearchAction",
      target: "https://bookfinder.vercel.app/?q={search_term_string}",
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};

// ====================================
// ORGANIZATION SCHEMA
// ====================================
export const OrganizationSchema = () => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "BookFinder",
    url: "https://bookfinder.vercel.app",
    logo: "https://bookfinder.vercel.app/logo.png",
    description: "Plataforma para descubrir y organizar libros",
    sameAs: [
      "https://twitter.com/bookfinder",
      "https://instagram.com/bookfinder",
    ],
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};

// ====================================
// BOOK SCHEMA
// ====================================
export const BookSchema = ({ book }) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Book",
    name: book.volumeInfo.title,
    author:
      book.volumeInfo.authors?.map((author) => ({
        "@type": "Person",
        name: author,
      })) || [],
    description: book.volumeInfo.description || "Sin descripción disponible",
    image: book.volumeInfo.imageLinks?.thumbnail?.replace("http:", "https:"),
    isbn: book.volumeInfo.industryIdentifiers?.[0]?.identifier,
    numberOfPages: book.volumeInfo.pageCount,
    inLanguage: "es",
    publisher: book.volumeInfo.publisher,
    datePublished: book.volumeInfo.publishedDate,
  };

  // Añadir categorías si existen
  if (book.volumeInfo.categories) {
    schema.genre = book.volumeInfo.categories;
  }

  // Añadir precio si existe
  if (book.saleInfo?.listPrice) {
    schema.offers = {
      "@type": "Offer",
      price: book.saleInfo.listPrice.amount,
      priceCurrency: book.saleInfo.listPrice.currencyCode,
      availability: "https://schema.org/InStock",
      url: `https://www.amazon.es/s?k=${encodeURIComponent(book.volumeInfo.title)}`,
    };
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};

// ====================================
// BREADCRUMB SCHEMA
// ====================================
export const BreadcrumbSchema = ({ items }) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
};

// ====================================
// EJEMPLO DE USO
// ====================================

/*
// En Home.jsx
import { WebsiteSchema, OrganizationSchema } from '../components/StructuredData';

function Home() {
  return (
    <>
      <WebsiteSchema />
      <OrganizationSchema />
      
      <div>
        // Tu contenido
      </div>
    </>
  );
}

// En modal de libro
import { BookSchema } from '../components/StructuredData';

{selectedBook && (
  <>
    <BookSchema book={selectedBook} />
    <div>
      // Modal content
    </div>
  </>
)}
*/

export default {
  WebsiteSchema,
  OrganizationSchema,
  BookSchema,
  BreadcrumbSchema,
};
