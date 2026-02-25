/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        app: {
          loginBgStart: "hsl(var(--app-login-bg-start) / <alpha-value>)",
          loginBgEnd: "hsl(var(--app-login-bg-end) / <alpha-value>)",
          signupBgStart: "hsl(var(--app-signup-bg-start) / <alpha-value>)",
          signupBgEnd: "hsl(var(--app-signup-bg-end) / <alpha-value>)",
          card: "hsl(var(--app-card) / <alpha-value>)",
          cardSoft: "hsl(var(--app-card-soft) / <alpha-value>)",
          border: "hsl(var(--app-border) / <alpha-value>)",
          textPrimary: "hsl(var(--app-text-primary) / <alpha-value>)",
          textSecondary: "hsl(var(--app-text-secondary) / <alpha-value>)",
          primary: "hsl(var(--app-primary) / <alpha-value>)",
          primaryStrong: "hsl(var(--app-primary-strong) / <alpha-value>)",
          accent: "hsl(var(--app-accent) / <alpha-value>)",
          success: "hsl(var(--app-success) / <alpha-value>)",
        },
      },
    },
  },
  plugins: [],
};
