/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ['class'],
    content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Dark theme base colors
        'dark-base': '#1a1a1f', // Darkest background
        'dark-surface': '#242429', // Component background
        'dark-elevated': '#2c2c32', // Elevated components
        'dark-border': '#39393f', // Border color
        'dark-hover': '#39393f', // Hover state
        
        // Accent colors from reference UI
        'accent-orange': '#f8743b',  // Primary orange accent
        'accent-orange-muted': '#c25f30', // Muted orange for secondary elements
        'accent-green': '#42b883',  // Primary green accent
        'accent-green-muted': '#369a6e', // Muted green for secondary elements
        
        // Text colors
        'text-primary': '#ffffff',
        'text-secondary': '#a9a9b2',
        'text-muted': '#6e6e78',

        // Keeping original color schemes
        primary: {
          '50': '#f0f9ff',
          '100': '#e0f2fe',
          '200': '#bae6fd',
          '300': '#7dd3fc',
          '400': '#38bdf8',
          '500': '#0ea5e9',
          '600': '#0284c7',
          '700': '#0369a1',
          '800': '#075985',
          '900': '#0c4a6e',
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))'
        },
        secondary: {
          '50': '#f5f3ff',
          '100': '#ede9fe',
          '200': '#ddd6fe',
          '300': '#c4b5fd',
          '400': '#a78bfa',
          '500': '#8b5cf6',
          '600': '#7c3aed',
          '700': '#6d28d9',
          '800': '#5b21b6',
          '900': '#4c1d95',
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))'
        },
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))'
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))'
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))'
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))'
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))'
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))'
        }
      },
      backgroundImage: {
        'noise-pattern': "url('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAGAElEQVR42u2aW4hVVRjHZ18vlYmIMpKgK2WKZZE9hBFdTCQqNCx8BJ+KepmpJErICLpQCeZL5kvUIL30SiYZhZTRRSnotSKiphtlVzC7/X/7fGf+Z1n77HPmMGfOHBl+8GOvvdba3/et9a21vrX30EMhCpcauehEPpAP5AMXRQDKgQqgEhiGB5oM5ruk1SFkTm6j+d9dOlAH3A5cB4wDJtBBTQRqgKuBUcAwoBwY6GgDSEdHB3V1ddS2bZvS1NREixYtosWLF9uODiGHkEd4BODOUcAY4GJgEDbwFFuBiZsK8GyYOHEiTZ8+HdOCdu/eTT/88IMeV1dX07Jly2jLli2YJs2aNYvWrl1LaM+pU6eotrZWO9LY2KgdmjZtmnbKdTq45H9FPQ6OIPRoGc7O4uA7mBWcORZ03UB9+YUXXqBdu3ZhnNPMmTOpsbGRDh06RFOmTKG9e/ei3Wlnn6Cbb76ZPvroI+379OkTaZ4Yp8HnnLm7FChOWS9MIY6HjP8cw7+vePzxx2nPnj343W7D5s2b6cYbb6S7776b1qxZE8wyXXPNNbRkyRJatGgR3XnnnXT//ffTJ598kutQWCkQXcmNwdV4CHAM9wWxswzn7d/rOFPL8L82btxIu3fv1rHf2toqHVDQGbrvvvvorbfeovvuu4+2bt1KK1asoB9//FGdY9pTXV2trrrqKu0k2lZ5Dh06FKcTxsEyaBTGpDzejvb29tqOONTxbP5PVVVV2L4chuHl5eXqJMtwn4wxl8m8lJfpsmXLFmzcuLETJ4OOi32yrLGxEbDPzcVmojk5G0L8OWrGjBmcnXNlVVUVZ+eckUceeeRclfFfx+E+XTpXlUKZcJHZs2fbXPVSskDfnCCInUXPPvssxvbRQm1trZ5cvnw5rVy5kg4ePGgbfzqYRfr/KgxrE9xbP3jwYJo4cWJ/RDvBTuL8m/GBcZWJiXa8gxpKyVqnEr58+TI6evQoHT9+nCZMmEBLly6lffv20ZkzZ+jdd9+l/fv30+nTpzHz6PHHH6fp06drp955552g243GjRtHd9xxB33wwQe0f/9+evDBB+m5557T2dJoMKX72WefVZk4ceIE3XLLLXTfffepTp8yj+gctLs2TjRO1nKh7bDGJ/PQddddhzEfLFiwgK6//no6cuQIvfvuu3TFFVfQgQMHlA8++IDq6+tp3Lhx9MILL+j5Y8eO0fHjx2nyZF0/aNCgQXTrrbdqp7/77jvq6OgImjHl6qoHHnhAn6WxsdEu8F2cRzQRLtMsaM0P3XbbbfTTTz/pyeHDhyuIenp6Oj3zzDOXTZ06dcjmzZsvGTt2LG3fvp1GjRqli/yPP/5YO/z555/T008/rd6JJMPs+OCDD+jUqVPalurqat0+PPqIPjtW11577bkNGzbQ1q1baefOnT46Zzmdcs0+6QRErl1Fno0jTj2TMWf8nMMrXFPOzJOUB/s7g84YZ3/l0rZoMkWON2fP6D6OgzXJxoGLmRKaWBlrKTgJGcxVq1YVjRkzRkW9ZahnUVy9ejWdf/55bN8pqB+W1a9bt46GDh36Lzmq9uKnwV1MmrKlS5cqfvzxRz0PDCg0rPyiOXPmEHQDx48f1/MDB+r+SmeVkb355pt07Ngx3drAPnnyJH355ZeYhXTixAn6+uuvtez777+nb7/9VlG0aBHByD2G8h1pO5IyJZ0G1dTU5LoSd0mcVbJ2RHhYJVPpwClvB42D4nhfqKmpISDYPXYzjWNi6jKejNiOxN5qBB1h6VdAVtV9ydatW3GXbxTcuZvkB6S+4U6B5Qi4I4mWOFaSuK4+0IjD1IEZM2ZY2S18RFacuphkuQsVjYMlTmvSojBuUwMlJSUlSspPMZfBSrw7cjnDWL9+PYzqx8rKytojR47ExgADWCLTzA/LPzUDM9xjZoPB8YMHD1bnAX0Jy7oJ2fhw5JwwmPnl/2BgdULJnWj94G3iy382iVfAUu6YW2eYkDr+DyUfyAfygQuOf87gWfLZHAAAAABJRU5ErkJggg==')",
      },
      boxShadow: {
        'neo-dark': '5px 5px 10px rgba(0, 0, 0, 0.3), -5px -5px 10px rgba(70, 70, 80, 0.1)',
        'neo-inset': 'inset 2px 2px 5px rgba(0, 0, 0, 0.5), inset -2px -2px 5px rgba(70, 70, 80, 0.1)',
        'subtle': '0 1px 3px rgba(0, 0, 0, 0.2)',
      },
      borderWidth: {
        '0.5': '0.5px',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 1s infinite',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)'
      }
    }
  },
  plugins: [require("tailwindcss-animate")],
}