/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
    "./node_modules/flowbite/**/*.js"
  ],
  theme: {
    extend: {
            colors: {
                dark: {
                    900: '#0f0f0f',
                    800: '#181818',
                    700: '#252525',
                },
                primary: {
                    500: '#3b82f6',
                    400: '#60a5fa',
                },
                accent: {
                    pink: '#ef4444',
                    purple: '#a855f7',
                    cyan: '#06b6d4',
                }
            },
            animation: {
                'float': 'float 6s ease-in-out infinite',
                'float-reverse': 'float-reverse 5s ease-in-out infinite',
            },
            keyframes: {
                float: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-10px)' },
                },
                'float-reverse': {
                    '0%, 100%': { transform: 'translateY(-5px)' },
                    '50%': { transform: 'translateY(5px)' },
                }
            }
        }
  },
  plugins: [
    require('flowbite/plugin')
  ],
}

