import { supabase } from "./supabase";

// ========== FAVORITOS ==========

export const getFavorites = async (userId) => {
  const { data, error } = await supabase
    .from("favorites")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data.map((fav) => fav.book_data);
};

export const addFavorite = async (userId, book) => {
  const { data, error } = await supabase
    .from("favorites")
    .insert({
      user_id: userId,
      book_id: book.id,
      book_data: book,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const removeFavorite = async (userId, bookId) => {
  const { error } = await supabase
    .from("favorites")
    .delete()
    .eq("user_id", userId)
    .eq("book_id", bookId);

  if (error) throw error;
};

// ========== BIBLIOTECA ==========

export const getLibrary = async (userId) => {
  const { data, error } = await supabase
    .from("library")
    .select("*")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) throw error;

  // Organizar por estantes
  const library = {
    wantToRead: [],
    reading: [],
    read: [],
  };

  data.forEach((item) => {
    library[item.shelf].push(item.book_data);
  });

  return library;
};

export const addToLibrary = async (userId, book, shelf) => {
  // Primero eliminar de otros estantes si existe
  await supabase
    .from("library")
    .delete()
    .eq("user_id", userId)
    .eq("book_id", book.id);

  // Luego añadir al nuevo estante
  const { data, error } = await supabase
    .from("library")
    .insert({
      user_id: userId,
      book_id: book.id,
      book_data: book,
      shelf: shelf,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const removeFromLibrary = async (userId, bookId) => {
  const { error } = await supabase
    .from("library")
    .delete()
    .eq("user_id", userId)
    .eq("book_id", bookId);

  if (error) throw error;
};
