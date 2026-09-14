/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx,vue}"],
  // theme: {
  //   extend: {
  //     fontFamily: {
  //       sans: ["Inter", "Roboto", "Arial", "sans-serif"],
  //       display: ["Inter", "Roboto", "Arial", "sans-serif"],
  //       mono: [
  //         "ui-monospace",
  //         "SFMono-Regular",
  //         "Menlo",
  //         "Monaco",
  //         "monospace",
  //       ],
  //       galaxy: ["Orbitron", "sans-serif"],
  //     },
  //     colors: {
  //       nvidiaGreen: "#76B900",
  //       nvidiaBlue: "#00F0FF",
  //       nvidiaDark: "#0B0B0B", // ✅ this defines bg-nvidiaDark
  //     },
  //   },
  // },
  theme: {
    extend: {
      colors: {
        nvidiaDark: "#0B0B0B", // or your preferred NVIDIA dark shade
        // Brand green, sampled from the logo's green strand (#50C040) and
        // ramped around it. Overriding Tailwind's `green` retunes every
        // green-400/500/600 accent on the site from one place.
        green: {
          50: "#F0FBEC",
          100: "#DCF6D4",
          200: "#C8F0BE",
          300: "#A0E48F",
          400: "#6FD45E",
          500: "#50C040",
          600: "#3FA332",
          700: "#328128",
          800: "#276521",
          900: "#1B4517",
          950: "#0D250B",
        },
      },
      // Apple.com type ramp (apple.com global typography).
      // Sizes in px with Apple's paired line-height + tracking; font
      // families are untouched.
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1.33337", letterSpacing: "-0.01em" }], // 12px – caption
        sm: ["0.875rem", { lineHeight: "1.42859", letterSpacing: "-0.016em" }], // 14px – footnote
        base: ["1.0625rem", { lineHeight: "1.47059", letterSpacing: "-0.022em" }], // 17px – body
        lg: ["1.1875rem", { lineHeight: "1.42105", letterSpacing: "-0.022em" }], // 19px – body large
        xl: ["1.3125rem", { lineHeight: "1.38105", letterSpacing: "0.011em" }], // 21px – intro
        "2xl": ["1.5rem", { lineHeight: "1.16667", letterSpacing: "0.009em" }], // 24px – subhead
        "3xl": ["1.75rem", { lineHeight: "1.14286", letterSpacing: "0.007em" }], // 28px – headline sm
        "4xl": ["2rem", { lineHeight: "1.125", letterSpacing: "0.004em" }], // 32px – headline
        "5xl": ["2.5rem", { lineHeight: "1.1", letterSpacing: "0em" }], // 40px – headline lg
        "6xl": ["3rem", { lineHeight: "1.08349", letterSpacing: "-0.003em" }], // 48px – display
        "7xl": ["3.5rem", { lineHeight: "1.07143", letterSpacing: "-0.005em" }], // 56px – display lg
        "8xl": ["4rem", { lineHeight: "1.0625", letterSpacing: "-0.009em" }], // 64px – hero
        "9xl": ["5rem", { lineHeight: "1.05", letterSpacing: "-0.015em" }], // 80px – hero xl
      },
      fontFamily: {
        // galaxy: ["Montserrat", "sans-serif"], // replace with Montserrat if you prefer
        display: ["Poppins", "sans-serif"], // or your Galaxy AI font
        sans: ["Inter", "sans-serif"],
      },
      keyframes: {
        sparkle: {
          "0%, 100%": { filter: "drop-shadow(0 0 10px rgba(250,204,21,0.6))" },
          "50%": { filter: "drop-shadow(0 0 30px rgba(250,204,21,1))" },
        },
        spinSlow: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
      },
      animation: {
        sparkle: "sparkle 1.5s ease-in-out infinite",
        spinSlow: "spinSlow 20s linear infinite",
      },
    },
  },

  plugins: [],
};
