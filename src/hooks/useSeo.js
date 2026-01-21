// src/hooks/useSEO.js
import { useEffect } from "react";

/**
 * Hook personalizado para gestionar SEO en cada página
 * Compatible con React 19
 */
export const useSEO = ({
  title,
  description,
  keywords,
  ogImage,
  ogType = "website",
  canonicalUrl,
  noindex = false,
}) => {
  useEffect(() => {
    // ====================================
    // TITLE
    // ====================================
    if (title) {
      document.title = title;
    }

    // ====================================
    // META TAGS
    // ====================================
    const updateMetaTag = (name, content, isProperty = false) => {
      if (!content) return;

      const attribute = isProperty ? "property" : "name";
      let meta = document.querySelector(`meta[${attribute}="${name}"]`);

      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute(attribute, name);
        document.head.appendChild(meta);
      }

      meta.setAttribute("content", content);
    };

    // Description
    updateMetaTag("description", description);

    // Keywords
    updateMetaTag("keywords", keywords);

    // Robots (indexación)
    updateMetaTag("robots", noindex ? "noindex, nofollow" : "index, follow");

    // ====================================
    // OPEN GRAPH (Facebook, LinkedIn, etc.)
    // ====================================
    updateMetaTag("og:title", title, true);
    updateMetaTag("og:description", description, true);
    updateMetaTag("og:type", ogType, true);
    updateMetaTag("og:image", ogImage, true);
    updateMetaTag("og:site_name", "BookFinder", true);

    if (canonicalUrl) {
      updateMetaTag("og:url", canonicalUrl, true);
    }

    // ====================================
    // TWITTER CARD
    // ====================================
    updateMetaTag("twitter:card", "summary_large_image");
    updateMetaTag("twitter:title", title);
    updateMetaTag("twitter:description", description);
    updateMetaTag("twitter:image", ogImage);

    // ====================================
    // CANONICAL URL
    // ====================================
    if (canonicalUrl) {
      let link = document.querySelector('link[rel="canonical"]');

      if (!link) {
        link = document.createElement("link");
        link.setAttribute("rel", "canonical");
        document.head.appendChild(link);
      }

      link.setAttribute("href", canonicalUrl);
    }

    // ====================================
    // STRUCTURED DATA (JSON-LD)
    // ====================================
    // Se implementará en el siguiente paso
  }, [title, description, keywords, ogImage, ogType, canonicalUrl, noindex]);
};

export default useSEO;
