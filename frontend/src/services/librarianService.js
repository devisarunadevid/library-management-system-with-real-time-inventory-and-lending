// src/services/bookService.js
import axios from "axios";

const API_BASE = "http://localhost:8080/api/librarian";

// Get all books
export const getBooks = async () => {
  const response = await axios.get(`${API_BASE}/books`);
  return response.data;
};

// Add a book
export const addBook = async (book) => {
  const response = await axios.post(`${API_BASE}/add-book`, book);
  return response.data;
};

// (optional for later)
export const editBook = async (id, book) =>
  axios.put(`${API_BASE}/books/${id}`, book);

export const deleteBook = async (id) => axios.delete(`${API_BASE}/books/${id}`);
