// import type { Config } from 'tailwindcss'

// const config: Config = {
//     darkMode: ['class'],
//     content: [
//     './pages/**/*.{js,ts,jsx,tsx,mdx}',
//     './components/**/*.{js,ts,jsx,tsx,mdx}',
//     './app/**/*.{js,ts,jsx,tsx,mdx}',
//   ],
//   theme: {
//   	extend: {
//   		backgroundImage: {
//   			'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
//   			'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))'
//   		},
//   		keyframes: {
//   			'accordion-down': {
//   				from: {
//   					height: '0'
//   				},
//   				to: {
//   					height: 'var(--radix-accordion-content-height)'
//   				}
//   			},
//   			'accordion-up': {
//   				from: {
//   					height: 'var(--radix-accordion-content-height)'
//   				},
//   				to: {
//   					height: '0'
//   				}
//   			}
//   		},
//   		animation: {
//   			'accordion-down': 'accordion-down 0.2s ease-out',
//   			'accordion-up': 'accordion-up 0.2s ease-out'
//   		}
//   	}
//   },
//   plugins: [],
// }
// export default config

import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: ['class'], // Enables dark mode using the `class` strategy
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}', // Scans pages directory
    './components/**/*.{js,ts,jsx,tsx,mdx}', // Scans components directory
    './app/**/*.{js,ts,jsx,tsx,mdx}', // Scans app directory
  ],
  theme: {
    extend: {
      // Custom background images
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      // Custom keyframes for accordion animations
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
      },
      // Custom animations for accordion
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
      },
      // Add shadcn/ui custom colors and variables
      colors: {
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        border: 'hsl(var(--border))', // Fixes `border-border` class
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        // Add custom emerald-500 color used in globals.css
        emerald: {
          500: '#10b981',
        },
      },
      // Support shadcn/ui's --radius variable
      borderRadius: {
        DEFAULT: 'var(--radius)',
      },
    },
  },
  plugins: [], // No additional plugins needed for now
}

export default config
