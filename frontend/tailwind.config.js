import typography from "@tailwindcss/typography";

export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui"],
        display: ["Newsreader", "Georgia", "serif"]
      },
      colors: {
        ink: "#111827",
        paper: "#f7fbfd",
        flame: "#ff7a1a",
        ocean: "#0f766e",
        berry: "#8b5cf6"
      },
      boxShadow: {
        glow: "0 24px 80px rgba(15, 23, 42, 0.12)"
      },
      backgroundImage: {
        "hero-photo":
          "linear-gradient(120deg, rgba(6, 13, 28, .84), rgba(6, 13, 28, .52)), url('https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1600&q=80')"
      }
    }
  },
  plugins: [typography]
};
