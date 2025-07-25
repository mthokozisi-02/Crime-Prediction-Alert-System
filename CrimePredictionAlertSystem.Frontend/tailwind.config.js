/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
    "./node_modules/flowbite/**/*.js"
  ],
  theme: {
    extend: {
      animation: {
        typewriter: 'typewriter 1s steps(45) forwards',
        typewriterDelayed1: 'typewriter 1s steps(45) forwards 1s',
        typewriterDelayed2: 'typewriter 1s steps(45) forwards 2s',
        typewriterDelayed3: 'typewriter 1s steps(45) forwards 3s',
        caret: 'typewriter 3s steps(45) forwards, blink 1s steps(45) infinite 2s',
        caretDelayed1: 'typewriter 3s steps(45) forwards 3s, blink 1s steps(45) infinite 3s',
        caretDelayed2: 'typewriter 3s steps(45) forwards 6s, blink 1s steps(45) infinite 6s',
        caretDelayed3: 'typewriter 3s steps(45) forwards 9s, blink 1s steps(45) infinite 9s',
      },
      keyframes: {
        typewriter: {
          to: {
            left: '100%',
          },
        },
        blink: {
          '0%': {
            opacity: '0',
          },
          '0.1%': {
            opacity: '1',
          },
          '50%': {
            opacity: '1',
          },
          '50.1%': {
            opacity: '0',
          },
          '100%': {
            opacity: '0',
          },
        },
      },
    },
  },
  plugins: [
     require('flowbite/plugin')
  ],
}

