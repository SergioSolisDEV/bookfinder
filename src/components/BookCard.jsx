import React, { useState } from 'react';
import { BookOpen, Heart, Star } from 'lucide-react';

function BookCard({ book, onClick, isFavorite, onToggleFavorite, showActions = true }) {
  const [isAnimating, setIsAnimating] = useState(false);

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    
    // Activar animación
    setIsAnimating(true);
    setTimeout(() => setIsAnimating(false), 600);
    
    onToggleFavorite(book);
  };

  return (
    <div
      onClick={() => onClick(book)}
      className="bg-white rounded-xl shadow-md hover:shadow-xl transition cursor-pointer overflow-hidden relative group"
    >
      {/* Botón de favorito */}
      {showActions && (
        <button
          onClick={handleFavoriteClick}
          className="absolute top-3 right-3 z-10 bg-white rounded-full p-2 shadow-lg md:opacity-0 md:group-hover:opacity-100 transition"
          aria-label="Marcar como favorito"
        >
          <Heart
            className={`w-5 h-5 transition-all duration-300 ${
              isFavorite 
                ? 'fill-red-500 text-red-500' 
                : 'text-gray-600 hover:text-red-500'
            } ${
              isAnimating ? 'animate-heartBeat' : ''
            }`}
          />
        </button>
      )}

      {/* Imagen del libro */}
      <div className="h-64 bg-gray-200 flex items-center justify-center overflow-hidden">
        {book.volumeInfo.imageLinks?.thumbnail ? (
          <img
            src={book.volumeInfo.imageLinks.thumbnail
              .replace('http:', 'https:')
              .replace('&edge=curl', '')
              .replace('zoom=1', 'zoom=2')}
            alt={book.volumeInfo.title}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <BookOpen className="w-16 h-16 text-gray-400" />
        )}
      </div>

      {/* Información del libro */}
      <div className="p-4">
        <h3 className="font-bold text-lg mb-2 line-clamp-2">
          {book.volumeInfo.title}
        </h3>
        <p className="text-gray-600 text-sm mb-2">
          {book.volumeInfo.authors?.join(', ') || 'Autor desconocido'}
        </p>

        {/* Rating si existe */}
        {book.volumeInfo.averageRating && (
          <div className="flex items-center gap-1 mb-2">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm text-gray-700">
              {book.volumeInfo.averageRating.toFixed(1)}
            </span>
          </div>
        )}

        <p className="text-gray-500 text-sm line-clamp-2">
          {book.volumeInfo.description || 'Sin descripción disponible'}
        </p>
      </div>
    </div>
  );
}

export default BookCard;