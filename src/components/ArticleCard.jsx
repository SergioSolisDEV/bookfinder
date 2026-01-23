// src/components/ArticleCard.jsx
import React from "react";
import { Link } from "react-router-dom";
import { Calendar, Clock, Eye, User } from "lucide-react";
import { formatDate, calculateReadingTime } from "../lib/blog";

const ArticleCard = ({ article }) => {
  const readingTime = calculateReadingTime(article.content);

  // Convertir tags de string a array
  const tagsArray = article.tags
    ? article.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
    : [];

  return (
    <Link
      to={`/blog/${article.slug}`}
      className="block bg-white rounded-xl shadow-md hover:shadow-xl transition overflow-hidden group"
    >
      {/* Imagen de portada */}
      {article.featured_image ? (
        <div className="h-48 overflow-hidden">
          <img
            src={article.featured_image}
            alt={article.title}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
            loading="lazy"
          />
        </div>
      ) : (
        <div className="h-48 bg-gradient-to-br from-purple-400 to-blue-500 flex items-center justify-center">
          <span className="text-white text-4xl font-bold opacity-50">
            {article.title.charAt(0)}
          </span>
        </div>
      )}

      {/* Contenido */}
      <div className="p-6">
        {/* Categoría */}
        {article.category && (
          <span className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold mb-3">
            {article.category}
          </span>
        )}

        {/* Título */}
        <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-2 group-hover:text-purple-600 transition">
          {article.title}
        </h3>

        {/* Excerpt / Meta Description */}
        {article.meta_description && (
          <p className="text-gray-600 text-sm mb-4 line-clamp-3">
            {article.meta_description}
          </p>
        )}

        {/* Meta información */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500">
          {/* Autor */}
          {article.author && (
            <div className="flex items-center gap-1">
              <User className="w-4 h-4" />
              <span>{article.author.username || article.author.email}</span>
            </div>
          )}

          {/* Fecha */}
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(article.created_at)}</span>
          </div>

          {/* Tiempo de lectura */}
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{readingTime} min</span>
          </div>

          {/* Vistas */}
          {article.views > 0 && (
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span>{article.views}</span>
            </div>
          )}
        </div>

        {/* Tags */}
        {tagsArray.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {tagsArray.slice(0, 3).map((tag, index) => (
              <span
                key={index}
                className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
};

export default ArticleCard;
