// src/lib/blog.js
import { supabase } from "./supabase";

/**
 * Obtener todos los artículos publicados
 */
export const getPublishedArticles = async () => {
  try {
    const { data, error } = await supabase
      .from("articles")
      .select(
        `
        *,
        author:profiles(username, email)
      `,
      )
      .eq("status", "published")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching articles:", error);
    return [];
  }
};

/**
 * Obtener un artículo por slug
 */
export const getArticleBySlug = async (slug) => {
  try {
    const { data, error } = await supabase
      .from("articles")
      .select(
        `
        *,
        author:profiles(username, email)
      `,
      )
      .eq("slug", slug)
      .eq("status", "published")
      .single();

    if (error) throw error;

    // Incrementar vistas
    if (data) {
      await incrementArticleViews(data.id);
    }

    return data;
  } catch (error) {
    console.error("Error fetching article:", error);
    return null;
  }
};

/**
 * Incrementar vistas de un artículo
 */
export const incrementArticleViews = async (articleId) => {
  try {
    const { data: article } = await supabase
      .from("articles")
      .select("views")
      .eq("id", articleId)
      .single();

    if (article) {
      await supabase
        .from("articles")
        .update({ views: (article.views || 0) + 1 })
        .eq("id", articleId);
    }
  } catch (error) {
    console.error("Error incrementing views:", error);
  }
};

/**
 * Buscar artículos
 */
export const searchArticles = async (query) => {
  try {
    const { data, error } = await supabase
      .from("articles")
      .select(
        `
        *,
        author:profiles(username, email)
      `,
      )
      .eq("status", "published")
      .or(
        `title.ilike.%${query}%,meta_description.ilike.%${query}%,content.ilike.%${query}%,category.ilike.%${query}%`,
      )
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error searching articles:", error);
    return [];
  }
};

/**
 * Obtener artículos por categoría
 */
export const getArticlesByCategory = async (category) => {
  try {
    const { data, error } = await supabase
      .from("articles")
      .select(
        `
        *,
        author:profiles(username, email)
      `,
      )
      .eq("status", "published")
      .eq("category", category)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching articles by category:", error);
    return [];
  }
};

/**
 * Obtener artículos relacionados
 */
export const getRelatedArticles = async (
  currentArticleId,
  category,
  limit = 3,
) => {
  try {
    const { data, error } = await supabase
      .from("articles")
      .select(
        `
        *,
        author:profiles(username, email)
      `,
      )
      .eq("status", "published")
      .eq("category", category)
      .neq("id", currentArticleId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error("Error fetching related articles:", error);
    return [];
  }
};

/**
 * Calcular tiempo de lectura estimado
 */
export const calculateReadingTime = (content) => {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.ceil(words / wordsPerMinute);
  return minutes;
};

/**
 * Formatear fecha
 */
export const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};
