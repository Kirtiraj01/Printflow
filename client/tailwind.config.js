/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#F5A623',
          dark: '#D9861A',
        },
        ink: '#1E1E1E',
        muted: '#7A7670',
        surface: '#FFFFFF',
        page: '#FDF8EF',
        success: '#4CAF50',
        danger: '#E24B4A',
      },
      fontFamily: {
        sans: ['Poppins', 'system-ui', '-apple-system', 'sans-serif'],
      },
      borderRadius: {
        'card': '16px',
        'btn': '16px',
        'sheet': '24px',
        'pill': '9999px',
      },
      boxShadow: {
        'soft': '0 4px 16px rgba(30, 30, 30, 0.08)',
        'soft-lg': '0 8px 24px rgba(30, 30, 30, 0.12)',
      },
    },
  },
  plugins: [],
}
