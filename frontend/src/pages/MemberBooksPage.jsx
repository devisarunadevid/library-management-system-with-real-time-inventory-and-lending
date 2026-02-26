// src/pages/MemberBooksPage.jsx
import { useEffect, useState } from "react";
import { bookService } from "../services/bookService";
import {
  Search,
  Book,
  Building2,
  Hash,
  Tags,
  BadgeCheck,
  Calendar,
  Layers,
} from "lucide-react";

export default function MemberBooksPage() {
  const [books, setBooks] = useState([]);
  const [titleAuthorQuery, setTitleAuthorQuery] = useState("");
  const [genreQuery, setGenreQuery] = useState("");
  const [publisherQuery, setPublisherQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchBooks = async (filters = {}) => {
    setLoading(true);
    setError("");
    try {
      let data;
      const hasFilters =
        filters.title || filters.author || filters.genre || filters.publisher;
      if (!hasFilters) {
        data = await bookService.getAll();
      } else {
        const normalizedFilters = {
          title: filters.title?.trim().toLowerCase() || "",
          author: filters.author?.trim().toLowerCase() || "",
          genre: filters.genre?.trim().toLowerCase() || "",
          publisher: filters.publisher?.trim().toLowerCase() || "",
        };
        data = await bookService.searchAdvanced(normalizedFilters);
      }
      const booksArray = Array.isArray(data) ? data : data.content || [];
      setBooks(booksArray);
    } catch (err) {
      console.error("Error fetching books:", err);
      setError("Failed to fetch books. Try again.");
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBooks();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchBooks({
      title: titleAuthorQuery,
      author: titleAuthorQuery,
      genre: genreQuery,
      publisher: publisherQuery,
    });
  };

  const handleBorrow = async (bookId) => {
    try {
      const userStr = localStorage.getItem("user");
      if (!userStr) throw new Error("User not logged in");
      const user = JSON.parse(userStr);
      await bookService.borrowBook(bookId, user.email);
      alert("Borrow request submitted! Wait for approval.");
      fetchBooks({
        title: titleAuthorQuery,
        author: titleAuthorQuery,
        genre: genreQuery,
        publisher: publisherQuery,
      });
    } catch (err) {
      alert(err.response?.data?.message || err.message);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 flex-1 overflow-auto">
      <div className="inline-flex items-center gap-3 rounded-2xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.12)_0%,rgba(255,255,255,0.04)_100%)] px-4 py-2 backdrop-blur-xl shadow-[0_8px_30px_rgba(0,0,0,0.16)] mb-4">
        <span className="text-xl">📚</span>
        <h1 className="text-xl sm:text-2xl font-extrabold tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-amber-200 via-amber-300 to-amber-100">
          Browse Books
        </h1>
      </div>

      <form
        className="mb-6 grid grid-cols-1 md:grid-cols-5 gap-3 rounded-2xl border border-white/10 bg-white/10 backdrop-blur-xl p-4"
        onSubmit={handleSearch}
      >
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-white/70" />
          <input
            type="text"
            placeholder="Search by title or author"
            value={titleAuthorQuery}
            onChange={(e) => setTitleAuthorQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/20 border border-white/20 text-white placeholder:text-white/75 outline-none focus:ring-2 focus:ring-amber-300/40"
          />
        </div>
        <input
          type="text"
          placeholder="Genre"
          value={genreQuery}
          onChange={(e) => setGenreQuery(e.target.value)}
          className="w-full px-3 py-2 rounded-xl bg-white/20 border border-white/20 text-white placeholder:text-white/75 outline-none focus:ring-2 focus:ring-amber-300/40"
        />
        <input
          type="text"
          placeholder="Publisher"
          value={publisherQuery}
          onChange={(e) => setPublisherQuery(e.target.value)}
          className="w-full px-3 py-2 rounded-xl bg-white/20 border border-white/20 text-white placeholder:text-white/75 outline-none focus:ring-2 focus:ring-amber-300/40"
        />
        <button
          type="submit"
          className="w-full md:w-auto inline-flex items-center justify-center rounded-xl border border-amber-300/30 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-2 font-semibold shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_8px_20px_rgba(245,158,11,0.35)] hover:-translate-y-0.5 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_12px_32px_rgba(245,158,11,0.5)] active:translate-y-0 transition-all"
        >
          <Search className="w-4 h-4" />
          <span className="ml-2">Search</span>
        </button>
      </form>

      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="h-40 rounded-3xl border border-white/15 bg-white/30 animate-pulse"
            />
          ))}
        </div>
      )}
      {error && <p className="text-rose-200">{error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
        {!loading && books.length === 0 && (
          <p className="text-white/90">No books found</p>
        )}
        {books.map((b) => {
          const status = String(b.status || "").toUpperCase();
          const statusClasses =
            status === "AVAILABLE"
              ? "bg-emerald-500/15 text-emerald-700 border-emerald-400/30"
              : "bg-amber-500/15 text-amber-700 border-amber-400/30";

          const imageUrl =
            b.imageUrl ??
            b.image_url ??
            b.coverUrl ??
            b.cover_url ??
            b.thumbnail ??
            null;

          return (
            <div
              key={b.id || b._id || b.isbn}
              className="group relative rounded-3xl border border-white/15 bg-white/85 text-stone-900 shadow-xl p-5 overflow-hidden transition-all hover:shadow-2xl hover:-translate-y-0.5"
            >
              <div className="absolute -right-10 -top-10 w-36 h-36 rounded-full bg-gradient-to-br from-amber-300/40 to-orange-400/40 blur-2xl group-hover:scale-110 transition-transform" />

              <div className="flex items-start gap-4">
                {/* Image area enhanced (attractive, unique, aesthetic) */}
                {imageUrl ? (
                  <div className="relative w-20 h-28 flex-shrink-0">
                    <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-br from-amber-300 via-yellow-400 to-orange-500 opacity-60 blur-sm transition-all duration-300 group-hover:opacity-100 group-hover:blur" />
                    <div className="relative h-full w-full rounded-2xl overflow-hidden ring-1 ring-white/60 shadow-[0_8px_30px_rgba(255,200,100,0.35)]">
                      <img
                        src={imageUrl}
                        alt={b.title || "Book cover"}
                        className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110 group-hover:rotate-1"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = "/book-placeholder.png";
                        }}
                      />
                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-white/10 mix-blend-overlay" />
                      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(60%_40%_at_50%_20%,rgba(255,215,128,0.25),transparent)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      <div className="pointer-events-none absolute -left-1/2 top-0 h-full w-2/3 -skew-x-12 bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-[100%] group-hover:translate-x-[200%] transition-transform duration-700 ease-out" />
                      <div className="pointer-events-none absolute -left-2 -top-2 h-6 w-6 rotate-45 bg-gradient-to-br from-amber-300 to-orange-500 shadow" />
                    </div>
                  </div>
                ) : (
                  <div className="shrink-0 p-3 rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-brown-900 shadow ring-1 ring-white/50">
                    <Book className="w-6 h-6" />
                  </div>
                )}

                <div className="min-w-0">
                  <h3 className="text-lg font-extrabold tracking-tight line-clamp-2">
                    {b.title}
                  </h3>
                  <p className="text-stone-600">{b.author}</p>
                </div>
              </div>

              <div className="mt-3 space-y-1.5 text-sm">
                <div className="flex items-center gap-2 text-stone-700">
                  <Building2 className="w-4 h-4 text-stone-500" />
                  <span className="truncate">{b.publisher || "N/A"}</span>
                </div>
                <div className="flex items-center gap-2 text-stone-700">
                  <Hash className="w-4 h-4 text-stone-500" />
                  <span className="truncate">ISBN: {b.isbn}</span>
                </div>
                <div className="flex items-center gap-2 text-stone-700">
                  <Tags className="w-4 h-4 text-stone-500" />
                  <span className="truncate">Genre: {b.genre || "N/A"}</span>
                </div>
                <div className="flex items-center gap-2 text-stone-700">
                  <Calendar className="w-4 h-4 text-stone-500" />
                  <span className="truncate">Year: {b.year || "N/A"}</span>
                </div>
                <div className="flex items-center gap-2 text-stone-700">
                  <Layers className="w-4 h-4 text-stone-500" />
                  <span className="truncate">Shelf: {b.shelf || "N/A"}</span>
                </div>
                <div className="flex items-center gap-2">
                  <BadgeCheck className="w-4 h-4 text-stone-500" />
                  <span
                    className={`inline-flex items-center rounded-xl px-2 py-0.5 text-xs border ${statusClasses}`}
                  >
                    Status: {status || "N/A"}
                  </span>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                {status === "AVAILABLE" && (
                  <button
                    onClick={() => handleBorrow(b.id)}
                    className="inline-flex items-center gap-2 rounded-xl border border-amber-300/30 bg-gradient-to-r from-amber-500 to-orange-500 text-white px-3 py-1.5 font-medium shadow-[inset_0_1px_0_rgba(255,255,255,0.2),0_8px_20px_rgba(245,158,11,0.35)] hover:brightness-105 hover:-translate-y-0.5 hover:shadow-[inset_0_1px_0_rgba(255,255,255,0.25),0_12px_32px_rgba(245,158,11,0.5)] active:translate-y-0 transition-all"
                  >
                    <Book className="w-4 h-4" />
                    <span>Borrow</span>
                  </button>
                )}
              </div>

              <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-black/5 group-hover:ring-black/10 transition" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
