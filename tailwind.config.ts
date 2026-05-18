import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      boxShadow: {
        neon: '0 20px 80px rgba(59, 130, 246, 0.22)',
      },
    },
  },
  plugins: [],
};

export default config;
