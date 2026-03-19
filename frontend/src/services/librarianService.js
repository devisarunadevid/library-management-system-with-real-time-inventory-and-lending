// src/services/bookService.js
import api from "./api";

// Get all books
export const getBooks = async () => {
  const response = await api.get("/librarian/books");
  return response.data;
};

// Add a book
export const addBook = async (book) => {
  const response = await api.post("/librarian/add-book", book);
  return response.data;
};

// (optional for later)
export const editBook = async (id, book) => {
  const response = await api.put(`/librarian/books/${id}`, book);
  return response.data;
};

export const deleteBook = async (id) => {
  const response = await api.delete(`/librarian/books/${id}`);
  return response.data;
};
