// src/pages/BlogPost.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Calendar,
  Clock,
  Eye,
  User,
  ArrowLeft,
  Share2,
  BookOpen,
  Loader2,
} from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ArticleCard from "../components/ArticleCard";
import { useSEO } from "../hooks/useSeo";
import {
  getArticleBySlug,
  getRelatedArticles,
  formatDate,
  calculateReadingTime,
} from "../lib/blog";
import { BookSchema } from "../components/StructuredData";

function BlogPost() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState(null);
  const [relatedArticles, setRelatedArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewsletter, setShowNewsletter] = useState(false);

  useEffect(() => {
    loadArticle();
  }, [slug]);

  const loadArticle = async () => {
    setLoading(true);
    const data = await getArticleBySlug(slug);

    if (!data) {
      navigate("/blog");
      return;
    }

    setArticle(data);

    // Cargar artículos relacionados
    if (data.category) {
      const related = await getRelatedArticles(data.id, data.category);
      setRelatedArticles(related);
    }

    setLoading(false);
  };

  // SEO dinámico
  useSEO({
    title: article ? `${article.title} - Blog BookFinder` : "Cargando...",
    description: article?.excerpt || article?.content?.substring(0, 160),
    keywords: article?.tags?.join(", "),
    ogImage: article?.cover_image,
    canonicalUrl: `https://bookfinder.vercel.app/blog/${slug}`,
  });

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.excerpt,
          url: window.location.href,
        });
      } catch (err) {
        console.log("Error sharing:", err);
      }
    } else {
      // Copiar al portapapeles
      navigator.clipboard.writeText(window.location.href);
      alert("¡Enlace copiado al portapapeles!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 to-blue-50">
        <Header onNewsletterOpen={() => setShowNewsletter(true)} />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="w-12 h-12 text-purple-600 animate-spin" />
        </main>
        <Footer />
      </div>
    );
  }

  if (!article) {
    return null;
  }

  const readingTime = calculateReadingTime(article.content);

  return (
    <>
      {/* Structured Data para SEO */}
      <BookSchema book={{ volumeInfo: { title: article.title } }} />

      <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 to-blue-50">
        <Header onNewsletterOpen={() => setShowNewsletter(true)} />

        <main className="flex-1 max-w-4xl mx-auto px-4 py-8 w-full">
          {/* Botón volver */}
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-6 font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver al blog
          </Link>

          {/* Artículo */}
          <article className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Imagen de portada */}
            {article.cover_image && (
              <div className="h-96 overflow-hidden">
                <img
                  src={article.cover_image}
                  alt={article.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Contenido */}
            <div className="p-8 sm:p-12">
              {/* Categoría */}
              {article.category && (
                <span className="inline-block px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold mb-4">
                  {article.category}
                </span>
              )}

              {/* Título */}
              <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
                {article.title}
              </h1>

              {/* Excerpt */}
              {article.excerpt && (
                <p className="text-xl text-gray-600 mb-6 leading-relaxed">
                  {article.excerpt}
                </p>
              )}

              {/* Meta información */}
              <div className="flex flex-wrap items-center gap-6 pb-6 mb-6 border-b border-gray-200">
                {/* Autor */}
                {article.author && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <User className="w-5 h-5" />
                    <span className="font-medium">
                      {article.author.username}
                    </span>
                  </div>
                )}

                {/* Fecha */}
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-5 h-5" />
                  <span>{formatDate(article.created_at)}</span>
                </div>

                {/* Tiempo de lectura */}
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="w-5 h-5" />
                  <span>{readingTime} min de lectura</span>
                </div>

                {/* Vistas */}
                {article.views > 0 && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Eye className="w-5 h-5" />
                    <span>{article.views} vistas</span>
                  </div>
                )}

                {/* Botón compartir */}
                <button
                  onClick={handleShare}
                  className="ml-auto flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                >
                  <Share2 className="w-4 h-4" />
                  Compartir
                </button>
              </div>

              {/* Contenido del artículo */}
              <div
                className="prose prose-lg max-w-none prose-headings:text-gray-800 prose-p:text-gray-700 prose-a:text-purple-600 prose-strong:text-gray-800"
                style={{ whiteSpace: "pre-wrap" }}
              >
                {article.content}
              </div>

              {/* Tags */}
              {article.tags && article.tags.length > 0 && (
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">
                    Etiquetas:
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {article.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </article>

          {/* AdSense */}
          <div className="bg-gray-200 border-2 border-dashed border-gray-400 rounded-lg p-8 text-center my-12">
            <p className="text-gray-600">AdSense Banner</p>
          </div>

          {/* Artículos relacionados */}
          {relatedArticles.length > 0 && (
            <div className="mt-12">
              <div className="flex items-center gap-3 mb-6">
                <BookOpen className="w-6 h-6 text-purple-600" />
                <h2 className="text-2xl font-bold text-gray-800">
                  Artículos relacionados
                </h2>
              </div>
              <div className="grid md:grid-cols-3 gap-6">
                {relatedArticles.map((relatedArticle) => (
                  <ArticleCard
                    key={relatedArticle.id}
                    article={relatedArticle}
                  />
                ))}
              </div>
            </div>
          )}
        </main>

        <Footer />
      </div>
    </>
  );
}

export default BlogPost;
