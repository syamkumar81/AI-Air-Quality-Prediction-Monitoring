/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Core Theme Palette
        theme: {
          emerald: '#0D9B76',
          emeraldHover: '#0FB388',
          emeraldLight: '#14C597',
          emeraldDark: '#097055',
          cyan: '#36C5F0',
          cyanHover: '#52CEF4',
          cyanLight: '#72D7F7',
          cyanDark: '#1E9DC4',
          navy: '#0B1724',
          navyDark: '#070F18',
          navySurface: '#0F1F33',
          navyCard: '#13253B',
          navyCardLight: '#18304B',
          navyBorder: '#1E3A5F',
          navyBorderSubtle: '#162C48',
        },
        // AQI Standard Categories
        aqi: {
          good: "#0D9B76",          // Emerald Green (0-50)
          satisfactory: "#22C55E",  // Light Green (51-100)
          moderate: "#EAB308",      // Yellow/Amber (101-200)
          poor: "#F97316",          // Orange (201-300)
          verypoor: "#EF4444",      // Red (301-400)
          severe: "#991B1B",        // Dark Red (401-500)
        },
        // Primary alias mapped to Emerald & Cyan spectrum
        primary: {
          50: '#e6faf5',
          100: '#c5f3e7',
          200: '#94e9d3',
          300: '#5dd8bc',
          400: '#2ec19f',
          500: '#0D9B76', // Emerald Green
          600: '#0b8263',
          700: '#096a51',
          800: '#085340',
          900: '#0B1724', // Deep Navy
        },
        cyan: {
          400: '#52CEF4',
          500: '#36C5F0', // Cyan Blue
          600: '#1E9DC4',
        },
        eco: {
          50: '#e6faf5',
          100: '#c5f3e7',
          500: '#0D9B76',
          600: '#0b8263',
          700: '#096a51',
        },
        canvas: {
          bg: '#0B1724',
          card: '#0F1F33',
          border: '#1B3554',
          borderLight: '#23446B',
          navy: '#0B1724',
          muted: '#8FA3BF',
        }
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        subtle: '0 1px 3px 0 rgba(0, 0, 0, 0.25)',
        card: '0 4px 20px -2px rgba(0, 0, 0, 0.4), 0 0 1px 1px rgba(54, 197, 240, 0.12)',
        cardHover: '0 14px 35px -4px rgba(0, 0, 0, 0.55), 0 0 20px 2px rgba(54, 197, 240, 0.25)',
        highlight: '0 10px 25px -3px rgba(13, 155, 118, 0.35)',
        glowEmerald: '0 0 25px -3px rgba(13, 155, 118, 0.5)',
        glowCyan: '0 0 25px -3px rgba(54, 197, 240, 0.5)',
        glowMix: '0 0 30px -5px rgba(54, 197, 240, 0.3), 0 0 25px -5px rgba(13, 155, 118, 0.35)',
      }
    },
  },
  plugins: [],
}
