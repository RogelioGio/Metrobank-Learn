import { text } from '@fortawesome/fontawesome-svg-core';

/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ['class'],
    mode: 'jit',
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
        ],
  theme: {
  	extend: {
  		animation: {
  			'fade-in-out': 'fade-in-out 25s ease-in-out infinite',
            "caret-blink": "caret-blink 1.25s ease-out infinite",
  		},
  		keyframes: {
  			'fade-in-out': {
  				'0%, 100%': {
  					opacity: '0'
  				},
  				'5%, 95%': {
  					opacity: '1'
  				}
  			},
            "caret-blink": {
                "0%,70%,100%": { opacity: "1" },
                "20%,50%": { opacity: "0" },
            },
  		},
  		fontFamily: {
  			header: [
  				'var(--headerFont)'
  			],
  			text: [
  				'var(--textFont)'
  			]
  		},
  		colors: {
            darkerPrimary: 'var(--DarkBackgroundPrimary)',
  			primary: 'var(--Primary-Color)',
  			primarybg: 'var(--Primay-BG-pastel)',
  			primaryhover: 'var(--Primary-Color-Hover)',
  			secondaryprimary: 'var(--Secondary-Primary-Color)',
  			secodary: 'var(--Darker-Primary-Color)',
  			tertiary: 'var(--Darker-Unactive-Color)',
            text_unhover: 'hsl(210, 11%, 71%)',
  			background: 'var(--Background-Color)',
  			secondarybackground: 'var(--Secondary-Background-Color)',
  			unactive: 'var(--Unactive-Color)',
  			white: 'var(--White)',
  			black: 'var(--Black)',
  			divider: 'var(--Divider)',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
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
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
  },
  plugins: [
    require("tailwind-scrollbar"),

    function ({ addUtilities }) {
        const newUtilities = {
          // This utility will reserve space for the scrollbar.
          '.scrollbar-gutter': {
            'scrollbar-gutter': 'stable',
          },
        };
        addUtilities(newUtilities, ['responsive']);
      },
      require("tailwindcss-animate")
],
}

