import { useEffect, useState, useCallback } from "react";
import { bookService } from "../services/bookService";
import {
  BookOpen,
  Search,
  Plus,
  Book,
  BadgeCheck,
  Tags,
  Building2,
  Hash,
  Layers,
  Calendar,
  Pencil,
  Trash2,
  Sparkles,
  Star,
} from "lucide-react";

export default function BooksPage() {
  const [books, setBooks] = useState([]);
  const [titleAuthorQuery, setTitleAuthorQuery] = useState("");
  const [genreFilter, setGenreFilter] = useState("");
  const [publisherFilter, setPublisherFilter] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [newBook, setNewBook] = useState({
    title: "",
    author: "",
    isbn: "",
    genre: "",
    publisher: "",
    year: "",
    totalCopies: 1,
    availableCopies: 1,
    shelf: "",
    imageUrl: "",
  });
  const [editingBook, setEditingBook] = useState(null);

  const fetchBooks = useCallback(async (filters = {}) => {
    setLoading(true);
    setError("");
    try {
      let data;
      const hasFilters =
        filters.title || filters.author || filters.genre || filters.publisher;
      if (!hasFilters) data = await bookService.getAll();
      else {
        const normalized = {
          title: filters.title?.trim().toLowerCase() || "",
          author: filters.author?.trim().toLowerCase() || "",
          genre: filters.genre?.trim().toLowerCase() || "",
          publisher: filters.publisher?.trim().toLowerCase() || "",
        };
        data = await bookService.searchAdvanced(normalized);
      }
      setBooks(Array.isArray(data) ? data : data?.content || []);
    } catch (err) {
      console.error("Error fetching books:", err);
      setError("Failed to fetch books. Try again.");
      setBooks([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchBooks({
      title: titleAuthorQuery,
      author: titleAuthorQuery,
      genre: genreFilter,
      publisher: publisherFilter,
    });
  };

  const handleAdd = async () => {
    try {
      await bookService.add(newBook);
      setNewBook({
        title: "",
        author: "",
        isbn: "",
        genre: "",
        publisher: "",
        year: "",
        totalCopies: 1,
        availableCopies: 1,
        shelf: "",
        imageUrl: "",
      });
      fetchBooks();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (book) => setEditingBook(book);

  const handleUpdate = async () => {
    try {
      await bookService.update(editingBook.id, editingBook);
      setEditingBook(null);
      fetchBooks();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    if (confirm("Are you sure to delete this book?")) {
      await bookService.delete(id);
      fetchBooks();
    }
  };

  return (
    <div className="min-h-screen w-full relative">
      {/* Fixed background */}
      <div
        className="fixed inset-0 -z-10 bg-cover bg-center"
        style={{
          backgroundImage: "url('/bibliolibrary.jpg')",
          backgroundAttachment: "fixed",
        }}
      />
      <div className="fixed inset-0 -z-10 pointer-events-none bg-[radial-gradient(1200px_700px_at_50%_-10%,rgba(255,214,130,0.20),transparent_60%)]" />
      <div className="fixed inset-0 -z-10 pointer-events-none bg-[linear-gradient(180deg,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0.06)_100%)]" />

      <div className="relative h-screen overflow-y-auto">
        <div className="relative p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-4 flex items-center justify-between">
            <div className="inline-flex items-center gap-3 rounded-2xl border border-amber-300/40 bg-white/40 backdrop-blur-2xl px-4 py-2 shadow-[0_8px_30px_rgba(0,0,0,0.16)] text-brown-900 ring-1 ring-white/30">
              <span className="p-2 rounded-xl bg-gradient-to-br from-amber-300 to-orange-500 text-brown-900 shadow ring-1 ring-amber-200/50">
                <BookOpen className="w-5 h-5" />
              </span>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-amber-300 via-yellow-400 to-orange-500 drop-shadow-[0_1px_0_rgba(0,0,0,0.15)]">
                Manage Books
              </h1>
            </div>

            <div className="hidden sm:flex items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-xl border border-amber-300/40 bg-white/60 px-3 py-1.5 text-brown-900 shadow">
                <Book className="w-4 h-4 text-amber-600" />
                <span className="text-sm font-semibold">
                  Books: {books.length}
                </span>
              </span>
              <span className="text-amber-500 inline-flex items-center gap-1">
                <Star className="w-4 h-4" />
                <Sparkles className="w-4 h-4" />
              </span>
            </div>
          </div>

          {/* Search */}
          <form
            className="mb-6 grid grid-cols-1 md:grid-cols-5 gap-3 rounded-2xl border border-white/40 bg-white/60 backdrop-blur-2xl p-4 text-brown-900"
            onSubmit={handleSearch}
          >
            <div className="relative md:col-span-2">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-amber-600" />
              <input
                type="text"
                placeholder="Search by title or author"
                value={titleAuthorQuery}
                onChange={(e) => setTitleAuthorQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/80 border border-white/60 text-brown-900 placeholder:text-brown-600 outline-none focus:ring-2 focus:ring-amber-300/60"
              />
            </div>
            <input
              type="text"
              placeholder="Genre"
              value={genreFilter}
              onChange={(e) => setGenreFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white/80 border border-white/60 text-brown-900 placeholder:text-brown-600 outline-none focus:ring-2 focus:ring-amber-300/60"
            />
            <input
              type="text"
              placeholder="Publisher"
              value={publisherFilter}
              onChange={(e) => setPublisherFilter(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-white/80 border border-white/60 text-brown-900 placeholder:text-brown-600 outline-none focus:ring-2 focus:ring-amber-300/60"
            />
            <button
              type="submit"
              className="w-full md:w-auto inline-flex items-center justify-center rounded-xl border border-amber-300/60 bg-gradient-to-r from-amber-400 via-orange-500 to-rose-500 text-white px-4 py-2 font-semibold shadow hover:brightness-105 transition-all ring-1 ring-white/30"
            >
              <Search className="w-4 h-4" />
              <span className="ml-2">Search</span>
            </button>
          </form>

          {/* Add / Edit Section */}
          <div className="mb-6 rounded-2xl border border-white/40 bg-white/60 backdrop-blur-2xl p-4 text-brown-900">
            <div className="mb-4 font-semibold">Add / Edit Book</div>
            <div className="mb-4 grid grid-cols-1 md:grid-cols-6 gap-3">
              {/* Title */}
              <input
                type="text"
                placeholder="Title"
                value={editingBook?.title || newBook.title}
                onChange={(e) =>
                  editingBook
                    ? setEditingBook({ ...editingBook, title: e.target.value })
                    : setNewBook({ ...newBook, title: e.target.value })
                }
                className="border border-white/60 bg-white/80 text-brown-900 px-3 py-2 rounded-xl outline-none focus:ring-2 focus:ring-amber-300/60"
              />
              {/* Author */}
              <input
                type="text"
                placeholder="Author"
                value={editingBook?.author || newBook.author}
                onChange={(e) =>
                  editingBook
                    ? setEditingBook({ ...editingBook, author: e.target.value })
                    : setNewBook({ ...newBook, author: e.target.value })
                }
                className="border border-white/60 bg-white/80 text-brown-900 px-3 py-2 rounded-xl outline-none focus:ring-2 focus:ring-amber-300/60"
              />
              {/* ISBN */}
              <input
                type="text"
                placeholder="ISBN"
                value={editingBook?.isbn || newBook.isbn}
                onChange={(e) =>
                  editingBook
                    ? setEditingBook({ ...editingBook, isbn: e.target.value })
                    : setNewBook({ ...newBook, isbn: e.target.value })
                }
                className="border border-white/60 bg-white/80 text-brown-900 px-3 py-2 rounded-xl outline-none focus:ring-2 focus:ring-amber-300/60"
              />
              {/* Genre */}
              <input
                type="text"
                placeholder="Genre"
                value={editingBook?.genre || newBook.genre || ""}
                onChange={(e) =>
                  editingBook
                    ? setEditingBook({ ...editingBook, genre: e.target.value })
                    : setNewBook({ ...newBook, genre: e.target.value })
                }
                className="border border-white/60 bg-white/80 text-brown-900 px-3 py-2 rounded-xl outline-none focus:ring-2 focus:ring-amber-300/60"
              />
              {/* Publisher */}
              <input
                type="text"
                placeholder="Publisher"
                value={editingBook?.publisher || newBook.publisher || ""}
                onChange={(e) =>
                  editingBook
                    ? setEditingBook({
                        ...editingBook,
                        publisher: e.target.value,
                      })
                    : setNewBook({ ...newBook, publisher: e.target.value })
                }
                className="border border-white/60 bg-white/80 text-brown-900 px-3 py-2 rounded-xl outline-none focus:ring-2 focus:ring-amber-300/60"
              />
              {/* Year */}
              <input
                type="number"
                placeholder="Year"
                value={editingBook?.year || newBook.year || ""}
                onChange={(e) =>
                  editingBook
                    ? setEditingBook({
                        ...editingBook,
                        year: e.target.value ? parseInt(e.target.value) : "",
                      })
                    : setNewBook({
                        ...newBook,
                        year: e.target.value ? parseInt(e.target.value) : "",
                      })
                }
                className="border border-white/60 bg-white/80 text-brown-900 px-3 py-2 rounded-xl outline-none focus:ring-2 focus:ring-amber-300/60"
              />
              {/* Image URL */}
              <input
                type="text"
                placeholder="Image URL"
                value={editingBook?.imageUrl || newBook.imageUrl || ""}
                onChange={(e) =>
                  editingBook
                    ? setEditingBook({
                        ...editingBook,
                        imageUrl: e.target.value,
                      })
                    : setNewBook({ ...newBook, imageUrl: e.target.value })
                }
                className="border border-white/60 bg-white/80 text-brown-900 px-3 py-2 rounded-xl outline-none focus:ring-2 focus:ring-amber-300/60"
              />
              {/* Total Copies */}
              <input
                type="number"
                placeholder="Total Copies"
                min={0}
                value={editingBook?.totalCopies ?? newBook.totalCopies ?? 1}
                onChange={(e) =>
                  editingBook
                    ? setEditingBook({
                        ...editingBook,
                        totalCopies: parseInt(e.target.value || "0"),
                      })
                    : setNewBook({
                        ...newBook,
                        totalCopies: parseInt(e.target.value || "0"),
                      })
                }
                className="border border-white/60 bg-white/80 text-brown-900 px-3 py-2 rounded-xl outline-none focus:ring-2 focus:ring-amber-300/60"
              />
              {/* Available Copies */}
              <input
                type="number"
                placeholder="Available Copies"
                min={0}
                value={
                  editingBook?.availableCopies ?? newBook.availableCopies ?? 1
                }
                onChange={(e) =>
                  editingBook
                    ? setEditingBook({
                        ...editingBook,
                        availableCopies: parseInt(e.target.value || "0"),
                      })
                    : setNewBook({
                        ...newBook,
                        availableCopies: parseInt(e.target.value || "0"),
                      })
                }
                className="border border-white/60 bg-white/80 text-brown-900 px-3 py-2 rounded-xl outline-none focus:ring-2 focus:ring-amber-300/60"
              />
              {/* Shelf */}
              <input
                type="text"
                placeholder="Shelf"
                value={editingBook?.shelf || newBook.shelf || ""}
                onChange={(e) =>
                  editingBook
                    ? setEditingBook({ ...editingBook, shelf: e.target.value })
                    : setNewBook({ ...newBook, shelf: e.target.value })
                }
                className="border border-white/60 bg-white/80 text-brown-900 px-3 py-2 rounded-xl outline-none focus:ring-2 focus:ring-amber-300/60"
              />
            </div>

            <div className="flex gap-2 flex-wrap">
              <button
                onClick={editingBook ? handleUpdate : handleAdd}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-white font-medium transition ring-1 ring-white/30 ${
                  editingBook
                    ? "border border-amber-300/60 bg-gradient-to-r from-amber-400 to-yellow-600 hover:brightness-105"
                    : "border border-emerald-300/60 bg-gradient-to-r from-emerald-500 to-teal-600 hover:brightness-105"
                }`}
              >
                <Plus className="w-4 h-4" />
                {editingBook ? "Update Book" : "Add Book"}
              </button>
              {editingBook && (
                <button
                  onClick={() => setEditingBook(null)}
                  className="px-4 py-2 rounded-xl bg-white/70 text-brown-900 border border-white/60 hover:bg-white/90 transition"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>

          {/* Book Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
            {!loading && books.length === 0 && (
              <p className="text-brown-900 bg-white/70 inline-block rounded-xl px-3 py-2">
                No books found
              </p>
            )}

            {books.map((b) => {
              const status = String(b.status || "").toUpperCase();
              const statusClasses =
                status === "AVAILABLE"
                  ? "bg-emerald-100 text-emerald-700 border-emerald-300"
                  : "bg-amber-100 text-amber-700 border-amber-300";

              return (
                <div
                  key={b.id || b._id || `${b.title}-${Math.random()}`}
                  className="group relative rounded-3xl border border-white/40 bg-white/85 text-brown-900 shadow-xl p-5 overflow-hidden transition-all hover:shadow-2xl hover:-translate-y-0.5"
                >
                  {/* Background effect */}
                  <div className="absolute -right-10 -top-10 w-36 h-36 rounded-full bg-gradient-to-br from-amber-300/50 to-orange-400/50 blur-2xl group-hover:scale-110 transition-transform" />

                  {/* Image + Info */}
                  <div className="flex items-start gap-4">
                    <div className="relative w-20 h-28">
                      <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-br from-amber-300 via-yellow-400 to-orange-500 opacity-60 blur-sm transition-all duration-300 group-hover:opacity-100 group-hover:blur" />
                      <div className="relative h-full w-full rounded-2xl overflow-hidden ring-1 ring-white/50 shadow-[0_8px_30px_rgba(255,200,100,0.35)]">
                        <img
                          src={b.imageUrl || "/book-placeholder.png"}
                          alt={b.title}
                          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110 group-hover:rotate-1"
                        />
                        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-white/10 mix-blend-overlay" />
                        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_40%_at_50%_20%,rgba(255,215,128,0.25),transparent)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="pointer-events-none absolute -left-1/2 top-0 h-full w-2/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-[100%] group-hover:translate-x-[200%] transition-transform duration-700 ease-out" />
                        <div className="pointer-events-none absolute -left-2 -top-2 h-6 w-6 rotate-45 bg-gradient-to-br from-amber-300 to-orange-500 shadow" />
                      </div>
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-lg font-extrabold tracking-tight line-clamp-2">
                        {b.title}
                      </h3>
                      <p className="text-brown-800/85">{b.author}</p>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="mt-3 space-y-1.5 text-sm">
                    <div className="flex items-center gap-2 text-brown-800/90">
                      <Building2 className="w-4 h-4 text-amber-600/80" />
                      <span className="truncate">{b.publisher || "N/A"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-brown-800/90">
                      <Hash className="w-4 h-4 text-amber-600/80" />
                      <span className="truncate">ISBN: {b.isbn}</span>
                    </div>
                    <div className="flex items-center gap-2 text-brown-800/90">
                      <Tags className="w-4 h-4 text-amber-600/80" />
                      <span className="truncate">
                        Genre: {b.genre || "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-brown-800/90">
                      <Calendar className="w-4 h-4 text-amber-600/80" />
                      <span className="truncate">Year: {b.year || "N/A"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-brown-800/90">
                      <Layers className="w-4 h-4 text-amber-600/80" />
                      <span className="truncate">
                        Shelf: {b.shelf || "N/A"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <BadgeCheck className="w-4 h-4 text-amber-600/80" />
                      <span
                        className={`inline-flex items-center rounded-xl px-2 py-0.5 text-xs border ${statusClasses}`}
                      >
                        Status: {status || "N/A"}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-4 flex justify-end gap-2">
                    <button
                      onClick={() => handleEdit(b)}
                      className="inline-flex items-center gap-2 rounded-xl border border-amber-300/60 bg-gradient-to-r from-amber-400 to-orange-500 text-white px-3 py-1.5 font-medium shadow hover:brightness-105 hover:-translate-y-0.5 transition-all ring-1 ring-white/30"
                    >
                      <Pencil className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(b.id)}
                      className="inline-flex items-center gap-2 rounded-xl border border-rose-300/60 bg-gradient-to-r from-rose-500 to-pink-600 text-white px-3 py-1.5 font-medium shadow hover:brightness-105 hover:-translate-y-0.5 transition-all ring-1 ring-white/30"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>

                  <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-black/5 group-hover:ring-black/10 transition" />
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
