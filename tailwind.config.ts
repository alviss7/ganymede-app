import type { Config } from "tailwindcss";
import createPlugin from "tailwindcss/plugin";

import typography from "@tailwindcss/typography";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      container: {
        center: true,
        padding: "2rem",
        screens: {
          "2xl": "1400px",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: {
          DEFAULT: "hsl(var(--foreground))",
          800: "hsl(var(--foreground-800))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
          800: "hsl(var(--primary-800))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", '"Helvetica Neue"', "sans-serif"],
        liberation: ["Liberation", "var(--font-sans)", "sans-serif"],
      },
    },
  },
  plugins: [
    tailwindcssAnimate,
    typography,
    createPlugin(({ addUtilities, addVariant }) => {
      addUtilities({
        ".center-absolute": {
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
        },
        ".center-y-absolute": {
          position: "absolute",
          top: "50%",
          transform: "translateY(-50%)",
        },
      });

      addVariant("has-value", [':not(&[value=""])', "&:not([value])"]);
      addVariant("peer-has-value", [
        ':merge(.peer):not([value=""]) ~ &',
        ":merge(.peer):not([value]) ~ &",
      ]);
    }),
  ],
} satisfies Config;
