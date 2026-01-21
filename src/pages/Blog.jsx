// src/pages/Blog.jsx
import React, { useState, useEffect } from "react";
import { Search, BookOpen, Loader2 } from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ArticleCard from "../components/ArticleCard";
import { useSEO } from "../hooks/useSeo";
import { getPublishedArticles, searchArticles } from "../lib/blog";

function Blog() {
  const [articles, setArticles] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewsletter, setShowNewsletter] = useState(false);

  // SEO
  useSEO({
    title: "Blog - BookFinder | Artículos sobre libros y lectura",
    description:
      "Descubre artículos, reseñas y recomendaciones sobre libros. Guías de lectura, listas curadas y consejos para lectores.",
    keywords:
      "blog libros, reseñas libros, recomendaciones lectura, artículos sobre libros",
    canonicalUrl: "https://bookfinder.vercel.app/blog",
  });

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    setLoading(true);
    const data = await getPublishedArticles();
    setArticles(data);
    setFilteredArticles(data);
    setLoading(false);
  };

  const handleSearch = async (e) => {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.trim() === "") {
      setFilteredArticles(articles);
    } else {
      const results = await searchArticles(query);
      setFilteredArticles(results);
    }
  };

  // Obtener categorías únicas
  const categories = [
    ...new Set(articles.map((a) => a.category).filter(Boolean)),
  ];

  const filterByCategory = (category) => {
    if (category === "all") {
      setFilteredArticles(articles);
    } else {
      setFilteredArticles(articles.filter((a) => a.category === category));
    }
    setSearchQuery("");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-purple-50 to-blue-50">
      <Header onNewsletterOpen={() => setShowNewsletter(true)} />

      <main className="flex-1 max-w-6xl mx-auto px-4 py-8 w-full">
        {/* Hero section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <BookOpen className="w-12 h-12 text-purple-600" />
            <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Blog
            </h1>
          </div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Artículos, reseñas y recomendaciones sobre el mundo de los libros
          </p>
        </div>

        {/* Búsqueda y filtros */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          {/* Barra de búsqueda */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearch}
              placeholder="Buscar artículos..."
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
            />
          </div>

          {/* Filtros por categoría */}
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => filterByCategory("all")}
                className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition text-sm font-medium"
              >
                Todos
              </button>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => filterByCategory(category)}
                  className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition text-sm font-medium"
                >
                  {category}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-purple-600 animate-spin" />
          </div>
        )}

        {/* Sin resultados */}
        {!loading && filteredArticles.length === 0 && (
          <div className="text-center py-20">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              {searchQuery
                ? "No se encontraron artículos"
                : "Aún no hay artículos"}
            </h3>
            <p className="text-gray-600">
              {searchQuery
                ? "Intenta con otros términos de búsqueda"
                : "Pronto publicaremos contenido interesante"}
            </p>
          </div>
        )}

        {/* Grid de artículos */}
        {!loading && filteredArticles.length > 0 && (
          <>
            <div className="mb-4">
              <p className="text-gray-700 font-semibold">
                {filteredArticles.length} artículo
                {filteredArticles.length !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArticles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </>
        )}

        {/* AdSense placeholder */}
        {filteredArticles.length > 0 && (
          <div className="bg-gray-200 border-2 border-dashed border-gray-400 rounded-lg p-8 text-center mt-12">
            <p className="text-gray-600">AdSense Banner</p>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

export default Blog;
