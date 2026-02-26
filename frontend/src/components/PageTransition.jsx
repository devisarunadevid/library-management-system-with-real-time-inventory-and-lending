// PageTransition.jsx
import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";

export default function PageTransition() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      animate={{ opacity: 0 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 2.8, ease: [0.22, 1, 0.36, 1] }} // ⏳ extra slow fade-out
      className="fixed inset-0 z-[999] pointer-events-none"
    >
      {/* Visible background (stays crisp) */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/libraryimg.jpeg')" }}
      />

      {/* Soft golden glow + subtle veil */}
      <div className="absolute inset-0 bg-[radial-gradient(1200px_700px_at_50%_-10%,rgba(255,214,130,0.20),transparent_60%)]" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0.06)_100%)]" />

      {/* Gentle golden sweep across the page */}
      <motion.div
        initial={{ x: "-120%", opacity: 0.35 }}
        animate={{ x: "120%", opacity: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 3.2, ease: [0.22, 1, 0.36, 1] }} // ⏳ slower sweeping motion
        className="absolute inset-y-0 left-0 w-[38%] bg-gradient-to-r from-amber-300/60 via-amber-200/40 to-transparent blur-md"
      />

      {/* Center crest (icon + title) */}
      <motion.div
        initial={{ y: 20, scale: 0.94, opacity: 0 }}
        animate={{ y: 0, scale: 1, opacity: 1 }}
        exit={{ y: -20, scale: 0.97, opacity: 0 }}
        transition={{ duration: 2.4, ease: [0.22, 1, 0.36, 1] }} // ⏳ smoother fade and scale
        className="absolute inset-0 flex items-center justify-center"
      >
        <div className="rounded-2xl border border-amber-300/40 bg-white/50 backdrop-blur-xl px-5 py-3 shadow-[0_12px_40px_rgba(0,0,0,0.18)] ring-1 ring-white/40 text-brown-900 flex items-center gap-2.5">
          <span className="p-2 rounded-xl bg-gradient-to-br from-amber-300 to-orange-500 text-brown-900 shadow ring-1 ring-amber-200/50">
            <BookOpen className="w-5 h-5" />
          </span>
          <span className="text-lg sm:text-xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-amber-300 via-yellow-400 to-orange-500">
            Loading Library
          </span>
        </div>
      </motion.div>

      {/* Minimal shelves hint at the bottom */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 w-[72%] max-w-4xl">
        <motion.div
          initial={{ width: "0%", opacity: 0.6 }}
          animate={{ width: "100%", opacity: 0.15 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 2.4, ease: [0.22, 1, 0.36, 1] }} // ⏳ slower shelves animation
          className="h-1.5 rounded-full bg-gradient-to-r from-amber-400 via-amber-300 to-amber-200"
        />
        <motion.div
          initial={{ width: "0%", opacity: 0.6 }}
          animate={{ width: "82%", opacity: 0.12 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: 2.4,
            delay: 0.2,
            ease: [0.22, 1, 0.36, 1],
          }} // ⏳ delayed second line
          className="mt-2 h-1.5 rounded-full bg-gradient-to-r from-amber-400 via-amber-300 to-amber-200"
        />
        <motion.div
          initial={{ width: "0%", opacity: 0.6 }}
          animate={{ width: "64%", opacity: 0.1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: 2.4,
            delay: 0.4,
            ease: [0.22, 1, 0.36, 1],
          }} // ⏳ delayed third line
          className="mt-2 h-1.5 rounded-full bg-gradient-to-r from-amber-400 via-amber-300 to-amber-200"
        />
      </div>
    </motion.div>
  );
}
