module.exports = {
  root: true,
<<<<<<< HEAD
  extends: ['next/core-web-vitals', 'prettier'],
=======
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: 'module'
  },
  extends: ['next/core-web-vitals', 'prettier'],
  plugins: ['tailwindcss'],
  rules: {
    'tailwindcss/classnames-order': 'warn',
    'tailwindcss/enforces-shorthand': 'warn',
    'tailwindcss/no-custom-classname': 'off'
  },
  settings: {
    tailwindcss: {
      callees: ['cn', 'classnames', 'clsx'],
      config: './tailwind.config.ts'
    }
  }
>>>>>>> 01bddbf4c1e9f5ab240400391ca2858120ed6bf4
};
