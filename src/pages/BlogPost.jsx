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

// Función para parsear Markdown a HTML
const parseMarkdown = (text) => {
  if (!text) return "";

  let html = text;

  // Títulos (del más específico al más general)
  html = html.replace(
    /#### (.*?)(\n|$)/g,
    '<h4 class="text-lg font-bold mt-5 mb-2 text-gray-800">$1</h4>',
  );
  html = html.replace(
    /### (.*?)(\n|$)/g,
    '<h3 class="text-xl font-bold mt-6 mb-3 text-gray-800">$1</h3>',
  );
  html = html.replace(
    /## (.*?)(\n|$)/g,
    '<h2 class="text-2xl font-bold mt-8 mb-4 text-gray-800">$1</h2>',
  );
  html = html.replace(
    /# (.*?)(\n|$)/g,
    '<h1 class="text-3xl font-bold mt-10 mb-5 text-gray-800">$1</h1>',
  );

  // Negrita y cursiva (procesar *** antes que ** y *)
  html = html.replace(
    /\*\*\*(.*?)\*\*\*/g,
    '<strong class="font-bold"><em class="italic">$1</em></strong>',
  );
  html = html.replace(
    /\*\*(.*?)\*\*/g,
    '<strong class="font-bold text-gray-900">$1</strong>',
  );
  html = html.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');
  html = html.replace(/<u>(.*?)<\/u>/g, "<u>$1</u>");

  // Imágenes (antes que enlaces para evitar conflictos)
  html = html.replace(
    /!\[(.*?)\]\((.*?)\)/g,
    '<img src="$2" alt="$1" class="max-w-full h-auto my-6 rounded-lg shadow-md mx-auto" loading="lazy" />',
  );

  // Enlaces
  html = html.replace(
    /\[(.*?)\]\((.*?)\)/g,
    '<a href="$2" class="text-purple-600 hover:text-purple-700 underline font-medium" target="_blank" rel="noopener noreferrer">$1</a>',
  );

  // Listas desordenadas
  html = html.replace(/^\s*-\s+(.+)$/gm, '<li class="mb-2">$1</li>');
  html = html.replace(
    /(<li class="mb-2">.*?<\/li>\s*)+/g,
    '<ul class="list-disc ml-6 my-6 space-y-2">$&</ul>',
  );

  // Listas ordenadas
  html = html.replace(/^\s*\d+\.\s+(.+)$/gm, '<li class="mb-2">$1</li>');

  // Citas
  html = html.replace(
    /^>\s+(.+)$/gm,
    '<blockquote class="border-l-4 border-purple-500 pl-6 py-3 my-6 italic text-gray-700 bg-purple-50 rounded-r">$1</blockquote>',
  );

  // Línea horizontal
  html = html.replace(
    /^---$/gm,
    '<hr class="my-8 border-t-2 border-gray-300"/>',
  );

  // Párrafos (doble salto de línea)
  html = html.replace(
    /\n\n/g,
    '</p><p class="mb-4 leading-relaxed text-gray-700">',
  );

  // Saltos de línea simples
  html = html.replace(/\n/g, "<br/>");

  return html;
};

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

    if (data.category) {
      const related = await getRelatedArticles(data.id, data.category);
      setRelatedArticles(related);
    }

    setLoading(false);
  };

  const tagsArray = article?.tags
    ? article.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
    : [];

  useSEO({
    title: article ? `${article.title} - Blog BookFinder` : "Cargando...",
    description:
      article?.meta_description || article?.content?.substring(0, 160),
    keywords: tagsArray.join(", "),
    ogImage: article?.featured_image,
    canonicalUrl: `https://bookfinder.vercel.app/blog/${slug}`,
  });

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.meta_description,
          url: window.location.href,
        });
      } catch (err) {
        console.log("Error sharing:", err);
      }
    } else {
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
      <BookSchema book={{ volumeInfo: { title: article.title } }} />

      <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 to-blue-50">
        <Header onNewsletterOpen={() => setShowNewsletter(true)} />

        <main className="flex-1 max-w-4xl mx-auto px-4 py-8 w-full">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-6 font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            Volver al blog
          </Link>

          <article className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {article.featured_image && (
              <div className="h-96 overflow-hidden">
                <img
                  src={article.featured_image}
                  alt={article.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            <div className="p-8 sm:p-12">
              {article.category && (
                <span className="inline-block px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold mb-4">
                  {article.category}
                </span>
              )}

              <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-4">
                {article.title}
              </h1>

              {article.meta_description && (
                <p className="text-xl text-gray-600 mb-6 leading-relaxed">
                  {article.meta_description}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-6 pb-6 mb-6 border-b border-gray-200">
                {article.author && (
                  <div className="flex items-center gap-2 text-gray-700">
                    <User className="w-5 h-5" />
                    <span className="font-medium">
                      {article.author.username || article.author.email}
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-5 h-5" />
                  <span>{formatDate(article.created_at)}</span>
                </div>

                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="w-5 h-5" />
                  <span>{readingTime} min de lectura</span>
                </div>

                {article.views > 0 && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Eye className="w-5 h-5" />
                    <span>{article.views} vistas</span>
                  </div>
                )}

                <button
                  onClick={handleShare}
                  className="ml-auto flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                >
                  <Share2 className="w-4 h-4" />
                  Compartir
                </button>
              </div>

              {/* CONTENIDO PARSEADO CON MARKDOWN */}
              <div
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{
                  __html:
                    '<p class="mb-4 leading-relaxed text-gray-700">' +
                    parseMarkdown(article.content) +
                    "</p>",
                }}
              />

              {tagsArray.length > 0 && (
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-700 mb-3">
                    Etiquetas:
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {tagsArray.map((tag, index) => (
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

          <div className="bg-gray-200 border-2 border-dashed border-gray-400 rounded-lg p-8 text-center my-12">
            <p className="text-gray-600">AdSense Banner</p>
          </div>

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
