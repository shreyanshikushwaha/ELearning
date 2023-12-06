import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: ['class'],// it means we can write tailwind classes for implementing dark mode features
  theme: {
    extend: {
      fontFamily :{
        Poppins : ["var(--font-Poppins)"],
        Josefin : ["var(--font-Josefin)"],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      //custom screen size
      screens:{
        "100px" : "1000px",
        "1100px": "1100px",
        "1200px": "1200px",
        "1300px": "1300px",
        "1500px": "1500px",
        "800px" : "800px",
        "400px"  : "400px",

      }
    },
  },
  plugins: [],
}
export default config
