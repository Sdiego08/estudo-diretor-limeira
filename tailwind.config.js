/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        papel: '#FBF7EF',
        'papel-fundo': '#F3EDE1',
        tinta: '#1F2420',
        'tinta-suave': '#5C635B',
        quadro: '#2F4F43',
        'quadro-claro': '#3F6656',
        ambar: '#C8860D',
        'ambar-claro': '#F3E4C4',
        erro: '#9B3B2E',
        'erro-claro': '#F2DFDB',
        linha: '#DFD6C4',
      },
      fontFamily: {
        titulo: ['Archivo', 'Segoe UI', 'Roboto', 'system-ui', 'sans-serif'],
        corpo: ['"Source Serif 4"', 'Georgia', 'Cambria', 'serif'],
      },
      borderRadius: {
        carta: '14px',
      },
    },
  },
  plugins: [],
}
